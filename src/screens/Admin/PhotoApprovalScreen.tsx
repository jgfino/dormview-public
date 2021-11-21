import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import {ListRenderItem} from 'react-native';
import styled from 'styled-components/native';
import ApprovalCardPhoto from '../../components/molecules/ApprovalCardPhoto';
import CustomFlatList from '../../components/native-replacements/CustomFlatList';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase, {Photo} from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type PhotoApprovalScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'PhotoApprovalScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type PhotoApprovalScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'PhotoApprovalScreen'
>;

type Props = {
  navigation: PhotoApprovalScreenNavigationProp;
  route: PhotoApprovalScreenRouteProp;
};

const itemsPerPage = 10;

/**
 * Screen for admins to approve photos. Loads 10 photos at a time by date added
 */
const PhotoApprovalScreen: React.FC<Props> = ({navigation, route}) => {
  const {photoFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const [refreshing, setRefreshing] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadPendingPhotos(true);
    }, []),
  );

  const loadPendingPhotos = async (refresh: boolean = false) => {
    const {data, error} = await photoFunctions.getPendingPhotos(
      itemsPerPage,
      refresh ? 0 : photos.length,
    );

    if (error || !data) {
      showAlert({message: 'Unable to fetch pending photos: ' + error?.message});
      console.log(error);
      setRefreshing(false);
      return;
    }

    setPhotos(refresh ? data ?? [] : [...photos, ...(data ?? [])]);
  };

  const onApprove = async (item: Photo) => {
    const {error} = await photoFunctions.approvePhoto(item.id);
    if (error) {
      console.log(error);
      showAlert({message: 'Unable to approve photo: ' + error?.message});
      return;
    }
    loadPendingPhotos(true);
  };

  const onReject = async (item: Photo) => {
    const {error} = await photoFunctions.deletePhoto(item.id);
    if (error) {
      console.log(error);
      showAlert({message: 'Unable to reject photo: ' + error?.message});
      return;
    }
    loadPendingPhotos(true);
  };

  const renderItem: ListRenderItem<Photo> = ({item}) => {
    return (
      <ApprovalCardPhoto
        title={item.room_number}
        caption={item.description}
        uri={item.full_url}
        onApprovePressed={() => onApprove(item)}
        onRejectPressed={() => onReject(item)}
        onInfoPressed={() =>
          navigation.navigate('AddPhotoModal', {photo: item, editing: true})
        }
      />
    );
  };

  return (
    <Container>
      <CustomFlatList
        showsTopButton={false}
        hasPadding={false}
        emptyMessage="No photos available for approval"
        emptyIcon="checkmark-done"
        renderItem={renderItem}
        data={photos}
        onRefresh={() => loadPendingPhotos(true)}
        onEndReached={() => loadPendingPhotos()}
        onEndReachedThreshold={0.3}
        refreshing={refreshing}
      />
    </Container>
  );
};

export default PhotoApprovalScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;
