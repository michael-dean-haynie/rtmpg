import { GameEngine } from '../game-engine';
import { ChangeDirectionEvent } from '../game-events/change-direction-event';
import { GameInput } from './game-input';

export class ChangeDirectionInput extends GameInput {
  constructor(gameEngine: GameEngine, private data: any) {
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
