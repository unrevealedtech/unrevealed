import { useCallback, useContext } from 'react';
import { UnrevealedContext } from './context';

export function useReload() {
  const { setFetchIndex } = useContext(UnrevealedContext);

  const reload = useCallback(() => {
    setFetchIndex((prev) => prev + 1);
  }, []);

  return { reload };
}
