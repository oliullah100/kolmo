import WebSocketService from '../app/websocket/websocket';

declare global {
  var wsService: WebSocketService | undefined;
  var webSocketService: WebSocketService | undefined;
}

export {}; 