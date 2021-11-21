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

type SendResetScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, 'SendResetScreen'>,
  CompositeNavigationProp<
    StackNavigationProp<RootStackParamList>,
    StackNavigationProp<ModalStackParamList>
  >
>;

type SendResetScreenRouteProp = RouteProp<
  AuthStackParamList,
  'SendResetScreen'
>;

type Props = {
  navigation: SendResetScreenNavigationProp;
  route: SendResetScreenRouteProp;
};

/**
 * The screen for a user request a password reset email
 */
const SendResetScreen: React.FC<Props> = ({navigation, route}) => {
  const {sendResetEmail} = useContext(AuthContext);
  const {showAlert} = useAlertModal();
  const [resetting, setResetting] = useState(false);

  const [email, setEmail] = useState<string>();

  const onRequestPressed = async () => {
    if (!email) {
      showAlert({message: 'Please enter an email address.'});
      return;
    }

    setResetting(true);
    const {error} = await sendResetEmail(email.trim());
    setResetting(false);

    if (error) {
      showAlert({message: 'Error sending reset email: ' + error.message});
      return;
    }

    showAlert({
      title: 'Info',
      message:
        'Check your email for information on how to reset your password.',
    });

    navigation.goBack();
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
                keyboardType="email-address"
                autoCompleteType="email"
                autoCorrect={false}
                onChangeText={setEmail}
              />
            </FieldContainer>
            <ResetButton
              loading={resetting}
              onPress={onRequestPressed}
              text="Send Link"
            />
          </AuthContainer>
          <TextButton
            first="Continue Without Signing In"
            underline
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{name: 'Main'}],
              })
            }
          />
        </ScrollContainer>
      </ScrollView>
    </Container>
  );
};

export default SendResetScreen;

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
  margin-top: 16px;
  margin-bottom: ${({theme}) => theme.spacing.margins}px;
`;
