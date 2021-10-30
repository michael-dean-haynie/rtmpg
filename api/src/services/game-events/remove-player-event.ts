import * as _ from 'lodash';

export class RemovePlayerEvent {
  constructor(public data: any, private gameState: any) {
    this.data.eventType = 'REMOVE_PLAYER';
  }

  apply() {
    _.remove(
      this.gameState.players,
      (player: any) => player.id === this.data.player.id
    );
  }

  rollback() {
    (this.gameState.players as any[]).push(this.data.player);
  }
}
