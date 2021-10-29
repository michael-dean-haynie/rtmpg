import * as _ from 'lodash';

export class AddPlayerEvent {
  constructor(public data: any, private gameState: any) {
    this.data.eventType = 'ADD_PLAYER';
  }

  apply() {
    (this.gameState.players as any[]).push(this.data.player);
  }

  rollback() {
    _.remove(
      this.gameState.players,
      (player: any) => player.id === this.data.player.id
    );
  }

  static generatePlayer(id: string): any {
    return {
      id
    };
  }
}
