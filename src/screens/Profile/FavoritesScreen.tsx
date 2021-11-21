import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {ListRenderItem, Platform} from 'react-native';
import styled from 'styled-components/native';
import Banner from '../../components/ads/Banner';
import ListItem from '../../components/molecules/ListItem';
import CustomFlatList from '../../components/native-replacements/CustomFlatList';
import {adUnits} from '../../constants/credentials';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase, {Dorm, School} from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type FavoritesScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'FavoritesScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type FavoritesScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'FavoritesScreen'
>;

type Props = {
  navigation: FavoritesScreenNavigationProp;
  route: FavoritesScreenRouteProp;
};

const FavoritesScreen: React.FC<Props> = ({route, navigation}) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const {schoolFunctions, dormFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  useEffect(() => {
    onRefresh();
  }, []);

  const onRefresh = async () => {
    const {data: newSchools, error: schoolError} =
      await schoolFunctions.getFavoriteSchools();
    const {data: newDorms, error: dormError} =
      await dormFunctions.getFavoriteDorms();

    if (schoolError || dormError) {
      console.log(schoolError, dormError);
      showAlert({
        message: 'Error fetching favorite data, please try again later.',
      });
      setRefreshing(false);
      return;
    }

    setSchools(newSchools ?? []);
    setDorms(newDorms ?? []);
  };

  const renderHeaderComponent = () => (
    <HeaderContainer>
      <Control
        values={['Schools', 'Dorms']}
        selectedIndex={selectedIndex}
        onChange={event =>
          setSelectedIndex(event.nativeEvent.selectedSegmentIndex)
        }
      />
    </HeaderContainer>
  );

  const renderSchoolItem: ListRenderItem<School> = ({item}) => (
    <ListItem
      onPress={() => navigation.push('SchoolScreen', {schoolId: item.id})}
      title={item.name}
      subtitle={[item.location]}
    />
  );

  const renderDormItem: ListRenderItem<Dorm> = ({item}) => (
    <ListItem
      title={item.name}
      subtitle={item.style}
      onPress={() => navigation.push('DormScreen', {dormId: item.id})}
    />
  );

  return (
    <Container>
      <FavoriteList
        ListHeaderComponent={renderHeaderComponent()}
        showsTopButton={false}
        data={selectedIndex === 0 ? schools : dorms}
        //@ts-ignore
        renderItem={selectedIndex === 0 ? renderSchoolItem : renderDormItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        emptyIcon="heart"
        emptyMessage={
          "You haven't favorited any " +
          (selectedIndex === 0 ? 'schools' : 'dorms') +
          ' yet. Click the heart icon at the top right of a page to start your collection!'
        }
      />
      <Banner
        visible
        adUnitID={adUnits.banners.favoritesLower}
        position="bottom"
      />
    </Container>
  );
};

export default FavoritesScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;

const oldIOS =
  parseInt(Platform.Version.toString(), 10) < 13 && Platform.OS === 'ios';
const Control = styled(SegmentedControl).attrs(({theme}) => ({
  tintColor: oldIOS ? theme.colors.primary : undefined,
}))``;

const FavoriteList = styled(
  CustomFlatList as new () => CustomFlatList<Dorm | School>,
)``;

const HeaderContainer = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.margins}px;
`;
