import { useCallback, useContext } from 'react';
import { UnrevealedContext } from './context';
import { Team, User } from './types';
import { serializeBody } from './utils';

export function useIdentify() {
  const { setTeam, setUser, trackingUrl, clientKey } =
    useContext(UnrevealedContext);

  const track = async (type: 'user' | 'team', body: unknown) => {
    try {
      await fetch(`${trackingUrl}/identify-${type}`, {
        method: 'post',
        headers: {
          'Client-Key': clientKey,
          'Content-Type': 'application/json',
        },
        body: serializeBody(body),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const identify = useCallback(
    async ({ user, team }: { user: User | null; team?: Team | null }) => {
      setUser(user);
      setTeam(team ?? null);

      if (user) {
        await track('user', { userId: user.id, traits: user.traits });
      }

      if (team) {
        await track('team', {
          teamId: team.id,
          userId: user?.id,
          traits: team.traits,
        });
      }
    },
    [],
  );

  return { identify };
}
