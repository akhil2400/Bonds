// Cookie configuration utility
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: false, // Allow non-HTTPS in development for network access
    sameSite: 'lax', // More permissive for cross-origin in development
    domain: undefined, // Don't set domain in development for IP access
    path: '/'
  };
};

const getAccessTokenOptions = () => ({
  ...getCookieOptions(),
  maxAge: 15 * 60 * 1000 // 15 minutes
});

const getRefreshTokenOptions = () => ({
  ...getCookieOptions(),
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});

const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: false, // Allow non-HTTPS in development for network access
    sameSite: 'lax', // More permissive for cross-origin in development
    domain: undefined, // Don't set domain in development for IP access
    path: '/'
  };
};

module.exports = {
  getCookieOptions,
  getAccessTokenOptions,
  getRefreshTokenOptions,
  getClearCookieOptions
};