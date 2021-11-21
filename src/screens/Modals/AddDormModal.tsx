import analytics from '@react-native-firebase/analytics';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import styled from 'styled-components/native';
import BlockButton from '../../components/atoms/BlockButton';
import ConditionalKeyboardScrollView from '../../components/native-replacements/ConditionalKeyboardScrollView';
import SwitchLabel from '../../components/native-replacements/SwitchLabel';
import Text from '../../components/native-replacements/Text';
import TextInput from '../../components/native-replacements/TextInput';
import CardView from '../../components/views/CardView';
import useAlertModal from '../../hooks/useAlertModal';
import useModalHeader from '../../hooks/useModalHeader';
import useSupabase from '../../hooks/useSupabase';
import {ModalStackParamList} from '../../types/routes';

type AddDormModalNavigationProp = StackNavigationProp<
  ModalStackParamList,
  'AddDormModal'
>;
type AddDormModalRouteProp = RouteProp<ModalStackParamList, 'AddDormModal'>;

type Props = {
  navigation: AddDormModalNavigationProp;
  route: AddDormModalRouteProp;
};

enum DormStyle {
  Traditional = 'Traditional',
  Suites = 'Suites',
  Apartments = 'Apartments',
  Greek = 'Greek',
}

/**
 * Modal for adding/requesting a new dorm
 */
const AddDormModal: React.FC<Props> = ({navigation, route}) => {
  const school = route.params.school;
  const dorm = route.params.dorm;
  const editing = route.params.editing;

  const {dormFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const [name, setName] = useState(dorm?.name);
  const [style, setStyle] = useState<string[]>(dorm?.style ?? []);
  const [loading, setLoading] = useState(false);

  const closeAndAdd = async () => {
    if (!name?.trim()) {
      showAlert({
        title: 'Missing Info!',
        message: 'Please enter the full building name',
      });
      return;
    }
    if (style.length == 0) {
      showAlert({
        title: 'Missing Info!',
        message: 'Please select at least one style for this building',
      });
      return;
    }

    setLoading(true);

    if (editing) {
      const {error} = await dormFunctions.approveAndModifyDorm(
        dorm!.id,
        name.trim(),
        style,
      );
      if (!error) {
        navigation.goBack();
      } else {
        showAlert({message: error.message});
        console.log(error);
      }
    } else {
      const {error} = await dormFunctions.createDorm(
        name.trim(),
        style,
        school!.id,
      );
      if (!error) {
        analytics().logEvent('request_dorm');
        navigation.replace('ConfettiModal', {type: 'dorm'});
      } else {
        showAlert({message: error.message});
        console.log(error);
      }
    }
    setLoading(false);
  };

  const handleSwitch = (value: any, type: string) => {
    let newStyle = [...style];
    if (value) {
      newStyle.push(type);
    } else {
      newStyle = newStyle.filter(style => style !== type);
    }
    setStyle(newStyle);
  };

  useModalHeader({
    title: 'Add Dorm',
    right: 'Submit',
    loading: loading,
    onRightPressed: closeAndAdd,
  });

  return (
    <Container>
      <ScrollView>
        <TopCard>
          <Text align="center" size={15} color="secondary1">
            {editing
              ? 'Modifying pending dorm for School:\n'
              : 'Requesting for School:\n'}
            <Text size={17} weight="semibold" align="center">
              {editing ? dorm!.school_name : school!.name}
            </Text>
          </Text>
        </TopCard>
        <Card label="BUILDING NAME:">
          <TextField
            placeholder="Full building name"
            value={name}
            onChangeText={setName}
          />
        </Card>
        <Card label="BUILDING STYLE:">
          <SwitchLabel
            value={style.includes(DormStyle.Traditional)}
            onValueChange={value => {
              handleSwitch(value, DormStyle.Traditional);
            }}
            label={DormStyle.Traditional}
            sublabel="Singles, doubles, etc; communal bathrooms"
          />
          <SwitchLabel
            value={style.includes(DormStyle.Suites)}
            onValueChange={value => {
              handleSwitch(value, DormStyle.Suites);
            }}
            label={DormStyle.Suites}
            sublabel="Bathroom(s) & possible common area"
          />
          <SwitchLabel
            value={style.includes(DormStyle.Apartments)}
            onValueChange={value => {
              handleSwitch(value, DormStyle.Apartments);
            }}
            label={DormStyle.Apartments}
            sublabel="Bathroom(s) & full kitchen/living room"
          />
          <SwitchLabel
            value={style.includes(DormStyle.Greek)}
            onValueChange={value => {
              handleSwitch(value, DormStyle.Greek);
            }}
            label={DormStyle.Greek}
            sublabel="Greek housing"
            showsBottomBorder={false}
          />
        </Card>
        <SubmitButton text="Submit" onPress={closeAndAdd} loading={loading} />
      </ScrollView>
    </Container>
  );
};

export default AddDormModal;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background.secondary1};
`;

const ScrollView = styled(ConditionalKeyboardScrollView)``;

const TopCard = styled(CardView)`
  padding: ${({theme}) => theme.spacing.margins}px;
  margin-top: ${({theme}) => theme.spacing.margins}px;
`;

const Card = styled(CardView)`
  background-color: ${({theme}) => theme.colors.background.primary};
  justify-content: center;
  padding-left: ${({theme}) => theme.spacing.margins}px;
  padding-right: ${({theme}) => theme.spacing.margins}px;
`;

const TextField = styled(TextInput)``;

const SubmitButton = styled(BlockButton)`
  margin: ${({theme}) => theme.spacing.margins}px;
`;
