import { GameEngine } from '../game-engine';

export abstract class GameInput {
  protected events: any[] = [];

  constructor(protected readonly gameEngine: GameEngine) {}

  process(): void {
    this.processBody();
    this.postProcess();
  }

  protected processBody(): void {
    // do nothing unless overwritten by subclass
  }

  private postProcess() {
    this.events.forEach((event) => {
      this.gameEngine.publishEventToLobby(event);
      this.gameEngine.events.push(event);
    });
  }
}
