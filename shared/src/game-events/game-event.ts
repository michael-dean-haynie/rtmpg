export interface GameEvent {
  apply: () => void;
  rollback: () => void;
}
