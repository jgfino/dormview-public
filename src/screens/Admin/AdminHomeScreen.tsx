import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useCallback, useContext, useState} from 'react';
import {RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled, {ThemeContext} from 'styled-components/native';
import LoadingScreen from '../../components/atoms/LoadingScreen';
import Spacer from '../../components/atoms/Spacer';
import ListItem from '../../components/molecules/ListItem';
import Text from '../../components/native-replacements/Text';
import useAlertModal from '../../hooks/useAlertModal';
import useSupabase from '../../hooks/useSupabase';
import {
  ModalStackParamList,
  ProfileStackParamList,
  RootStackParamList,
  TabParamList,
} from '../../types/routes';

type AdminHomeScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ProfileStackParamList, 'AdminHomeScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    CompositeNavigationProp<
      StackNavigationProp<RootStackParamList>,
      StackNavigationProp<ModalStackParamList>
    >
  >
>;

type AdminHomeScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'AdminHomeScreen'
>;

type Props = {
  navigation: AdminHomeScreenNavigationProp;
  route: AdminHomeScreenRouteProp;
};

type ApprovalState = {
  pendingSchools: boolean;
  pendingDorms: boolean;
  pendingPhotos: boolean;
};

/**
 * The main view for admins. Contains approval status as well as an option to view feedback
 */
const AdminHomeScreen: React.FC<Props> = ({navigation}) => {
  const {schoolFunctions, dormFunctions, photoFunctions} = useSupabase();
  const {showAlert} = useAlertModal();

  const [refreshing, setRefreshing] = useState(false);
  const [approvalState, setApprovalState] = useState<ApprovalState>();

  const theme = useContext(ThemeContext);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, []),
  );

  const onRefresh = async () => {
    const {data: hasSchools, error: schoolError} =
      await schoolFunctions.hasPendingSchools();
    const {data: hasDorms, error: dormError} =
      await dormFunctions.hasPendingDorms();
    const {data: hasPhotos, error: photoError} =
      await photoFunctions.hasPendingPhotos();

    if (
      schoolError ||
      dormError ||
      photoError ||
      hasSchools == null ||
      hasDorms == null ||
      hasPhotos == null
    ) {
      console.log(schoolError, dormError, photoError);

      showAlert({
        message:
          'Error fetching pending information: ' +
          schoolError?.message +
          ' ' +
          dormError?.message +
          ' ' +
          photoError?.message,
      });

      setRefreshing(false);
      return;
    }

    setApprovalState({
      pendingSchools: hasSchools,
      pendingDorms: hasDorms,
      pendingPhotos: hasPhotos,
    });
  };

  if (!approvalState) return <LoadingScreen />;

  return (
    <Container>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <HeaderText size={20} color="secondary1" weight="bold">
          Approvals:
        </HeaderText>
        <Spacer />
        <ListItem
          onPress={() => navigation.push('SchoolApprovalScreen')}
          title="Pending Schools"
          RightComponent={
            <RightIcon
              color={
                approvalState.pendingSchools
                  ? theme.colors.destructive
                  : theme.colors.confirm
              }
            />
          }
        />
        <Spacer />
        <ListItem
          onPress={() => navigation.push('DormApprovalScreen')}
          title="Pending Dorms"
          RightComponent={
            <RightIcon
              color={
                approvalState.pendingDorms
                  ? theme.colors.destructive
                  : theme.colors.confirm
              }
            />
          }
        />
        <Spacer />
        <ListItem
          onPress={() => navigation.push('PhotoApprovalScreen')}
          title="Pending Photos"
          RightComponent={
            <RightIcon
              color={
                approvalState.pendingPhotos
                  ? theme.colors.destructive
                  : theme.colors.confirm
              }
            />
          }
        />
        {/* <Spacer large />
        <HeaderText size={24} color="secondary1" weight="bold">
          Other:
        </HeaderText>
        <Spacer />
        <ListItem title="View Feedback" /> */}
      </ScrollView>
    </Container>
  );
};

export default AdminHomeScreen;

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.colors.background.primary};
  flex: 1;
`;

const ScrollView = styled.ScrollView`
  padding: ${({theme}) => theme.spacing.margins}px;
`;

const HeaderText = styled(Text)``;

const RightIcon = styled(Icon).attrs(props => ({
  name: 'ellipse',
  size: 24,
}))``;
