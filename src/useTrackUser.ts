import { useEffect } from 'react';
import { User } from './types';

type Body = { user: User };

function serializeBody(body: Body): string | null {
  try {
    return JSON.stringify(body);
  } catch {
    return null;
  }
}

export function useTrackUser(
  clientKey: string,
  user: User | undefined | null,
  { wait }: { wait: boolean },
) {
  useEffect(() => {
    if (wait || !user) {
      return;
    }

    const body = serializeBody({ user });

    if (!body) {
      return;
    }

    fetch('https://track.unrevealed.tech/identify', {
      method: 'post',
      headers: { 'Client-Key': clientKey, 'Content-Type': 'application/json' },
      body,
    }).catch((err: Error) => {
      console.error(err);
    });
  }, [clientKey, user]);
}
