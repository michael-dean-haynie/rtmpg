import * as _ from 'lodash';
import { GameState, GSPlayer } from '../game-state';
import { GameEvent } from './game-event';

export class AddPlayerEvent implements GameEvent {
  constructor(public data: any, private gameState: GameState) {
    this.data.eventType = 'ADD_PLAYER';
  }

  apply() {
    this.gameState.players.push(this.data.player);
  }

  rollback() {
    _.remove(
      this.gameState.players,
      (player: any) => player.id === this.data.player.id
    );
  }

  static generatePlayer(id: string, name: string): GSPlayer {
    return {
      id,
      name,
      position: {
        x: this.getRandomIntInclusive(5, 95),
        y: this.getRandomIntInclusive(5, 95)
      },
      direction: 'NONE',
      color: this.getRandomColor()
    };
  }

  static getRandomColor(): string {
    const red = this.getRandomIntInclusive(0, 255);
    const green = this.getRandomIntInclusive(0, 255);
    const blue = this.getRandomIntInclusive(0, 255);
    return `rgba(${red}, ${green}, ${blue}, 0.5)`;
  }

  static getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }
}
