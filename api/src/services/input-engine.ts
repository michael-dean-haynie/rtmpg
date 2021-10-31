import { Logger } from '../utilities/logger';
import { GameEngineService } from './game-engine.service';
import { ChangeDirectionInput } from './game-inputs/change-direction-input';
import { LobbyService } from './lobby.service';

export class InputEngine {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly gameEngineService: GameEngineService
  ) {}

  processInput(playerId: string, input: any) {
    // find lobby
    const lobbies = Array.from(this.lobbyService.lobbies.values());
    const lobby = lobbies.find((lob) => lob.connections.includes(playerId));
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
    if (input.type === 'CHANGE_DIRECTION') {
      const oldDirection = gameEngine.state.players.find(
        (plyr: any) => plyr.id === playerId
      ).direction;

      const inputObj = new ChangeDirectionInput(gameEngine, {
        playerId,
        oldDirection,
        newDirection: input.newDirection
      });

      gameEngine.inputQueue.push(inputObj);
    }
  }
}
