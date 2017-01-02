import {stub} from "sinon";

export default class MongodbClient {
  constructor() {
    this.createIndex = stub();
    this.dropIndex = stub();
    this.connect = stub();
    this.getIndexes = stub();
  }

  reset() {
    this.createIndex.reset();
    this.dropIndex.reset();
    this.connect.reset();
    this.getIndexes.reset();
  }
}
