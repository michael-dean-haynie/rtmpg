import { GameEngine } from '../game-engine';
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
    const existingPlayers = this.gameEngine.state.players as string[];
    const addedPlayers = lobby?.players.filter(
      (lobbyP) => !existingPlayers.includes(lobbyP)
    );
    const removedPlayers = existingPlayers.filter(
      (existingP) => !lobby?.players.includes(existingP)
    );

    // TOOD: actually figure out how to mutate game state so it is reversable
    addedPlayers?.forEach((playerId) => {
      this.events.push({
        eventType: 'ADD_PLAYER',
        eventData: { playerId }
      });
    });

    removedPlayers?.forEach((playerId) => {
      this.events.push({
        eventType: 'REMOVE_PLAYER',
        eventData: { playerId }
      });
    });
  }
}
