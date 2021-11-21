import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import Banner from '../../components/ads/Banner';
import {PhotoSectionGrid} from '../../components/views/PhotoGrid';
import {adUnits} from '../../constants/credentials';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase, {Photo} from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';
import generateSections, {Section} from '../../utils/generateSections';

type MyPhotosScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'MyPhotosScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type MyPhotosScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'MyPhotosScreen'
>;

type Props = {
  navigation: MyPhotosScreenNavigationProp;
  route: MyPhotosScreenRouteProp;
};

const itemsPerPage = 25;

const MyPhotosScreen: React.FC<Props> = ({navigation, route}) => {
  const {photoFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const [sections, setSections] = useState<Section<Photo>[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [refreshing] = useState(false);

  useEffect(() => {
    loadPhotos(true);
  }, []);

  const loadPhotos = async (refresh: boolean = false) => {
    const {data, error} = await photoFunctions.getUserPhotos(
      itemsPerPage,
      refresh ? 0 : photos.length,
    );
    if (error) {
      showAlert({
        message: 'Unable to fetch saved photo data: ' + error.message,
      });
      return;
    }

    const newPhotos = refresh ? data ?? [] : [...photos, ...(data ?? [])];
    setPhotos(newPhotos);

    const newSections = generateSections(newPhotos, photo => photo.school_name);

    setSections(newSections);
  };

  return (
    <Container>
      <Banner
        visible
        position="top"
        adUnitID={adUnits.banners.savedPhotosUpper}
      />
      <Grid
        emptyIcon="images"
        emptyMessage="You haven't uploaded any photos yet!"
        onRefresh={() => loadPhotos(true)}
        refreshing={refreshing}
        sections={sections}
        pending={false}
        loadMore={() => loadPhotos()}
        bypassAd={true}
      />
    </Container>
  );
};

export default MyPhotosScreen;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.primary};
`;

const Grid = styled(PhotoSectionGrid)`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.primary};
`;
