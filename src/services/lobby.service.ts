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

  removePlayerFromAllLobbies(uuid: string): void {
    this.lobbies.forEach((lobby) => {
      if (lobby.players.includes(uuid)) {
        lobby.players = lobby.players.filter((pid) => pid !== uuid);
        Logger.info(`Removed player ${uuid} from lobby ${lobby.id}.`);
      }

      if (lobby.players.length === 0) {
        this.delete(lobby.id);
      }
    });
    this.publishLobbyUpdates();
  }

  addPlayerToLobby(playerId: string, lobbyId: string): void {
    // check if player is already in another lobby
    if (this.playerIsInALobby(playerId)) {
      Logger.error(
        `Could not add player ${playerId} to lobby ${lobbyId} because player is already in another lobby.`
      );
      return;
    }

    // try to add player if lobby exists
    const lobby = this.lobbies.get(lobbyId);
    if (lobby) {
      lobby.players.push(playerId);
      Logger.info(`Added player ${playerId} to lobby ${lobby.id}.`);
      this.publishLobbyUpdates();
    } else {
      Logger.error(
        `Could not add player ${playerId} to lobby ${lobbyId} because lobby does not exist.`
      );
    }
  }

  playerIsInALobby(playerId: string): boolean {
    return Array.from(this.lobbies.values()).some((rm) => {
      return rm.players.includes(playerId);
    });
  }
}

export class Lobby {
  players: string[] = []; // connection uuids
  id: string = uuidv4();
}
