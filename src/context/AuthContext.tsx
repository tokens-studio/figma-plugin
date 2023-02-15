import React, {
  useState, createContext, useContext, useEffect, useMemo, useCallback,
} from 'react';

import supabase from '@/supabase';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AuthContextType, AuthData, AuthInfo } from '@/types/Auth';
import { track } from '@/utils/analytics';

const defaultContextValue = {
  user: null,
  logIn: () => {},
  signUp: () => {},
  handleLogout: () => {},
  authInProgress: false,
  authError: '',
  setAuthError: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

const AuthContextProvider = ({
  children,
  authData: savedAuthData,
}: {
  children: JSX.Element;
  authData: AuthData | null;
}) => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [authError, setAuthError] = useState('');
  const [authInProgress, setAuthInProgress] = useState(false);

  function handleLogin(data: AuthData) {
    setAuthData(data);
    // Store user auth data in figma.clientStorage
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_AUTH_DATA,
      auth: data,
    });
  }

  function handleLogout() {
    setAuthData(null);
    track('Logout second screen');
    // Clear auth data in figma.clientStorage
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_AUTH_DATA,
      auth: null,
    });
  }

  const logIn = useCallback(async (loginInfo: AuthInfo) => {
    setAuthInProgress(true);
    const { data, error } = await supabase.signIn(loginInfo);
    if (error) {
      setAuthError(error.msg || error.error_description);
    } else {
      track('Log in second screen');
      handleLogin(data);
    }

    setAuthInProgress(false);
  }, []);

  const signUp = useCallback(async (signUpInfo: AuthInfo) => {
    setAuthInProgress(true);
    const { data, error } = await supabase.signUp(signUpInfo);
    if (error) {
      setAuthError(error.msg || error.error_description);
    } else {
      track('Sign up second screen');
      handleLogin(data);
    }

    setAuthInProgress(false);
  }, []);

  useEffect(() => {
    async function checkAuthData(data: AuthData) {
      await supabase.verifyAuth(data, (result: AuthData | null) => {
        if (result) {
          handleLogin(result);
        } else {
          handleLogout();
        }
      });
    }

    if (savedAuthData) {
      checkAuthData(savedAuthData);
    }
  }, [savedAuthData]);

  const contextValue = useMemo(
    () => ({
      user: authData?.user ?? null,
      authInProgress,
      logIn,
      signUp,
      handleLogout,
      authError,
      setAuthError,
    }),
    [authData?.user, authInProgress, logIn, signUp, authError],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthContextProvider');
  }
  return context;
};

export { AuthContextProvider, useAuth };
