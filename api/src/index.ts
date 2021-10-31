import connectLivereload from 'connect-livereload';
import express from 'express';
import * as http from 'http';
import livereload from 'livereload';
import { AddressInfo } from 'net';
import * as path from 'path';
import {
  ClientMessage,
  JoinLobbyMessage
} from 'shared/lib/contracts/client/client-message';
import * as WebSocket from 'ws';
import config from './config';
import { ApiMessageService } from './services/api-message.service';
import { ConnectionService } from './services/connection.service';
import { GameEngineService } from './services/game-engine.service';
import { InputEngine } from './services/input-engine';
import { Lobby, LobbyService } from './services/lobby.service';
import { Logger } from './utilities/logger';

// Initialize Servicesz
const connectionService = new ConnectionService();
const lobbyService = new LobbyService();
const gameEngineService = new GameEngineService(
  lobbyService,
  connectionService
);
const inputEngine = new InputEngine(lobbyService, gameEngineService);
const apiMessageService = new ApiMessageService();

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
  const playerId = connectionService.register(ws);

  lobbyService.subscribe((lobbies: Lobby[]) => {
    apiMessageService.send(ws, { messageType: 'LOBBIES_UPDATE', lobbies });
  });

  ws.on('close', () => {
    connectionService.unregister(playerId);
    lobbyService.removeConnectionFromAllLobbies(playerId);
  });

  ws.on('message', (message: string) => {
    const request = JSON.parse(message) as ClientMessage;

    // create new lobby
    if (request.messageType === 'CREATE_NEW_LOBBY') {
      if (lobbyService.connectionIsInALobby(playerId)) {
        Logger.error(
          `Player ${playerId} could not create new lobby because player is already in another lobby.`
        );
        return;
      }
      const lobby = lobbyService.create();
      gameEngineService.create(lobby.id);
      lobbyService.addConnectionToLobby(playerId, lobby.id);
    }

    // join lobby
    if (request.messageType === 'JOIN_LOBBY') {
      const message = request as JoinLobbyMessage;
      if (!message.lobbyId) {
        Logger.error(`'lobbyId' required to join a lobby.`);
        return;
      }
      lobbyService.addConnectionToLobby(playerId, message.lobbyId);
    }

    // exit lobbies
    if (request.messageType === 'EXIT_LOBBIES') {
      lobbyService.removeConnectionFromAllLobbies(playerId);
    }

    //////////////////////////////////////////////////////////////////
    // player input
    if (request.messageType === 'PLAYER_INPUT') {
      inputEngine.processInput(playerId, request.playerInput);
    }
  });

  //send immediatly a feedback to the incoming connection
  apiMessageService.send(ws, {
    messageType: 'CONNECTION_ESTABLISHED',
    connectionId: playerId
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
