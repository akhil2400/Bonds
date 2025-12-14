// Cookie configuration utility
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
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
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
    path: '/'
  };
};

module.exports = {
  getCookieOptions,
  getAccessTokenOptions,
  getRefreshTokenOptions,
  getClearCookieOptions
};