import { Lobby } from 'shared/src/contracts/api/lobby';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utilities/logger';
import { ConnectionService } from './connection.service';

export class LobbyService {
  lobbies: Map<string, Lobby> = new Map();
  // eslint-disable-next-line @typescript-eslint/ban-types
  private lobbySubs: Function[] = []; // subscriptions for updates to lobbies

  constructor(private readonly connectionService: ConnectionService) {}

  private publishLobbyUpdates(): void {
    this.lobbySubs.forEach((fn) => {
      fn(Array.from(this.lobbies.values()));
    });
  }

  manualPublish(): void {
    this.publishLobbyUpdates();
  }

  subscribe(fn: (lobbies: Lobby[]) => void) {
    this.lobbySubs.push(fn);
  }

  create(name: string): Lobby {
    const lobby = { id: uuidv4(), connections: [], name };
    this.lobbies.set(lobby.id, lobby);
    Logger.info(`Created lobby ${lobby.id}.`);
    this.publishLobbyUpdates();

    return lobby;
  }

  delete(uuid: string): void {
    this.lobbies.delete(uuid);
    Logger.info(`Deleted lobby ${uuid}.`);
    this.publishLobbyUpdates();
  }

  removeConnectionFromAllLobbies(uuid: string): void {
    this.lobbies.forEach((lobby) => {
      const connectionIds = lobby.connections.map(
        (connection) => connection.id
      );
      if (connectionIds.includes(uuid)) {
        lobby.connections = lobby.connections.filter(
          (connection) => connection.id !== uuid
        );
        Logger.info(`Removed connection ${uuid} from lobby ${lobby.id}.`);
      }

      if (lobby.connections.length === 0) {
        this.delete(lobby.id);
      }
    });
    this.publishLobbyUpdates();
  }

  addConnectionToLobby(connectionId: string, lobbyId: string): void {
    // check if connection is already in another lobby
    if (this.connectionIsInALobby(connectionId)) {
      Logger.error(
        `Could not add connection ${connectionId} to lobby ${lobbyId} because connection is already in another lobby.`
      );
      return;
    }

    // try to add connection if lobby exists
    const lobby = this.lobbies.get(lobbyId);
    if (lobby) {
      const connection = this.connectionService.getConnectionById(connectionId);
      if (connection === undefined) {
        Logger.error(
          `Could not add connection ${connectionId} to lobby ${lobbyId} because connection does not exist`
        );
        return;
      }
      lobby.connections.push(connection);
      Logger.info(`Added connection ${connectionId} to lobby ${lobby.id}.`);
      this.publishLobbyUpdates();
    } else {
      Logger.error(
        `Could not add connection ${connectionId} to lobby ${lobbyId} because lobby does not exist.`
      );
    }
  }

  connectionIsInALobby(connectionId: string): boolean {
    return Array.from(this.lobbies.values()).some((rm) => {
      return rm.connections.map((conn) => conn.id).includes(connectionId);
    });
  }
}
