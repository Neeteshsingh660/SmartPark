import { request } from './apiClient';

export const adminService = {
  async getDashboard() {
    return request('/admin/dashboard');
  },
};
