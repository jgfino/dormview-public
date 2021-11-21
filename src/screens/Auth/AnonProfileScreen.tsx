import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import styled from 'styled-components/native';
import Banner from '../../components/ads/Banner';
import BlockButton from '../../components/atoms/BlockButton';
import EmptyMessage from '../../components/molecules/EmptyMessage';
import {adUnits} from '../../constants/credentials';
import {
  AnonProfileParamList,
  ModalStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type AnonProfileScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AnonProfileParamList, 'AnonProfileScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type AnonProfileScreenRouteProp = RouteProp<
  AnonProfileParamList,
  'AnonProfileScreen'
>;

type Props = {
  navigation: AnonProfileScreenNavigationProp;
  route: AnonProfileScreenRouteProp;
};

/**
 * The screen seen when a feature requires a user to be signed in
 */
const AnonProfileScreen = ({navigation, route}: Props) => {
  return (
    <Container>
      <Banner adUnitID={adUnits.banners.anonUpper} position="top" visible />
      <EmptyMessage
        icon="person-circle"
        message="Uh oh! This feature requires you to be signed in. Sign up now to gain access to more features like uploading photos, favoriting schools/dorms, and saving the photos you're most interested in!"
      />
      <LowerButton
        text="Sign In"
        onPress={() => navigation.navigate('Auth', {screen: 'SignInScreen'})}
      />
    </Container>
  );
};

export default AnonProfileScreen;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.primary};
  align-items: center;
`;

const LowerButton = styled(BlockButton)`
  margin-bottom: ${({theme}) => theme.spacing.margins}px;
`;
