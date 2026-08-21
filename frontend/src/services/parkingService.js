import { request } from './apiClient';

export const parkingService = {
  async searchNearby({ latitude, longitude, radiusKm = 5, maxPrice, covered, security, evCharging }) {
    const params = new URLSearchParams();
    if (latitude != null) params.append('latitude', latitude);
    if (longitude != null) params.append('longitude', longitude);
    if (radiusKm != null) params.append('radiusKm', radiusKm);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (covered != null) params.append('covered', covered);
    if (security != null) params.append('security', security);
    if (evCharging != null) params.append('evCharging', evCharging);

    return request(`/parking/nearby?${params.toString()}`);
  },

  async getParkingDetails(id, userLat, userLon) {
    const params = new URLSearchParams();
    if (userLat != null) params.append('userLat', userLat);
    if (userLon != null) params.append('userLon', userLon);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/parking/${id}${queryString}`);
  },

  // Owner Endpoints
  async getMySpots() {
    return request('/owner/parking');
  },

  async getSpotById(id) {
    return request(`/owner/parking/${id}`);
  },

  async createSpot(spotData) {
    return request('/owner/parking', {
      method: 'POST',
      body: JSON.stringify(spotData),
    });
  },

  async updateSpot(id, spotData) {
    return request(`/owner/parking/${id}`, {
      method: 'PUT',
      body: JSON.stringify(spotData),
    });
  },

  async deleteSpot(id) {
    return request(`/owner/parking/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleSpotStatus(id) {
    return request(`/owner/parking/${id}/toggle-status`, {
      method: 'POST',
    });
  },

  async getOwnerBookings() {
    return request('/owner/parking/bookings');
  },
};
