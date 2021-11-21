import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect, useState} from 'react';
import styled from 'styled-components/native';
import Banner from '../../components/ads/Banner';
import PendingRibbon from '../../components/atoms/PendingRibbon';
import {PhotoFlatGrid} from '../../components/views/PhotoGrid';
import {adUnits} from '../../constants/credentials';
import {AuthContext} from '../../context/AuthProvider';
import useAlertModal from '../../hooks/useAlertModal';
import useImagePicker from '../../hooks/useImagePicker';
import useRightIconHeader from '../../hooks/useRightIconHeader';
import useSupabase, {Photo} from '../../hooks/useSupabase';
import {
  HomeStackParamList,
  ModalStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type RoomScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'RoomScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type RoomScreenRouteProp = RouteProp<HomeStackParamList, 'RoomScreen'>;

type Props = {
  navigation: RoomScreenNavigationProp;
  route: RoomScreenRouteProp;
};

const itemsPerPage = 25;

/**
 * This screen shows a grid view of all photos in a specific room of a building
 */
const RoomScreen: React.FC<Props> = ({navigation, route}) => {
  const roomNumber = route.params.roomNumber;
  const dorm = route.params.dorm;

  const {photoFunctions} = useSupabase();
  const {showImagePickerActionSheet} = useImagePicker();
  const {showAlert} = useAlertModal();
  const {user} = useContext(AuthContext);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPhotos(true);
  }, []);

  const loadPhotos = async (refresh: boolean = false) => {
    const {data, error} = await photoFunctions.getPhotosForDormRoom(
      dorm.id,
      roomNumber ?? undefined,
      itemsPerPage,
      refresh ? 0 : photos.length,
    );

    if (error) {
      console.log(error);
      showAlert({
        message:
          'Unable to load photos, please try again later: ' + error.message,
      });
      setRefreshing(false);
      return;
    }

    setPhotos(refresh ? data ?? [] : [...photos, ...(data ?? [])]);
  };

  // Handle image uploading
  const uploadImage = async () => {
    if (!user) {
      showAlert({
        message:
          'You must be signed in to add photos. Do you want to sign up now?',
        closeButtonText: 'No',
        confirmButtonText: 'Yes',
        onConfirm: () => navigation.push('Auth', {screen: 'SignUpScreen'}),
      });
      return;
    }

    showImagePickerActionSheet(({image, error}) => {
      if (error) {
        console.log(error);
      }
      if (image) {
        navigation.push('AddPhotoModal', {
          image: image,
          dorm: dorm,
          roomNumber: roomNumber,
          editing: false,
        });
      }
    });
  };

  useRightIconHeader({
    icons: ['add'],
    iconActions: [uploadImage],
    title: roomNumber ? '#' + roomNumber : 'All Photos',
  });

  return (
    <Container>
      <PendingRibbon
        visible={dorm.pending}
        message="These photos are currently under approval. Any changes will only be visible to you"
      />
      <Banner
        adUnitID={adUnits.banners.roomUpper}
        position="top"
        visible={!dorm.pending}
      />
      <PhotoFlatGrid
        emptyIcon="images"
        emptyMessage="No photos are available for this room yet."
        data={photos}
        onRefresh={() => loadPhotos(true)}
        refreshing={refreshing}
        pending={dorm.pending}
        onEndReached={() => loadPhotos()}
        initialNumToRender={itemsPerPage}
      />
    </Container>
  );
};

export default RoomScreen;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.primary};
`;
