import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {ListRenderItem} from 'react-native';
import styled from 'styled-components/native';
import ListItem from '../../components/molecules/ListItem';
import CustomFlatList from '../../components/native-replacements/CustomFlatList';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase, {Dorm} from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type PendingDormsScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'PendingDormsScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type PendingDormsScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'PendingDormsScreen'
>;

type Props = {
  navigation: PendingDormsScreenNavigationProp;
  route: PendingDormsScreenRouteProp;
};

const PendingDormsScreen: React.FC<Props> = ({navigation, route}) => {
  const {dormFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    onRefresh();
  }, []);

  const onRefresh = async () => {
    const {data, error} = await dormFunctions.getPendingDorms();

    if (error) {
      console.log(error);
      showAlert({message: 'Unable to get pending dorms: ' + error.message});
      setRefreshing(false);
      return;
    }

    setDorms(data ?? []);
  };

  const renderItem: ListRenderItem<Dorm> = ({item}) => {
    return (
      <ListItem
        title={item.name}
        subtitle={[item.school_name]}
        onPress={() => navigation.push('DormScreen', {dormId: item.id})}
      />
    );
  };

  return (
    <Container>
      <CustomFlatList
        showsTopButton={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={renderItem}
        data={dorms}
        emptyIcon="file-tray"
        emptyMessage="Nothing to see here! You don't currently have any pending dorms."
      />
    </Container>
  );
};

export default PendingDormsScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;
