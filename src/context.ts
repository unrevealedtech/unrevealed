import { createContext } from 'react';

export interface UnrevealedContextValue {
  features: string[];
  loading: boolean;
  error: string | null;
}

export const UnrevealedContext = createContext<UnrevealedContextValue>({
  features: [],
  loading: true,
  error: null,
});
