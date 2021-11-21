import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {ListRenderItem} from 'react-native';
import styled from 'styled-components/native';
import ImageCell from '../../components/molecules/ListItem';
import CustomFlatList from '../../components/native-replacements/CustomFlatList';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase, {School} from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type PendingSchoolsScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'PendingSchoolsScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type PendingSchoolsScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'PendingSchoolsScreen'
>;

type Props = {
  navigation: PendingSchoolsScreenNavigationProp;
  route: PendingSchoolsScreenRouteProp;
};

const PendingSchoolsScreen: React.FC<Props> = ({navigation, route}) => {
  const {schoolFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const [schools, setSchools] = useState<School[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    onRefresh();
  }, []);

  const onRefresh = async () => {
    const {data, error} = await schoolFunctions.getPendingSchools();

    if (error) {
      console.log(error);
      showAlert({message: 'Unable to get pending schools: ' + error.message});
      setRefreshing(false);
      return;
    }

    setSchools(data ?? []);
  };

  const renderItem: ListRenderItem<School> = ({item}) => {
    return (
      <ImageCell
        title={item.name}
        subtitle={[item.location]}
        onPress={() =>
          navigation.push('SchoolScreen', {
            schoolId: item.id,
          })
        }
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
        data={schools}
        emptyIcon="file-tray"
        emptyMessage="Nothing to see here! You don't currently have any pending schools."
      />
    </Container>
  );
};

export default PendingSchoolsScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;
