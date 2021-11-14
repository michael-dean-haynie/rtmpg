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

  // Outgoing Messages
  const newLobbyButton = document.getElementById('newLobbyBtn');
  newLobbyButton.onclick = () => {
    clientMessageService.send({ messageType: 'CREATE_NEW_LOBBY' });
  };

  const exitLobbiesButton = document.getElementById('exitLobbiesBtn');
  exitLobbiesButton.onclick = () => {
    clientMessageService.send({ messageType: 'EXIT_LOBBIES' });
    canvasComponent.handleCurrentPlayerExit();
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
