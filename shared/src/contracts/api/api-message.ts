import { Lobby } from './lobby';

// message comming fromt the api
export interface ApiMessage {
  messageType: ApiMessageType;
  [key: string]: any;
}

export interface LobbiesUpdateMessage extends ApiMessage {
  messageType: 'LOBBIES_UPDATE';
  lobbies: Lobby[];
}

export type ApiMessageType = 'CONNECTION_ESTABLISHED' | 'LOBBIES_UPDATE';
