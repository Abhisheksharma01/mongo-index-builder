import {default as Sut, getIndexBuilder} from "../../dist/indexBuilder";
import MockDataServiceProvider from "./mocks/mockMongoService";
import Lab from "lab";
import MockLogger from "./mocks/logger";
import {expect, fail} from "code";
import * as Hoek from "hoek";
import MockedEventEmitter from "./mocks/mockEventEmitter";
import * as customEvents from "./../../dist/customEvents";
import undefinedFactory from "./mocks/undefinedFactory";
import Sinon from "sinon";


const lab = exports.lab = Lab.script();
const {beforeEach, describe, it} = lab;

describe("indexBuilderService", () => {

  let dataService;
  let MockEventEmitter;
  let sut;

  describe("construtor", () => {

    function sutFactory(config) {

      const config_ = config || {};
      const mockMongoConfig = config_.mongoConfig || {
        "connectionString": "mongo://userName:Password@address:port/db",
        "operationTimeout": 5000
      };
      const mockLoggerConfig = config_.loggerConfig || {
        "streams": [{
          "level": "fatal",
          "stream": process.stdout
        }],
        "name": "My-logger"
      };
      sut = new Sut({"mongoConfig": mockMongoConfig, "loggerConfig": mockLoggerConfig});
    }

    it("should be a function", done => {

      expect(Sut).to.exist().and.be.a.function();
      return done();
    });

    it("should be newable", done => {

      const act = () => sutFactory();

      expect(act).to.not.throw();

      return done();
    });

    it("should throw when called without new", done => {

      const act = () => Sut();

      expect(act).to.throw(Error, "Cannot read property \'mongoConfig\' of undefined");

      return done();
    });

    it("should assert the mongo config.", done => {

      const act = () => new Sut({"mongoConfig": undefinedFactory()});

      expect(act).to.throw(Error, /^Mongo DB configuration is not in the required format/);

      return done();
    });

    it("should take use of default logger config if custom is not provided.", done => {

      const act = () => sutFactory({"mongoConfig": {
        "connectionString": "mongo://userName:Password@address:port/db"}});

      expect(act).to.not.throw();

      return done();
    });

  });

  describe("buildIndexes", () => {

    beforeEach(done => {

      dataService = new MockDataServiceProvider();
      MockEventEmitter = new MockedEventEmitter();
      sut = new Sut({dataService, MockLogger, MockEventEmitter});

      return done();
    });


    it("should call the this.dataService_.getIndexes method for each collection in index list", () => {

      // Arrange
      const mockIndexes = [

        {
          "collectionName": "testCollection",
          "indexName": "testIndex",
          "indexKeys": [
            {
              "keyName": "newId",
              "keySortOrder": 1.0000000000000000
            }
          ]
        },
        {
          "collectionName": "testCollection1",
          "indexName": "testIndex1",
          "indexKeys": [
            {
              "keyName": "newId",
              "keySortOrder": 1.0000000000000000
            }
          ]
        }];
      const mockCollectionIndexesTestCollection = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection"
      }];

      const mockCollectionIndexesTestCollection1 = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection1"
      }];

      dataService.getIndexes.withArgs("testCollection").resolves(mockCollectionIndexesTestCollection);
      dataService.getIndexes.withArgs("testCollection1").resolves(mockCollectionIndexesTestCollection1);
      dataService.createIndex.resolves(true);
      dataService.dropIndex.resolves(true);


      // Act
      const act = sut.buildIndexes(mockIndexes);

      // Assert
      return act
        .then(() => {
          expect(dataService.getIndexes.callCount).to.equal(Hoek.unique(mockIndexes.map(index => index.collectionName)).length);
          expect(dataService.getIndexes.firstCall.calledWith(mockIndexes[0].collectionName)).to.be.true();
          expect(dataService.getIndexes.secondCall.calledWith(mockIndexes[1].collectionName)).to.be.true();
        });

    });

    it("should call the this.dataService_.dropIndex method if db collection contains extra indexes than desired", () => {

      // Arrange
      const mockIndexes = [
        {
          "collectionName": "testCollection",
          "indexName": "_id_",
          "indexKeys": [
            {
              "keyName": "_id",
              "keySortOrder": 1.0000000000000000
            }]
        },
        {
          "collectionName": "testCollection",
          "indexName": "testIndex",
          "indexKeys": [
            {
              "keyName": "newId",
              "keySortOrder": 1.0000000000000000
            }]
        }
      ];


      const mockCollectionIndexesTestCollection = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection"
      },
      {
        "v": 1,
        "key": {
          "testid": 1
        },
        "name": "testid_1",
        "ns": "testdb.testCollection"
      }
      ];

      dataService.getIndexes.withArgs("testCollection").resolves(mockCollectionIndexesTestCollection);
      dataService.createIndex.resolves(true);
      dataService.dropIndex.resolves(true);


      // Act
      const act = sut.buildIndexes(mockIndexes);

      // Assert
      return act
        .then(() => {
          expect(dataService.dropIndex.callCount).to.equal(1);
          expect(dataService.dropIndex.calledWith("testCollection", "testid_1")).to.be.true();
        });
    });

    it("should call the this.eventEmitter.emit method for all the indexes to be dropped and created", () => {

      // Arrange
      const mockIndexes = [
        {
          "collectionName": "testCollection",
          "indexName": "_id_",
          "indexKeys": [
            {
              "keyName": "_id",
              "keySortOrder": 1.0000000000000000
            }]
        },
        {
          "collectionName": "testCollection",
          "indexName": "testIndex",
          "indexKeys": [
            {
              "keyName": "newId",
              "keySortOrder": 1.0000000000000000
            }]
        }
      ];

      const mockCollectionIndexesTestCollection = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection"
      },
      {
        "v": 1,
        "key": {
          "testid": 1
        },
        "name": "testid_1",
        "ns": "testdb.testCollection"
      }
      ];

      dataService.getIndexes.withArgs("testCollection").resolves(mockCollectionIndexesTestCollection);
      dataService.createIndex.resolves(true);
      dataService.dropIndex.resolves(true);

      // Act
      const act = sut.buildIndexes(mockIndexes);


      // Assert
      return act
        .then(() => {
          expect(sut.eventEmitter.emit.callCount).to.equal(7);
          expect(sut.eventEmitter.emit.args[0]).to.include(["Index syncronisation started @ : "]);
          expect(sut.eventEmitter.emit.args[sut.eventEmitter.emit.args.length - 1]).to.include(["Index sync is completed."]);
          expect(sut.eventEmitter.emit.callCount).to.equal(7);
          expect(sut.eventEmitter.emit.args[1]).to.include(["List of collections to be built :", "testCollection"]);
          expect(sut.eventEmitter.emit.args[2]).to.include(["Starting index dropping For :", "testid_1"]);
          expect(sut.eventEmitter.emit.args[3]).to.include(["Completed index dropping For :", "testid_1"]);
          expect(sut.eventEmitter.emit.args[3]).to.include(["Completed index dropping For :", "testid_1"]);
          expect(sut.eventEmitter.emit.args[4]).to.include(["Starting index creation For :", "Keys : {\"newId\":1}, Options : {\"name\":\"testIndex\"}"]);
          expect(sut.eventEmitter.emit.args[5]).to.include(["Completed index creation For :", "Keys : {\"newId\":1}, Options : {\"name\":\"testIndex\"}"]);
          expect(sut.eventEmitter.on.callCount).to.equal(9);
          expect(sut.eventEmitter.on.args.map(item => item[0])).to.include(Object.keys(customEvents.indexEvents));
        });
    });

    it("should call the this.dataService_.createIndex method with index list which are not present in db collections", () => {


      // Arrange
      const mockIndexes = [
        {
          "collectionName": "testCollection",
          "indexName": "_id_",
          "indexKeys": [
            {
              "keyName": "_id",
              "keySortOrder": 1.0000000000000000
            }]
        },
        {
          "collectionName": "testCollection",
          "indexName": "testIndex",
          "indexKeys": [
            {
              "keyName": "newId",
              "keySortOrder": 1.0000000000000000
            }]
        }
      ];


      const mockCollectionIndexesTestCollection = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection"
      }];

      dataService.getIndexes.withArgs("testCollection").resolves(mockCollectionIndexesTestCollection);
      dataService.createIndex.resolves(true);
      dataService.dropIndex.resolves(true);


      // Act
      const act = sut.buildIndexes(mockIndexes);

      // Assert
      return act
        .then(() => {
          expect(dataService.createIndex.callCount).to.equal(1);
          expect(dataService.createIndex.calledWith("testCollection", {"newId": 1}, {"name": "testIndex"})).to.be.true();
        });
    });

    it("should not call the this.dataService_.dropIndex and this.dataService_.createIndex methods if db collections contain all the desired indexes", () => {

      // Arrange
      const mockIndexes = [
        {
          "collectionName": "testCollection",
          "indexName": "_id_",
          "indexKeys": [
            {
              "keyName": "_id",
              "keySortOrder": 1.0000000000000000
            }]
        },
        {
          "collectionName": "testCollection",
          "indexName": "testIndex",
          "indexKeys": [
            {
              "keyName": "newId",
              "keySortOrder": 1.0000000000000000
            }]
        }
      ];


      const mockCollectionIndexesTestCollection = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection"
      },
      {
        "v": 1,
        "key": {
          "newId": 1
        },
        "name": "testIndex",
        "ns": "testdb.testCollection"
      }];

      dataService.getIndexes.withArgs("testCollection").resolves(mockCollectionIndexesTestCollection);
      dataService.createIndex.resolves(true);
      dataService.dropIndex.resolves(true);


      // Act
      const act = sut.buildIndexes(mockIndexes);

      // Assert
      return act
        .then(() => {
          expect(dataService.createIndex.callCount).to.equal(0);
          expect(dataService.dropIndex.callCount).to.equal(0);
        });
    });

    it("should reject when when dataService.getIndexes throws", () => {

      // Arrange
      const mockIndexes = [
        {
          "collectionName": "testCollection",
          "indexName": "_id_",
          "indexKeys": [
            {
              "keyName": "_id",
              "keySortOrder": 1.0000000000000000
            }]
        },
        {
          "collectionName": "testCollection",
          "indexName": "testIndex",
          "indexKeys": [
            {
              "keyName": "newId",
              "keySortOrder": 1.0000000000000000
            }]
        }
      ];

      const somethingWentWrongError = new Error("Something went wrong");
      dataService.getIndexes.rejects(somethingWentWrongError);

      // Act
      const act = sut.buildIndexes(mockIndexes);


      // Assert
      return act
        .then(() => fail("should reject"))
        .catch(err => {

          expect(err.message).to.equal("Error in building indexes : Something went wrong");
          Sinon.assert.calledOnce(dataService.getIndexes);
          Sinon.assert.notCalled(dataService.dropIndex);
          Sinon.assert.notCalled(dataService.createIndex);
          expect(sut.eventEmitter.emit.callCount).to.equal(3);
          expect(sut.eventEmitter.emit.args[0]).to.include(["Index syncronisation started @ : "]);
          expect(sut.eventEmitter.emit.args[sut.eventEmitter.emit.args.length - 1]).to.include([customEvents.indexEvents.Error]);
        });
    });

    it("should reject eventEmitter throws", () => {

      // Arrange
      const mockIndexes = [
        {
          "collectionName": "testCollection",
          "indexName": "_id_",
          "indexKeys": [
            {
              "keyName": "_id",
              "keySortOrder": 1.0000000000000000
            }]
        },
        {
          "collectionName": "testCollection",
          "indexName": "testIndex",
          "indexKeys": [
            {
              "keyName": "newId",
              "keySortOrder": 1.0000000000000000
            }]
        }
      ];

      const somethingWentWrongError = new Error("Something went wrong");
      MockEventEmitter.emit.throws(somethingWentWrongError);

      // Act
      const act = sut.buildIndexes(mockIndexes);


      // Assert
      return act
        .then(() => fail("should reject"))
        .catch(err => {

          expect(err.message).to.equal("Something went wrong");
        });
    });
  });

  describe("getIndexBuilder", () => {


    it("should return a new instance of index builder service for the first time and same object fo the second time", done => {

      // Arrange

      // Act
      const indexBulder = getIndexBuilder({dataService, MockLogger});
      const indexBulderNew = getIndexBuilder({dataService, MockLogger});

      // Assert

      expect(indexBulder).to.equal(indexBulderNew);
      expect(indexBulder).to.exist().and.be.an.object();
      expect(indexBulder).to.only.include("eventEmitter");
      expect(indexBulder.buildIndexes).to.exist().and.be.a.function();

      return done();
    });

  });

});
