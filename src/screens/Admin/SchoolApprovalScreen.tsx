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
import useSupabase, {School} from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type SchoolApprovalScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'SchoolApprovalScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type SchoolApprovalScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'SchoolApprovalScreen'
>;

type Props = {
  navigation: SchoolApprovalScreenNavigationProp;
  route: SchoolApprovalScreenRouteProp;
};

/**
 * Screen for admins to approve schools
 */
const SchoolApprovalScreen: React.FC<Props> = ({navigation, route}) => {
  const {schoolFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const [refreshing, setRefreshing] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);

  useFocusEffect(
    useCallback(() => {
      refreshPendingSchools();
    }, []),
  );

  const refreshPendingSchools = async () => {
    const {data, error} = await schoolFunctions.getPendingSchools();

    if (error || !data) {
      showAlert({
        message: 'Unable to fetch pending schools: ' + error?.message,
      });
      console.log(error);
      setRefreshing(false);
      return;
    }

    setSchools(data);
  };

  const onApprove = async (item: School) => {
    const {error} = await schoolFunctions.approveSchool(item.id);
    if (error) {
      console.log(error);
      showAlert({message: 'Unable to approve school: ' + error?.message});
      return;
    }
    refreshPendingSchools();
  };

  const onReject = async (item: School) => {
    const {error} = await schoolFunctions.deleteSchool(item.id);
    if (error) {
      console.log(error);
      showAlert({message: 'Unable to reject school: ' + error?.message});
      return;
    }
    refreshPendingSchools();
  };

  const renderItem: ListRenderItem<School> = ({item, index}) => {
    return (
      <ApprovalCard
        title={item.name}
        subtitle={[item.location]}
        onApprovePressed={() => onApprove(item)}
        onRejectPressed={() => onReject(item)}
        onPress={() =>
          navigation.push('AddSchoolModal', {school: item, editing: true})
        }
      />
    );
  };

  return (
    <Container>
      <CustomFlatList
        showsTopButton={false}
        emptyIcon="checkmark-done"
        emptyMessage="No schools available for approval"
        renderItem={renderItem}
        data={schools}
        onRefresh={refreshPendingSchools}
        refreshing={refreshing}
      />
    </Container>
  );
};

export default SchoolApprovalScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;
