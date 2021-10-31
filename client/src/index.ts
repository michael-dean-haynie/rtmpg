import {
  ApiMessage,
  LobbiesUpdateMessage
} from 'shared/lib/contracts/api/api-message';
import { LobbiesComponent } from './components/lobbies.component';
import { ClientMessageService } from './services/client-message.service';

// Wire Up Web Socket
const webSocket = new WebSocket('ws://localhost:8000/ws');
webSocket.onopen = () => {
  // Create New Lobby Button
  const newLobbyButton = document.createElement('button');
  newLobbyButton.id = 'createNewLobbyBtn';
  newLobbyButton.innerText = 'Create New Lobby';
  document.body.appendChild(newLobbyButton);

  // Create Exit Lobbies Button
  const exitLobbiesButton = document.createElement('button');
  exitLobbiesButton.id = 'exitLobbiesBtn';
  exitLobbiesButton.innerText = 'Exit Lobbies';
  document.body.appendChild(exitLobbiesButton);

  // Set Up Services
  const clientMessageService = new ClientMessageService(webSocket);

  // Set Up Components
  const lobbiesComponent = new LobbiesComponent(document, clientMessageService);

  // Outgoing Messages
  newLobbyButton.onclick = () => {
    clientMessageService.send({ messageType: 'CREATE_NEW_LOBBY' });
  };

  exitLobbiesButton.onclick = () => {
    clientMessageService.send({ messageType: 'EXIT_LOBBIES' });
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
  };
};
