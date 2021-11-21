import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useState} from 'react';
import {Alert} from 'react-native';
import styled from 'styled-components/native';
import BlockButton from '../../components/atoms/BlockButton';
import ConditionalKeyboardScrollView from '../../components/native-replacements/ConditionalKeyboardScrollView';
import TextInput from '../../components/native-replacements/TextInput';
import CardView from '../../components/views/CardView';
import {AuthContext} from '../../context/AuthProvider';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type EditProfileScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'EditProfileScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type EditProfileScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'EditProfileScreen'
>;

type Props = {
  navigation: EditProfileScreenNavigationProp;
  route: EditProfileScreenRouteProp;
};

/**
 * Allows a user to edit their name and email as well as request a password reset
 */
const EditProfileScreen: React.FC<Props> = ({navigation, route}) => {
  const {profile, changeEmail} = useContext(AuthContext);
  const [name, setName] = useState<string>();
  const [email, setEmail] = useState<string>();

  const onChangeEmail = async () => {
    if (!email) {
      Alert.alert('Oops!', 'Please enter an email');
      return;
    }

    const error = await changeEmail(email.trim());

    if (error) {
      Alert.alert('Error', 'Unable to change email: ' + error.message);
      return;
    }

    Alert.alert('Success', 'Email updated successfully');
  };

  return (
    <Container>
      <ScrollView>
        <ScrollContainer>
          <FieldContainer label="EMAIL:">
            <TextInput
              defaultValue={profile?.email}
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={onChangeEmail}
              keyboardType="email-address"
              autoCompleteType="email"
            />
          </FieldContainer>
          <ResetButton
            text="Reset Password"
            onPress={() =>
              navigation.navigate('Auth', {screen: 'SendResetScreen'})
            }
          />
        </ScrollContainer>
      </ScrollView>
    </Container>
  );
};

export default EditProfileScreen;

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.secondary1};
`;

const ScrollView = styled(ConditionalKeyboardScrollView)``;

const ScrollContainer = styled.View`
  justify-content: space-between;
`;

const FieldContainer = styled(CardView)`
  padding-left: ${({theme}) => theme.spacing.margins}px;
  padding-right: ${({theme}) => theme.spacing.margins}px;
`;

const ResetButton = styled(BlockButton)`
  margin: ${({theme}) => theme.spacing.margins}px;
`;
