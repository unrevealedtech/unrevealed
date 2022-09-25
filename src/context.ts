import { createContext } from 'react';

export interface UnrevealedContextValue {
  features: string[];
  loading: boolean;
  error: null;
}

export const UnrevealedContext = createContext<UnrevealedContextValue>({
  features: [],
  loading: true,
  error: null,
});
