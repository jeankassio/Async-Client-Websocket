/*!
 * Async Client Websocket v1.0.3
 * by Jean Kássio
 *
 * More info:
 * https://jeankassio.dev
 *
 * Copyright Jean Kássio
 * Released under the MIT license
 * https://github.com/jeankassio/Async-Client-Websocket/blob/main/LICENSE
 *
 * @preserve
 */

class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.onOpen = null;
    this.onClose = null;
    this.onMessage = null;
    this.onError = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = (event) => {
        if (this.onOpen) {
          this.onOpen(event);
        }
        resolve();
      };

      this.socket.onmessage = (event) => {
        const message = event.data;
        if (this.onMessage) {
          this.onMessage(message);
        }
      };

      this.socket.onerror = (error) => {
        if (this.onError) {
          this.onError(error);
        }
      };

      this.socket.onclose = (event) => {
        if (this.onClose) {
          this.onClose(event);
        }
      };
    });
  }

  send(message) {
    if(this.socket && this.socket.readyState === WebSocket.OPEN) {
		this.socket.send(message);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}