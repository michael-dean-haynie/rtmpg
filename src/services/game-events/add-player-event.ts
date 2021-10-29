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
      id,
      position: {
        x: this.getRandomIntInclusive(5, 95),
        y: this.getRandomIntInclusive(5, 95)
      },
      direction: 'NONE'
    };
  }

  static getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }
}
