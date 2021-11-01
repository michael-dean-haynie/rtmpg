import { GameEvent } from './game-event';

export class GameStartEvent implements GameEvent {
  constructor(public data: any) {
    this.data.eventType = 'GAME_START';
  }

  apply() {
    // no state change
  }

  rollback() {
    // no state change
  }
}
