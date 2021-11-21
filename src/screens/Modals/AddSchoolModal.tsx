import analytics from '@react-native-firebase/analytics';
import {Picker} from '@react-native-picker/picker';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useContext, useEffect, useState} from 'react';
import {Keyboard} from 'react-native';
import styled, {ThemeContext} from 'styled-components/native';
import BlockButton from '../../components/atoms/BlockButton';
import ItemSeparator from '../../components/atoms/ListSeparator';
import ConditionalKeyboardScrollView from '../../components/native-replacements/ConditionalKeyboardScrollView';
import Text from '../../components/native-replacements/Text';
import TextInput from '../../components/native-replacements/TextInput';
import CardView from '../../components/views/CardView';
import states from '../../constants/states';
import useAlertModal from '../../hooks/useAlertModal';
import useModalHeader from '../../hooks/useModalHeader';
import useSupabase from '../../hooks/useSupabase';
import {ModalStackParamList} from '../../types/routes';

type AddSchoolModalNavigationProp = StackNavigationProp<
  ModalStackParamList,
  'AddSchoolModal'
>;
type AddSchoolModalRouteProp = RouteProp<ModalStackParamList, 'AddSchoolModal'>;

type Props = {
  navigation: AddSchoolModalNavigationProp;
  route: AddSchoolModalRouteProp;
};

/**
 * Modal for adding/requesting a new school
 */
const AddSchoolModal: React.FC<Props> = ({navigation, route}) => {
  const editing = route.params?.editing;
  const school = route.params?.school;

  const {schoolFunctions} = useSupabase();
  const {showAlert} = useAlertModal();
  const theme = useContext(ThemeContext);

  const [name, setName] = useState<string>(school?.name ?? '');
  const [city, setCity] = useState<string>(school?.city ?? '');
  const [state, setState] = useState<string>(school?.state ?? '');
  const [zip, setZip] = useState<string>(school?.zip ?? '');

  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const closeAndAdd = async () => {
    if (!name.trim()) {
      showAlert({
        title: 'Missing Info!',
        message: 'Please enter the full school name',
      });
      return;
    }
    if (!state.trim()) {
      showAlert({title: 'Missing Info!', message: 'Please select the state'});
      return;
    }
    if (!city.trim()) {
      showAlert({title: 'Missing Info!', message: 'Please enter the city'});
      return;
    }
    if (!zip) {
      showAlert({
        title: 'Missing Info!',
        message: 'Please enter the zip or postal code',
      });
      return;
    }

    setLoading(true);

    if (editing) {
      const {error} = await schoolFunctions.approveAndModifySchool(
        school!.id,
        name.trim(),
        city.trim(),
        state.trim(),
        zip.trim(),
      );

      if (!error) {
        navigation.goBack();
      } else {
        showAlert({message: error.message});
        console.log(error);
      }
    } else {
      const {error} = await schoolFunctions.createSchool(
        name.trim(),
        city.trim(),
        state.trim(),
        zip.trim(),
      );

      if (!error) {
        analytics().logEvent('request_school');
        navigation.replace('ConfettiModal', {type: 'school'});
      } else {
        showAlert({message: error.message});
        console.log(error);
      }
    }

    setLoading(false);
  };

  // Setup keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useModalHeader({
    title: editing ? 'Modify School' : 'Add School',
    right: editing ? 'Approve' : 'Submit',
    loading: loading,
    onRightPressed: closeAndAdd,
  });

  return (
    <Container>
      <ScrollView>
        <TopCard>
          <Text weight="semibold" align="center" size={17}>
            {editing && school
              ? `Modifying School: ${school.name}`
              : 'Requesting New School'}
          </Text>
        </TopCard>
        <Card label="SCHOOL NAME:">
          <TextField
            value={name}
            placeholder="Full school name"
            onChangeText={setName}
          />
        </Card>
        <Card label="LOCATION INFO:">
          <TextField
            value={state}
            editable={false}
            placeholder="State"
            onChangeText={setState}
          />
          <PickerContainer
            pointerEvents={isKeyboardVisible ? 'none' : undefined}>
            <Picker selectedValue={state} onValueChange={setState}>
              {states.flatMap((state, index) => {
                const item = [
                  <Picker.Item
                    label={state[1]}
                    value={state[0]}
                    color={theme.colors.text.primary}
                  />,
                ];
                if (index === 0) {
                  item.unshift(<Picker.Item />);
                }
                return item;
              })}
            </Picker>
          </PickerContainer>
          <ItemSeparator />
          <TextField value={city} placeholder="City" onChangeText={setCity} />
          <ItemSeparator />
          <TextField
            value={zip}
            keyboardType="number-pad"
            placeholder="Zip Code"
            onChangeText={setZip}
            maxLength={5}
          />
        </Card>
        <SubmitButton
          text={editing ? 'Approve' : 'Submit'}
          onPress={closeAndAdd}
          loading={loading}
        />
      </ScrollView>
    </Container>
  );
};

export default AddSchoolModal;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.secondary1};
`;

const ScrollView = styled(ConditionalKeyboardScrollView)``;

const TopCard = styled(CardView)`
  padding: ${({theme}) => theme.spacing.margins}px;
  margin-top: ${({theme}) => theme.spacing.margins}px;
`;

const PickerContainer = styled.View``;

const Card = styled(CardView)`
  background-color: ${({theme}) => theme.colors.background.primary};
  justify-content: center;
`;

const TextField = styled(TextInput)`
  padding-left: ${({theme}) => theme.spacing.margins}px;
  padding-right: ${({theme}) => theme.spacing.margins}px;
`;

const SubmitButton = styled(BlockButton)`
  margin: ${({theme}) => theme.spacing.margins}px;
`;
