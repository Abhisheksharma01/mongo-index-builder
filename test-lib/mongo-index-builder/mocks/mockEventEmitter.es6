import {stub} from "sinon";

export default class MockedEventEmitter {
  constructor() {
    this.emit = stub();
    this.on = stub();
  }

  reset() {
    this.emit.reset();
    this.on.reset();
  }
}
