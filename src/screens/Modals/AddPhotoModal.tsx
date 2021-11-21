import analytics from '@react-native-firebase/analytics';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import FastImage from 'react-native-fast-image';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import styled from 'styled-components/native';
import BlockButton from '../../components/atoms/BlockButton';
import BoldLabelText from '../../components/atoms/BoldLabelText';
import Spacer from '../../components/atoms/Spacer';
import ConditionalKeyboardScrollView from '../../components/native-replacements/ConditionalKeyboardScrollView';
import TextInput from '../../components/native-replacements/TextInput';
import CardView from '../../components/views/CardView';
import useAlertModal from '../../hooks/useAlertModal';
import useModalHeader from '../../hooks/useModalHeader';
import useSupabase from '../../hooks/useSupabase';
import {ModalStackParamList} from '../../types/routes';

type AddPhotoModalNavigationProp = StackNavigationProp<
  ModalStackParamList,
  'AddPhotoModal'
>;
type AddPhotoModalRouteProp = RouteProp<ModalStackParamList, 'AddPhotoModal'>;

type Props = {
  navigation: AddPhotoModalNavigationProp;
  route: AddPhotoModalRouteProp;
};

/**
 * Modal for adding a photo to a room or modifying a photo before approving it
 */
const AddPhotoModal: React.FC<Props> = ({navigation, route}) => {
  const image = route.params.image;
  const dorm = route.params.dorm;
  const photo = route.params.photo;
  const editing = route.params.editing;

  const [number, setNumber] = useState(
    editing ? photo?.room_number : route.params.roomNumber ?? undefined,
  );

  const [comments, setComments] = useState<string | undefined>(
    photo?.description,
  );
  const [loading, setLoading] = useState(false);

  const [aspect, setAspect] = useState<number>();

  const {photoFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  useEffect(() => {
    if (editing) {
      Image.getSize(photo!.full_url, (width, height) =>
        setAspect(width / height),
      );
    } else {
      setAspect(image!.width / image!.height);
    }
  }, []);

  const closeAndAdd = async () => {
    if (!comments?.trim()) {
      showAlert({
        title: 'Missing Info!',
        message: 'Please provide a brief description for this photo',
      });
      return;
    }

    if (editing) {
      const {error} = await photoFunctions.approveAndModifyPhoto(
        photo!.id,
        comments,
        number ?? null,
      );

      if (!error) {
        navigation.goBack();
      } else {
        showAlert({message: error.message});
        console.log(error);
      }
    } else {
      if (number?.trim() == null) {
        showAlert({
          title: 'Confirm',
          message: "Are you sure you don't want to provide a room number?",
          closeButtonText: 'No',
          confirmButtonText: 'Yes',
          onConfirm: () => uploadPhoto(),
        });
      } else {
        uploadPhoto();
      }
    }
  };

  const uploadPhoto = async () => {
    setLoading(true);
    const {error} = await photoFunctions.createPhoto(
      image!,
      comments?.trim() ?? null,
      number?.trim() ?? null,
      dorm!.school_id,
      dorm!.id,
    );
    setLoading(false);

    if (error) {
      showAlert({message: 'Error adding photo: ' + error.message});
      console.log(error);
      return;
    }

    analytics().logEvent('upload_photo');
    navigation.replace('ConfettiModal', {type: 'photo'});
  };

  useModalHeader({
    title: editing ? 'Approve Photo' : 'Upload Photo',
    right: editing ? 'Approve' : 'Upload',
    loading: loading,
    onRightPressed: closeAndAdd,
  });

  return (
    <Container>
      <ScrollView modal>
        <TopImage
          source={{uri: editing ? photo!.full_url : image!.path}}
          style={{aspectRatio: aspect}}
          resizeMode="contain"
        />
        <Card label="DESCRIPTION:">
          <TextField
            maxLength={100}
            placeholder="Brief Description"
            value={comments}
            onChangeText={setComments}
          />
        </Card>
        <Card label="ROOM NUMBER:">
          <TextField
            keyboardType="numbers-and-punctuation"
            value={number}
            placeholder="Room Number (recommended!)"
            onChangeText={setNumber}
          />
        </Card>
        <BottomCard label="SCHOOL INFO:">
          <BoldLabelText
            first="Adding to School: "
            second={editing ? photo!.school_name : dorm!.school_name}
          />
          <Spacer />
          <BoldLabelText
            first="Adding to Dorm: "
            second={editing ? photo!.dorm_name : dorm!.name}
          />
        </BottomCard>
        <SubmitButton
          text={editing ? 'Approve' : 'Submit'}
          onPress={closeAndAdd}
          loading={loading}
        />
      </ScrollView>
    </Container>
  );
};

export default AddPhotoModal;

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.secondary1};
`;

const TopImage = styled(FastImage)``;

const Card = styled(CardView)`
  padding-left: ${({theme}) => theme.spacing.margins}px;
  padding-right: ${({theme}) => theme.spacing.margins}px;
  background-color: ${({theme}) => theme.colors.background.primary};
`;

const ScrollView = styled(ConditionalKeyboardScrollView)``;

const TextField = styled(TextInput)``;

const BottomCard = styled(CardView)`
  padding: ${({theme}) => theme.spacing.margins}px;
`;

const SubmitButton = styled(BlockButton)`
  margin: ${({theme}) => theme.spacing.margins}px;
  margin-bottom: ${StaticSafeAreaInsets.safeAreaInsetsBottom + 16}px;
`;
