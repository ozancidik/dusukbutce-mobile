export const endpoints = {
  csrfToken: '/api/auth/csrf-token',
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  socialLogin: '/api/auth/social-login',
  verifyToken: '/api/auth/verify-token',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',
  updateProfile: '/api/auth/update-profile',
  upload: '/api/upload',
  submissions: '/api/submissions',
};

// Bu uçlar 401'de otomatik logout tetiklemeyecek istisnalar — henüz oturum
// yokken veya oturum kurulurken çağrılıyorlar.
export const AUTH_EXEMPT_PATHS = [
  endpoints.login,
  endpoints.register,
  endpoints.socialLogin,
];
