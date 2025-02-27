import env from '@/env';
import logger, { Logger } from '@/lib/logger';
import { ApiClient, HelixUser } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import userService from './user';

export class TwitchService {
  private logger: Logger;
  private cachedClients: Map<number, ApiClient>;

  constructor() {
    this.logger = logger.getSubLogger({ name: 'TwitchService' });
    this.cachedClients = new Map();
  }

  async getUser(accessToken: string, username: string): Promise<HelixUser | null> {
    try {
      const authProvider = new StaticAuthProvider(env.TWITCH_CLIENT_ID, accessToken, env.TWITCH_SCOPES.split(' '));
      const apiClient = new ApiClient({ authProvider });
      const user = await apiClient.users.getUserByName(username);

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getClient(userId: number) {
    const user = await userService.get(userId);
    const authProvider = new StaticAuthProvider(
      env.TWITCH_CLIENT_ID,
      user.twitchAccessToken,
      env.TWITCH_SCOPES.split(' '),
    );

    let apiClient = this.cachedClients.get(user.id);

    if (!apiClient) {
      apiClient = new ApiClient({ authProvider });
      this.cachedClients.set(user.id, apiClient);
    }

    return apiClient;
  }

  async *getFollowers(userId: number) {
    try {
      const user = await userService.get(userId);
      const apiClient = await this.getClient(userId);

      this.logger.info(`Getting followers for ${user.username}`);

      for await (const follower of apiClient.channels.getChannelFollowersPaginated(user.twitchId)) {
        yield follower;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getFollowersCount(userId: number) {
    const user = await userService.get(userId);
    const apiClient = await this.getClient(userId);

    return apiClient.channels.getChannelFollowerCount(user.twitchId);
  }
}

export const twitchService = new TwitchService();
