import { SetStateAction } from 'react';

export interface UserData {
  email: string;
  id: string;
}

export interface AuthData {
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user: UserData;
}

export interface AuthInfo {
  email?: string;
  password?: string;
  refresh_token?: string;
}

export interface AuthContextType {
  user: UserData | null;
  logIn: (loginInfo: AuthInfo) => void;
  signUp: (loginInfo: AuthInfo) => void;
  handleLogout: () => void;
  authInProgress: boolean;
  authError: string;
  setAuthError: React.Dispatch<SetStateAction<string>>;
}
