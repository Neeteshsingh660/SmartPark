import { request } from './apiClient';

export const checkInService = {
  async checkIn(qrToken) {
    return request('/owner/scan/checkin', {
      method: 'POST',
      body: JSON.stringify({ qrToken }),
    });
  },

  async checkOut(qrToken) {
    return request('/owner/scan/checkout', {
      method: 'POST',
      body: JSON.stringify({ qrToken }),
    });
  },
};
