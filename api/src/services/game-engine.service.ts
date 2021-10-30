import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utilities/logger';
import { ConnectionService } from './connection.service';
import { GameEngine } from './game-engine';
import { LobbyService } from './lobby.service';

export class GameEngineService {
  gameEngines: Map<string, GameEngine> = new Map();

  constructor(
    private readonly lobbyService: LobbyService,
    private readonly connectionService: ConnectionService
  ) {}

  create(lobbyId: string): string {
    const uuid = uuidv4();
    const gameEngine = new GameEngine(
      uuid,
      lobbyId,
      this.lobbyService,
      this.connectionService
    );
    this.gameEngines.set(uuid, gameEngine);
    Logger.info(`Created game ${uuid}.`);
    return uuid;
  }
}
