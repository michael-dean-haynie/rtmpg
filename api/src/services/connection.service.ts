import { Connection } from 'shared/src/contracts/api/connection';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { Logger } from '../utilities/logger';

export class ConnectionService {
  connections: Map<Connection, WebSocket> = new Map();

  getConnectionById(uuid: string): Connection | undefined {
    const connection = Array.from(this.connections.keys()).find(
      (conn) => conn.id === uuid
    );
    if (connection === undefined) {
      Logger.warning(`Could not find connection by id: ${uuid}.`);
    }
    return connection;
  }

  register(webSocket: WebSocket) {
    const uuid = uuidv4();
    const connection = { id: uuid };
    this.connections.set(connection, webSocket);
    Logger.info(`Registered connection ${uuid}.`);
    return connection;
  }

  assignName(name: string, uuid: string): void {
    const connection = this.getConnectionById(uuid);
    if (connection === undefined) {
      Logger.error(
        `Could not assign name for connection connection with uuid: ${uuid} because it could not be found.`
      );
      return;
    }

    connection.playerName = name;
  }

  unregister(uuid: string) {
    const connection = this.getConnectionById(uuid);
    if (connection === undefined) {
      Logger.error(
        `Could not unregister connection by uuid: ${uuid} because it could not be found.`
      );
      return;
    }
    this.connections.delete(connection);
    Logger.info(`Unregistered connection ${uuid}.`);
  }
}
