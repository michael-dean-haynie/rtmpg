import { PlayerInput } from 'shared/lib/contracts/client/client-message';
import { GSDirection } from 'shared/lib/game-state';
import { Logger } from '../utilities/logger';
import { GameEngineService } from './game-engine.service';
import { ChangeDirectionInput } from './game-inputs/change-direction-input';
import { LobbyService } from './lobby.service';

export class InputEngine {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly gameEngineService: GameEngineService
  ) {}

  processInput(playerId: string, playerInput: PlayerInput) {
    // find lobby
    const lobbies = Array.from(this.lobbyService.lobbies.values());
    const lobby = lobbies.find((lob) =>
      lob.connections.map((conn) => conn.id).includes(playerId)
    );
    if (!lobby) {
      Logger.error(`Could not find lobby by player id: ${playerId}.`);
      return;
    }

    // find game engine
    const gameEngines = Array.from(this.gameEngineService.gameEngines.values());
    const gameEngine = gameEngines.find((ge) => ge.lobbyId === lobby.id);
    if (!gameEngine) {
      Logger.error(`Could not get game engine by lobbyId: ${lobby.id}.`);
      return;
    }

    // do the things
    if (playerInput.inputType === 'CHANGE_DIRECTION') {
      const newDirection = playerInput.value as GSDirection;
      const oldDirection = gameEngine.state.players.find(
        (plyr) => plyr.id === playerId
      )?.direction;

      if (oldDirection === undefined) {
        Logger.error(`Could not determine 'oldDirection'`);
        console.log('game state:', JSON.stringify(gameEngine.state, null, 2));
        return;
      }

      const inputObj = new ChangeDirectionInput(gameEngine, {
        playerId,
        oldDirection,
        newDirection
      });

      gameEngine.inputQueue.push(inputObj);
    }
  }
}
