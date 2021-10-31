import { ApiMessage } from 'shared/lib/contracts/api/api-message';
import { WebSocket } from 'ws';

export class ApiMessageService {
  send(ws: WebSocket, message: ApiMessage) {
    ws.send(JSON.stringify(message));
  }
}
