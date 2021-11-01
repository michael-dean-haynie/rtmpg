import { GameState, GSPlayer } from 'shared/src/game-state';

export class CanvasComponent {
  private get canvas(): HTMLCanvasElement {
    return this.document.getElementById(this._canvasId) as HTMLCanvasElement;
  }
  private get ctx(): CanvasRenderingContext2D {
    return this.canvas.getContext('2d');
  }
  private multiplier = 5;
  private width: number;
  private height: number;
  private pieceRad: number; // radius like measurement for the square player pieces

  private _canvasId = 'canvas';

  constructor(private document: Document) {
    this.width = 100 * this.multiplier;
    this.height = 100 * this.multiplier;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.pieceRad = 5 * this.multiplier; // to make board bigger (temp)
  }

  newGame(): void {
    this.clearCanvas();
  }

  paintState(state: GameState): void {
    this.clearCanvas();
    state.players.forEach((player) => {
      this.paintPlayer(player);
    });
  }

  private paintPlayer(player: GSPlayer): void {
    const originX = player.position.x * this.multiplier - this.pieceRad;
    const originY =
      this.height - player.position.y * this.multiplier - this.pieceRad;
    const sideLength = this.pieceRad * 2;
    this.ctx.fillStyle = player.color;
    this.ctx.fillRect(originX, originY, sideLength, sideLength);
  }

  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
