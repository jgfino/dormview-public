import analytics from '@react-native-firebase/analytics';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect, useState} from 'react';
import {ListRenderItem} from 'react-native';
import styled from 'styled-components/native';
import Banner from '../../components/ads/Banner';
import LoadingScreen from '../../components/atoms/LoadingScreen';
import PendingRibbon from '../../components/atoms/PendingRibbon';
import ListItem from '../../components/molecules/ListItem';
import CustomFlatList from '../../components/native-replacements/CustomFlatList';
import {adUnits} from '../../constants/credentials';
import {AuthContext} from '../../context/AuthProvider';
import useAlertModal from '../../hooks/useAlertModal';
import useImagePicker from '../../hooks/useImagePicker';
import useRightIconHeader from '../../hooks/useRightIconHeader';
import useSupabase, {Dorm} from '../../hooks/useSupabase';
import {
  HomeStackParamList,
  ModalStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type DormScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'DormScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type DormScreenRouteProp = RouteProp<HomeStackParamList, 'DormScreen'>;

type Props = {
  navigation: DormScreenNavigationProp;
  route: DormScreenRouteProp;
};

/**
 * The main display screen for a Dorm. This screen displays the name and style of the dorm,
 * along with a list of room numbers that photos are available for
 */
const DormScreen: React.FC<Props> = ({navigation, route}) => {
  const dormId = route.params.dormId;

  const [dorm, setDorm] = useState<Dorm>();
  const [rooms, setRooms] = useState<(string | null)[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {dormFunctions, photoFunctions} = useSupabase();
  const {showImagePickerActionSheet} = useImagePicker();
  const {showAlert} = useAlertModal();
  const {user} = useContext(AuthContext);

  // Initialize data
  useEffect(() => {
    const getInitialFavorite = async () => {
      const {data} = await dormFunctions.hasFavoriteDorm(dormId);
      if (data != null) {
        setFavorite(data);
      }
    };
    getInitialFavorite();
    onRefresh();
    analytics().logEvent('view_dorm', {id: dormId});
  }, [route]);

  const onRefresh = async () => {
    const {data: newDorm, error: dormError} = await dormFunctions.getDorm(
      dormId,
    );

    const {data: newRooms, error: roomError} =
      await photoFunctions.getRoomsForDorm(dormId);

    if (dormError || roomError || newDorm == null || newRooms == null) {
      showAlert({
        message:
          'Unable to fetch data for dorm. Please try again later: ' +
          dormError?.message +
          ' ' +
          roomError?.message,
      });
      console.log('Error fetching dorm data:', dormError, roomError);
      setRefreshing(false);
      return;
    }

    if (newRooms.length > 0) {
      if (newRooms[newRooms.length - 1] == null) {
        newRooms.pop();
      }
      newRooms.unshift(null);
    }

    setDorm(newDorm);
    setRooms(newRooms);
  };

  const onFavoritePressed = async () => {
    if (!user) {
      showAlert({
        message:
          'You must be signed in to favorite a dorm. Do you want to sign up now?',
        closeButtonText: 'No',
        confirmButtonText: 'Yes',
        onConfirm: () => navigation.push('Auth', {screen: 'SignUpScreen'}),
      });
      return;
    }

    const {data, error} = await dormFunctions.toggleFavoriteDorm(dormId);

    if (!error && data != null) {
      if (data) {
        analytics().logEvent('favorite_dorm', {id: dormId});
      } else {
        analytics().logEvent('unfavorite_dorm', {id: dormId});
      }
      setFavorite(data);
    } else {
      showAlert({message: error?.message ?? 'Unable to favorite dorm'});
      console.log(error);
    }
  };

  const uploadImage = async () => {
    if (!dorm) return;

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
        navigation.navigate('AddPhotoModal', {
          image: image,
          dorm: dorm,
          editing: false,
        });
      }
    });
  };

  useRightIconHeader({
    title: dorm?.name ?? '',
    icons: !dorm?.pending
      ? [favorite ? 'heart' : 'heart-outline', 'add']
      : ['add'],
    iconActions: !dorm?.pending
      ? [onFavoritePressed, uploadImage]
      : [uploadImage],
  });

  const onDeletePressed = async () => {
    showAlert({
      title: 'Confirm',
      message:
        'Are you sure you want to delete this dorm? Any photos pending for this dorm will also be deleted',
      closeButtonText: 'No',
      confirmButtonText: 'Yes',
      onConfirm: async () => {
        const {error} = await dormFunctions.deleteDorm(dormId);
        if (error) {
          console.log(error);
          showAlert({message: 'Unable to delete dorm: ' + error.message});
          return;
        }
        navigation.goBack();
      },
    });
  };

  if (!dorm) return <LoadingScreen />;

  const renderItem: ListRenderItem<string | null> = ({item, index}) => {
    return (
      <ListItem
        title={item ? '#' + item : 'All Photos'}
        onPress={() => {
          navigation.push('RoomScreen', {
            roomNumber: item,
            dorm: dorm,
          });
        }}
      />
    );
  };

  return (
    <Container>
      <PendingRibbon
        visible={dorm.pending}
        message="This dorm is currently under review. Any changes will only be visible to you."
      />
      <CustomFlatList<string | null>
        topButtonTitle="Add Your Photos!"
        onTopButtonPressed={uploadImage}
        showsBottomButton={dorm.pending}
        bottomButtonTitle="Delete Dorm"
        onBottomButtonPressed={onDeletePressed}
        emptyIcon="images"
        emptyMessage="No photos are available for this dorm yet. Click above to add one and start growing this dorm’s collection!"
        data={rooms}
        renderItem={renderItem}
        keyExtractor={(item: string | null, index: number) => index.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <Banner
        adUnitID={adUnits.banners.dormLower}
        position="bottom"
        visible={!dorm.pending}
      />
    </Container>
  );
};

export default DormScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;
