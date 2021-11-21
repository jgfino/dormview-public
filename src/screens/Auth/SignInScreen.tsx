import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useState} from 'react';
import styled from 'styled-components/native';
import BlockButton from '../../components/atoms/BlockButton';
import TwoTonedTextButton from '../../components/atoms/TwoTonedTextButton';
import TextFieldLabel from '../../components/molecules/TextFieldLabel';
import ConditionalKeyboardScrollView from '../../components/native-replacements/ConditionalKeyboardScrollView';
import Text from '../../components/native-replacements/Text';
import {AuthContext} from '../../context/AuthProvider';
import useAlertModal from '../../hooks/useAlertModal';
import {
  AuthStackParamList,
  ModalStackParamList,
  RootStackParamList,
} from '../../types/routes';

type SignInScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, 'SignInScreen'>,
  CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    StackNavigationProp<ModalStackParamList>
  >
>;

type SignInScreenRouteProp = RouteProp<AuthStackParamList, 'SignInScreen'>;

type Props = {
  navigation: SignInScreenNavigationProp;
  route: SignInScreenRouteProp;
};

/**
 * The screen for a user to sign in with an email and password
 */
const SignInScreen: React.FC<Props> = ({navigation}) => {
  const {signIn} = useContext(AuthContext);
  const [signingIn, setSigningIn] = useState(false);

  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const {showAlert} = useAlertModal();

  const onSignInPressed = async () => {
    if (!email || !password) {
      showAlert({
        title: 'Missing Info',
        message: 'Please enter an email and password.',
      });

      return;
    }

    setSigningIn(true);
    const error = await signIn(email.trim(), password.trim());
    setSigningIn(false);

    if (error) {
      showAlert({message: error.message});
      console.log(error);
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{name: 'Main'}],
    });
  };

  return (
    <Container>
      <ScrollView align="center">
        <ScrollContainer>
          <Logo size={50} weight="light" align="center">
            DormView
          </Logo>
          <AuthContainer>
            <FieldContainer>
              <TextFieldLabel
                label="EMAIL:"
                autoCapitalize="none"
                autoCompleteType="email"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </FieldContainer>
            <FieldContainer>
              <TextFieldLabel
                label="PASSWORD:"
                autoCapitalize="none"
                autoCompleteType="password"
                autoCorrect={false}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={onSignInPressed}
              />
            </FieldContainer>
            <SignInButton
              loading={signingIn}
              onPress={onSignInPressed}
              text="Sign In"
            />
          </AuthContainer>
          <BottomContainer>
            <TextButton
              first="New Here?"
              second="Sign Up"
              onPress={() => navigation.navigate('SignUpScreen')}
            />
            <TextButton
              first="Forgot Password?"
              second="Click Here"
              onPress={() => navigation.navigate('SendResetScreen')}
            />
          </BottomContainer>
        </ScrollContainer>
      </ScrollView>
    </Container>
  );
};

export default SignInScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;

const ScrollView = styled(ConditionalKeyboardScrollView)``;

const ScrollContainer = styled.View`
  padding-left: 38px;
  padding-right: 38px;
`;

const Logo = styled(Text)`
  margin-bottom: 60px;
`;

const AuthContainer = styled.View``;

const FieldContainer = styled.View`
  margin-bottom: 8px;
`;

const SignInButton = styled(BlockButton)`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const BottomContainer = styled.View`
  margin-top: ${({theme}) => theme.spacing.margins}px;
  margin-bottom: ${({theme}) => theme.spacing.margins}px;
  align-items: center;
`;

const TextButton = styled(TwoTonedTextButton)`
  margin-top: 16px;
`;
