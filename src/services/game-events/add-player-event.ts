import * as _ from 'lodash';
import { Logger } from '../../utilities/logger';

export class AddPlayerEvent {
  constructor(public data: any, private gameState: any) {
    this.data.eventType = 'ADD_PLAYER';
  }

  apply() {
    Logger.trace(
      `Applying AddPlayerEvent. Game state before: ${JSON.stringify(
        this.gameState
      )}`
    );
    (this.gameState.players as any[]).push(this.data.player);
    Logger.trace(
      `Applied AddPlayerEvent. Game state after: ${JSON.stringify(
        this.gameState
      )}`
    );
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
