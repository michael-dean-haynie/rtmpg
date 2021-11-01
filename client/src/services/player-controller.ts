import { PlayerInputMessage } from 'shared/src/contracts/client/client-message';
import { GSDirection } from 'shared/src/game-state';
import { ClientMessageService } from './client-message.service';

export class PlayerController {
  private pks: GSDirection[] = []; // pressed key stack
  private keyToDirectionMap: Map<string, GSDirection> = new Map([
    ['ArrowUp', 'UP'],
    ['ArrowRight', 'RIGHT'],
    ['ArrowDown', 'DOWN'],
    ['ArrowLeft', 'LEFT']
  ]);

  constructor(
    private document: Document,
    private clientMessagService: ClientMessageService
  ) {
    this.document.onkeydown = (e) => {
      this.sendIfChanged(() => {
        const direction = this.keyToDirectionMap.get(e.key);
        if (direction) {
          if (!this.pks.includes(direction)) {
            this.pks.push(direction);
          }
        }
      });
    };

    this.document.onkeyup = (e) => {
      this.sendIfChanged(() => {
        const direction = this.keyToDirectionMap.get(e.key);
        this.pks = this.pks.filter((dir) => dir !== direction);
      });
    };
  }

  private sendIfChanged(funcThatMightChangeDir: () => void) {
    const initialDirection = this.pks[this.pks.length - 1];
    funcThatMightChangeDir();
    const newDirection = this.pks[this.pks.length - 1];
    if (initialDirection !== newDirection) {
      this.sendChangeDirectionMessage(newDirection);
    }
  }

  private sendChangeDirectionMessage(direction: GSDirection) {
    const message: PlayerInputMessage = {
      messageType: 'PLAYER_INPUT',
      playerInput: {
        inputType: 'CHANGE_DIRECTION',
        value: direction
      }
    };
    this.clientMessagService.send(message);
  }
}
