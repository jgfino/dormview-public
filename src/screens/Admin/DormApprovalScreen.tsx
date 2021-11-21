import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import {ListRenderItem} from 'react-native';
import styled from 'styled-components/native';
import ApprovalCard from '../../components/molecules/ApprovalCard';
import CustomFlatList from '../../components/native-replacements/CustomFlatList';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase, {Dorm} from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type DormApprovalScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'DormApprovalScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type DormApprovalScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'DormApprovalScreen'
>;

type Props = {
  navigation: DormApprovalScreenNavigationProp;
  route: DormApprovalScreenRouteProp;
};

/**
 * The screen for admins to approve dorms
 */
const DormApprovalScreen: React.FC<Props> = ({navigation}) => {
  const {dormFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshPendingDorms();
    }, []),
  );

  const refreshPendingDorms = async () => {
    const {data, error} = await dormFunctions.getPendingDorms();

    if (error || !data) {
      showAlert({message: 'Unable to fetch pending dorms: ' + error?.message});
      console.log(error);
      setRefreshing(false);
      return;
    }

    setDorms(data);
  };

  const onApprove = async (item: Dorm) => {
    const {error} = await dormFunctions.approveDorm(item.id);
    if (error) {
      console.log(error);
      showAlert({message: 'Unable to approve dorm: ' + error?.message});
      return;
    }
    refreshPendingDorms();
  };

  const onReject = async (item: Dorm) => {
    const {error} = await dormFunctions.deleteDorm(item.id);
    if (error) {
      console.log(error);
      showAlert({message: 'Unable to reject dorm: ' + error?.message});
      return;
    }
    refreshPendingDorms();
  };

  const renderItem: ListRenderItem<Dorm> = ({item, index}) => {
    return (
      <ApprovalCard
        title={item.name}
        subtitle={item.style}
        subtitle2={item.school_name}
        onApprovePressed={() => onApprove(item)}
        onRejectPressed={() => onReject(item)}
        onPress={() =>
          navigation.navigate('AddDormModal', {dorm: item, editing: true})
        }
      />
    );
  };

  return (
    <Container>
      <CustomFlatList
        showsTopButton={false}
        emptyMessage="No dorms available for approval"
        emptyIcon="checkmark-done"
        renderItem={renderItem}
        data={dorms}
        onRefresh={refreshPendingDorms}
        refreshing={refreshing}
      />
    </Container>
  );
};

export default DormApprovalScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;
