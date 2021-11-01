import { GameEvent } from './game-event';

export class ChangeDirectionEvent implements GameEvent {
  constructor(public data: any, private gameState: any) {
    this.data.eventType = 'CHANGE_DIRECTION';
  }

  apply() {
    this.gameState.players.find(
      (plyr: any) => plyr.id === this.data.playerId
    ).direction = this.data.newDirection;
  }

  rollback() {
    this.gameState.players.find(
      (plyr: any) => plyr.id === this.data.playerId
    ).direction = this.data.oldDirection;
  }
}
