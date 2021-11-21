import {NavigatorScreenParams} from '@react-navigation/core';
import {ImageOrVideo} from 'react-native-image-crop-picker';
import {Dorm, Photo, School} from '../hooks/useSupabase';
import {AlertModalProps} from '../screens/Modals/AlertModal';

/**
 * This file contains type definitions for all routes/screens used in the app
 */

/**
 * Types for the main flow of the app (School -> Dorm -> Room -> Photo)
 */
type MainStackParamList = {
  /**
   * School screen parameters
   */
  SchoolScreen: {
    /**
     * Id of the school to fetch information for
     */
    schoolId: string;
  };

  /**
   * Dorm screen parameters
   */
  DormScreen: {
    /**
     * Id of the dorm to fetch information for
     */
    dormId: string;
  };
  /**
   * Room screen parameters
   */
  RoomScreen: {
    /**
     * The room number to fetch photos for. If null, fetch all photos
     */
    roomNumber?: string | null;

    /**
     * Id of the dorm to fetch information for
     */
    dorm: Dorm;
  };
  /**
   * Photo screen parameters
   */
  PhotoScreen: {
    /**
     * Id of the photo to fetch information for
     */
    photoId: string;

    /**
     * Whether to bypass the interstitial ad
     */
    bypassAd?: boolean;
  };
};

/**
 * The underlying navigator, containing main routes and modals
 */
export type ModalStackParamList = {
  /**
   * Parameters for the main/auth stack navigator
   */
  RootStack: NavigatorScreenParams<RootStackParamList>;

  /**
   * Request/edit school modal parameters
   */
  AddSchoolModal: {
    /**
     * Whether the modal is in edit mode
     */
    editing: boolean;

    /**
     * If in edit mode, the pre-filled school information
     */
    school?: School;
  };

  /**
   * Request/add dorm modal parameters
   */
  AddDormModal: {
    /**
     * The school to add the dorm to
     */
    school?: School;

    /**
     * Whether the modal is in edit mode
     */
    editing: boolean;

    /**
     * If in edit mode, the pre-filled dorm information
     */
    dorm?: Dorm;
  };

  /**
   * Request/edit photo modal parameters
   */
  AddPhotoModal: {
    /**
     * The image to upload, if not editing
     */
    image?: ImageOrVideo;

    /**
     * The dorm to add the photo to, if applicable
     */
    dorm?: Dorm;

    /**
     * The room number to add the photo to, if applicable
     */
    roomNumber?: string | null;

    /**
     * The photo to edit, if applicable
     */
    photo?: Photo;

    /**
     * Whether the modal is in edit mode
     */
    editing: boolean;
  };

  /**
   * Confetti modal paramters
   */
  ConfettiModal: {
    /**
     * Which message type to show on the modal
     */
    type: 'school' | 'dorm' | 'photo';
  };

  AlertModal: {
    alertProps: AlertModalProps;
  };
};

/**
 * The secondary underlying navigator, containing the main and auth routes
 */
export type RootStackParamList = {
  /**
   * The main route for the app (lower tabs)
   */
  Main: NavigatorScreenParams<TabParamList>;

  /**
   * The auth route for the app (sign in, sign up, recover password)
   */
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

/**
 * Parameters for the app's auth route
 */
export type AuthStackParamList = {
  /**
   * Sign in screen params (none)
   */
  SignInScreen: undefined;

  /**
   * Sign up screen params (none)
   */
  SignUpScreen: undefined;

  /**
   * Reset password screen param
   */
  ResetPwdScreen: {
    /**
     * The update token
     */
    token: string;
  };

  TestScreen: {
    /**
     * The update token
     */
    token: string;
  };

  /**
   * Password reset email request screen params (none)
   */
  SendResetScreen: undefined;
};

/**
 * Parameters for the main tab navigator
 */
export type TabParamList = {
  /**
   * Home tab params (home screen, main flow)
   */
  HomeTab: NavigatorScreenParams<HomeStackParamList>;

  /**
   * Search tab params (search screen, main flow)
   */
  SearchTab: NavigatorScreenParams<SearchStackParamList>;

  /**
   * Upload tab params (none, handeled by context)
   */
  UploadTab: undefined;

  /**
   * Saved tab params (saved screen, main flow)
   */
  SavedTab: NavigatorScreenParams<SavedStackParamList>;

  /**
   * Profile tab params (profile screen, pending screens, main flow, admin flow for admins)
   */
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

/**
 * Params for screens in the home tab
 */
export type HomeStackParamList = MainStackParamList & {
  /**
   * Home screen parameters (none)
   */
  HomeScreen: undefined;
};

/**
 * Params for screens in the search tab
 */
export type SearchStackParamList = MainStackParamList & {
  /**
   * Search screen parameters (none)
   */
  SearchScreen: undefined;
};

/**
 * Params for screens in the saved tab
 */
export type SavedStackParamList = MainStackParamList & {
  /**
   * Saved photo screen parameters (none)
   */
  SavedPhotosScreen: undefined;
};

/**
 * Params for the profile screen
 */
export type ProfileStackParamList = MainStackParamList & {
  MyProfileScreen: undefined;

  PendingSchoolsScreen: undefined;
  PendingDormsScreen: undefined;
  PendingPhotosScreen: undefined;

  EditProfileScreen: undefined;
  FavoritesScreen: undefined;
  MyPhotosScreen: undefined;
  FeedbackScreen: undefined;
  PurchasesScreen: undefined;

  AdminHomeScreen: undefined;
  SchoolApprovalScreen: undefined;
  DormApprovalScreen: undefined;
  PhotoApprovalScreen: undefined;
};

/**
 * Params for the anonymous profile screen
 */
export type AnonProfileParamList = {
  /**
   * Anon profile screen params (none)
   */
  AnonProfileScreen: undefined;
};
