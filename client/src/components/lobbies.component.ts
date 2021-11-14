import { Lobby } from 'shared/lib/contracts/api/lobby';
import { JoinLobbyMessage } from 'shared/lib/contracts/client/client-message';
import { ClientMessageService } from 'src/services/client-message.service';

export class LobbiesComponent {
  private _lobbiesContainerId = 'lobbies';
  private _lobbies: Lobby[] = [];
  private _joinButtonsAreDisabled = false;

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

  setJoinLobbyButtonsDisabled(disabled: boolean) {
    this._joinButtonsAreDisabled = disabled;
    const buttons = document.getElementsByClassName('join-lobby');
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons.item(i) as HTMLButtonElement;
      button.disabled = disabled;
    }
  }

  private updateDom() {
    const lobbyCtnr = this._document.getElementById(this._lobbiesContainerId);
    lobbyCtnr.innerHTML = '';
    this.lobbies.forEach((lobby) => {
      const lobbyListItem = this._document.createElement('li');

      // show id
      const lobbyIdSpan = this._document.createElement('span');
      lobbyIdSpan.innerText = lobby.name || lobby.id;
      lobbyIdSpan.style.fontWeight = 'bold';
      lobbyListItem.appendChild(lobbyIdSpan);

      // show button to join lobby
      const joinLobbyButton = this._document.createElement(
        'button'
      ) as HTMLButtonElement;
      joinLobbyButton.innerText = 'Join Lobby';
      joinLobbyButton.classList.add('join-lobby');
      joinLobbyButton.onclick = () => {
        const message: JoinLobbyMessage = {
          messageType: 'JOIN_LOBBY',
          lobbyId: lobby.id
        };
        this._clientMessageService.send(message);

        const exitLobbiesButton = document.getElementById(
          'exitLobbiesBtn'
        ) as HTMLButtonElement;
        exitLobbiesButton.disabled = false;
        const newLobbyButton = document.getElementById(
          'newLobbyBtn'
        ) as HTMLButtonElement;
        newLobbyButton.disabled = true;
        this.setJoinLobbyButtonsDisabled(true);
      };
      lobbyListItem.appendChild(joinLobbyButton);

      // list connections (player names)
      if (lobby.connections?.length) {
        const lobbyConnectionsList = this._document.createElement('ul');
        lobby.connections.forEach((connection) => {
          const connectionListItem = this._document.createElement('li');
          connectionListItem.innerHTML = connection.playerName;
          lobbyConnectionsList.appendChild(connectionListItem);
        });
        lobbyListItem.appendChild(lobbyConnectionsList);
      }

      lobbyCtnr.appendChild(lobbyListItem);
    });

    this.setJoinLobbyButtonsDisabled(this._joinButtonsAreDisabled);
  }
}
