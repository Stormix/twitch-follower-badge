import scope from '@/instrument';
import { type TwitchOAuthValidResponse } from '../types/twitch';
import { EXTENSION_ID, TWITCH_CLIENT_ID } from './config';
import { logger } from './logger';
import type { UserLogin } from './validation';

const CLIENT_ID = encodeURIComponent(TWITCH_CLIENT_ID);
const REDIRECT_URI = encodeURIComponent(`https://${EXTENSION_ID}.chromiumapp.org/`);
const RESPONSE_TYPE = encodeURIComponent('token id_token');
const TWITCH_SCOPES = [
  'openid',
  'user:read:email',
  'channel:read:subscriptions', // Read subscribers
  'moderator:read:followers', // Read followers
  'moderator:read:chatters', // Read chatters
  'moderation:read', // Read moderators
  'channel:read:vips', // Read vips
] as const;
const SCOPE = encodeURIComponent(TWITCH_SCOPES.join(' '));

const CLAIMS = encodeURIComponent(
  JSON.stringify({
    id_token: { email: null, email_verified: null },
  }),
);
const STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));

const twitchEndpoint = () => {
  const nonce = encodeURIComponent(
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  );
  return `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&claims=${CLAIMS}&state=${STATE}&nonce=${nonce}`;
};

const validateToken = async (access_token: string) => {
  try {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    });

    const user = (await response.json()) as TwitchOAuthValidResponse;
    logger.info('Logged in as: ', user.login);

    return user;
  } catch (error) {
    logger.error('Failed to fetch user', error);
    return null;
  }
};

const authenticateUser = async (userLogin: UserLogin): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    const endpoint = `${process.env.PLASMO_PUBLIC_BACKEND_URL}/api/user/login`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(userLogin),
    headers: {
      'Content-Type': 'application/json',
    },
  });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Failed to authenticate user', error);
    return null;
  }
};

export const authenticateUsingTwitch = () => {
  return new Promise<{
    accessToken: string;
    refreshToken: string;
    user: TwitchOAuthValidResponse;
  }>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: twitchEndpoint(),
        interactive: true,
      },
      async (redirect_url) => {
        const error = chrome.runtime.lastError;
        if (error || !redirect_url || redirect_url.includes('error=access_denied')) {
          reject(error || 'Authentication failed');
          scope.captureException(error || 'Authentication failed');
          return;
        }

        try {
          logger.info('User signed in.');
          const url = new URL(redirect_url);
          const searchParams = new URLSearchParams(url.hash.substring(1));
          const access_token = searchParams.get('access_token');

          if (!access_token) {
            throw new Error('No access token found');
          }

          const user = await validateToken(access_token);
          if (!user) {
            throw new Error('Failed to fetch user data');
          }

          const payload: UserLogin = {
            userId: user.user_id,
            username: user.login,
            accessToken: access_token,
          };

          const { refreshToken, accessToken } = await authenticateUser(payload);

          resolve({ accessToken, refreshToken, user });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
};
