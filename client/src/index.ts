import * as faker from 'faker';
import {
  ApiMessage,
  EventsRecapMessage,
  GameEventMessage,
  LobbiesUpdateMessage
} from 'shared/lib/contracts/api/api-message';
import { CanvasComponent } from './components/canvas.component';
import { LobbiesComponent } from './components/lobbies.component';
import { ClientGameEngine } from './services/client-game-engine';
import { ClientMessageService } from './services/client-message.service';
import { PlayerController } from './services/player-controller';

// Prompt player for name
function promptPlayerForName(): string {
  let name = null;
  const defaultName = `${faker.name.firstName()} ${faker.name.lastName()}`;
  name = window.prompt('Please enter your player name:', defaultName);
  if (typeof name === 'string' && name.trim().length) {
    return name;
  } else {
    return promptPlayerForName();
  }
}
const playerName = promptPlayerForName();

// Wire Up Web Socket
const webSocket = new WebSocket('ws://localhost:8000/ws');
webSocket.onopen = () => {
  // Set Up Services
  const clientMessageService = new ClientMessageService(webSocket);
  let gameEngine: ClientGameEngine;
  const playerController = new PlayerController(document, clientMessageService);

  // Set Up Components
  const lobbiesComponent = new LobbiesComponent(document, clientMessageService);
  const canvasComponent = new CanvasComponent(document);

  // Transmit player name to server
  clientMessageService.send({ messageType: 'PLAYER_NAME', playerName });

  // Outgoing Messages
  const newLobbyButton = document.getElementById(
    'newLobbyBtn'
  ) as HTMLButtonElement;
  newLobbyButton.onclick = () => {
    clientMessageService.send({ messageType: 'CREATE_NEW_LOBBY' });
    newLobbyButton.disabled = true;
    exitLobbiesButton.disabled = false;
    lobbiesComponent.setJoinLobbyButtonsDisabled(true);
  };

  const exitLobbiesButton = document.getElementById(
    'exitLobbiesBtn'
  ) as HTMLButtonElement;
  exitLobbiesButton.onclick = () => {
    clientMessageService.send({ messageType: 'EXIT_LOBBIES' });
    canvasComponent.handleCurrentPlayerExit();
    exitLobbiesButton.disabled = true;
    newLobbyButton.disabled = false;
    lobbiesComponent.setJoinLobbyButtonsDisabled(false);
  };

  // Incomming Messages
  webSocket.onmessage = (event) => {
    console.log(event.data);

    const apiMessage: ApiMessage = JSON.parse(event.data);
    if (apiMessage.messageType === 'CONNECTION_ESTABLISHED') {
      // do something, I dunno
    }

    if (apiMessage.messageType === 'LOBBIES_UPDATE') {
      const lobbiesUpdate = apiMessage as LobbiesUpdateMessage;
      lobbiesComponent.lobbies = lobbiesUpdate.lobbies;
    }

    if (apiMessage.messageType === 'EVENTS_RECAP') {
      const eventsRecap = apiMessage as EventsRecapMessage;
      gameEngine = new ClientGameEngine(canvasComponent, eventsRecap.events);
    }

    if (apiMessage.messageType === 'GAME_EVENT') {
      const gameEventMessage = apiMessage as GameEventMessage;
      gameEngine.processEvent(gameEventMessage.event);
    }
  };
};
