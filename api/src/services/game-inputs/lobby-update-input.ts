import { Lobby } from 'shared/src/contracts/api/lobby';
import { AddPlayerEvent } from '../../../../shared/lib/game-events/add-player-event';
import { RemovePlayerEvent } from '../../../../shared/lib/game-events/remove-player-event';
import { Logger } from '../../utilities/logger';
import { GameEngine } from '../game-engine';
import { GameInput } from './game-input';

export class LobbyUpdateInput extends GameInput {
  constructor(gameEngine: GameEngine, private readonly lobbies: Lobby[]) {
    super(gameEngine);
  }

  processBody(): void {
    const lobby = this.lobbies.find(
      (lob) => lob.id === this.gameEngine.lobbyId
    );

    // check for new players and removed players
    const existingPlayers = this.gameEngine.state.players.map(
      (plyr) => plyr.id
    );
    const addedPlayers = lobby?.connections.filter(
      (lobbyConn) => !existingPlayers.includes(lobbyConn.id)
    );
    const removedPlayers = existingPlayers.filter(
      (existingP) =>
        !lobby?.connections.map((conn) => conn.id).includes(existingP)
    );

    addedPlayers?.forEach((connection) => {
      // first send them the existing events so they can catch up
      this.gameEngine.publishPastEventsToNewPlayer(connection.id);

      const event = new AddPlayerEvent(
        {
          player: AddPlayerEvent.generatePlayer(
            connection.id,
            connection.playerName as string
          )
        },
        this.gameEngine.state
      );

      Logger.trace(
        `Applying ${event.data.eventType}. Game state before: ${JSON.stringify(
          this.gameEngine.state
        )}`
      );

      // apply event to game state
      event.apply();

      Logger.trace(
        `Applied ${event.data.eventType}. Game state after: ${JSON.stringify(
          this.gameEngine.state
        )}`
      );

      // add event to events array
      this.events.push(event);
    });

    removedPlayers?.forEach((playerId) => {
      const player = this.gameEngine.state.players.find(
        (plyr: any) => plyr.id === playerId
      );

      const event = new RemovePlayerEvent({ player }, this.gameEngine.state);

      Logger.trace(
        `Applying ${event.data.eventType}. Game state before: ${JSON.stringify(
          this.gameEngine.state
        )}`
      );

      // apply event to game state
      event.apply();

      Logger.trace(
        `Applied ${event.data.eventType}. Game state after: ${JSON.stringify(
          this.gameEngine.state
        )}`
      );

      // add event to events array
      this.events.push(event);
    });
  }
}
