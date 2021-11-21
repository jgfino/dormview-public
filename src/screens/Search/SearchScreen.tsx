import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect, useState} from 'react';
import {ListRenderItem, Platform} from 'react-native';
import {SearchBar} from 'react-native-elements';
import Animated, {Extrapolate} from 'react-native-reanimated';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import styled from 'styled-components/native';
import Banner from '../../components/ads/Banner';
import ImageCell from '../../components/molecules/ListItem';
import CustomFlatList from '../../components/native-replacements/CustomFlatList';
import Text from '../../components/native-replacements/Text';
import {adUnits} from '../../constants/credentials';
import {AuthContext} from '../../context/AuthProvider';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase, {School} from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  RootStackParamList,
  SearchStackParamList,
  TabParamList,
} from '../../types/routes';

type SearchScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<SearchStackParamList, 'SearchScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type SearchScreenRouteProp = RouteProp<SearchStackParamList, 'SearchScreen'>;

type Props = {
  navigation: SearchScreenNavigationProp;
  route: SearchScreenRouteProp;
};

const itemsPerPage = 25;

/**
 * The main search page where a user can search for schools by name and location
 */
const SearchScreen: React.FC<Props> = ({navigation, route}) => {
  const [search, setSearch] = useState('');

  const [showResults, setShowResults] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);

  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<School[]>([]);

  const {schoolFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const {user} = useContext(AuthContext);

  //#region Animation Values

  const [scrollY] = useState(new Animated.Value(0));
  const [scrollHeight, setScrollHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, scrollHeight, scrollHeight * 2],
    outputRange: [0, -scrollHeight, -scrollHeight * 2],
    extrapolate: Extrapolate.CLAMP,
  });

  const barTranslateY = scrollY.interpolate({
    inputRange: [0, scrollHeight],
    outputRange: [0, -scrollHeight],
    extrapolate: Extrapolate.CLAMP,
  });

  //#endregion

  useEffect(() => {
    const initializeRecents = async () => {
      const oldRecents = await AsyncStorage.getItem('recentSearches');

      if (!oldRecents) {
        return;
      }

      const recentsArray: string[] = JSON.parse(oldRecents);

      setRecents(recentsArray);
    };
    initializeRecents();
  }, []);

  const updateResults = async (query: string) => {
    if (!query) {
      const {data, error} = await schoolFunctions.getAllSchools(
        itemsPerPage,
        0,
      );

      if (error) {
        showAlert({message: 'Error searching schools: ' + error.message});
        console.log(error);
        return;
      }

      setResults(data ?? []);
      setShowResults(true);
    } else {
      setSearch(query);
      setSearching(true);
      const {data, error} = await schoolFunctions.searchSchools(
        query,
        itemsPerPage,
        0,
      );
      setSearching(false);

      if (error) {
        showAlert({message: 'Error searching schools: ' + error.message});
        console.log(error);
        return;
      }

      setResults(data ?? []);
      setShowResults(true);

      const newRecents = [...recents];
      newRecents.unshift(query);

      if (newRecents.length > 25) {
        newRecents.pop();
      }

      setRecents(newRecents);

      analytics().logSearch({search_term: query});
      AsyncStorage.setItem('recentSearches', JSON.stringify(newRecents));
    }
  };

  const loadMoreResults = async () => {
    let result;

    if (!search) {
      result = await schoolFunctions.getAllSchools(
        itemsPerPage,
        results.length,
      );
    } else {
      result = await schoolFunctions.searchSchools(
        search,
        itemsPerPage,
        results.length,
      );
    }

    if (result.error) {
      showAlert({
        message: 'Error loading more schools: ' + result.error.message,
      });
      console.log(result.error);
      return;
    }

    setResults([...results, ...(result.data ?? [])]);
  };

  const onRequestPressed = async () => {
    if (!user) {
      showAlert({
        message:
          'You must be signed in to request a school. Do you want to sign up now?',
        closeButtonText: 'No',
        confirmButtonText: 'Yes',
        onConfirm: () => navigation.push('Auth', {screen: 'SignUpScreen'}),
      });
      return;
    }

    navigation.navigate('AddSchoolModal', {editing: false});
  };

  const clearSearches = async () => {
    await AsyncStorage.setItem('recentSearches', JSON.stringify([]));
    setRecents([]);
  };

  const renderRecentItem: ListRenderItem<string> = ({item, index}) => {
    const RecentComponent = (
      <RecentContainer onPress={() => updateResults(item)}>
        <RecentItem size={16} weight="semibold" color="secondary2">
          {item}
        </RecentItem>
      </RecentContainer>
    );

    if (index === 0) {
      return (
        <>
          <RecentItem size={18} weight="bold" color="secondary1">
            Recent Searches:
          </RecentItem>
          {RecentComponent}
        </>
      );
    } else {
      return RecentComponent;
    }
  };

  const renderResultItem: ListRenderItem<School> = ({item, index}) => {
    return (
      <ImageCell
        title={item.name}
        subtitle={[item.location]}
        onPress={() =>
          navigation.push('SchoolScreen', {
            schoolId: item.id,
          })
        }
      />
    );
  };

  return (
    <Container>
      <HeaderContainer
        onLayout={event =>
          setHeaderHeight(
            event.nativeEvent.layout.height -
              StaticSafeAreaInsets.safeAreaInsetsTop,
          )
        }>
        <AnimatedContainer
          style={{transform: [{translateY: titleTranslateY}]}}
          onLayout={event => setScrollHeight(event.nativeEvent.layout.height)}>
          <Title size={40} weight="bold">
            Search
          </Title>
        </AnimatedContainer>
        <Bar
          showCancel={showResults}
          style={{transform: [{translateY: barTranslateY}]}}
          placeholder="Enter name, city, or zip code"
          platform={Platform.OS === 'ios' ? 'ios' : 'android'}
          showLoading={searching}
          onSubmitEditing={props =>
            updateResults(props.nativeEvent.text.trim())
          }
          returnKeyType="search"
          onClear={() => setShowResults(false)}
          //@ts-ignore
          onChangeText={text => setSearch(text)}
          value={search}
        />
      </HeaderContainer>
      <SearchFlatList
        emptyIcon="search"
        emptyMessage={
          showResults
            ? 'No results were found for your search. If you don’t see the school you’re looking for, request it by clicking above!'
            : 'Recent searches will appear here'
        }
        showsVerticalScrollIndicator={false}
        topButtonTitle="Request a School"
        onTopButtonPressed={onRequestPressed}
        contentContainerStyle={{
          paddingTop:
            headerHeight +
            //@ts-ignore
            Platform.select({
              ios: 0,
              android: StaticSafeAreaInsets.safeAreaInsetsTop,
            }),
        }}
        onScroll={Animated.event([
          {nativeEvent: {contentOffset: {y: scrollY}}},
        ])}
        scrollEventThrottle={16}
        data={showResults ? results : recents}
        // @ts-ignore
        renderItem={showResults ? renderResultItem : renderRecentItem}
        keyExtractor={(item, index) => index.toString()}
        onEndReachedThreshold={0.4}
        onEndReached={showResults ? loadMoreResults : undefined}
        initialNumToRender={itemsPerPage}
        showsBottomButton={recents.length > 0 && !showResults}
        bottomButtonTitle="Clear Recent Searches"
        onBottomButtonPressed={clearSearches}
      />
      <Banner
        visible
        adUnitID={adUnits.banners.searchLower}
        position="bottom"
      />
    </Container>
  );
};

