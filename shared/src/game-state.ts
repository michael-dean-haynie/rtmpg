export interface GameState {
  players: GSPlayer[];
}

export interface GSPlayer {
  id: string;
  position: GSPosition;
  direction: GSDirection;
  color: string;
  name: string;
}

export interface GSPosition {
  x: number;
  y: number;
}

export type GSDirection = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' | 'NONE';
