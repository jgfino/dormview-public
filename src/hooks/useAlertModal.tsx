import {useNavigation} from '@react-navigation/core';
import {RootNavigationProp} from '../../App';
import {AlertModalProps} from '../screens/Modals/AlertModal';

const useAlertModal = () => {
  const navigation = useNavigation<RootNavigationProp>();

  const showAlert = (props: AlertModalProps) => {
    navigation.navigate('AlertModal', {alertProps: props});
  };
  return {showAlert};
};

export default useAlertModal;
