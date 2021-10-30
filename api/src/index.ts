import express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import * as WebSocket from 'ws';
import config from './config';
import { ConnectionService } from './services/connection.service';
import { GameEngineService } from './services/game-engine.service';
import { InputEngine } from './services/input-engine';
import { Lobby, LobbyService } from './services/lobby.service';
import { Logger } from './utilities/logger';

// Initialize Services
const connectionService = new ConnectionService();
const lobbyService = new LobbyService();
const gameEngineService = new GameEngineService(
  lobbyService,
  connectionService
);
const inputEngine = new InputEngine(lobbyService, gameEngineService);

const app = express();

//initialize a simple http server
const server = http.createServer(app);

// expose public folder (serves html client/scripts)
app.use(express.static('public'));

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  const playerId = connectionService.register(ws);

  lobbyService.subscribe((lobbies: Lobby[]) => {
    ws.send(JSON.stringify({ lobbies }));
  });

  ws.on('close', () => {
    connectionService.unregister(playerId);
    lobbyService.removePlayerFromAllLobbies(playerId);
  });

  ws.on('message', (message: string) => {
    const request = JSON.parse(message);

    // create new lobby
    if (request.input === 'CREATE_NEW_LOBBY') {
      if (lobbyService.playerIsInALobby(playerId)) {
        Logger.error(
          `Player ${playerId} could not create new lobby because player is already in another lobby.`
        );
        return;
      }
      const lobby = lobbyService.create();
      gameEngineService.create(lobby.id);
      lobbyService.addPlayerToLobby(playerId, lobby.id);
    }

    // join lobby
    if (request.input === 'JOIN_LOBBY') {
      if (!request.lobbyId) {
        Logger.error(`'lobbyId' required to join a lobby.`);
        return;
      }
      lobbyService.addPlayerToLobby(playerId, request.lobbyId);
    }

    // exit lobbies
    if (request.input === 'EXIT_LOBBIES') {
      lobbyService.removePlayerFromAllLobbies(playerId);
    }

    //////////////////////////////////////////////////////////////////
    // player input
    if (request.input === 'PLAYER_INPUT') {
      inputEngine.processInput(request.playerInput);
    }
  });

  //send immediatly a feedback to the incoming connection
  ws.send('Connection established with web socket server.');
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
