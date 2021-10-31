import { Lobby } from 'shared/src/contracts/api/lobby';

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

  constructor(private _document: Document) {
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
