import { Connection } from './connection';

export interface Lobby {
  connections: Connection[];
  id: string;
  name?: string;
}
