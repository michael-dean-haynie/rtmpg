import { Lobby } from 'shared/lib/contracts/api/lobby';
import { JoinLobbyMessage } from 'shared/lib/contracts/client/client-message';
import { ClientMessageService } from 'src/services/client-message.service';

export class LobbiesComponent {
  private _lobbiesContainerId = 'lobbies';
  private _lobbies: Lobby[] = [];
  get lobbies() {
    return this._lobbies;
  }
  set lobbies(newLobbies: Lobby[]) {
    this._lobbies = newLobbies;
    this.updateDom();
  }

  constructor(
    private _document: Document,
    private _clientMessageService: ClientMessageService
  ) {
    this.updateDom();
  }

  private updateDom() {
    const lobbyCtnr = this._document.getElementById(this._lobbiesContainerId);
    lobbyCtnr.innerHTML = '';
    this.lobbies.forEach((lobby) => {
      const lobbyListItem = this._document.createElement('li');

      // show id
      const lobbyIdSpan = this._document.createElement('span');
      lobbyIdSpan.innerText = lobby.id;
      lobbyListItem.appendChild(lobbyIdSpan);

      // show button to join lobby
      const joinLobbyButton = this._document.createElement('button');
      joinLobbyButton.innerText = 'Join Lobby';
      joinLobbyButton.onclick = () => {
        const message: JoinLobbyMessage = {
          messageType: 'JOIN_LOBBY',
          lobbyId: lobby.id
        };
        this._clientMessageService.send(message);
      };
      lobbyListItem.appendChild(joinLobbyButton);

      // list connections
      if (lobby.connections?.length) {
        const lobbyConnectionsList = this._document.createElement('ul');
        lobby.connections.forEach((connection) => {
          const connectionListItem = this._document.createElement('li');
          connectionListItem.innerHTML = connection;
          lobbyConnectionsList.appendChild(connectionListItem);
        });
        lobbyListItem.appendChild(lobbyConnectionsList);
      }

      lobbyCtnr.appendChild(lobbyListItem);
    });
  }
}
