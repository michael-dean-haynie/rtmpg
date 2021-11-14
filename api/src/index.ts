import connectLivereload from 'connect-livereload';
import express from 'express';
import * as http from 'http';
import livereload from 'livereload';
import { AddressInfo } from 'net';
import * as path from 'path';
import {
  ClientMessage,
  JoinLobbyMessage,
  PlayerInputMessage,
  PlayerNameMessage
} from 'shared/lib/contracts/client/client-message';
import { Lobby } from 'shared/src/contracts/api/lobby';
import * as WebSocket from 'ws';
import config from './config';
import { ApiMessageService } from './services/api-message.service';
import { ConnectionService } from './services/connection.service';
import { GameEngineService } from './services/game-engine.service';
import { InputEngine } from './services/input-engine';
import { LobbyService } from './services/lobby.service';
import { Logger } from './utilities/logger';

// Initialize Services
const connectionService = new ConnectionService();
const lobbyService = new LobbyService(connectionService);
const apiMessageService = new ApiMessageService();
const gameEngineService = new GameEngineService(
  lobbyService,
  connectionService,
  apiMessageService
);
const inputEngine = new InputEngine(lobbyService, gameEngineService);

const app = express();

//initialize a simple http server
const server = http.createServer(app);

// Live Reload TODO: configure this per environment?
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.resolve('client/dist'));
app.use(connectLivereload());
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

// expose public folder (serves html client/scripts)
app.use(express.static('client/dist'));

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  const { id: connectionId } = connectionService.register(ws);

  lobbyService.subscribe((lobbies: Lobby[]) => {
    apiMessageService.send(ws, { messageType: 'LOBBIES_UPDATE', lobbies });
  });
  lobbyService.manualPublish();

  ws.on('close', () => {
    connectionService.unregister(connectionId);
    lobbyService.removeConnectionFromAllLobbies(connectionId);
  });

  ws.on('message', (jsonMessage: string) => {
    const message = JSON.parse(jsonMessage) as ClientMessage;

    // player name
    if (message.messageType === 'PLAYER_NAME') {
      const msg = message as PlayerNameMessage;
      connectionService.assignName(msg.playerName, connectionId);
      lobbyService.manualPublish();
    }

    // create new lobby
    if (message.messageType === 'CREATE_NEW_LOBBY') {
      if (lobbyService.connectionIsInALobby(connectionId)) {
        Logger.error(
          `Player ${connectionId} could not create new lobby because player is already in another lobby.`
        );
        return;
      }

      const playerName =
        connectionService.getConnectionById(connectionId)?.playerName;
      const lobby = lobbyService.create(`${playerName}'s Lobby`);
      gameEngineService.create(lobby.id);
      lobbyService.addConnectionToLobby(connectionId, lobby.id);
    }

    // join lobby
    if (message.messageType === 'JOIN_LOBBY') {
      const msg = message as JoinLobbyMessage;
      if (!msg.lobbyId) {
        Logger.error(`'lobbyId' required to join a lobby.`);
        return;
      }
      lobbyService.addConnectionToLobby(connectionId, msg.lobbyId);
    }

    // exit lobbies
    if (message.messageType === 'EXIT_LOBBIES') {
      lobbyService.removeConnectionFromAllLobbies(connectionId);
    }

    //////////////////////////////////////////////////////////////////
    // player input
    if (message.messageType === 'PLAYER_INPUT') {
      const msg = message as PlayerInputMessage;
      if (!msg.playerInput) {
        Logger.error(`'playerInput' required to submit player input.`);
        return;
      }
      inputEngine.processInput(connectionId, msg.playerInput);
    }
  });

  //send immediatly a feedback to the incoming connection
  apiMessageService.send(ws, {
    messageType: 'CONNECTION_ESTABLISHED',
    connectionId: connectionId
  });
});

//start our server
server.listen(config.app.port, () => {
  // figure out how to display port
  let displayedPort = '<port could not be determined>';
  const serverAddress = server.address();
  if (isAddressInfo(serverAddress)) {
    displayedPort = serverAddress.port.toString();
  } else if (typeof serverAddress === 'string' && serverAddress.length) {
    displayedPort = serverAddress;
  }

  Logger.info(`Server started on port ${displayedPort} :)`);
});

// TODO: put in a better place
function isAddressInfo(tbd: unknown): tbd is AddressInfo {
  return typeof tbd === 'object' && tbd !== null && 'port' in tbd;
}
