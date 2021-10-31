import { ClientMessage } from 'shared/lib/contracts/client/client-message';

export class ClientMessageService {
  send(ws: WebSocket, message: ClientMessage) {
    ws.send(JSON.stringify(message));
  }
}
