import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useRef} from 'react';
import {Dimensions, Platform} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import styled from 'styled-components/native';
import BlockButton from '../../components/atoms/BlockButton';
import Text from '../../components/native-replacements/Text';
import {ModalStackParamList} from '../../types/routes';

type ConfettiModalNavigationProp = StackNavigationProp<
  ModalStackParamList,
  'ConfettiModal'
>;
type ConfettiModalRouteProp = RouteProp<ModalStackParamList, 'ConfettiModal'>;

type Props = {
  navigation: ConfettiModalNavigationProp;
  route: ConfettiModalRouteProp;
};

type MessageType = 'school' | 'dorm' | 'photo';

const ConfettiModal: React.FC<Props> = ({navigation, route}) => {
  const generateMessage = (type: MessageType) => {
    return `Thank you for adding a ${type}! This will help people like you find out what it's like to be living there. Your request is currently under review and should be approved in 1-2 days. In the meantime, you can head over to your pending ${type}s on the profile tab to view this ${type} ${
      type !== 'photo'
        ? `and add more ${getAdditionalInfo(type)} to this ${type}!`
        : `.`
    }`;
  };
  const getAdditionalInfo = (type: MessageType) => {
    switch (type) {
      case 'school':
        return 'dorms and photos';
      case 'dorm':
        return 'photos';
      case 'photo':
    }
  };

  const explosion = useRef<any>();

  return (
    <Container>
      <ConfettiCannon
        ref={ref => (explosion.current = ref)}
        count={Platform.select({ios: 200, android: 100}) ?? 100}
        fadeOut
        origin={{x: -10, y: 0}}
        explosionSpeed={500}
        fallSpeed={2000}
      />
      <TextContainer>
        <TitleText size={70} weight="bold" color="secondary1" align="center">
          Yay!
        </TitleText>
        <MessageText size={16} color="secondary1" align="center">
          {generateMessage(route.params.type)}
        </MessageText>
        <CloseButton text="Close" onPress={() => navigation.pop()} />
      </TextContainer>
    </Container>
  );
};

export default ConfettiModal;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
  align-items: center;
  justify-content: space-around;
`;

const TextContainer = styled.View`
  width: ${Dimensions.get('window').width - 100}px;
  max-width: 500px;
  justify-content: space-evenly;
  flex: 1;
`;

const TitleText = styled(Text)``;

const MessageText = styled(Text)``;

const CloseButton = styled(BlockButton)`
  width: 50px;
`;
