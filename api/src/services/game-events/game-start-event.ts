export class GameStartEvent {
  constructor(public data: any) {
    this.data.eventType = 'GAME_START';
  }

  apply() {
    // no state change
  }

  rollback() {
    // no state change
  }
}
