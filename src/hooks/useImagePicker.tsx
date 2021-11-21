import {useActionSheet} from '@expo/react-native-action-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PermissionsAndroid, Platform} from 'react-native';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import useAlertModal from './useAlertModal';

/**
 * Helper for interaction with the image picker
 */
const useImagePicker = () => {
  const {showActionSheetWithOptions} = useActionSheet();
  const {showAlert} = useAlertModal();
  /**
   * Opens the image library with cropping of the given size
   * @param {Number}  width   Width of image to choose
   * @param {Number}  height  Height of image to choose
   * @param {Boolean}  circle Whether the cropping screen should have a circle overlay
   * @returns The chosen image
   */
  const chooseImage = async (): Promise<ImageOrVideo> => {
    const newImage = await ImagePicker.openPicker({
      height: 1000,
      width: 1000,
      compressImageMaxHeight: 1000,
      compressImageMaxWidth: 1000,
      forceJpg: true,
      cropping: true,
      compressImageQuality: 0.7,
      avoidEmptySpaceAroundImage: true,
      freeStyleCropEnabled: true,
      includeBase64: true,
      smartAlbums: [
        'UserLibrary',
        'Favorites',
        'Panoramas',
        'SelfPortraits',
        'Screenshots',
      ],
    });
    return newImage;
  };

  /**
   * Opens the camera for taking a photo
   * @returns The image taken
   */
  const takeImage = async () => {
    // Android permissions

    if (Platform.OS === 'android') {
      const neverAsk = await AsyncStorage.getItem('never_ask_camera');
      console.log(neverAsk);
      if (neverAsk) {
        showAlert({
          message:
            'DormView does not have access to the camera, give it camera access in settings to take photos.',
        });

        return;
      }

      const hasPermission = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (!hasPermission) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        if (result === 'denied') {
          return;
        }
        if (result === 'never_ask_again') {
          AsyncStorage.setItem('never_ask_again', 'true');
        }
      }
    }
    const newImage = await ImagePicker.openCamera({
      height: 1000,
      width: 1000,
      compressImageMaxHeight: 1000,
      compressImageMaxWidth: 1000,
      forceJpg: true,
      cropping: true,
      compressImageQuality: 0.7,
      avoidEmptySpaceAroundImage: true,
      freeStyleCropEnabled: true,
      includeBase64: true,
    });
    return newImage;
  };

  /**
   * Shows an action sheet with take image/choose image and allows a user to select
   * an image
   * @param onSelect Callback for when an image is selected
   */
  const showImagePickerActionSheet = async (
    onSelect: ({
      image,
      error,
    }: {
      image: ImageOrVideo | null;
      error: Error | null;
    }) => void,
  ) => {
    const options = ['Take Image', 'Choose Image', 'Cancel'];
    const cancelButtonIndex = 2;

    const params = {options, cancelButtonIndex};

    showActionSheetWithOptions(params, async buttonIndex => {
      let image: ImageOrVideo | undefined;
      try {
        if (buttonIndex == 0) {
          image = await takeImage();
        }
        if (buttonIndex == 1) {
          image = await chooseImage();
        }
      } catch (error) {
        onSelect({error: error, image: null});
      }
      if (image) onSelect({image: image, error: null});
    });
  };

  return {chooseImage, takeImage, showImagePickerActionSheet};
};

export default useImagePicker;
