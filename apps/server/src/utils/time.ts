export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([hdm])$/);
  if (!match) {
    throw new Error('Invalid duration format. Expected format: 1h, 7d, etc.');
  }

  const [_, value, unit] = match;
  const multipliers = {
    h: 60 * 60,
    d: 24 * 60 * 60,
    m: 60
  } as const;
  const seconds = parseInt(value) * multipliers[unit as keyof typeof multipliers];

  return seconds;
} 