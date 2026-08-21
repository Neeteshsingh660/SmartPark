import { request } from './apiClient';

export const reviewService = {
  async addReview(bookingId, { rating, comment }) {
    return request(`/reviews/booking/${bookingId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  async getParkingReviews(parkingSpotId) {
    return request(`/reviews/parking/${parkingSpotId}`);
  },
};
