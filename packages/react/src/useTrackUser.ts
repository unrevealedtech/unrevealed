import { useEffect } from 'react';
import { Team, User } from './types';
import { serializeBody } from './utils';

interface Options {
  wait: boolean;
  trackingUrl?: string | undefined;
}

export function useTrackUser(
  clientKey: string,
  user: User | undefined | null,
  team: Team | undefined | null,
  { wait, trackingUrl = 'https://track.unrevealed.tech/identify' }: Options,
) {
  useEffect(() => {
    if (wait || !user) {
      return;
    }

    const body = serializeBody({ user, team });

    if (!body) {
      return;
    }

    fetch(trackingUrl, {
      method: 'post',
      headers: { 'Client-Key': clientKey, 'Content-Type': 'application/json' },
      body,
    }).catch((err: Error) => {
      console.error(err);
    });
  }, [clientKey, user]);
}
