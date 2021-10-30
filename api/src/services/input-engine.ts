import { Logger } from '../utilities/logger';
import { GameEngineService } from './game-engine.service';
import { ChangeDirectionInput } from './game-inputs/change-direction-input';
import { LobbyService } from './lobby.service';

export class InputEngine {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly gameEngineService: GameEngineService
  ) {}

  processInput(input: any) {
    const { gameEngineId, playerId } = input;
    const gameEngine = this.gameEngineService.gameEngines.get(gameEngineId);
    if (!gameEngine) {
      Logger.error(
        `Could not get game engine ${gameEngineId} because it does not exist.`
      );
      Logger.error(
        `GameEngines:  ${JSON.stringify(
          Array.from(this.gameEngineService.gameEngines.keys())
        )}`
      );
      return;
    }

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

    // TODO: need to create GameInput and pass that
    // gameEngine.inputQueue.push(input);
  }
}

export type MoveDirection = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' | 'NONE';
