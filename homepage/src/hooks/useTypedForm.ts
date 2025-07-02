
import { useState, useCallback } from 'react';
import { z } from 'zod';
import { FormState } from '@/utils/types';

export function useTypedForm<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialValues: T
) {
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const initialState = {} as FormState<T>;
    Object.keys(initialValues).forEach((key) => {
      const k = key as keyof T;
      initialState[k] = {
        value: initialValues[k],
        error: undefined,
        touched: false,
      };
    });
    return initialState;
  });

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        touched: true,
      },
    }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));
  }, []);

  const validate = useCallback(() => {
    const values = {} as T;
    Object.keys(formState).forEach((key) => {
      const k = key as keyof T;
      values[k] = formState[k].value;
    });

    const result = schema.safeParse(values);
    
    if (!result.success) {
      const newFormState = { ...formState };
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof T;
        if (field && newFormState[field]) {
          newFormState[field] = {
            ...newFormState[field],
            error: error.message,
          };
        }
      });
      setFormState(newFormState);
      return { success: false, errors: result.error.errors };
    }

    // Clear errors on success
    const newFormState = { ...formState };
    Object.keys(newFormState).forEach((key) => {
      const k = key as keyof T;
      newFormState[k] = {
        ...newFormState[k],
        error: undefined,
      };
    });
    setFormState(newFormState);

    return { success: true, data: result.data };
  }, [formState, schema]);

  const reset = useCallback(() => {
    const resetState = {} as FormState<T>;
    Object.keys(initialValues).forEach((key) => {
      const k = key as keyof T;
      resetState[k] = {
        value: initialValues[k],
        error: undefined,
        touched: false,
      };
    });
    setFormState(resetState);
  }, [initialValues]);

  const getValues = useCallback(() => {
    const values = {} as T;
    Object.keys(formState).forEach((key) => {
      const k = key as keyof T;
      values[k] = formState[k].value;
    });
    return values;
  }, [formState]);

  return {
    formState,
    setValue,
    setError,
    validate,
    reset,
    getValues,
  };
}
