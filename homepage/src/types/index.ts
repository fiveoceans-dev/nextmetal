
// Core application types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  app_metadata: Record<string, any>;
  user_metadata: {
    full_name?: string;
    [key: string]: any;
  };
  aud: string;
  confirmation_sent_at: string | null;
  confirmed_at: string | null;
  email_confirmed_at: string | null;
  identities: any[];
  last_sign_in_at: string | null;
  phone: string | null;
  recovery_sent_at: string | null;
  role: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface TokenomicsData {
  label: string;
  value: string;
  percent: number;
  color: string;
  icon: React.ComponentType<any>; // Changed to accept any props for better compatibility
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type StringOrNumber = string | number;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'cyber' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}
