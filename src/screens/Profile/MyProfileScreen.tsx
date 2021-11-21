import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useState} from 'react';
import {Linking, ListRenderItem} from 'react-native';
import styled from 'styled-components/native';
import ListItem from '../../components/molecules/ListItem';
import CustomFlatList from '../../components/native-replacements/CustomFlatList';
import {AuthContext} from '../../context/AuthProvider';
import useAlertModal from '../../hooks/useAlertModal';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type MyProfileScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'MyProfileScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type MyProfileScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'MyProfileScreen'
>;

type Props = {
  navigation: MyProfileScreenNavigationProp;
  route: MyProfileScreenRouteProp;
};

type ProfileListItem = {
  title: string;
  icon?: string;
  goToDestination?: () => void;
};

/**
 * The screen seen on the "Profile" tab by a user when they are logged in
 */
const MyProfileScreen = ({navigation, route}: Props) => {
  const {user, profile, signOut, updateUserProfile} = useContext(AuthContext);
  const {showAlert} = useAlertModal();
  const [refreshing, setRefreshing] = useState(false);

  const userListItems = [
    {
      title: `My Pending Schools`,
      goToDestination: () => navigation.push('PendingSchoolsScreen'),
    },
    {
      title: `My Pending Dorms`,
      goToDestination: () => navigation.push('PendingDormsScreen'),
    },
    {
      title: `My Pending Photos`,
      goToDestination: () => navigation.push('PendingPhotosScreen'),
    },
    // {
    //   icon: 'create-outline',
    //   title: 'Edit Profile',
    //   goToDestination: () => navigation.push('EditProfileScreen'),
    // },
    {
      icon: 'heart',
      title: 'My Favorites',
      goToDestination: () => navigation.push('FavoritesScreen'),
    },
    {
      icon: 'images',
      title: 'My Photos',
      goToDestination: () => navigation.push('MyPhotosScreen'),
    },
  ];

  const listItems: ProfileListItem[] = [
    {
      icon: 'star-half',
      title: 'Send Feedback',
      goToDestination: () => navigation.push('FeedbackScreen'),
    },
    {
      icon: 'reader',
      title: 'Privacy Policy/Terms',
      goToDestination: () =>
        Linking.openURL('https://www.dormviewapp.com/privacy-terms'),
    },
  ];

  const adminListItems = [
    {
      icon: 'analytics',
      title: 'Admin Dashboard',
      goToDestination: () => navigation.push('AdminHomeScreen'),
    },
  ];

  const onSignOutPressed = async () => {
    const error = await signOut();
    if (error) {
      showAlert({
        message: 'There was an error signing out, please try again later',
      });
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{name: 'Auth', params: {screen: 'SignInScreen'}}],
    });
  };

  const onSignInPressed = async () => {
    navigation.push('Auth', {screen: 'SignInScreen'});
  };

  const onRefresh = async () => {
    const error = await updateUserProfile();
    if (error) {
      showAlert({message: 'Unable to refresh profile: ' + error.message});
      setRefreshing(false);
    }
  };

  const renderItem: ListRenderItem<ProfileListItem> = ({item}) => {
    return (
      <ListItem
        title={item.title}
        icon={item.icon}
        onPress={item.goToDestination}
      />
    );
  };

  return (
    <Container>
      <CustomFlatList
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={
          profile?.admin
            ? [...userListItems, ...listItems, ...adminListItems]
            : user
            ? [...userListItems, ...listItems]
            : listItems
        }
        renderItem={renderItem}
        showsTopButton={false}
        bottomButtonTitle={user ? 'Sign Out' : 'Sign In'}
        showsBottomButton
        bottomButtonDestructive={user ? true : false}
        onBottomButtonPressed={user ? onSignOutPressed : onSignInPressed}
        keyExtractor={(item, index) => index.toString()}
      />
    </Container>
  );
};

export default MyProfileScreen;

const Container = styled.View`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;
