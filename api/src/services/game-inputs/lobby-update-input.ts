import { Logger } from '../../utilities/logger';
import { GameEngine } from '../game-engine';
import { AddPlayerEvent } from '../game-events/add-player-event';
import { RemovePlayerEvent } from '../game-events/remove-player-event';
import { Lobby } from '../lobby.service';
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
      (plyr: any) => plyr.id
    ) as string[];
    const addedPlayers = lobby?.players.filter(
      (lobbyP) => !existingPlayers.includes(lobbyP)
    );
    const removedPlayers = existingPlayers.filter(
      (existingP) => !lobby?.players.includes(existingP)
    );

    addedPlayers?.forEach((playerId) => {
      // first send them the existing events so they can catch up
      this.gameEngine.publishPastEventsToNewPlayer(playerId);

      const event = new AddPlayerEvent(
        {
          player: AddPlayerEvent.generatePlayer(playerId)
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
