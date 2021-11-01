import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utilities/logger';
import { ApiMessageService } from './api-message.service';
import { ConnectionService } from './connection.service';
import { GameEngine } from './game-engine';
import { LobbyService } from './lobby.service';

export class GameEngineService {
  gameEngines: Map<string, GameEngine> = new Map();

  constructor(
    private readonly lobbyService: LobbyService,
    private readonly connectionService: ConnectionService,
    private readonly apiMessageService: ApiMessageService
  ) {}

  create(lobbyId: string): string {
    const uuid = uuidv4();
    const gameEngine = new GameEngine(
      uuid,
      lobbyId,
      this.lobbyService,
      this.connectionService,
      this.apiMessageService
    );
    this.gameEngines.set(uuid, gameEngine);
    Logger.info(`Created game ${uuid}.`);
    return uuid;
  }
}
