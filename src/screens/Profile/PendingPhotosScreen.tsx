import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {PhotoFlatGrid} from '../../components/views/PhotoGrid';
import useAlertModal from '../../hooks/useAlertModal';
import useRightIconHeader from '../../hooks/useRightIconHeader';
import useSupabase, {Photo} from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type PendingPhotosScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'PendingPhotosScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type PendingPhotosScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'PendingPhotosScreen'
>;

type Props = {
  navigation: PendingPhotosScreenNavigationProp;
  route: PendingPhotosScreenRouteProp;
};

const itemsPerPage = 25;

const PendingPhotosScreen: React.FC<Props> = ({navigation, route}) => {
  const {photoFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [refreshing] = useState(false);

  useEffect(() => {
    loadPhotos(true);
  }, []);

  useRightIconHeader({
    title: 'Pending Photos',
  });

  const loadPhotos = async (refresh: boolean = false) => {
    const {data, error} = await photoFunctions.getPendingPhotos(
      itemsPerPage,
      refresh ? 0 : photos.length,
    );

    if (error) {
      console.log(error);
      showAlert({message: 'Unable to get pending photos: ' + error.message});
      return;
    }

    setPhotos(refresh ? data ?? [] : [...photos, ...(data ?? [])]);
  };

  return (
    <Container>
      <PhotoFlatGrid
        emptyMessage="Nothing to see here! You don't currently have any pending photos."
        emptyIcon="file-tray"
        refreshing={refreshing}
        onRefresh={() => loadPhotos(true)}
        onEndReached={() => loadPhotos()}
        data={photos}
        pending
      />
    </Container>
  );
};

export default PendingPhotosScreen;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.primary};
`;
