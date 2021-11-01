// message comming fromt the client
export interface ClientMessage {
  messageType: ClientMessageType;
  [key: string]: any;
}

export interface JoinLobbyMessage extends ClientMessage {
  messageType: 'JOIN_LOBBY';
  lobbyId: string;
}

export interface PlayerInputMessage extends ClientMessage {
  messageType: 'PLAYER_INPUT';
  playerInput: PlayerInput;
}
export interface PlayerInput {
  inputType: PlayerInputType;
  value: any;
}

// types (used as enums)
export type ClientMessageType =
  | 'CREATE_NEW_LOBBY'
  | 'JOIN_LOBBY'
  | 'EXIT_LOBBIES'
  | 'PLAYER_INPUT';

export type PlayerInputType = 'CHANGE_DIRECTION';
