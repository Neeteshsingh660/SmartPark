import { request } from './apiClient';

export const paymentService = {
  async processPayment(paymentData) {
    return request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async createRazorpayOrder(orderData) {
    return request('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async verifyRazorpayPayment(verifyData) {
    return request('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(verifyData),
    });
  },
};
