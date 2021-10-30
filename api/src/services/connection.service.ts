import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { Logger } from '../utilities/logger';

export class ConnectionService {
  connections: Map<string, WebSocket> = new Map();

  register(webSocket: WebSocket) {
    const uuid = uuidv4();
    this.connections.set(uuid, webSocket);
    Logger.info(`Registered connection ${uuid}.`);
    return uuid;
  }

  unregister(uuid: string) {
    this.connections.delete(uuid);
    Logger.info(`Unregistered connection ${uuid}.`);
  }
}
