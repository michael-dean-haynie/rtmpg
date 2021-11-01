import { GSDirection } from 'shared/lib/game-state';
import { ChangeDirectionEvent } from '../../../../shared/lib/game-events/change-direction-event';
import { GameEngine } from '../game-engine';
import { GameInput } from './game-input';

export class ChangeDirectionInput extends GameInput {
  constructor(gameEngine: GameEngine, private data: ChangeDirectionInputData) {
    super(gameEngine);
  }

  processBody(): void {
    const event = new ChangeDirectionEvent(
      {
        playerId: this.data.playerId,
        oldDirection: this.data.oldDirection,
        newDirection: this.data.newDirection
      },
      this.gameEngine.state
    );

    event.apply();
    this.events.push(event);
  }
}

export interface ChangeDirectionInputData {
  playerId: string;
  oldDirection: GSDirection;
  newDirection: GSDirection;
}
