import analytics from '@react-native-firebase/analytics';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect, useState} from 'react';
import {ListRenderItem, Platform} from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated, {Extrapolate} from 'react-native-reanimated';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import styled from 'styled-components/native';
import defaultSchool from '../../assets/images/defaultSchool.jpg';
import Banner from '../../components/ads/Banner';
import LoadingScreen from '../../components/atoms/LoadingScreen';
import PendingRibbon from '../../components/atoms/PendingRibbon';
import ListItem from '../../components/molecules/ListItem';
import CustomFlatList from '../../components/native-replacements/CustomFlatList';
import Text from '../../components/native-replacements/Text';
import {adUnits} from '../../constants/credentials';
import {AuthContext} from '../../context/AuthProvider';
import useAlertModal from '../../hooks/useAlertModal';
import useRightIconHeader from '../../hooks/useRightIconHeader';
import useSupabase, {Dorm, School} from '../../hooks/useSupabase';
import {
  HomeStackParamList,
  ModalStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type SchoolScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'SchoolScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type SchoolScreenRouteProp = RouteProp<HomeStackParamList, 'SchoolScreen'>;

type Props = {
  navigation: SchoolScreenNavigationProp;
  route: SchoolScreenRouteProp;
};

/**
 * The main display screen for a School. This screen displays the name and location of the school,
 * along with a list of available buildings to add or view photos from.
 */
const SchoolScreen: React.FC<Props> = ({navigation, route}) => {
  const schoolId = route.params.schoolId;

  const {schoolFunctions, dormFunctions} = useSupabase();
  const {showAlert} = useAlertModal();
  const {user} = useContext(AuthContext);

  const [school, setSchool] = useState<School>();
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [favorite, setFavorite] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [imageSource, setImageSource] = useState<any>();

  //#region Animation Values

  const [scrollY] = useState(new Animated.Value(0));

  const [headerHeight, setHeaderHeight] = useState(0);

  const headerY = scrollY.interpolate({
    inputRange: [-100, 0, headerHeight, headerHeight * 2],
    outputRange: [10, 0, -headerHeight, -headerHeight * 2],
    extrapolate: Extrapolate.CLAMP,
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.1, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  const navOpacity = scrollY.interpolate({
    inputRange: [
      0,
      200 - StaticSafeAreaInsets.safeAreaInsetsTop,
      Math.max(headerHeight - StaticSafeAreaInsets.safeAreaInsetsTop, 200),
    ],
    outputRange: [0, 0, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  //#endregion

  useEffect(() => {
    const getInitialFavorite = async () => {
      const {data} = await schoolFunctions.hasFavoriteSchool(schoolId);
      if (data != null) {
        setFavorite(data);
      }
    };
    getInitialFavorite();
    onRefresh();
    analytics().logEvent('view_school', {id: schoolId});
  }, [route]);

  const onRefresh = async () => {
    const {data: newSchool, error: schoolError} =
      await schoolFunctions.getSchool(schoolId);

    const {data: newDorms, error: dormError} =
      await dormFunctions.getDormsForSchool(schoolId);

    if (schoolError || dormError || !newSchool || !newDorms) {
      console.log('Error fetching school data:', schoolError, dormError);
      showAlert({
        message:
          'Unable to fetch data for school. Please try again later: ' +
          schoolError?.message +
          ' ' +
          dormError?.message,
      });
      setRefreshing(false);
      return;
    }

    setSchool(newSchool);
    setImageSource({uri: newSchool.photo_url});
    setDorms(newDorms);
  };

  const onFavoritePressed = async () => {
    if (!user) {
      showAlert({
        message:
          'You must be signed in to favorite a school. Do you want to sign up now?',
        closeButtonText: 'No',
        confirmButtonText: 'Yes',
        onConfirm: () => navigation.push('Auth', {screen: 'SignUpScreen'}),
      });
      return;
    }

    const {data, error} = await schoolFunctions.toggleFavoriteSchool(schoolId);
    if (!error && data != null) {
      if (data) {
        analytics().logEvent('favorite_school', {id: schoolId});
      } else {
        analytics().logEvent('unfavorite_school', {id: schoolId});
      }
      setFavorite(data);
    } else {
      showAlert({message: error?.message ?? 'Unable to favorite school'});
      console.log(error);
    }
  };

  useRightIconHeader({
    title: school?.name || '',
    icons: !school?.pending
      ? [favorite ? 'heart' : 'heart-outline']
      : undefined,
    iconActions: [onFavoritePressed],
    animated: true,
    opacity: navOpacity,
  });

  const onRequestPressed = () => {
    if (!school) return;

    if (!user) {
      showAlert({
        message:
          'You must be signed in to request a dorm. Do you want to sign up now?',
        closeButtonText: 'No',
        confirmButtonText: 'Yes',
        onConfirm: () => navigation.push('Auth', {screen: 'SignUpScreen'}),
      });
      return;
    }

    navigation.push('AddDormModal', {school: school, editing: false});
  };

  const onDeletePressed = async () => {
    showAlert({
      title: 'Confirm',
      message:
        'Are you sure you want to delete this school? Any dorms or photos pending for this school will also be deleted',
      closeButtonText: 'No',
      confirmButtonText: 'Yes',
      onConfirm: async () => {
        const {error} = await schoolFunctions.deleteSchool(schoolId);
        if (error) {
          console.log(error);
          showAlert({message: 'Unable to delete school: ' + error.message});
          return;
        }
        navigation.goBack();
      },
    });
  };

  if (!school) return <LoadingScreen />;

  const refreshProps = Platform.select({
    ios: {
      onRefresh: onRefresh,
      refreshing: refreshing,
    },
  });

  const renderItem: ListRenderItem<Dorm> = ({item}) => {
    return (
      <DormItem
        title={item.name}
        subtitle={item.style}
        onPress={() => {
          navigation.push('DormScreen', {
            dormId: item.id,
          });
        }}
      />
    );
  };
  return (
    <Container>
      <HeaderContainer
        style={{transform: [{translateY: headerY}]}}
        onLayout={event => setHeaderHeight(event.nativeEvent.layout.height)}>
        <ImageContainer style={{transform: [{scale: imageScale}]}}>
          <HeaderImage
            source={imageSource}
            onError={() => setImageSource(defaultSchool)}
          />
        </ImageContainer>
        <Ribbon
          visible={school.pending}
          message="This school is currently under review. Any changes will only be visible to you."
        />
        <HeaderText size={22} weight="bold">
          {school.name}
        </HeaderText>
        <HeaderText size={18} color="secondary2" weight="semibold">
          {school.location}
        </HeaderText>
      </HeaderContainer>
      <DormList
        data={dorms}
        renderItem={renderItem}
        emptyIcon="images"
        emptyMessage="No dorms are available for this school yet. Click above to add one and start growing this school’s collection!"
        topButtonTitle="Request a Dorm!"
        onTopButtonPressed={onRequestPressed}
        showsBottomButton={school.pending}
        bottomButtonTitle="Delete School"
        onBottomButtonPressed={onDeletePressed}
        scrollEventThrottle={16}
        contentContainerStyle={{paddingTop: headerHeight}}
        onScroll={Animated.event([
          {nativeEvent: {contentOffset: {y: scrollY}}},
        ])}
        {...refreshProps}
      />
      <Banner
        visible={!school.pending}
        adUnitID={adUnits.banners.schoolLower}
        position="bottom"
      />
    </Container>
  );
};

export default SchoolScreen;

const Container = styled.View`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;

const AnimatedList = Animated.createAnimatedComponent(CustomFlatList);
const DormList = styled(AnimatedList as new () => CustomFlatList<Dorm>)``;

const DormItem = styled(ListItem)``;

const HeaderContainer = styled(Animated.View)`
  position: absolute;
  left: 0px;
  right: 0px;
  z-index: 1;
  padding-bottom: 16px;
`;

const ImageContainer = styled(Animated.View)`
  margin-bottom: ${({theme}) => theme.spacing.margins}px;
`;

const HeaderImage = styled(FastImage)`
  height: ${Platform.select({ios: 200, android: 150})}px;
`;

const Ribbon = styled(PendingRibbon)`
  margin-top: ${({theme}) => -theme.spacing.margins}px;
  margin-bottom: ${({theme}) => theme.spacing.itemSpacing}px;
`;

const HeaderText = styled(Text)`
  margin-left: ${({theme}) => theme.spacing.margins}px;
  margin-right: ${({theme}) => theme.spacing.margins}px;
`;
