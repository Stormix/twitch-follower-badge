export const TWITCH_SCOPES = [
  'channel:read:subscriptions', // Read subscribers
  'moderator:read:followers', // Read followers
  'moderator:read:chatters', // Read chatters
  'moderation:read', // Read moderators
  'channel:read:vips', // Read vips
] as const;
