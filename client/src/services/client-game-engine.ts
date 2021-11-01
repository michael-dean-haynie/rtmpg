import { AddPlayerEvent } from 'shared/lib/game-events/add-player-event';
import { ChangeDirectionEvent } from 'shared/lib/game-events/change-direction-event';
import { GameEvent } from 'shared/lib/game-events/game-event';
import { GameStartEvent } from 'shared/lib/game-events/game-start-event';
import { MovePlayerEvent } from 'shared/lib/game-events/move-player-event';
import { RemovePlayerEvent } from 'shared/lib/game-events/remove-player-event';
import { GameState } from 'shared/lib/game-state';
import { CanvasComponent } from 'src/components/canvas.component';

export class ClientGameEngine {
  state: GameState = {
    players: []
  };

  constructor(private canvasComponent: CanvasComponent, recapEvents: any[]) {
    recapEvents.forEach((event) => {
      const gameEvent = this.eventFactory(event.data);
      gameEvent.apply();
    });
    canvasComponent.paintState(this.state);
  }

  processEvent(event: any): void {
    const gameEvent = this.eventFactory(event);
    gameEvent.apply();
    this.canvasComponent.paintState(this.state);
  }

  private eventFactory(event: any): GameEvent {
    switch (event.eventType) {
      case 'GAME_START':
        return new GameStartEvent(event);
      case 'ADD_PLAYER':
        return new AddPlayerEvent(event, this.state);
      case 'REMOVE_PLAYER':
        return new RemovePlayerEvent(event, this.state);
      case 'CHANGE_DIRECTION':
        return new ChangeDirectionEvent(event, this.state);
      case 'MOVE_PLAYER':
        return new MovePlayerEvent(event, this.state);
    }
  }
}
