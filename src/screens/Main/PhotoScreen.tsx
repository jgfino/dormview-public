import analytics from '@react-native-firebase/analytics';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AdMobInterstitial} from 'expo-ads-admob';
import React, {useContext, useEffect, useState} from 'react';
import {Image} from 'react-native';
import FastImage from 'react-native-fast-image';
//@ts-ignore
import Pinchable from 'react-native-pinchable';
import styled from 'styled-components/native';
import BlockButton from '../../components/atoms/BlockButton';
import ListSeparator from '../../components/atoms/ListSeparator';
import LoadingScreen from '../../components/atoms/LoadingScreen';
import PendingRibbon from '../../components/atoms/PendingRibbon';
import ConditionalKeyboardScrollView from '../../components/native-replacements/ConditionalKeyboardScrollView';
import Text from '../../components/native-replacements/Text';
import {adUnits} from '../../constants/credentials';
import {AuthContext} from '../../context/AuthProvider';
import {ConsentContext} from '../../context/ConsentProvider';
import useAlertModal from '../../hooks/useAlertModal';
import useRightIconHeader from '../../hooks/useRightIconHeader';
import useSupabase, {Photo} from '../../hooks/useSupabase';
import {
  HomeStackParamList,
  ModalStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type PhotoScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'PhotoScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type PhotoScreenRouteProp = RouteProp<HomeStackParamList, 'PhotoScreen'>;

type Props = {
  navigation: PhotoScreenNavigationProp;
  route: PhotoScreenRouteProp;
};

/**
 * The full screen display screen for a photo, including its description, number, and owner
 */
const PhotoScreen: React.FC<Props> = ({navigation, route}) => {
  const photoId = route.params.photoId;

  const {photoFunctions} = useSupabase();
  const {hasConsent} = useContext(ConsentContext);
  const {showAlert} = useAlertModal();
  const {user, profile} = useContext(AuthContext);

  const [photo, setPhoto] = useState<Photo>();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [aspect, setAspect] = useState<number>();

  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const {data, error} = await photoFunctions.hasSavedPhoto(photoId);
      if (error || data == null) {
        return;
      } else {
        setSaved(data);
      }
      refreshPhoto();
    };
    initialize();
    analytics().logEvent('view_photo', {id: photoId});
  }, [route]);

  useEffect(() => {
    if (canShow || !photo) return;

    const showIntersitional = async () => {
      await AdMobInterstitial.setAdUnitID(adUnits.interstitials.viewPhoto);
      await AdMobInterstitial.requestAdAsync({
        servePersonalizedAds: hasConsent,
      });
      await AdMobInterstitial.showAdAsync();
    };

    if (!photo.pending && !route.params.bypassAd && !profile?.admin) {
      showIntersitional().finally(() => setCanShow(true));
    } else {
      setCanShow(true);
    }
  }, [photo]);

  useEffect(() => {
    if (!photo) return;
    Image.getSize(photo!.full_url, (width, height) =>
      setAspect(width / height),
    );
  }, [photo]);

  const refreshPhoto = async () => {
    const {data, error} = await photoFunctions.getPhoto(photoId);
    if (error || data == null) {
      showAlert({message: 'Error fetching photo data: ' + error?.message});
      return;
    }
    setPhoto(data);
  };

  const onSavePressed = async () => {
    if (!user) {
      showAlert({
        message:
          'You must be signed in to save a photo. Do you want to sign up now?',
        closeButtonText: 'No',
        confirmButtonText: 'Yes',
        onConfirm: () => navigation.push('Auth', {screen: 'SignUpScreen'}),
      });
      return;
    }

    const {data, error} = await photoFunctions.toggleSavedPhoto(photoId);
    if (error || data == null) {
      showAlert({message: error?.message ?? 'Unable to save photo'});
      console.log(error);
      return;
    }
    if (data) {
      analytics().logEvent('save_photo', {id: photoId});
    } else {
      analytics().logEvent('unsave_photo', {id: photoId});
    }
    setSaved(data);
  };

  const onDeletePressed = async () => {
    showAlert({
      title: 'Confirm',
      message: 'Are you sure you want to delete this photo?',
      closeButtonText: 'No',
      confirmButtonText: 'Yes',
      onConfirm: async () => {
        setDeleteLoading(true);
        const {error} = await photoFunctions.deletePhoto(photoId);
        setDeleteLoading(false);

        if (error) {
          showAlert({
            message:
              'Unable to delete photo, please try again later: ' +
              error.message,
          });
          console.log(error);
          return;
        }
        analytics().logEvent('delete_photo');
        navigation.goBack();
      },
    });
  };

  useRightIconHeader({
    icons: !photo?.pending ? [saved ? 'bookmark' : 'bookmark-outline'] : [],
    title: 'View Photo',
    iconActions: [onSavePressed],
  });

  if (!canShow || !photo) return <LoadingScreen />;

  return (
    <Container>
      <PendingRibbon
        visible={photo.pending}
        message="This photo is currently under approval. Any changes will only be visible to you"
      />
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <Pinchable>
          <TopImage
            source={{uri: photo.full_url}}
            style={{aspectRatio: aspect}}
          />
        </Pinchable>
        <Card
          style={photoFunctions.isPhotoOwner(photo) ? {borderRadius: 15} : {}}>
          <DateContainer>
            <Text size={15} weight="semibold" color="secondary2">
              {new Date(photo.date_added).toLocaleDateString('en-us', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </DateContainer>
          <ListSeparator />
          <Text size={16} weight="semibold" color="primary">
            {photo.school_name}
          </Text>
          <Text size={16} weight="semibold" color="primary">
            {photo.dorm_name}
          </Text>
          {photo.room_number && (
            <>
              <Text size={15} weight="semibold" color="secondary1">
                {`Rm #${photo.room_number}`}
              </Text>
            </>
          )}
          <ListSeparator />
          <Text size={16} weight="semibold">
            {photo.description}
          </Text>
        </Card>
        {photoFunctions.isPhotoOwner(photo) && (
          <BottomButton
            onPress={onDeletePressed}
            text="Delete Photo"
            loading={deleteLoading}
          />
        )}
      </ScrollView>
    </Container>
  );
};

export default PhotoScreen;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.primary};
`;

const ScrollView = styled(ConditionalKeyboardScrollView)``;

const TopImage = styled(FastImage)`
  flex: 1;
`;

const Card = styled.View`
  justify-content: space-around;
  flex-grow: 1;
  margin-left: ${({theme}) => theme.spacing.margins}px;
  margin-right: ${({theme}) => theme.spacing.margins}px;
  margin-top: ${({theme}) => theme.spacing.margins}px;
  padding-left: ${({theme}) => theme.spacing.margins}px;
  padding-right: ${({theme}) => theme.spacing.margins}px;
  padding-top: ${({theme}) => theme.spacing.margins}px;
  padding-bottom: ${({theme}) => theme.spacing.margins}px;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  background-color: ${({theme}) => theme.colors.background.secondary2};
  min-height: 240px;
`;

const DateContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BottomButton = styled(BlockButton)`
  margin: ${({theme}) => theme.spacing.margins}px;
  background-color: ${({theme}) => theme.colors.destructive};
`;
