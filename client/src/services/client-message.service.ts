import { ClientMessage } from 'shared/lib/contracts/client/client-message';

export class ClientMessageService {
  constructor(private _webSocket: WebSocket) {}

  send(message: ClientMessage) {
    this._webSocket.send(JSON.stringify(message));
  }
}
