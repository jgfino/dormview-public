import {
  ActionSheetProvider,
  connectActionSheet,
} from '@expo/react-native-action-sheet';
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';
import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  LinkingOptions,
  NavigationContainer,
  NavigationContainerRef,
  useNavigation,
} from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationOptions,
  StackNavigationProp,
} from '@react-navigation/stack';
import React, {useContext, useEffect, useRef} from 'react';
import {Platform, StatusBar, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {DefaultTheme, ThemeContext, ThemeProvider} from 'styled-components';
import {AuthContext, AuthProvider} from './src/context/AuthProvider';
import {ConsentProvider} from './src/context/ConsentProvider';
import useAlertModal from './src/hooks/useAlertModal';
import AdminHomeScreen from './src/screens/Admin/AdminHomeScreen';
import DormApprovalScreen from './src/screens/Admin/DormApprovalScreen';
import PhotoApprovalScreen from './src/screens/Admin/PhotoApprovalScreen';
import SchoolApprovalScreen from './src/screens/Admin/SchoolApprovalScreen';
import AnonProfileScreen from './src/screens/Auth/AnonProfileScreen';
import ResetPwdScreen from './src/screens/Auth/ResetPwdScreen';
import SendResetScreen from './src/screens/Auth/SendResetScreen';
import SignInScreen from './src/screens/Auth/SignInScreen';
import SignUpScreen from './src/screens/Auth/SignUpScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import DormScreen from './src/screens/Main/DormScreen';
import PhotoScreen from './src/screens/Main/PhotoScreen';
import RoomScreen from './src/screens/Main/RoomScreen';
import SchoolScreen from './src/screens/Main/SchoolScreen';
import AddDormModal from './src/screens/Modals/AddDormModal';
import AddPhotoModal from './src/screens/Modals/AddPhotoModal';
import AddSchoolModal from './src/screens/Modals/AddSchoolModal';
import AlertModal from './src/screens/Modals/AlertModal';
import ConfettiModal from './src/screens/Modals/ConfettiModal';
import FavoritesScreen from './src/screens/Profile/FavoritesScreen';
import FeedbackScreen from './src/screens/Profile/FeedbackScreen';
import MyPhotosScreen from './src/screens/Profile/MyPhotosScreen';
import MyProfileScreen from './src/screens/Profile/MyProfileScreen';
import PendingDormsScreen from './src/screens/Profile/PendingDormsScreen';
import PendingPhotosScreen from './src/screens/Profile/PendingPhotosScreen';
import PendingSchoolsScreen from './src/screens/Profile/PendingSchoolsScreen';
import SavedPhotosScreen from './src/screens/Saved/SavedPhotosScreen';
import SearchScreen from './src/screens/Search/SearchScreen';
import {
  AnonProfileParamList,
  AuthStackParamList,
  HomeStackParamList,
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  SavedStackParamList,
  SearchStackParamList,
  TabParamList,
} from './src/types/routes';
import {darkTheme, lightTheme} from './themes';

const ModalStack = createStackNavigator<ModalStackParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

export type RootNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    StackNavigationProp<ModalStackParamList>
  >
>;

/**
 * Hook wrapper for entire app to allow accessing theme in navigators
 */
const useConnectedApp = (theme: DefaultTheme) => {
  const defaultScreenOptions: StackNavigationOptions = {
    headerTitleStyle: {
      fontFamily: Platform.select({ios: 'Nunito', android: 'Nunito_SemiBold'}),
      fontWeight: Platform.select({ios: '500', android: undefined}),
      color: theme.colors.text.primary,
    },
    headerTintColor: theme.colors.primary,
    headerBackTitleVisible: false,
    headerStyle: {
      backgroundColor: theme.colors.background.primary,
      shadowColor: theme.colors.accent2,
    },
  };

  /**
   * Contains all of the navigation/screens for the app
   */
  const AppWithNavigation = () => {
    const {initialLaunch, user} = useContext(AuthContext);
    const {showAlert} = useAlertModal();
    const navigation = useNavigation<RootNavigationProp>();

    useEffect(() => {
      return messaging().onMessage(async remoteMessage => {
        console.log('Received remote message:', remoteMessage);
        if (remoteMessage.data!.type.includes('request') && user) {
          showAlert({
            title: 'Admin Alert',
            message: remoteMessage.notification!.body!,
            confirmButtonText: 'See It!',
            onConfirm: () =>
              navigateFromRequestNotification(remoteMessage.data!.type),
            vibrate: true,
          });
        } else if (remoteMessage.data!.type === 'reject') {
          showAlert({
            title: 'Uh oh!',
            message: remoteMessage.notification!.body!,
            vibrate: true,
          });
        } else if (remoteMessage.data!.type === 'feedback') {
          showAlert({
            title: 'Admin Alert',
            message: remoteMessage.notification!.body!,
            vibrate: true,
          });
        } else {
          showAlert({
            title: 'Hey!',
            message: remoteMessage.notification!.body!,
            confirmButtonText: 'See It!',
            onConfirm: () =>
              navigateFromNotification(
                remoteMessage.data!.type,
                remoteMessage.data!.id,
              ),
            vibrate: true,
          });
        }
      });
    }, []);

    useEffect(() => {
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage,
        );

        if (remoteMessage.data!.type.includes('request')) {
          navigateFromRequestNotification(remoteMessage.data!.type);
          return;
        }

        navigateFromNotification(
          remoteMessage.data!.type,
          remoteMessage.data!.id,
        );
      });

      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage,
            );

            if (remoteMessage.data!.type.includes('request')) {
              navigateFromRequestNotification(remoteMessage.data!.type);
              return;
            }

            navigateFromNotification(
              remoteMessage.data!.type,
              remoteMessage.data!.id,
            );
          }
        });
    }, []);

    const navigateFromNotification = (type: string, id: string) => {
      switch (type) {
        case 'school':
          navigation.navigate('HomeTab', {
            screen: 'SchoolScreen',
            params: {schoolId: id},
            initial: false,
          });
          break;
        case 'dorm':
          navigation.navigate('HomeTab', {
            screen: 'DormScreen',
            params: {dormId: id},
            initial: false,
          });
          break;
        case 'photo':
          navigation.navigate('HomeTab', {
            screen: 'PhotoScreen',
            params: {photoId: id, bypassAd: true},
            initial: false,
          });
          break;
        default:
          return;
      }
    };

    const navigateFromRequestNotification = (type: string) => {
      const requestType = type.substring(type.indexOf('-') + 1);

      navigation.navigate('ProfileTab', {
        initial: false,
        screen:
          requestType === 'school'
            ? 'SchoolApprovalScreen'
            : requestType === 'dorm'
            ? 'DormApprovalScreen'
            : requestType === 'photo'
            ? 'PhotoApprovalScreen'
            : 'AdminHomeScreen',
      });
    };

    if (initialLaunch === undefined) return null;

    return (
      <ModalStack.Navigator
        screenOptions={{
          ...defaultScreenOptions,
          presentation: 'modal',
        }}>
        <ModalStack.Screen
          name="RootStack"
          component={Root}
          options={{
            headerShown: false,
          }}
        />
        <ModalStack.Screen name="AddSchoolModal" component={AddSchoolModal} />
        <ModalStack.Screen name="AddDormModal" component={AddDormModal} />
        <ModalStack.Screen name="AddPhotoModal" component={AddPhotoModal} />
        <ModalStack.Screen
          name="AlertModal"
          component={AlertModal}
          options={{
            cardStyle: {backgroundColor: 'rgba(0, 0, 0, 0.3)'},
            headerShown: false,
            presentation: 'transparentModal',
          }}
        />
        <ModalStack.Screen
          name="ConfettiModal"
          component={ConfettiModal}
          options={{
            headerShown: false,
            presentation: 'card',
            animationTypeForReplace: 'pop',
          }}
        />
      </ModalStack.Navigator>
    );
  };

  const Root = () => {
    const {initialLaunch} = useContext(AuthContext);
    return (
      <RootStack.Navigator
        initialRouteName={initialLaunch ? 'Auth' : 'Main'}
        screenOptions={{headerShown: false}}>
        <RootStack.Screen name="Main" component={TabBar} />
        <RootStack.Screen name="Auth" component={Auth} />
      </RootStack.Navigator>
    );
  };

  const AuthStack = createStackNavigator<AuthStackParamList>();

  const Auth = () => (
    <AuthStack.Navigator
      screenOptions={{headerShown: false, presentation: 'card'}}>
      <AuthStack.Screen name="SignInScreen" component={SignInScreen} />
      <AuthStack.Screen name="SignUpScreen" component={SignUpScreen} />
      <AuthStack.Screen name="ResetPwdScreen" component={ResetPwdScreen} />
      <AuthStack.Screen name="SendResetScreen" component={SendResetScreen} />
    </AuthStack.Navigator>
  );

  const HomeStack = createStackNavigator<HomeStackParamList>();
  /**
   * Stack navigator for the 'Home' tab
   */
  const Home = () => {
    return (
      <HomeStack.Navigator screenOptions={defaultScreenOptions}>
        <HomeStack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <HomeStack.Screen name="SchoolScreen" component={SchoolScreen} />
        <HomeStack.Screen name="DormScreen" component={DormScreen} />
        <HomeStack.Screen name="RoomScreen" component={RoomScreen} />
        <HomeStack.Screen name="PhotoScreen" component={PhotoScreen} />
      </HomeStack.Navigator>
    );
  };

  const SearchStack = createStackNavigator<SearchStackParamList>();

  const Search = () => {
    return (
      <SearchStack.Navigator screenOptions={defaultScreenOptions}>
        <SearchStack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{headerShown: false}}
        />
        <SearchStack.Screen name="SchoolScreen" component={SchoolScreen} />
        <SearchStack.Screen name="DormScreen" component={DormScreen} />
        <SearchStack.Screen name="RoomScreen" component={RoomScreen} />
        <SearchStack.Screen name="PhotoScreen" component={PhotoScreen} />
      </SearchStack.Navigator>
    );
  };

  const SavedPhotosStack = createStackNavigator<SavedStackParamList>();

  const SavedPhotos = () => {
    return (
      <SavedPhotosStack.Navigator screenOptions={defaultScreenOptions}>
        <SavedPhotosStack.Screen
          name="SavedPhotosScreen"
          component={SavedPhotosScreen}
          options={{title: 'Saved Photos'}}
        />
        <SavedPhotosStack.Screen name="SchoolScreen" component={SchoolScreen} />
        <SavedPhotosStack.Screen name="DormScreen" component={DormScreen} />
        <SavedPhotosStack.Screen name="RoomScreen" component={RoomScreen} />
        <SavedPhotosStack.Screen name="PhotoScreen" component={PhotoScreen} />
      </SavedPhotosStack.Navigator>
    );
  };

  const MyProfileStack = createStackNavigator<ProfileStackParamList>();
  /**
   * Stack navigator for the 'Profile' tab when a user is logged in
   */
  const MyProfile = () => {
    return (
      <MyProfileStack.Navigator screenOptions={defaultScreenOptions}>
        <MyProfileStack.Screen
          name="MyProfileScreen"
          component={MyProfileScreen}
          options={{title: 'Settings'}}
        />
        <MyProfileStack.Screen
          name="PendingSchoolsScreen"
          component={PendingSchoolsScreen}
          options={{title: 'Pending Schools'}}
        />
        <MyProfileStack.Screen
          name="PendingDormsScreen"
          component={PendingDormsScreen}
          options={{title: 'Pending Dorms'}}
        />
        <MyProfileStack.Screen
          name="PendingPhotosScreen"
          component={PendingPhotosScreen}
          options={{title: 'Pending Photos'}}
        />
        <MyProfileStack.Screen name="SchoolScreen" component={SchoolScreen} />
        <MyProfileStack.Screen name="DormScreen" component={DormScreen} />
        <MyProfileStack.Screen name="RoomScreen" component={RoomScreen} />
        <MyProfileStack.Screen name="PhotoScreen" component={PhotoScreen} />
        {/* <MyProfileStack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{title: 'Edit Profile'}}
      /> */}
        <MyProfileStack.Screen
          name="FavoritesScreen"
          component={FavoritesScreen}
          options={{title: 'Favorites'}}
        />
        <MyProfileStack.Screen
          name="MyPhotosScreen"
          component={MyPhotosScreen}
          options={{title: 'My Photos'}}
        />
        <MyProfileStack.Screen
          name="FeedbackScreen"
          component={FeedbackScreen}
          options={{title: 'Send Feedback'}}
        />
        <MyProfileStack.Screen
          name="AdminHomeScreen"
          component={AdminHomeScreen}
          options={{title: 'Admin Dashboard'}}
        />
        <MyProfileStack.Screen
          name="SchoolApprovalScreen"
          component={SchoolApprovalScreen}
          options={{title: 'Approve Schools'}}
        />
        <MyProfileStack.Screen
          name="DormApprovalScreen"
          component={DormApprovalScreen}
          options={{title: 'Approve Dorms'}}
        />
        <MyProfileStack.Screen
          name="PhotoApprovalScreen"
          component={PhotoApprovalScreen}
          options={{title: 'Approve Photos'}}
        />
      </MyProfileStack.Navigator>
    );
  };

  const AnonProfileStack = createStackNavigator<AnonProfileParamList>();
  /**
   * Stack navigator for the 'Profile' tab when a user is not logged in
   */
  const AnonProfile = () => {
    return (
      <AnonProfileStack.Navigator screenOptions={{headerShown: false}}>
        <AnonProfileStack.Screen
          name="AnonProfileScreen"
          component={AnonProfileScreen}
        />
      </AnonProfileStack.Navigator>
    );
  };

  const Tab = createBottomTabNavigator<TabParamList>();

  const TabBar = () => {
    const themeContext = useContext(ThemeContext);
    const {user} = useContext(AuthContext);

    return (
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused}) => {
            let icon = 'home';
            switch (route.name) {
              case 'HomeTab':
                icon = 'home';
                break;
              case 'SearchTab':
                icon = 'search';
                break;
              case 'UploadTab':
                icon = 'add-circle-outline';
                break;
              case 'SavedTab':
                icon = 'bookmarks';
                break;
              case 'ProfileTab':
                icon = 'cog';
                break;
              default:
                break;
            }
            return (
              <Icon
                name={icon}
                size={28}
                color={
                  focused
                    ? themeContext.colors.primary
                    : themeContext.colors.unfocused
                }
              />
            );
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: themeContext.colors.background.primary,
            borderTopColor: themeContext.colors.accent2,
          },
        })}>
        <Tab.Screen name="HomeTab" component={Home} />
        <Tab.Screen name="SearchTab" component={Search} />
        <Tab.Screen
          name="SavedTab"
          component={user ? SavedPhotos : AnonProfile}
        />
        <Tab.Screen name="ProfileTab" component={MyProfile} />
      </Tab.Navigator>
    );
  };

  return connectActionSheet(AppWithNavigation);
};

