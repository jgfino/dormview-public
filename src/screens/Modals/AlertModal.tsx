import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {Vibration} from 'react-native';
import styled from 'styled-components/native';
import Spacer from '../../components/atoms/Spacer';
import Text from '../../components/native-replacements/Text';
import {ModalStackParamList} from '../../types/routes';

export interface AlertModalProps {
  title?: string;
  message: string;
  onClose?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;
  closeButtonText?: string;
  confirmButtonText?: string;
  vibrate?: boolean;
}

type AlertModalNavigationProp = StackNavigationProp<
  ModalStackParamList,
  'AlertModal'
>;
type AlertModalRouteProp = RouteProp<ModalStackParamList, 'AlertModal'>;

type Props = {
  navigation: AlertModalNavigationProp;
  route: AlertModalRouteProp;
};

const AlertModal: React.FC<Props> = ({navigation, route}) => {
  const {
    title,
    message,
    onClose,
    onConfirm,
    closeButtonText,
    confirmButtonText,
    vibrate,
  } = route.params.alertProps;

  useEffect(() => {
    if (vibrate) {
      Vibration.vibrate();
    }
  }, []);
  return (
    <Container>
      <ModalView>
        <TitleText size={20} align="center" weight="semibold">
          {title ?? 'Oops!'}
        </TitleText>
        <Spacer size={22} />
        <MessageText size={16} align="center">
          {message}
        </MessageText>
        <Spacer size={30} />
        <ButtonContainer>
          {onConfirm ? (
            <>
              <CloseButtonDestructive
                onPress={() => {
                  navigation.goBack();
                  onClose && onClose();
                }}>
                <ButtonText
                  size={16}
                  align="center"
                  weight="semibold"
                  color="white">
                  {closeButtonText ?? 'Close'}
                </ButtonText>
              </CloseButtonDestructive>
              <Spacer horizontal />
              <ConfirmButton
                onPress={() => {
                  navigation.goBack();
                  onConfirm();
                }}>
                <ButtonText
                  size={16}
                  align="center"
                  weight="semibold"
                  color="white">
                  {confirmButtonText ?? 'Confirm'}
                </ButtonText>
              </ConfirmButton>
            </>
          ) : (
            <CloseButton
              onPress={() => {
                navigation.goBack();
                onClose && onClose();
              }}>
              <ButtonText
                size={16}
                align="center"
                weight="semibold"
                color="white">
                {closeButtonText ?? 'Close'}
              </ButtonText>
            </CloseButton>
          )}
        </ButtonContainer>
      </ModalView>
    </Container>
  );
};

export default AlertModal;

const Container = styled.View`
  flex: 1;
  justify-content: center;
`;

const ModalView = styled.View`
  align-items: center;
  justify-content: center;
  margin: 75px;
  padding: 20px;
  background-color: ${({theme}) => theme.colors.background.secondary1};
  border-radius: 20px;
`;

const TitleText = styled(Text)``;

const MessageText = styled(Text)``;

const ButtonContainer = styled.View`
  flex-direction: row;
`;

const ButtonText = styled(Text)``;

const CloseButtonDestructive = styled.TouchableOpacity`
  background-color: ${({theme}) => theme.colors.destructive};
  padding: 8px;
  border-radius: 10px;
  flex: 1;
`;

const CloseButton = styled.TouchableOpacity`
  background-color: ${({theme}) => theme.colors.primary};
  padding: 8px;
  border-radius: 10px;
  flex: 1;
`;

const ConfirmButton = styled.TouchableOpacity`
  background-color: ${({theme}) => theme.colors.confirm};
  padding: 8px;
  border-radius: 10px;
  flex: 1;
`;
