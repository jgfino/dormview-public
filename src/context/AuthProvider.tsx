import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';
import {
  createClient,
  PostgrestError,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import React, {createContext, useEffect, useState} from 'react';
import {supabaseKey, supabaseUrl} from '../constants/credentials';

export interface Profile {
  id: string;
  email: string;
  admin: boolean;
}

type AuthContent = {
  client: SupabaseClient;

  /**
   * The currently logged in user, if there is one
   */
  user?: User | null;

  /**
   * The currently logged in user's profile, if applicable
   */
  profile?: Profile | null;

  /**
   * Whether this is the app's first launch on this device
   */
  initialLaunch: boolean | undefined;

  /**
   * Updates the current user profile with the database
   * @param userId The user id to check against, by default
   * checks against currently signed in user
   */
  updateUserProfile: (
    userId?: string,
  ) => Promise<PostgrestError | null | undefined>;

  /**
   * Signs a user in with the given email and password
   * @param email     The email to sign in with
   * @param password  The password to sign in with
   */
  signIn: (
    email: string,
    password: string,
  ) => Promise<Error | null | undefined>;
  /**
   * Signs a user up with the given email and password
   * @param email     The email to sign up with
   * @param password  The password to sign up with
   */
  signUp: (
    email: string,
    password: string,
  ) => Promise<Error | null | undefined>;

  /**
   * Signs out the currently logged in user
   */
  signOut: () => Promise<Error | null | undefined>;

  /**
   * Sends a password reset email to the given email
   * @param email Email to send the email to
   */
  sendResetEmail: (
    email: string,
  ) => Promise<{data: {} | null; error: Error | null}>;

  /**
   * Resets the current user's password
   */
  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<Error | null | undefined>;

  /**
   * Updates the current user's email
   */
  changeEmail: (email: string) => Promise<Error | null | undefined>;
};

const AuthContext = createContext<AuthContent>(undefined!);

/**
 * Provides global information about the currently logged in user
 */
const AuthProvider = ({children}: {children: any}) => {
  const [client] = useState(
    createClient(supabaseUrl, supabaseKey, {
      localStorage: AsyncStorage,
      detectSessionInUrl: false,
      autoRefreshToken: true,
      persistSession: true,
    }),
  );

  const [user, setUser] = useState<User | null>();
  const [profile, setProfile] = useState<Profile | null>();
  const [initialLaunch, setInitialLaunch] = useState<boolean>();

  // Determine and keep track of the first launch for showing the sign up screen
  useEffect(() => {
    AsyncStorage.getItem('firstLaunch')
      .then(value => {
        if (value == null) {
          AsyncStorage.setItem('firstLaunch', 'false');
          setInitialLaunch(true);
        } else {
          setInitialLaunch(false);
        }
      })
      .catch(e => {
        console.log(e);
        setInitialLaunch(true);
      });
  }, []);

  // Subscribe to user changes
  useEffect(() => {
    const unsubscribe = client.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed', event);

      setUser(session?.user);

      if (!session) {
        setProfile(null);
        return;
      }
    });
    return unsubscribe.data?.unsubscribe;
  }, []);

  useEffect(() => {
    updateUserProfile();
  }, [user]);

  // Update the user profile
  const updateUserProfile = async (userId: string | undefined = user?.id) => {
    if (!user) return;

    const {data, error} = await client
      .rpc<Profile>('get_profile', {user_id: user.id})
      .maybeSingle();

    console.log('Profile', data, error);
    setProfile(data);

    return error;
  };

  const addUserToken = async () => {
    let deviceToken;
    try {
      deviceToken = await messaging().getToken();
    } catch (e) {
      console.log('Error getting device token', e);
      return e;
    }

    const {error} = await client.rpc('add_token_to_user', {
      token: deviceToken,
    });

    if (error) {
      console.log('Error adding user device token', error);
      return error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        client,
        user,
        profile,
        initialLaunch,
        updateUserProfile,
        signIn: async (email: string, password: string) => {
          const {user: newUser, error} = await client.auth.signIn({
            email: email,
            password: password,
          });

          if (error || !newUser) {
            console.log('Error signing in', error);
            return error;
          }

          await addUserToken();

          analytics().logLogin({method: 'email'});
          console.log('User signed in successfully');
        },
        signUp: async (email: string, password: string) => {
          const {user: newUser, error} = await client.auth.signUp({
            email: email,
            password: password,
          });

          if (error || !newUser) {
            console.log('Error signing up', error);
            return error;
          }

          const {error: profileError} = await client.rpc<void>(
            'create_profile',
            {user_id: newUser.id, email: email},
          );

          if (profileError) {
            console.log('Error creating profile for new user', profileError);
            return error;
          }

          await addUserToken();

          analytics().logSignUp({method: 'email'});
          console.log('New account created successfully for', newUser.email);
        },
        signOut: async () => {
          try {
            const oldToken = await messaging().getToken();
            await messaging().deleteToken();
            const {data, error: tokenError} = await client.rpc(
              'remove_token_from_user',
              {token: oldToken},
            );
            console.log(data);
            if (tokenError) {
              console.log(tokenError);
              return;
            }
          } catch (e) {
            console.log('Error deleting user device token', e);
            return e;
          }

          const {error} = await client.auth.signOut();
          if (error) {
            console.log('Error signing out', error);
            return error;
          }

          console.log('User signed out successfully');
        },
        resetPassword: async (token: string, newPassword: string) => {
          const {user: updatedUser, error} = await client.auth.api.updateUser(
            token,
            {password: newPassword},
          );

          if (error || !updatedUser) {
            console.log(error);
            return error;
          }

          setUser(updatedUser);
        },
        sendResetEmail: async (email: string) => {
          return client.auth.api.resetPasswordForEmail(email);
        },
        changeEmail: async (email: string) => {
          const {user, error} = await client.auth.update({
            email: email,
          });

          if (error) {
            return error;
          }

          setUser(user);
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
