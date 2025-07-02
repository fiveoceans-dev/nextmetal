
import React, { createContext, useContext, useEffect, useState } from 'react';

interface NextMetalUser {
  id: string;
  email: string;
  nickname?: string;
  is_verified: boolean;
  points: number;
  referral_code?: string;
  referral_uses_left?: number;
  quests: {
    quest1_done: boolean;
    quest2_done: boolean;
    quest3_done: boolean;
    quest4_done: boolean;
    quest5_done: boolean;
  };
}

interface NextMetalAuthContextType {
  user: NextMetalUser | null;
  sessionToken: string | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, nickname?: string, referralCode?: string) => Promise<{ error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  addPoints: (type: string, delta: number, meta?: any) => Promise<void>;
  createReferralCode: (code: string) => Promise<{ error?: string }>;
  loading: boolean;
}

const NextMetalAuthContext = createContext<NextMetalAuthContextType | undefined>(undefined);

export const useNextMetalAuth = () => {
  const context = useContext(NextMetalAuthContext);
  if (context === undefined) {
    throw new Error('useNextMetalAuth must be used within a NextMetalAuthProvider');
  }
  return context;
};

const API_BASE_URL = 'https://srvvqtlawmnhdddlffuf.supabase.co/functions/v1';

export const NextMetalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<NextMetalUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('nextmetal_session_token');
    if (token) {
      setSessionToken(token);
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Login failed' };
      }

      setSessionToken(data.session_token);
      localStorage.setItem('nextmetal_session_token', data.session_token);
      
      await refreshUser();
      return {};
    } catch (error) {
      return { error: 'Network error' };
    }
  };

  const register = async (email: string, password: string, nickname?: string, referralCode?: string): Promise<{ error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nickname, referralCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Registration failed' };
      }

      // Auto-login after registration
      return await login(email, password);
    } catch (error) {
      return { error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem('nextmetal_session_token');
  };

  const refreshUser = async () => {
    const token = sessionToken || localStorage.getItem('nextmetal_session_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user-data/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        logout();
        return;
      }

      const data = await response.json();
      setUser({
        id: data.user.id,
        email: data.user.email,
        nickname: data.user.nickname,
        is_verified: data.user.is_verified,
        points: data.points,
        referral_code: data.referral_code,
        referral_uses_left: data.referral_uses_left,
        quests: data.quests || {
          quest1_done: false,
          quest2_done: false,
          quest3_done: false,
          quest4_done: false,
          quest5_done: false,
        },
      });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (type: string, delta: number, meta: any = {}) => {
    const token = sessionToken || localStorage.getItem('nextmetal_session_token');
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/user-data/add-points`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, delta, meta }),
      });

      await refreshUser();
    } catch (error) {
      console.error('Failed to add points:', error);
    }
  };

  const createReferralCode = async (code: string): Promise<{ error?: string }> => {
    const token = sessionToken || localStorage.getItem('nextmetal_session_token');
    if (!token) return { error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_BASE_URL}/user-data/create-referral`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to create referral code' };
      }

      await refreshUser();
      return {};
    } catch (error) {
      return { error: 'Network error' };
    }
  };

  const value: NextMetalAuthContextType = {
    user,
    sessionToken,
    login,
    register,
    logout,
    refreshUser,
    addPoints,
    createReferralCode,
    loading,
  };

  return (
    <NextMetalAuthContext.Provider value={value}>
      {children}
    </NextMetalAuthContext.Provider>
  );
};
