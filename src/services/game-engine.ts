import { Logger } from '../utilities/logger';
import { ConnectionService } from './connection.service';
import { GameStartEvent } from './game-events/game-start-event';
import { GameInput } from './game-inputs/game-input';
import { LobbyUpdateInput } from './game-inputs/lobby-update-input';
import { LobbyService } from './lobby.service';

export class GameEngine {
  private start = 0; // ms since unix epoch (initialized during first tick)
  private tickNumber = 0;

  state: any = {
    players: []
  };
  inputQueue: GameInput[] = [];
  events: any[] = [];

  constructor(
    readonly gameId: string,
    public readonly lobbyId: string,
    private readonly lobbyService: LobbyService,
    private readonly connectionService: ConnectionService
  ) {
    this.events.push(new GameStartEvent({ gameEngineId: this.gameId }));

    this.tick();

    // listen for lobby updates (added players / removed players)
    this.lobbyService.subscribe((lobbies) => {
      this.inputQueue.push(new LobbyUpdateInput(this, lobbies));
    });
  }

  publishEventToLobby(event: any) {
    const lobby = this.lobbyService.lobbies.get(this.lobbyId);
    if (!lobby) {
      Logger.error(
        `Could not get lobby ${this.lobbyId} because it does not exist.`
      );
      return;
    }

    lobby.players.forEach((playerId) => {
      const webSocket = this.connectionService.connections.get(playerId);
      if (!webSocket) {
        Logger.error(
          `Could not get connection ${playerId} because it does not exist.`
        );
        return;
      }

      webSocket.send(JSON.stringify({ event: event.data }));
    });
  }

  publishPastEventsToNewPlayer(playerId: string) {
    const lobby = this.lobbyService.lobbies.get(this.lobbyId);
    if (!lobby) {
      Logger.error(
        `Could not get lobby ${this.lobbyId} because it does not exist.`
      );
      return;
    }

    const webSocket = this.connectionService.connections.get(playerId);
    if (!webSocket) {
      Logger.error(
        `Could not get connection ${playerId} because it does not exist.`
      );
      return;
    }

    this.events.forEach((event) => {
      webSocket.send(JSON.stringify({ event: event.data }));
    });
  }

  private tick() {
    const tickStart = Date.now();
    if (this.tickNumber === 0) {
      this.start = tickStart;
    }

    // process input that has been queued up
    while (this.inputQueue.length) {
      this.inputQueue.shift()?.process();
    }

    // TODO: process continuation-like events (events that don't require input to happen)

    // gather tick metadata
    const tickMetaData = {
      tickNumber: this.tickNumber,
      tickTimeStamp: Date.now() - this.start, // number of ms since game start
      tickDuration: Date.now() - tickStart // number of ms tick took up
    };

    // schedule next tick
    this.tickNumber++;
    setTimeout(this.tick.bind(this), 50);
  }
}
