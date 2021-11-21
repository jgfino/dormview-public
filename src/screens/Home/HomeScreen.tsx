import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  useColorScheme,
} from 'react-native';
import styled from 'styled-components/native';
import logo from '../../assets/images/logo.png';
import logoDark from '../../assets/images/logoDark.png';
import Banner from '../../components/ads/Banner';
import PendingRibbon from '../../components/atoms/PendingRibbon';
import Spacer from '../../components/atoms/Spacer';
import ListItem from '../../components/molecules/ListItem';
import SquareIconCard from '../../components/molecules/SquareIconCard';
import Text from '../../components/native-replacements/Text';
import {adUnits} from '../../constants/credentials';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase, {School} from '../../hooks/useSupabase';
import {
  HomeStackParamList,
  ModalStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type HomeScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'HomeScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type HomeScreenRouteProp = RouteProp<HomeStackParamList, 'HomeScreen'>;

type Props = {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
};

// Section type for home screen
type HomeSection = {
  title: string;
  horizontal?: boolean;
  data: School[];
};

const itemsPerPage = 25;

/**
 * The main landing screen a user sees. It shows recently added schools and a list of all available schools at the bottom
 */
const HomeScreen: React.FC<Props> = ({navigation, route}) => {
  const [newSchools, setNewSchools] = useState<School[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const {schoolFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const scheme = useColorScheme();

  useEffect(() => {
    onRefresh();
  }, []);

  // Refresh sections when data in either list changes
  useEffect(() => {
    setSections([
      {
        title: 'Just Added',
        data: newSchools,
        horizontal: true,
      },
      {title: 'All Schools', data: allSchools},
    ]);
  }, [newSchools, allSchools]);

  const onRefresh = () => {
    Promise.all([loadMoreNew(true), loadMoreAll(true)]).finally(() =>
      setRefreshing(false),
    );
  };

  const loadMoreNew = async (reset: boolean = false) => {
    const {data: newData, error: newError} =
      await schoolFunctions.getAllSchoolsByDate(
        itemsPerPage,
        reset ? 0 : newSchools.length,
      );

    if (newError || newData == null) {
      showAlert({
        message:
          'Error fetching new schools, please try again later: ' +
          newError?.message,
      });
      console.log(newError);
      return;
    }

    const data = reset ? newData : [...newSchools, ...newData];
    setNewSchools([...new Set(data)]);
  };

  const loadMoreAll = async (reset: boolean = false) => {
    const {data: allData, error: allError} =
      await schoolFunctions.getAllSchools(
        itemsPerPage,
        reset ? 0 : allSchools.length,
      );

    if (allError || allData == null) {
      showAlert({
        message:
          'Error fetching schools, please try again later: ' +
          allError?.message,
      });
      console.log(allError);
      return;
    }

    const data = reset ? allData : [...allSchools, ...allData];
    setAllSchools([...new Set(data)]);
  };

  // Renders a square cell used in the first sections of the list
  const renderHorizontalItem: ListRenderItem<School> = ({item}) => (
    <SquareIconCard
      iconName="school"
      title={item.name}
      subtitle={item.location}
      onPress={() => navigation.push('SchoolScreen', {schoolId: item.id})}
    />
  );

  // Renders a rectangle cell used in the bottom list
  const renderVerticalItem: SectionListRenderItem<School, HomeSection> = ({
    item,
    section,
  }) =>
    section.horizontal ? null : (
      <>
        <VerticalItem
          title={item.name}
          subtitle={[item.location]}
          onPress={() =>
            navigation.push('SchoolScreen', {
              schoolId: item.id,
            })
          }
        />
        <Spacer />
      </>
    );

  // Renders the section header and, if applicable, the horizontal list for a section
  const renderSectionHeader = ({
    section,
  }: {
    section: SectionListData<School, HomeSection>;
  }) => (
    <>
      {section.data.length > 0 && (
        <HeaderText size={22} weight="bold" color="secondary1">
          {section.title}
        </HeaderText>
      )}
      {section.horizontal && (
        <HorizontalList
          onEndReached={() => loadMoreNew()}
          horizontal
          ItemSeparatorComponent={() => <Spacer horizontal />}
          data={section.data}
          renderItem={renderHorizontalItem}
          initialNumToRender={itemsPerPage}
          showsHorizontalScrollIndicator={false}
          onEndReachedThreshold={0.3}
        />
      )}
    </>
  );

  return (
    <Container>
      <PendingRibbon
        message="Currently in development mode. All API requests will be made to the test database and all ads served will be in test mode."
        visible={__DEV__}
      />
      <MainList
        ListHeaderComponent={
          <LogoContainer>
            <Logo
              source={scheme === 'dark' ? logoDark : logo}
              resizeMode="contain"
            />
          </LogoContainer>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        initialNumToRender={itemsPerPage}
        onEndReached={() => loadMoreAll()}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        sections={sections}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderVerticalItem}
        onEndReachedThreshold={0.3}
      />
      <Banner visible adUnitID={adUnits.banners.homeLower} position="bottom" />
    </Container>
  );
};

export default HomeScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;

const VerticalItem = styled(ListItem)`
  margin-left: ${({theme}) => theme.spacing.margins}px;
  margin-right: ${({theme}) => theme.spacing.margins}px;
`;

const LogoContainer = styled.View`
  align-items: center;
  justify-content: center;
  height: 40px;
  margin: 16px;
`;

const Logo = styled(Image)`
  flex: 1;
`;

const HeaderText = styled(Text)`
  margin-left: ${({theme}) => theme.spacing.margins}px;
  margin-bottom: ${({theme}) => theme.spacing.itemSpacing}px;
`;

const MainList = styled(
  SectionList as new () => SectionList<School, HomeSection>,
).attrs(({theme}) => ({
  contentContainerStyle: {
    paddingBottom: theme.spacing.itemSpacing,
  },
}))``;

const HorizontalList = styled(FlatList as new () => FlatList<School>).attrs(
  ({theme}) => ({
    contentContainerStyle: {
      paddingLeft: theme.spacing.margins,
      paddingRight: theme.spacing.margins,
      paddingBottom: theme.spacing.itemSpacing,
    },
  }),
)``;
