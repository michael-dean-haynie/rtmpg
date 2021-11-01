import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utilities/logger';

export class LobbyService {
  lobbies: Map<string, Lobby> = new Map();
  private lobbySubs: Function[] = []; // subscriptions for updates to lobbies

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

  create(): Lobby {
    const lobby = new Lobby();
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
      if (lobby.connections.includes(uuid)) {
        lobby.connections = lobby.connections.filter((pid) => pid !== uuid);
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
      lobby.connections.push(connectionId);
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
      return rm.connections.includes(connectionId);
    });
  }
}

export class Lobby {
  connections: string[] = []; // connection uuids
  id: string = uuidv4();
}
