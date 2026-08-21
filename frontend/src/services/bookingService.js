import { request } from './apiClient';

export const bookingService = {
  async createBooking(bookingData) {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async getMyBookings() {
    return request('/bookings/my');
  },

  async getBookingDetails(id) {
    return request(`/bookings/${id}`);
  },

  async requestExtension(id, hours = 1) {
    return request(`/bookings/${id}/extend?hours=${hours}`, { method: 'POST' });
  },

  async cancelBooking(id) {
    return request(`/bookings/${id}/cancel`, { method: 'POST' });
  },

  async getSpotAvailability(spotId) {
    return request(`/parking/${spotId}/availability`);
  },

  async respondToExtension(bookingId, approve) {
    return request(`/owner/parking/bookings/${bookingId}/extension-response?approve=${approve}`, { method: 'POST' });
  },

  async getWalletBalance() {
    return request('/wallet/balance');
  },
};
