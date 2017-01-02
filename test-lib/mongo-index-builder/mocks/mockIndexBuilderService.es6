import {stub} from "sinon";
require("sinon-as-promised");

export default class indexBuilderService {
  constructor() {
    this.buildIndexes = stub();
  }

  reset() {
    this.buildIndexes.reset();
  }
}
