import { request } from './apiClient';

export const authService = {
  async sendOtp(email) {
    return request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async register(data) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};
