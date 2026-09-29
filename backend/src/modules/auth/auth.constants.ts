export const accessSecret = () => process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
export const refreshSecret = () => process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';

export const REFRESH_COOKIE = 'refresh_token';
export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
