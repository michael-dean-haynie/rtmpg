import { EventsRecapMessage } from '../../../shared/lib/contracts/api/api-message';
import { GameStartEvent } from '../../../shared/lib/game-events/game-start-event';
import { MovePlayerEvent } from '../../../shared/lib/game-events/move-player-event';
import { Logger } from '../utilities/logger';
import { ApiMessageService } from './api-message.service';
import { ConnectionService } from './connection.service';
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
    private readonly connectionService: ConnectionService,
    private readonly apiMessageService: ApiMessageService
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

    lobby.connections.forEach((playerId) => {
      const webSocket = this.connectionService.connections.get(playerId);
      if (!webSocket) {
        Logger.error(
          `Could not get connection ${playerId} because it does not exist.`
        );
        return;
      }

      // webSocket.send(JSON.stringify({ event: event.data }));'
      this.apiMessageService.send(webSocket, {
        messageType: 'GAME_EVENT',
        event: event.data
      });
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

    const message: EventsRecapMessage = {
      messageType: 'EVENTS_RECAP',
      events: this.events
    };

    this.apiMessageService.send(webSocket, message);
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

    // process continuation-like events (events that don't require input to happen)
    this.movePlayers();

    // gather tick metadata
    const tickMetaData = {
      tickNumber: this.tickNumber,
      tickTimeStamp: Date.now() - this.start, // number of ms since game start
      tickDuration: Date.now() - tickStart // number of ms tick took up
    };

    // schedule next tick
    this.tickNumber++;
    setTimeout(this.tick.bind(this), 20);
  }

  private movePlayers(): void {
    this.state.players.forEach((player: any) => {
      // check if moving
      if (player.direction === 'NONE') {
        return;
      }

      // calculate new position
      const newPosition = this.calculateNewPosition(player);

      // only create event if position actually changed
      if (
        newPosition.x === player.position.x &&
        newPosition.y === player.position.y
      ) {
        return;
      }

      // create event
      const event = new MovePlayerEvent(
        {
          playerId: player.id,
          oldPosition: { ...player.position },
          newPosition
        },
        this.state
      );

      // do the things
      event.apply();
      this.publishEventToLobby(event);
      this.events.push(event);
    });
  }

  private calculateNewPosition(player: any) {
    const oldPosition = player.position;
    const speed = 1; // should move 1 coordinate per tick()
    const pieceSize = 5; // a radius-like measurement but for a square

    // calculate next target position
    const tp = { ...oldPosition };
    switch (player.direction) {
      case 'UP':
        tp.y += speed;
        break;
      case 'RIGHT':
        tp.x += speed;
        break;
      case 'DOWN':
        tp.y -= speed;
        break;
      case 'LEFT':
        tp.x -= speed;
        break;
    }

    // check and correct if going off the top edge
    if (tp.y > 100 - pieceSize) {
      tp.y = 100 - pieceSize;
    }
    // check and correct if going off the right edge
    if (tp.x > 100 - pieceSize) {
      tp.x = 100 - pieceSize;
    }
    // check and correct if going off the bottom edge
    if (tp.y < pieceSize) {
      tp.y = pieceSize;
    }
    // check and correct if going off the left edge
    if (tp.x < pieceSize) {
      tp.x = pieceSize;
    }

    return tp;
  }
}