export default SearchScreen;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.primary};
`;

const HeaderContainer = styled.View`
  position: absolute;
  left: 0px;
  right: 0px;
  z-index: 1;
  padding-top: ${Platform.select({
    ios: StaticSafeAreaInsets.safeAreaInsetsTop,
    android: 0,
  })}px;
`;

const AnimatedContainer = styled(Animated.View)``;

const Title = styled(Text)`
  margin-left: ${({theme}) => theme.spacing.margins}px;
`;

const Bar = styled(Animated.createAnimatedComponent(SearchBar)).attrs(
  props => ({
    inputContainerStyle: {
      height: 44,
      backgroundColor: props.theme.colors.accent2,
    },
    inputStyle: {
      fontFamily: 'Nunito',
      color: props.theme.colors.text.primary,
    },
    containerStyle: {
      backgroundColor: props.theme.colors.background.primary,
    },
    selectionColor: props.theme.colors.primary,
    cancelButtonProps: {
      color: props.theme.colors.primary,
    },
    searchIcon: {
      color: props.theme.colors.primary,
    },
    cancelIcon: {
      color: props.theme.colors.primary,
    },
  }),
)``;

const AnimatedList = Animated.createAnimatedComponent(CustomFlatList);
const SearchFlatList = styled(
  AnimatedList as new () => CustomFlatList<string | School>,
)``;

const RecentContainer = styled.TouchableOpacity`
  padding-top: ${({theme}) => theme.spacing.margins}px;
  padding-bottom: ${({theme}) => theme.spacing.margins}px;
`;

const RecentItem = styled(Text)``;
