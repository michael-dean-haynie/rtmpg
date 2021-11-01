import { GameEvent } from './game-event';

export class MovePlayerEvent implements GameEvent {
  constructor(public data: any, private gameState: any) {
    this.data.eventType = 'MOVE_PLAYER';
  }

  apply() {
    const player = this.gameState.players.find(
      (plyr: any) => plyr.id === this.data.playerId
    );
    player.position = this.data.newPosition;
  }

  rollback() {
    const player = this.gameState.players.find((plyr: any) => {
      plyr.id === this.data.playerId;
    });
    player.position = this.data.oldPosition;
  }
}
