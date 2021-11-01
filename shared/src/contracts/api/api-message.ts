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

export interface EventsRecapMessage extends ApiMessage {
  messageType: 'EVENTS_RECAP';
  events: any[];
}

export interface GameEventMessage extends ApiMessage {
  messageType: 'GAME_EVENT';
  event: any;
}

export type ApiMessageType =
  | 'CONNECTION_ESTABLISHED'
  | 'LOBBIES_UPDATE'
  | 'EVENTS_RECAP'
  | 'GAME_EVENT';
