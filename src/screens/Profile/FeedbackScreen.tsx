import analytics from '@react-native-firebase/analytics';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Platform} from 'react-native';
import styled from 'styled-components/native';
import Banner from '../../components/ads/Banner';
import BlockButton from '../../components/atoms/BlockButton';
import ConditionalKeyboardScrollView from '../../components/native-replacements/ConditionalKeyboardScrollView';
import Text from '../../components/native-replacements/Text';
import TextInput from '../../components/native-replacements/TextInput';
import CardView from '../../components/views/CardView';
import {adUnits} from '../../constants/credentials';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type FeedbackScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'FeedbackScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type FeedbackScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'FeedbackScreen'
>;

type Props = {
  navigation: FeedbackScreenNavigationProp;
  route: FeedbackScreenRouteProp;
};

const FeedbackScreen: React.FC<Props> = ({navigation, route}) => {
  const [message, setMessage] = useState<string>();
  const {feedbackFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const onSubmit = async () => {
    if (!message) {
      showAlert({message: 'Please enter a message'});
      return;
    }

    const {error} = await feedbackFunctions.sendFeedback(message.trim());

    if (error) {
      showAlert({
        message:
          'Unable to send feedback, please try again later: ' + error.message,
      });
      console.log(error);
      return;
    }

    analytics().logEvent('send_feedback');

    showAlert({
      title: 'Thanks!',
      message:
        'Thank you for sending feedback. Your message will help us to improve DormView',
    });

    navigation.goBack();
  };

  return (
    <Container>
      <ScrollView>
        <ScrollContainer>
          <TopContainer>
            <TextContainer>
              <Text
                size={16}
                weight="semibold"
                color="secondary2"
                align="center">
                Questions, comments, issues, suggestions? We’d love to hear from
                you. Send us your feedback in the box below. For more
                personalized questions, please email us at email@dormview
              </Text>
            </TextContainer>
            <InputContainer>
              <TextBox
                multiline
                textAlignVertical="top"
                placeholder="Type here..."
                maxLength={1000}
                value={message}
                onChangeText={setMessage}
              />
            </InputContainer>
            <SubmitButton text="Submit" onPress={onSubmit} />
          </TopContainer>
          <BottomContainer></BottomContainer>
        </ScrollContainer>
      </ScrollView>
      <TextContainer>
        <Text size={14} weight="semibold" color="secondary2" align="center">
          {'If you’re enjoying DormView, consider rating it on the ' +
            (Platform.OS === 'ios' ? 'App Store' : 'Play Store') +
            '. It helps out a ton!'}
        </Text>
      </TextContainer>
      <Banner
        visible
        position="bottom"
        adUnitID={adUnits.banners.feedbackLower}
      />
    </Container>
  );
};

export default FeedbackScreen;

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.secondary1};
`;

const ScrollView = styled(ConditionalKeyboardScrollView)``;

const ScrollContainer = styled.View`
  justify-content: space-between;
`;

const TopContainer = styled.View``;

const BottomContainer = styled.View`
  margin-top: 50px;
`;

const TextContainer = styled.View`
  padding: ${({theme}) => theme.spacing.margins}px;
`;

const InputContainer = styled(CardView)`
  padding: ${({theme}) => theme.spacing.margins}px;
`;

const TextBox = styled(TextInput)`
  min-height: 150px;
`;

const SubmitButton = styled(BlockButton)`
  margin: ${({theme}) => theme.spacing.margins}px;
`;
