import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
  }

  connect(onMessageCallback) {
    if (this.client && this.client.connected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      debug: (str) => {
        // Uncomment for dev debugging
        // console.log('[STOMP]', str);
      },
      onConnect: () => {
        console.log('STOMP WebSocket connected successfully');
        if (onMessageCallback) onMessageCallback({ type: 'CONNECTED' });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
      },
    });

    this.client.activate();
  }

  subscribeUser(role, email, callback) {
    if (!this.client || !this.client.connected) {
      setTimeout(() => this.subscribeUser(role, email, callback), 1000);
      return;
    }

    const topic = role === 'OWNER' ? `/topic/owner/${email}` : `/topic/driver/${email}`;
    if (this.subscriptions[topic]) return;

    console.log(`Subscribing to topic: ${topic}`);
    this.subscriptions[topic] = this.client.subscribe(topic, (message) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.subscriptions = {};
    }
  }
}

export const websocketService = new WebSocketService();
