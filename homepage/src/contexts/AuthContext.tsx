
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthState } from '@/types';
import { SignInFormData, SignUpFormData } from '@/schemas/auth';

interface AuthContextType extends AuthState {
  signIn: (data: SignInFormData) => Promise<{ error: any }>;
  signUp: (data: SignUpFormData) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock user object for UI testing with proper typing
  const mockUser: User = {
    id: 'mock-user-id',
    email: 'user@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { full_name: 'Mock User' },
    aud: 'authenticated',
    confirmation_sent_at: null,
    confirmed_at: null,
    email_confirmed_at: null,
    identities: [],
    last_sign_in_at: null,
    phone: null,
    recovery_sent_at: null,
    role: 'authenticated'
  };

  const [user, setUser] = useState<User | null>(mockUser);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const signIn = async (data: SignInFormData): Promise<{ error: any }> => {
    console.log('Mock sign in:', data.email);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);
    
    return { error: null };
  };

  const signUp = async (data: SignUpFormData): Promise<{ error: any }> => {
    console.log('Mock sign up:', data.email, data.fullName);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUser({
        ...mockUser,
        email: data.email,
        user_metadata: { full_name: data.fullName || data.email }
      });
      setLoading(false);
    }, 1000);
    
    return { error: null };
  };

  const signOut = async (): Promise<void> => {
    console.log('Mock sign out');
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUser(null);
      setSession(null);
      setLoading(false);
    }, 500);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
