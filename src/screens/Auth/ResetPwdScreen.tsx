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

type ResetPwdScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, 'ResetPwdScreen'>,
  CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    StackNavigationProp<ModalStackParamList>
  >
>;

type ResetPwdScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPwdScreen'>;

type Props = {
  navigation: ResetPwdScreenNavigationProp;
  route: ResetPwdScreenRouteProp;
};

/**
 * The screen for a user to sign in with an email and password
 */
const ResetPwdScreen: React.FC<Props> = ({navigation, route}) => {
  const tokenData = new URL(
    'dormview://' + route.params.token.replace('#', '?'),
  );
  const errorCode = tokenData.searchParams.get('error_code');
  const parsedToken = tokenData.searchParams.get('access_token');

  console.log(tokenData, parsedToken);

  const {showAlert} = useAlertModal();

  const {resetPassword} = useContext(AuthContext);
  const [resetting, setResetting] = useState(false);

  const [password, setPassword] = useState<string>();
  const [confirmPassword, setConfirmPassword] = useState<string>();

  const onResetPressed = async () => {
    if (errorCode || !parsedToken) {
      showAlert({
        message:
          'Unable to reset password, you may need to request a new reset link.',
      });
      return;
    }

    // Password validation
    const passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (!password?.match(passw) || !password) {
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

    setResetting(true);
    const error = await resetPassword(parsedToken, password.trim());
    setResetting(false);

    if (error) {
      showAlert({message: 'Unable to reset password: ' + error.message});
      console.log(error);
      return;
    }

    navigation.reset({
      index: 0,
      //@ts-ignore
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
                label="NEW PASSWORD:"
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
            <ResetButton
              loading={resetting}
              onPress={onResetPressed}
              text="Reset Password"
            />
          </AuthContainer>
          <TextButton
            underline
            first="Continue Without Resetting"
            onPress={() =>
              navigation.reset({
                index: 0,
                //@ts-ignore
                routes: [{name: 'Main'}],
              })
            }
          />
        </ScrollContainer>
      </ScrollView>
    </Container>
  );
};

export default ResetPwdScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;

const ScrollView = styled(ConditionalKeyboardScrollView)``;

const ScrollContainer = styled.View`
  padding-left: 38px;
  padding-right: 38px;
  align-items: center;
`;

const Logo = styled(Text)`
  margin-bottom: 60px;
`;

const AuthContainer = styled.View``;

const FieldContainer = styled.View`
  margin-bottom: 8px;
`;

const ResetButton = styled(BlockButton)`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const TextButton = styled(TwoTonedTextButton)`
  margin-top: 10px;
  margin-bottom: ${({theme}) => theme.spacing.margins}px;
`;
