import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useState} from 'react';
import {Linking} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import styled, {ThemeContext} from 'styled-components/native';
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

type SignUpScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, 'SignUpScreen'>,
  CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    StackNavigationProp<ModalStackParamList>
  >
>;

type SignUpScreenRouteProp = RouteProp<AuthStackParamList, 'SignUpScreen'>;

type Props = {
  navigation: SignUpScreenNavigationProp;
  route: SignUpScreenRouteProp;
};

/**
 * The screen allowing a user to sign up with an email and password
 */
const SignUpScreen: React.FC<Props> = ({navigation}) => {
  const {showAlert} = useAlertModal();
  const {signUp} = useContext(AuthContext);
  const [signingUp, setSigningUp] = useState(false);
  const theme = useContext(ThemeContext);

  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [confirmPassword, setConfirmPassword] = useState<string>();
  const [accepted, setAccepted] = useState<boolean | undefined>(false);

  // Handle a user signing up
  const onSignUpPressed = async () => {
    if (!email || !password) {
      showAlert({title: 'Missing Info', message: 'Please fill out all fields'});
      return;
    }

    if (!accepted) {
      showAlert({
        message:
          'You must agree to our privacy policy and terms of conditions before signing up',
      });
      return;
    }

    // Password validation
    const passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (!password.match(passw)) {
      showAlert({
        title: 'Weak Password',
        message:
          'Please make sure your password contains 6-20 characters with at least 1 uppercase letter and 1 number',
      });
      return;
    }

    // Make sure the confirm password field is correct
    if (password !== confirmPassword) {
      showAlert({message: 'Passwords do not match'});
      return;
    }

    setSigningUp(true);
    const error = await signUp(email.trim(), password.trim());
    setSigningUp(false);

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
                keyboardType="default"
                autoCompleteType="password"
                autoCorrect={false}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </FieldContainer>
            <FieldContainer>
              <TextFieldLabel
                label="CONFIRM PASSWORD:"
                autoCapitalize="none"
                keyboardType="default"
                autoCompleteType="password"
                autoCorrect={false}
                secureTextEntry={true}
                onChangeText={setConfirmPassword}
              />
            </FieldContainer>
            <CheckboxContainer>
              <BouncyCheckbox
                onPress={isChecked => setAccepted(isChecked)}
                fillColor={theme.colors.primary}
                iconStyle={{borderColor: theme.colors.primary}}
              />
              <TermsText
                size={16}
                align="center"
                underline
                onPress={() =>
                  Linking.openURL('https://www.dormviewapp.com/privacy-terms')
                }>
                By signing up you agree to our Privacy Policy and Terms and
                Conditions
              </TermsText>
            </CheckboxContainer>

            <SignUpButton
              loading={signingUp}
              onPress={onSignUpPressed}
              text="Sign Up"
            />
          </AuthContainer>
          <BottomContainer>
            <TextButton
              first="Have an Account?"
              second="Sign In"
              onPress={() => navigation.navigate('SignInScreen')}
            />
            <TextButton
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Main'}],
                })
              }
              first="Continue as Guest"
              underline
            />
          </BottomContainer>
        </ScrollContainer>
      </ScrollView>
    </Container>
  );
};

export default SignUpScreen;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.primary};
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

const CheckboxContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 16px;
`;

const TermsText = styled(Text)`
  flex: 1;
`;

const SignUpButton = styled(BlockButton)`
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
