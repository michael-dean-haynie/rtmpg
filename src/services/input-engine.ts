import { Logger } from '../utilities/logger';
import { GameEngineService } from './game-engine.service';
import { LobbyService } from './lobby.service';

export class InputEngine {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly gameEngineService: GameEngineService
  ) {}

  processInput(input: any) {
    const { lobbyId, gameId, playerId } = input;
    const gameEngine = this.gameEngineService.gameEngines.get(gameId);
    if (!gameEngine) {
      Logger.error(
        `Could not get game engine ${gameId} because it does not exist.`
      );
      return;
    }

    // TODO: need to create GameInput and pass that
    gameEngine.inputQueue.push(input);
  }
}

export type MoveDirection = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' | 'NONE';
