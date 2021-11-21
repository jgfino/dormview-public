import {decode} from 'base64-arraybuffer';
import {useContext} from 'react';
import RNFS from 'react-native-fs';
import {Image} from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';
import {AuthContext} from '../context/AuthProvider';

// Types

export interface School {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  location: string;

  pending: boolean;

  photo_url: string;
}

export interface Dorm {
  id: string;
  name: string;
  style: string[];
  school_id: string;

  pending: boolean;
  school_name: string;
}

export interface Photo {
  id: string;
  description: string;
  room_number: string;
  school_id: string;
  dorm_id: string;

  owner: string;
  pending: boolean;
  date_added: string;

  full_url: string;
  thumb_url: string;

  school_name: string;
  dorm_name: string;
}

type PathReturn = {
  id: string;
  full_path: string;
  thumb_path: string;
};

/**
 * The main hook for interacting with supabase
 */
const useSupabase = () => {
  const {client, user, profile} = useContext(AuthContext);

  // Schools

  /**
   * Searches for a school based on name, location, or zip code
   * @param query   The query to search for
   * @param limit   Limit number of results
   * @param offset  Offset number of results
   * @returns The matching schools
   */
  const searchSchools = async (
    query: string,
    limit: number,
    offset: number,
  ) => {
    console.log('Searching for ' + query);
    return client.rpc<School>('search_schools', {
      query: query,
      result_limit: limit,
      result_offset: offset,
    });
  };

  /**
   * Gets all schools available in the database. Uses pagination
   * @param limit   How many to fetch at a time
   * @param offset  Where to start when fetching
   * @returns The set of schools
   */
  const getAllSchools = async (limit: number, offset: number) => {
    console.log('Fetching all schools');
    return client.rpc<School>('get_all_schools', {
      result_limit: limit,
      result_offset: offset,
    });
  };

  /**
   * Gets all schools available in the database. Uses pagination, and sorts by most recently added
   * @param limit   How many to fetch at a time
   * @param offset  Where to start when fetching
   * @returns The set of schools
   */
  const getAllSchoolsByDate = async (limit: number, offset: number) => {
    console.log('Fetching all schools by date');
    return client.rpc<School>('get_all_schools_by_date', {
      result_limit: limit,
      result_offset: offset,
    });
  };

  /**
   * Determines if any pending schools currently exist
   * @returns True if pending schools exist
   */
  const hasPendingSchools = async () => {
    console.log('Fetching pending schools status');
    return client.rpc<boolean>('has_pending_schools').single();
  };

  /**
   * Gets a user's currently pending schools. For an admin, gets all pending schools
   * @returns The currently pending schools for the current user (all schools if admin)
   */
  const getPendingSchools = async () => {
    console.log('Fetching pending schools');
    return client.rpc<School>('get_pending_schools');
  };

  /**
   * Gets the school with the given ID
   * @param schoolId  The id of the school to get
   * @returns The requested school
   */
  const getSchool = async (schoolId: string) => {
    console.log('Fetching school', schoolId);
    return client.rpc<School>('get_school', {school_id: schoolId}).single();
  };

  /**
   * Creates a new school with the provided information. A user must be signed in
   * to use this function. Fails if a duplicate school is detected.
   * @param name    Full name of the new school
   * @param city    City (or equivalent) the school is located in
   * @param state   State (or equivalent) the school is located in
   * @param zip     Zip/postal code the school is located in
   * @returns The newly created school record
   */
  const createSchool = async (
    name: string,
    city: string,
    state: string,
    zip: string,
  ) => {
    console.log('Creating school', name);
    return client.rpc<void>('create_school', {
      name: name,
      city: city,
      state: state,
      zip: zip,
    });
  };

  /**
   * Deletes the pending school with the given id. A user must be signed in, and the signed in
   * user must be the owner of the given school to use this function
   * @param schoolId The id of the pending school to delete
   */
  const deleteSchool = async (schoolId: string) => {
    console.log('Deleting school', schoolId);
    return client.rpc<void>('delete_school', {school_id: schoolId});
  };

  /**
   * Determines if the currently signed in user has favorited the given school. A user
   * must be signed in to use this function.
   * @param schoolId The id of the school to check
   * @returns true if the school is favorited, false otherwise
   */
  const hasFavoriteSchool = async (schoolId: string) => {
    console.log('Fetching favorite status for school', schoolId);
    return client
      .rpc<boolean>('has_favorite_school', {school_id: schoolId})
      .single();
  };

  /**
   * Toggles the favorite status for the school with the given id for the currently signed
   * in user. A user must be signed in to use this function.
   * @param schoolId The id of the school to toggle
   * @returns The new favorite status of the school
   */
  const toggleFavoriteSchool = async (schoolId: string) => {
    console.log('Toggling favorite status for school', schoolId);
    return client
      .rpc<boolean>('toggle_favorite_school', {
        school_id: schoolId,
      })
      .single();
  };

  /**
   * Gets the schools currently favorited by the signed in user.
   * @returns The currently favorited schools
   */
  const getFavoriteSchools = async () => {
    console.log('Fetching favorite schools');
    return client.rpc<School>('get_favorite_schools');
  };

  /**
   * Approves the school with the given id
   * @param schoolId The id of the school to approve
   */
  const approveSchool = async (schoolId: string) => {
    console.log('Approving school', schoolId);
    return client.rpc<void>('approve_school', {school_id: schoolId});
  };

  /**
   * Modifies and approves the school with the given id
   * @param schoolId  The id of the school to approve/modify
   * @param newName   The new name of the school
   * @param newCity   The new city for the school
   * @param newState  The new state for the school
   * @param newZip    The new zip for the school
   */
  const approveAndModifySchool = async (
    schoolId: string,
    newName: string,
    newCity: string,
    newState: string,
    newZip: string,
  ) => {
    console.log('Approving and modifying school', schoolId);
    return client.rpc<void>('approve_school', {
      school_id: schoolId,
      new_name: newName,
      new_city: newCity,
      new_state: newState,
      new_zip: newZip,
    });
  };

  // Dorms

  /**
   * Gets the dorm with the given id. School name is included in the result.
   * @param dormId The id of the dorm to get
   * @returns The requested dorm
   */
  const getDorm = async (dormId: string) => {
    console.log('Fetching dorm', dormId);
    return client.rpc<Dorm>('get_dorm', {dorm_id: dormId}).single();
  };

  /**
   * Creates a dorm with the given attributes. Fails if a duplicate dorm for the same
   * school is detected. Dorms created by an admin are automatically approved.
   * @param name      Name of the dorm to create
   * @param style     Style tags for the dorm to create
   * @param schoolId  Id of the school the new dorm belongs to
   */
  const createDorm = async (
    name: string,
    style: string[],
    schoolId: string,
  ) => {
    console.log('Creating dorm', name);
    return client.rpc<void>('create_dorm', {
      name: name,
      style: style,
      school_id: schoolId,
    });
  };

  /**
   * Deletes the dorm with the given id
   * @param dormId The id of the dorm to delete
   */
  const deleteDorm = async (dormId: string) => {
    console.log('Deleting dorm', dormId);
    return client.rpc<void>('delete_dorm', {dorm_id: dormId});
  };

  /**
   * Gets the dorms for the given school. Name of the dorms' parent school is included
   * in the results.
   * @param schoolId The school id to get the dorms for
   * @returns The dorms belonging to the requested school
   */
  const getDormsForSchool = async (schoolId: string) => {
    console.log('Fetching dorms for school', schoolId);
    return client.rpc<Dorm>('get_dorms_for_school', {
      school_id: schoolId,
    });
  };

  /**
   * Gets a user's currently pending dorms
   * @returns The currently pending dorms for the current user (all dorms if admin)
   */
  const getPendingDorms = async () => {
    console.log('Fetching pending dorms');
    return client.rpc<Dorm>('get_pending_dorms');
  };

  /**
   * Determines if any pending dorms currently exist
   * @returns True if pending dorms exist
   */
  const hasPendingDorms = async () => {
    console.log('Fetching pending dorms status');
    return client.rpc<boolean>('has_pending_dorms').single();
  };

  /**
   * Determines if the currently signed in user has favorited the given dorm
   * @param dormId The id of the dorm to check
   * @returns true if the user has favorited the dorm
   */
  const hasFavoriteDorm = async (dormId: string) => {
    console.log('Fetching favorite status for dorm', dormId);
    return client.rpc<boolean>('has_favorite_dorm', {dorm_id: dormId}).single();
  };

  /**
   * Toggles the favorite status of the given dorm for the currently signed in user
   * @param dormId The id of the dorm to toggle
   * @returns The new favorite status of the dorm
   */
  const toggleFavoriteDorm = async (dormId: string) => {
    console.log('Toggling favorite status for dorm', dormId);
    return client
      .rpc<boolean>('toggle_favorite_dorm', {dorm_id: dormId})
      .single();
  };

  /**
   * Gets the dorms currently favorited by the signed in user
   * @returns The currently favorited dorms
   */
  const getFavoriteDorms = async () => {
    console.log('Fetching favorite dorms');
    return client.rpc<Dorm>('get_favorite_dorms');
  };

  /**
   * Approves the dorm with the given id
   * @param dormId The id of the dorm to approve
   */
  const approveDorm = async (dormId: string) => {
    console.log('Approving dorm', dormId);
    return client.rpc<void>('approve_dorm', {dorm_id: dormId});
  };

  /**
   * Modifies and approves the dorm with the given id
   * @param dormId    The id of the dorm to approve/modify
   * @param newName   The new name of the dorm
   * @param newStyle  The new style for the dorm
   */
  const approveAndModifyDorm = async (
    dormId: string,
    newName: string,
    newStyle: string[],
  ) => {
    console.log('Approving and modifying dorm', dormId);
    return client.rpc<void>('approve_dorm', {
      dorm_id: dormId,
      new_name: newName,
      new_style: newStyle,
    });
  };

  // Photos

  /**
   * Gets the photo with the given id
   * @returns The requested photo
   */
  const getPhoto = async (photoId: string) => {
    console.log('Fetching photo', photoId);
    return client.rpc<Photo>('get_photo', {photo_id: photoId}).single();
  };

  /**
   * Creates a new photo with the given attributes. Returns the storage path of the new photo to use
   * for uploading the file
   * @param image       The file to upload
   * @param description Brief description of the photo (optional)
   * @param roomNumber  Room number for the photo (optional)
   * @param schoolId    School the photo belongs to
   * @param dormId      Dorm the photo belongs to
   */
  const createPhoto = async (
    image: Image,
    description: string | null,
    roomNumber: string | null,
    schoolId: string,
    dormId: string,
  ) => {
    console.log('Creating photo');

    const {data, error} = await client
      .rpc<PathReturn>('create_photo', {
        description: description,
        room_number: roomNumber,
        school_id: schoolId,
        dorm_id: dormId,
      })
      .single();

    if (data == null || error) {
      return {error: error};
    }

    let height = 0;
    let width = 0;

    if (image.height > image.width) {
      width = 300;
      height = (image.height / image.width) * width;
    } else {
      height = 300;
      width = (image.width / image.height) * height;
    }

    let thumb;
    try {
      thumb = await ImageResizer.createResizedImage(
        image.path,
        width,
        height,
        'JPEG',
        90,
        0,
        undefined,
        false,
        {
          mode: 'stretch',
          onlyScaleDown: true,
        },
      );
    } catch (e) {
      return {error: e as Error};
    }

    const fullData = decode(image.data!);
    const thumbBase64 = await RNFS.readFile(thumb.path, 'base64');
    const thumbData = decode(thumbBase64);

    const {error: storageError1} = await client.storage
      .from('user-photos')
      .upload(data.full_path, fullData, {
        contentType: 'image/jpeg',
        cacheControl: '15778800',
      });

    const {error: storageError2} = await client.storage
      .from('user-photos')
      .upload(data.thumb_path, thumbData, {
        contentType: 'image/jpeg',
        cacheControl: '15778800',
      });

    if (storageError1 || storageError2) {
      await deletePhoto(data.id);
      return {error: storageError1 ?? storageError2};
    }

    return {error: null};
  };

  /**
   * Deletes the photo with the given id
   * @param photoId The id of the photo to delete
   */
  const deletePhoto = async (photoId: string) => {
    console.log('Deleting photo', photoId);
    return client.rpc<void>('delete_photo', {photo_id: photoId}).single();
  };

  /**
   * Gets the currently signed in user's photos
   * @param limit   Limit of photos to get
   * @param offset  Offset of photos to get
   * @returns Current user's photos
   */
  const getUserPhotos = (limit: number, offset: number) => {
    console.log('Fetching user photos');
    return client.rpc<Photo>('get_user_photos', {
      result_limit: limit,
      result_offset: offset,
    });
  };

  /**
   * Gets a list of available rooms for the given dorm id
   * @param dormId  The id of the dorm to look for rooms for
   * @returns The available rooms
   */
  const getRoomsForDorm = async (dormId: string) => {
    console.log('Fetching rooms for', dormId);
    return client.rpc<string | null>('get_rooms_for_dorm', {
      dorm_id: dormId,
    });
  };

  /**
   * Gets all of the photos available for a specific dorm room. Uses pagination
   * @param dormId      The id of the dorm to get photos for
   * @param roomNumber  The room number to fetch photos for. Setting this to undefined will fetch all
   * @param pending     Whether to only fetch pending photos
   * @param limit       Limit for the query
   * @param offset      Starting offset of the query
   * @returns The available photos
   */
  const getPhotosForDormRoom = (
    dormId: string,
    roomNumber: string | undefined,
    limit: number,
    offset: number,
  ) => {
    console.log(
      'Fetching photos for dorm',
      dormId,
      roomNumber ? 'room ' + roomNumber : '',
    );
    return client.rpc<Photo>('get_photos_for_dorm', {
      dorm_id: dormId,
      room_number: roomNumber,
      result_limit: limit,
      result_offset: offset,
    });
  };

  /**
   * Gets a user's currently pending photos
   * @param limit       Limit for the query
   * @param offset      Starting offset of the query
   * @returns The currently pending photos for the current user (all photos if admin)
   */
  const getPendingPhotos = async (limit: number, offset: number) => {
    console.log('Fetching pending photos');
    return client.rpc<Photo>('get_pending_photos', {
      result_limit: limit,
      result_offset: offset,
    });
  };

  /**
   * Determines if any pending photos currently exist
   * @returns True if pending photos exist
   */
  const hasPendingPhotos = async () => {
    console.log('Fetching pending photo status');
    return client.rpc<boolean>('has_pending_photos').single();
  };

  /**
   * Determines if the currently signed in user has saved the given photo
   * @param photoId The id of the photo to check for
   * @returns True if the user has saved the photo
   */
  const hasSavedPhoto = (photoId: string) => {
    console.log('Fetching saved status for photo', photoId);
    return client.rpc<boolean>('has_saved_photo', {photo_id: photoId}).single();
  };

  /**
   * Toggles the favorite status for the given photo for the currently signed in user
   * @param photoId The id of the photo to toggle
   * @returns The new saved status
   */
  const toggleSavedPhoto = (photoId: string) => {
    console.log('Toggling saved status for photo', photoId);
    return client
      .rpc<boolean>('toggle_saved_photo', {photo_id: photoId})
      .single();
  };

  /**
   * Gets the photos currently saved by the signed in user. Uses pagination
   * @param limit   The query limit
   * @param offset  The query offset
   * @returns The user's saved photos
   */
  const getSavedPhotos = (limit: number, offset: number) => {
    console.log('Fetching saved photos');
    return client.rpc<Photo>('get_saved_photos', {
      result_limit: limit,
      result_offset: offset,
    });
  };

  /**
   * Approves the given photo as-is
   * @param photoId The id of the photo to approve
   */
  const approvePhoto = (photoId: string) => {
    console.log('Approving photo', photoId);
    return client.rpc<void>('approve_photo', {photo_id: photoId});
  };

  /**
   * Approves and modifies the given photo with new information
   * @param photoId         The id of the photo to approve
   * @param newDescription  The new description for the photo
   * @param newRoomNumber   The new room number for the photo
   */
  const approveAndModifyPhoto = (
    photoId: string,
    newDescription: string | null,
    newRoomNumber: string | null,
  ) => {
    console.log('Approving and modifying photo', photoId);
    return client.rpc<void>('approve_photo', {
      photo_id: photoId,
      new_description: newDescription,
      new_room_number: newRoomNumber,
    });
  };

  /**
   * Determines if the given photo is owned by the currently signed in user
   * @param Photo The photo to check
   * @returns true if the user owns the photo
   */
  const isPhotoOwner = (photo: Photo) => {
    return photo.owner === user?.id || profile?.admin;
  };

  /**
   * Submits feedback with the given message
   * @param message
   */
  const sendFeedback = async (message: string) => {
    console.log('Submitting feedback');
    return client.rpc<void>('send_feedback', {message: message});
  };

  return {
    schoolFunctions: {
      searchSchools,
      getAllSchools,
      getAllSchoolsByDate,
      getPendingSchools,
      hasPendingSchools,
      getSchool,
      createSchool,
      deleteSchool,
      hasFavoriteSchool,
      toggleFavoriteSchool,
      getFavoriteSchools,
      approveSchool,
      approveAndModifySchool,
    },
    dormFunctions: {
      getDorm,
      createDorm,
      deleteDorm,
      getDormsForSchool,
      getPendingDorms,
      hasPendingDorms,
      hasFavoriteDorm,
      toggleFavoriteDorm,
      getFavoriteDorms,
      approveDorm,
      approveAndModifyDorm,
    },
    photoFunctions: {
      getPhoto,
      createPhoto,
      deletePhoto,
      getRoomsForDorm,
      getPhotosForDormRoom,
      getPendingPhotos,
      hasPendingPhotos,
      hasSavedPhoto,
      toggleSavedPhoto,
      getSavedPhotos,
      getUserPhotos,
      approvePhoto,
      approveAndModifyPhoto,
      isPhotoOwner,
    },
    feedbackFunctions: {
      sendFeedback,
    },
  };
};

export default useSupabase;
