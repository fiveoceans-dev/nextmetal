
// Type utilities for better type safety
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export type PickRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Form utilities
export type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
};

export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
};

// Event handlers
export type EventHandler<T = Element> = (event: React.SyntheticEvent<T>) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type ClickHandler<T = HTMLButtonElement> = (event: React.MouseEvent<T>) => void;

// Component utilities
export type ComponentWithChildren<T = {}> = T & {
  children: React.ReactNode;
};

export type ComponentWithOptionalChildren<T = {}> = T & {
  children?: React.ReactNode;
};

// Async utilities
export type AsyncResult<T, E = Error> = Promise<{ data?: T; error?: E }>;

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
