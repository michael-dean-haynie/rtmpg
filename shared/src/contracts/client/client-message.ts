// message comming fromt the client
export interface ClientMessage {
  messageType: ClientMessageType;
  [key: string]: any;
}

export interface JoinLobbyMessage extends ClientMessage {
  messageType: 'JOIN_LOBBY';
  lobbyId: string;
}

export type ClientMessageType =
  | 'CREATE_NEW_LOBBY'
  | 'JOIN_LOBBY'
  | 'EXIT_LOBBIES'
  | 'PLAYER_INPUT';