// WIP: linking for password resets
// dormview://#access_token=token&token_type=bearer&type=recovery
const linking: LinkingOptions<ModalStackParamList> = {
  prefixes: ['dormview://'],
  config: {
    screens: {
      RootStack: {
        screens: {
          Auth: {
            screens: {
              ResetPwdScreen: {
                path: ':token',
              },
            },
          },
        },
      },
    },
  },
};

/**
 * Entry file for the app; provides theme and auth context, as well as analytics screen tracking
 */
const App = () => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  const ConnectedApp = useConnectedApp(theme);

  const routeNameRef = useRef<string>();
  const navigationRef = useRef<NavigationContainerRef<ModalStackParamList>>(
    undefined!,
  );

  return (
    <ActionSheetProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ConsentProvider>
            <NavigationContainer
              linking={linking}
              ref={navigationRef}
              onReady={() => {
                routeNameRef.current =
                  navigationRef.current.getCurrentRoute()?.name;
              }}
              onStateChange={async () => {
                const previousRouteName = routeNameRef.current;
                const currentRouteName =
                  navigationRef.current.getCurrentRoute()?.name;

                if (previousRouteName !== currentRouteName) {
                  await analytics().logScreenView({
                    screen_name: currentRouteName,
                    screen_class: currentRouteName,
                  });
                }
                console.log(currentRouteName);
                routeNameRef.current = currentRouteName;
              }}>
              <StatusBar
                backgroundColor={theme.colors.background.primary}
                barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
              />
              <ConnectedApp />
            </NavigationContainer>
          </ConsentProvider>
        </AuthProvider>
      </ThemeProvider>
    </ActionSheetProvider>
  );
};

export default App;
