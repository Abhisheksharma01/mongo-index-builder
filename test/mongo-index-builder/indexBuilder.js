"use strict";

var _indexBuilder = require("../../dist/indexBuilder");

var _indexBuilder2 = _interopRequireDefault(_indexBuilder);

var _mockMongoService = require("./mocks/mockMongoService");

var _mockMongoService2 = _interopRequireDefault(_mockMongoService);

var _lab = require("lab");

var _lab2 = _interopRequireDefault(_lab);

var _logger = require("./mocks/logger");

var _logger2 = _interopRequireDefault(_logger);

var _code = require("code");

var _hoek = require("hoek");

var Hoek = _interopRequireWildcard(_hoek);

var _mockEventEmitter = require("./mocks/mockEventEmitter");

var _mockEventEmitter2 = _interopRequireDefault(_mockEventEmitter);

var _customEvents = require("./../../dist/customEvents");

var customEvents = _interopRequireWildcard(_customEvents);

var _undefinedFactory = require("./mocks/undefinedFactory");

var _undefinedFactory2 = _interopRequireDefault(_undefinedFactory);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lab = exports.lab = _lab2.default.script();
var beforeEach = lab.beforeEach,
    describe = lab.describe,
    it = lab.it;


describe("indexBuilderService", function () {

  var dataService = void 0;
  var MockEventEmitter = void 0;
  var sut = void 0;

  describe("Construtor", function () {

    function sutFactory(config) {

      var config_ = config || {};
      var mockMongoConfig = config_.mongoConfig || {
        "connectionString": "mongo://userName:Password@address:port/db",
        "operationTimeout": 5000
      };
      var mockLoggerConfig = config_.loggerConfig || {
        "streams": [{
          "level": "fatal",
          "stream": process.stdout
        }],
        "name": "My-logger"
      };
      sut = new _indexBuilder2.default({ "mongoConfig": mockMongoConfig, "loggerConfig": mockLoggerConfig });
    }

    it("should be a function", function (done) {

      (0, _code.expect)(_indexBuilder2.default).to.exist().and.be.a.function();
      return done();
    });

    it("should be newable", function (done) {

      var act = function act() {
        return sutFactory();
      };

      (0, _code.expect)(act).to.not.throw();

      return done();
    });

    it("should throw when called without new", function (done) {

      var act = function act() {
        return (0, _indexBuilder2.default)();
      };

      (0, _code.expect)(act).to.throw(Error, "Cannot read property \'mongoConfig\' of undefined");

      return done();
    });

    it("should assert the mongo config.", function (done) {

      var act = function act() {
        return new _indexBuilder2.default({ "mongoConfig": (0, _undefinedFactory2.default)() });
      };

      (0, _code.expect)(act).to.throw(Error, /^Mongo DB configuration is not in the required format/);

      return done();
    });

    it("should take use of default logger config if custom is not provided.", function (done) {

      var act = function act() {
        return sutFactory({ "mongoConfig": {
            "connectionString": "mongo://userName:Password@address:port/db" } });
      };

      (0, _code.expect)(act).to.not.throw();

      return done();
    });
  });

  describe("buildIndexes", function () {

    beforeEach(function (done) {

      dataService = new _mockMongoService2.default();
      MockEventEmitter = new _mockEventEmitter2.default();
      sut = new _indexBuilder2.default({ dataService: dataService, MockLogger: _logger2.default, MockEventEmitter: MockEventEmitter });

      return done();
    });

    it("should call the this.dataService_.getIndexes method for each collection in index list", function () {

      // Arrange
      var mockIndexes = [{
        "collectionName": "testCollection",
        "indexName": "testIndex",
        "indexKeys": [{
          "keyName": "newId",
          "keySortOrder": 1.0000000000000000
        }]
      }, {
        "collectionName": "testCollection1",
        "indexName": "testIndex1",
        "indexKeys": [{
          "keyName": "newId",
          "keySortOrder": 1.0000000000000000
        }]
      }];
      var mockCollectionIndexesTestCollection = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection"
      }];

      var mockCollectionIndexesTestCollection1 = [{
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
      var act = sut.buildIndexes(mockIndexes);

      // Assert
      return act.then(function () {
        (0, _code.expect)(dataService.getIndexes.callCount).to.equal(Hoek.unique(mockIndexes.map(function (index) {
          return index.collectionName;
        })).length);
        (0, _code.expect)(dataService.getIndexes.firstCall.calledWith(mockIndexes[0].collectionName)).to.be.true();
        (0, _code.expect)(dataService.getIndexes.secondCall.calledWith(mockIndexes[1].collectionName)).to.be.true();
      });
    });

    it("should call the this.dataService_.dropIndex method if db collection contains extra indexes than desired", function () {

      // Arrange
      var mockIndexes = [{
        "collectionName": "testCollection",
        "indexName": "testIndex",
        "indexKeys": [{
          "keyName": "newId",
          "keySortOrder": 1.0000000000000000
        }]
      }];

      var mockCollectionIndexesTestCollection = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection"
      }, {
        "v": 1,
        "key": {
          "testid": 1
        },
        "name": "testid_1",
        "ns": "testdb.testCollection"
      }];

      dataService.getIndexes.withArgs("testCollection").resolves(mockCollectionIndexesTestCollection);
      dataService.createIndex.resolves(true);
      dataService.dropIndex.resolves(true);

      // Act
      var act = sut.buildIndexes(mockIndexes);

      // Assert
      return act.then(function () {
        (0, _code.expect)(dataService.dropIndex.callCount).to.equal(1);
        (0, _code.expect)(dataService.dropIndex.calledWith("testCollection", "testid_1")).to.be.true();
      });
    });

    it("should call the this.eventEmitter.emit method for all the indexes to be dropped and created", function () {

      // Arrange
      var mockIndexes = [{
        "collectionName": "testCollection",
        "indexName": "testIndex",
        "indexKeys": [{
          "keyName": "newId",
          "keySortOrder": 1.0000000000000000
        }]
      }];

      var mockCollectionIndexesTestCollection = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection"
      }, {
        "v": 1,
        "key": {
          "testid": 1
        },
        "name": "testid_1",
        "ns": "testdb.testCollection"
      }];

      dataService.getIndexes.withArgs("testCollection").resolves(mockCollectionIndexesTestCollection);
      dataService.createIndex.resolves(true);
      dataService.dropIndex.resolves(true);

      // Act
      var act = sut.buildIndexes(mockIndexes);

      // Assert
      return act.then(function () {
        (0, _code.expect)(sut.eventEmitter.emit.callCount).to.equal(7);
        (0, _code.expect)(sut.eventEmitter.emit.args[0]).to.include(["indexesSyncronisationStart"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[sut.eventEmitter.emit.args.length - 1]).to.include(["indexesSyncronised"]);
        (0, _code.expect)(sut.eventEmitter.emit.callCount).to.equal(7);
        (0, _code.expect)(sut.eventEmitter.emit.args[1]).to.include(["collectionNames", "testCollection"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[2]).to.include(["indexDrop", "testid_1"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[3]).to.include(["indexDropped", "testid_1"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[4]).to.include(["indexCreate", "Keys : {\"newId\":1}, Options : {\"name\":\"testIndex\"}"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[5]).to.include(["indexCreated", "Keys : {\"newId\":1}, Options : {\"name\":\"testIndex\"}"]);
        (0, _code.expect)(sut.eventEmitter.on.callCount).to.equal(9);
        (0, _code.expect)(sut.eventEmitter.on.args.map(function (item) {
          return item[0];
        })).to.include(Object.keys(customEvents.indexEvents));
      });
    });

    it("should call the this.dataService_.createIndex method with index list which are not present in db collections", function () {

      // Arrange
      var mockIndexes = [{
        "collectionName": "testCollection",
        "indexName": "testIndex",
        "indexKeys": [{
          "keyName": "newId",
          "keySortOrder": 1.0000000000000000
        }]
      }];

      var mockCollectionIndexesTestCollection = [{
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
      var act = sut.buildIndexes(mockIndexes);

      // Assert
      return act.then(function () {
        (0, _code.expect)(dataService.createIndex.callCount).to.equal(1);
        (0, _code.expect)(dataService.createIndex.calledWith("testCollection", { "newId": 1 }, { "name": "testIndex" })).to.be.true();
      });
    });

    it("should not call the this.dataService_.dropIndex and this.dataService_.createIndex methods if db collections contain all the desired indexes", function () {

      // Arrange
      var mockIndexes = [{
        "collectionName": "testCollection",
        "indexName": "testIndex",
        "indexKeys": [{
          "keyName": "newId",
          "keySortOrder": 1.0000000000000000
        }]
      }];

      var mockCollectionIndexesTestCollection = [{
        "v": 1,
        "key": {
          "_id": 1
        },
        "name": "_id_",
        "ns": "testdb.testCollection"
      }, {
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
      var act = sut.buildIndexes(mockIndexes);

      // Assert
      return act.then(function () {
        (0, _code.expect)(dataService.createIndex.callCount).to.equal(0);
        (0, _code.expect)(dataService.dropIndex.callCount).to.equal(0);
      });
    });

    it("should reject when when dataService.getIndexes throws", function () {

      // Arrange
      var mockIndexes = [{
        "collectionName": "testCollection",
        "indexName": "testIndex",
        "indexKeys": [{
          "keyName": "newId",
          "keySortOrder": 1.0000000000000000
        }]
      }];

      var somethingWentWrongError = new Error("Something went wrong");
      dataService.getIndexes.rejects(somethingWentWrongError);

      // Act
      var act = sut.buildIndexes(mockIndexes);

      // Assert
      return act.then(function () {
        return (0, _code.fail)("should reject");
      }).catch(function (err) {

        (0, _code.expect)(err.message).to.equal("Error in building indexes : Something went wrong");
        _sinon2.default.assert.calledOnce(dataService.getIndexes);
        _sinon2.default.assert.notCalled(dataService.dropIndex);
        _sinon2.default.assert.notCalled(dataService.createIndex);
        (0, _code.expect)(sut.eventEmitter.emit.callCount).to.equal(3);
        (0, _code.expect)(sut.eventEmitter.emit.args[0]).to.include(["indexesSyncronisationStart"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[sut.eventEmitter.emit.args.length - 1]).to.include(["error"]);
      });
    });

    it("should reject eventEmitter throws", function () {

      // Arrange
      var mockIndexes = [{
        "collectionName": "testCollection",
        "indexName": "testIndex",
        "indexKeys": [{
          "keyName": "newId",
          "keySortOrder": 1.0000000000000000
        }]
      }];

      var somethingWentWrongError = new Error("Something went wrong");
      MockEventEmitter.emit.throws(somethingWentWrongError);

      // Act
      var act = sut.buildIndexes(mockIndexes);

      // Assert
      return act.then(function () {
        return (0, _code.fail)("should reject");
      }).catch(function (err) {

        (0, _code.expect)(err.message).to.equal("Something went wrong");
      });
    });
  });

  describe("getIndexBuilder", function () {

    it("should return a new instance of index builder service for the first time and same object fo the second time", function (done) {

      // Arrange

      // Act
      var indexBulder = (0, _indexBuilder.getIndexBuilder)({ dataService: dataService, MockLogger: _logger2.default });
      var indexBulderNew = (0, _indexBuilder.getIndexBuilder)({ dataService: dataService, MockLogger: _logger2.default });

      // Assert

      (0, _code.expect)(indexBulder).to.equal(indexBulderNew);
      (0, _code.expect)(indexBulder).to.exist().and.be.an.object();
      (0, _code.expect)(indexBulder).to.only.include("eventEmitter");
      (0, _code.expect)(indexBulder.buildIndexes).to.exist().and.be.a.function();

      return done();
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvaW5kZXhCdWlsZGVyLmVzNiJdLCJuYW1lcyI6WyJIb2VrIiwiY3VzdG9tRXZlbnRzIiwibGFiIiwiZXhwb3J0cyIsInNjcmlwdCIsImJlZm9yZUVhY2giLCJkZXNjcmliZSIsIml0IiwiZGF0YVNlcnZpY2UiLCJNb2NrRXZlbnRFbWl0dGVyIiwic3V0Iiwic3V0RmFjdG9yeSIsImNvbmZpZyIsImNvbmZpZ18iLCJtb2NrTW9uZ29Db25maWciLCJtb25nb0NvbmZpZyIsIm1vY2tMb2dnZXJDb25maWciLCJsb2dnZXJDb25maWciLCJwcm9jZXNzIiwic3Rkb3V0IiwidG8iLCJleGlzdCIsImFuZCIsImJlIiwiYSIsImZ1bmN0aW9uIiwiZG9uZSIsImFjdCIsIm5vdCIsInRocm93IiwiRXJyb3IiLCJNb2NrTG9nZ2VyIiwibW9ja0luZGV4ZXMiLCJtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbiIsIm1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uMSIsImdldEluZGV4ZXMiLCJ3aXRoQXJncyIsInJlc29sdmVzIiwiY3JlYXRlSW5kZXgiLCJkcm9wSW5kZXgiLCJidWlsZEluZGV4ZXMiLCJ0aGVuIiwiY2FsbENvdW50IiwiZXF1YWwiLCJ1bmlxdWUiLCJtYXAiLCJpbmRleCIsImNvbGxlY3Rpb25OYW1lIiwibGVuZ3RoIiwiZmlyc3RDYWxsIiwiY2FsbGVkV2l0aCIsInRydWUiLCJzZWNvbmRDYWxsIiwiZXZlbnRFbWl0dGVyIiwiZW1pdCIsImFyZ3MiLCJpbmNsdWRlIiwib24iLCJpdGVtIiwiT2JqZWN0Iiwia2V5cyIsImluZGV4RXZlbnRzIiwic29tZXRoaW5nV2VudFdyb25nRXJyb3IiLCJyZWplY3RzIiwiY2F0Y2giLCJlcnIiLCJtZXNzYWdlIiwiYXNzZXJ0IiwiY2FsbGVkT25jZSIsIm5vdENhbGxlZCIsInRocm93cyIsImluZGV4QnVsZGVyIiwiaW5kZXhC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QVo7O0FBR0E7QUFDQSxhQUFPTCxJQUNKYyxJQURJLENBQ0M7QUFBQSxlQUFNLGdCQUFLLGVBQUwsQ0FBTjtBQUFBLE9BREQsRUFFSnVCLEtBRkksQ0FFRSxlQUFPOztBQUVaLDBCQUFPQyxJQUFJQyxPQUFYLEVBQW9COUMsRUFBcEIsQ0FBdUJ1QixLQUF2QixDQUE2QixzQkFBN0I7QUFDRCxPQUxJLENBQVA7QUFNRCxLQTdCRDtBQThCRCxHQXBWRDs7QUFzVkFyQyxXQUFTLGlCQUFULEVBQTRCLFlBQU07O0FBR2hDQyxPQUFHLDZHQUFILEVBQWtILGdCQUFROztBQUV4SDs7QUFFQTtBQUNBLFVBQU1nRSxjQUFjLG1DQUFnQixFQUFDL0Qsd0JBQUQsRUFBY3VCLDRCQUFkLEVBQWhCLENBQXBCO0FBQ0EsVUFBTXlDLGlCQUFpQixtQ0FBZ0IsRUFBQ2hFLHdCQUFELEVBQWN1Qiw0QkFBZCxFQUFoQixDQUF2Qjs7QUFFQTs7QUFFQSx3QkFBT3dDLFdBQVAsRUFBb0JuRCxFQUFwQixDQUF1QnVCLEtBQXZCLENBQTZCNkIsY0FBN0I7QUFDQSx3QkFBT0QsV0FBUCxFQUFvQm5ELEVBQXBCLENBQXVCQyxLQUF2QixHQUErQkMsR0FBL0IsQ0FBbUNDLEVBQW5DLENBQXNDa0QsRUFBdEMsQ0FBeUNDLE1BQXpDO0FBQ0Esd0JBQU9ILFdBQVAsRUFBb0JuRCxFQUFwQixDQUF1QnVELElBQXZCLENBQTRCbkIsT0FBNUIsQ0FBb0MsY0FBcEM7QUFDQSx3QkFBT2UsWUFBWS9CLFlBQW5CLEVBQWlDcEIsRUFBakMsQ0FBb0NDLEtBQXBDLEdBQTRDQyxHQUE1QyxDQUFnREMsRUFBaEQsQ0FBbURDLENBQW5ELENBQXFEQyxRQUFyRDs7QUFFQSxhQUFPQyxNQUFQO0FBQ0QsS0FoQkQ7QUFrQkQsR0FyQkQ7QUF1QkQsQ0FuYkQiLCJmaWxlIjoiaW5kZXhCdWlsZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtkZWZhdWx0IGFzIFN1dCwgZ2V0SW5kZXhCdWlsZGVyfSBmcm9tIFwiLi4vLi4vZGlzdC9pbmRleEJ1aWxkZXJcIjtcbmltcG9ydCBNb2NrRGF0YVNlcnZpY2VQcm92aWRlciBmcm9tIFwiLi9tb2Nrcy9tb2NrTW9uZ29TZXJ2aWNlXCI7XG5pbXBvcnQgTGFiIGZyb20gXCJsYWJcIjtcbmltcG9ydCBNb2NrTG9nZ2VyIGZyb20gXCIuL21vY2tzL2xvZ2dlclwiO1xuaW1wb3J0IHtleHBlY3QsIGZhaWx9IGZyb20gXCJjb2RlXCI7XG5pbXBvcnQgKiBhcyBIb2VrIGZyb20gXCJob2VrXCI7XG5pbXBvcnQgTW9ja2VkRXZlbnRFbWl0dGVyIGZyb20gXCIuL21vY2tzL21vY2tFdmVudEVtaXR0ZXJcIjtcbmltcG9ydCAqIGFzIGN1c3RvbUV2ZW50cyBmcm9tIFwiLi8uLi8uLi9kaXN0L2N1c3RvbUV2ZW50c1wiO1xuaW1wb3J0IHVuZGVmaW5lZEZhY3RvcnkgZnJvbSBcIi4vbW9ja3MvdW5kZWZpbmVkRmFjdG9yeVwiO1xuaW1wb3J0IFNpbm9uIGZyb20gXCJzaW5vblwiO1xuXG5cbmNvbnN0IGxhYiA9IGV4cG9ydHMubGFiID0gTGFiLnNjcmlwdCgpO1xuY29uc3Qge2JlZm9yZUVhY2gsIGRlc2NyaWJlLCBpdH0gPSBsYWI7XG5cbmRlc2NyaWJlKFwiaW5kZXhCdWlsZGVyU2VydmljZVwiLCAoKSA9PiB7XG5cbiAgbGV0IGRhdGFTZXJ2aWNlO1xuICBsZXQgTW9ja0V2ZW50RW1pdHRlcjtcbiAgbGV0IHN1dDtcblxuICBkZXNjcmliZShcIkNvbnN0cnV0b3JcIiwgKCkgPT4ge1xuXG4gICAgZnVuY3Rpb24gc3V0RmFjdG9yeShjb25maWcpIHtcblxuICAgICAgY29uc3QgY29uZmlnXyA9IGNvbmZpZyB8fCB7fTtcbiAgICAgIGNvbnN0IG1vY2tNb25nb0NvbmZpZyA9IGNvbmZpZ18ubW9uZ29Db25maWcgfHwge1xuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogXCJtb25nbzovL3VzZXJOYW1lOlBhc3N3b3JkQGFkZHJlc3M6cG9ydC9kYlwiLFxuICAgICAgICBcIm9wZXJhdGlvblRpbWVvdXRcIjogNTAwMFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG1vY2tMb2dnZXJDb25maWcgPSBjb25maWdfLmxvZ2dlckNvbmZpZyB8fCB7XG4gICAgICAgIFwic3RyZWFtc1wiOiBbe1xuICAgICAgICAgIFwibGV2ZWxcIjogXCJmYXRhbFwiLFxuICAgICAgICAgIFwic3RyZWFtXCI6IHByb2Nlc3Muc3Rkb3V0XG4gICAgICAgIH1dLFxuICAgICAgICBcIm5hbWVcIjogXCJNeS1sb2dnZXJcIlxuICAgICAgfTtcbiAgICAgIHN1dCA9IG5ldyBTdXQoe1wibW9uZ29Db25maWdcIjogbW9ja01vbmdvQ29uZmlnLCBcImxvZ2dlckNvbmZpZ1wiOiBtb2NrTG9nZ2VyQ29uZmlnfSk7XG4gICAgfVxuXG4gICAgaXQoXCJzaG91bGQgYmUgYSBmdW5jdGlvblwiLCBkb25lID0+IHtcblxuICAgICAgZXhwZWN0KFN1dCkudG8uZXhpc3QoKS5hbmQuYmUuYS5mdW5jdGlvbigpO1xuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGJlIG5ld2FibGVcIiwgZG9uZSA9PiB7XG5cbiAgICAgIGNvbnN0IGFjdCA9ICgpID0+IHN1dEZhY3RvcnkoKTtcblxuICAgICAgZXhwZWN0KGFjdCkudG8ubm90LnRocm93KCk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCB0aHJvdyB3aGVuIGNhbGxlZCB3aXRob3V0IG5ld1wiLCBkb25lID0+IHtcblxuICAgICAgY29uc3QgYWN0ID0gKCkgPT4gU3V0KCk7XG5cbiAgICAgIGV4cGVjdChhY3QpLnRvLnRocm93KEVycm9yLCBcIkNhbm5vdCByZWFkIHByb3BlcnR5IFxcJ21vbmdvQ29uZmlnXFwnIG9mIHVuZGVmaW5lZFwiKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGFzc2VydCB0aGUgbW9uZ28gY29uZmlnLlwiLCBkb25lID0+IHtcblxuICAgICAgY29uc3QgYWN0ID0gKCkgPT4gbmV3IFN1dCh7XCJtb25nb0NvbmZpZ1wiOiB1bmRlZmluZWRGYWN0b3J5KCl9KTtcblxuICAgICAgZXhwZWN0KGFjdCkudG8udGhyb3coRXJyb3IsIC9eTW9uZ28gREIgY29uZmlndXJhdGlvbiBpcyBub3QgaW4gdGhlIHJlcXVpcmVkIGZvcm1hdC8pO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgdGFrZSB1c2Ugb2YgZGVmYXVsdCBsb2dnZXIgY29uZmlnIGlmIGN1c3RvbSBpcyBub3QgcHJvdmlkZWQuXCIsIGRvbmUgPT4ge1xuXG4gICAgICBjb25zdCBhY3QgPSAoKSA9PiBzdXRGYWN0b3J5KHtcIm1vbmdvQ29uZmlnXCI6IHtcbiAgICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IFwibW9uZ286Ly91c2VyTmFtZTpQYXNzd29yZEBhZGRyZXNzOnBvcnQvZGJcIn19KTtcblxuICAgICAgZXhwZWN0KGFjdCkudG8ubm90LnRocm93KCk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJidWlsZEluZGV4ZXNcIiwgKCkgPT4ge1xuXG4gICAgYmVmb3JlRWFjaChkb25lID0+IHtcblxuICAgICAgZGF0YVNlcnZpY2UgPSBuZXcgTW9ja0RhdGFTZXJ2aWNlUHJvdmlkZXIoKTtcbiAgICAgIE1vY2tFdmVudEVtaXR0ZXIgPSBuZXcgTW9ja2VkRXZlbnRFbWl0dGVyKCk7XG4gICAgICBzdXQgPSBuZXcgU3V0KHtkYXRhU2VydmljZSwgTW9ja0xvZ2dlciwgTW9ja0V2ZW50RW1pdHRlcn0pO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG5cbiAgICBpdChcInNob3VsZCBjYWxsIHRoZSB0aGlzLmRhdGFTZXJ2aWNlXy5nZXRJbmRleGVzIG1ldGhvZCBmb3IgZWFjaCBjb2xsZWN0aW9uIGluIGluZGV4IGxpc3RcIiwgKCkgPT4ge1xuXG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBtb2NrSW5kZXhlcyA9IFtcblxuICAgICAgICB7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBcInRlc3RDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogXCJ0ZXN0SW5kZXhcIixcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2V5TmFtZVwiOiBcIm5ld0lkXCIsXG4gICAgICAgICAgICAgIFwia2V5U29ydE9yZGVyXCI6IDEuMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIFwiY29sbGVjdGlvbk5hbWVcIjogXCJ0ZXN0Q29sbGVjdGlvbjFcIixcbiAgICAgICAgICBcImluZGV4TmFtZVwiOiBcInRlc3RJbmRleDFcIixcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2V5TmFtZVwiOiBcIm5ld0lkXCIsXG4gICAgICAgICAgICAgIFwia2V5U29ydE9yZGVyXCI6IDEuMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfV07XG4gICAgICBjb25zdCBtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbiA9IFt7XG4gICAgICAgIFwidlwiOiAxLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJfaWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJfaWRfXCIsXG4gICAgICAgIFwibnNcIjogXCJ0ZXN0ZGIudGVzdENvbGxlY3Rpb25cIlxuICAgICAgfV07XG5cbiAgICAgIGNvbnN0IG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uMSA9IFt7XG4gICAgICAgIFwidlwiOiAxLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJfaWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJfaWRfXCIsXG4gICAgICAgIFwibnNcIjogXCJ0ZXN0ZGIudGVzdENvbGxlY3Rpb24xXCJcbiAgICAgIH1dO1xuXG4gICAgICBkYXRhU2VydmljZS5nZXRJbmRleGVzLndpdGhBcmdzKFwidGVzdENvbGxlY3Rpb25cIikucmVzb2x2ZXMobW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24pO1xuICAgICAgZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy53aXRoQXJncyhcInRlc3RDb2xsZWN0aW9uMVwiKS5yZXNvbHZlcyhtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbjEpO1xuICAgICAgZGF0YVNlcnZpY2UuY3JlYXRlSW5kZXgucmVzb2x2ZXModHJ1ZSk7XG4gICAgICBkYXRhU2VydmljZS5kcm9wSW5kZXgucmVzb2x2ZXModHJ1ZSk7XG5cblxuICAgICAgLy8gQWN0XG4gICAgICBjb25zdCBhY3QgPSBzdXQuYnVpbGRJbmRleGVzKG1vY2tJbmRleGVzKTtcblxuICAgICAgLy8gQXNzZXJ0XG4gICAgICByZXR1cm4gYWN0XG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy5jYWxsQ291bnQpLnRvLmVxdWFsKEhvZWsudW5pcXVlKG1vY2tJbmRleGVzLm1hcChpbmRleCA9PiBpbmRleC5jb2xsZWN0aW9uTmFtZSkpLmxlbmd0aCk7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMuZmlyc3RDYWxsLmNhbGxlZFdpdGgobW9ja0luZGV4ZXNbMF0uY29sbGVjdGlvbk5hbWUpKS50by5iZS50cnVlKCk7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMuc2Vjb25kQ2FsbC5jYWxsZWRXaXRoKG1vY2tJbmRleGVzWzFdLmNvbGxlY3Rpb25OYW1lKSkudG8uYmUudHJ1ZSgpO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgY2FsbCB0aGUgdGhpcy5kYXRhU2VydmljZV8uZHJvcEluZGV4IG1ldGhvZCBpZiBkYiBjb2xsZWN0aW9uIGNvbnRhaW5zIGV4dHJhIGluZGV4ZXMgdGhhbiBkZXNpcmVkXCIsICgpID0+IHtcblxuICAgICAgLy8gQXJyYW5nZVxuICAgICAgY29uc3QgbW9ja0luZGV4ZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImNvbGxlY3Rpb25OYW1lXCI6IFwidGVzdENvbGxlY3Rpb25cIixcbiAgICAgICAgICBcImluZGV4TmFtZVwiOiBcInRlc3RJbmRleFwiLFxuICAgICAgICAgIFwiaW5kZXhLZXlzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJrZXlOYW1lXCI6IFwibmV3SWRcIixcbiAgICAgICAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogMS4wMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICBdO1xuXG5cbiAgICAgIGNvbnN0IG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uID0gW3tcbiAgICAgICAgXCJ2XCI6IDEsXG4gICAgICAgIFwia2V5XCI6IHtcbiAgICAgICAgICBcIl9pZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcIl9pZF9cIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcInZcIjogMSxcbiAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgIFwidGVzdGlkXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJuYW1lXCI6IFwidGVzdGlkXzFcIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9XG4gICAgICBdO1xuXG4gICAgICBkYXRhU2VydmljZS5nZXRJbmRleGVzLndpdGhBcmdzKFwidGVzdENvbGxlY3Rpb25cIikucmVzb2x2ZXMobW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24pO1xuICAgICAgZGF0YVNlcnZpY2UuY3JlYXRlSW5kZXgucmVzb2x2ZXModHJ1ZSk7XG4gICAgICBkYXRhU2VydmljZS5kcm9wSW5kZXgucmVzb2x2ZXModHJ1ZSk7XG5cblxuICAgICAgLy8gQWN0XG4gICAgICBjb25zdCBhY3QgPSBzdXQuYnVpbGRJbmRleGVzKG1vY2tJbmRleGVzKTtcblxuICAgICAgLy8gQXNzZXJ0XG4gICAgICByZXR1cm4gYWN0XG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZGF0YVNlcnZpY2UuZHJvcEluZGV4LmNhbGxDb3VudCkudG8uZXF1YWwoMSk7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmRyb3BJbmRleC5jYWxsZWRXaXRoKFwidGVzdENvbGxlY3Rpb25cIiwgXCJ0ZXN0aWRfMVwiKSkudG8uYmUudHJ1ZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGNhbGwgdGhlIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQgbWV0aG9kIGZvciBhbGwgdGhlIGluZGV4ZXMgdG8gYmUgZHJvcHBlZCBhbmQgY3JlYXRlZFwiLCAoKSA9PiB7XG5cbiAgICAgIC8vIEFycmFuZ2VcbiAgICAgIGNvbnN0IG1vY2tJbmRleGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBcInRlc3RDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogXCJ0ZXN0SW5kZXhcIixcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2V5TmFtZVwiOiBcIm5ld0lkXCIsXG4gICAgICAgICAgICAgIFwia2V5U29ydE9yZGVyXCI6IDEuMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgY29uc3QgbW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24gPSBbe1xuICAgICAgICBcInZcIjogMSxcbiAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgIFwiX2lkXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJuYW1lXCI6IFwiX2lkX1wiLFxuICAgICAgICBcIm5zXCI6IFwidGVzdGRiLnRlc3RDb2xsZWN0aW9uXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwidlwiOiAxLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJ0ZXN0aWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJ0ZXN0aWRfMVwiLFxuICAgICAgICBcIm5zXCI6IFwidGVzdGRiLnRlc3RDb2xsZWN0aW9uXCJcbiAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMud2l0aEFyZ3MoXCJ0ZXN0Q29sbGVjdGlvblwiKS5yZXNvbHZlcyhtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbik7XG4gICAgICBkYXRhU2VydmljZS5jcmVhdGVJbmRleC5yZXNvbHZlcyh0cnVlKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmRyb3BJbmRleC5yZXNvbHZlcyh0cnVlKTtcblxuICAgICAgLy8gQWN0XG4gICAgICBjb25zdCBhY3QgPSBzdXQuYnVpbGRJbmRleGVzKG1vY2tJbmRleGVzKTtcblxuXG4gICAgICAvLyBBc3NlcnRcbiAgICAgIHJldHVybiBhY3RcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuY2FsbENvdW50KS50by5lcXVhbCg3KTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmFyZ3NbMF0pLnRvLmluY2x1ZGUoW1wiaW5kZXhlc1N5bmNyb25pc2F0aW9uU3RhcnRcIl0pO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJnc1tzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJncy5sZW5ndGggLSAxXSkudG8uaW5jbHVkZShbXCJpbmRleGVzU3luY3JvbmlzZWRcIl0pO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuY2FsbENvdW50KS50by5lcXVhbCg3KTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmFyZ3NbMV0pLnRvLmluY2x1ZGUoW1wiY29sbGVjdGlvbk5hbWVzXCIsIFwidGVzdENvbGxlY3Rpb25cIl0pO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJnc1syXSkudG8uaW5jbHVkZShbXCJpbmRleERyb3BcIiwgXCJ0ZXN0aWRfMVwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzWzNdKS50by5pbmNsdWRlKFtcImluZGV4RHJvcHBlZFwiLCBcInRlc3RpZF8xXCJdKTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmFyZ3NbNF0pLnRvLmluY2x1ZGUoW1wiaW5kZXhDcmVhdGVcIiwgXCJLZXlzIDoge1xcXCJuZXdJZFxcXCI6MX0sIE9wdGlvbnMgOiB7XFxcIm5hbWVcXFwiOlxcXCJ0ZXN0SW5kZXhcXFwifVwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzWzVdKS50by5pbmNsdWRlKFtcImluZGV4Q3JlYXRlZFwiLCBcIktleXMgOiB7XFxcIm5ld0lkXFxcIjoxfSwgT3B0aW9ucyA6IHtcXFwibmFtZVxcXCI6XFxcInRlc3RJbmRleFxcXCJ9XCJdKTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5vbi5jYWxsQ291bnQpLnRvLmVxdWFsKDkpO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLm9uLmFyZ3MubWFwKGl0ZW0gPT4gaXRlbVswXSkpLnRvLmluY2x1ZGUoT2JqZWN0LmtleXMoY3VzdG9tRXZlbnRzLmluZGV4RXZlbnRzKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgY2FsbCB0aGUgdGhpcy5kYXRhU2VydmljZV8uY3JlYXRlSW5kZXggbWV0aG9kIHdpdGggaW5kZXggbGlzdCB3aGljaCBhcmUgbm90IHByZXNlbnQgaW4gZGIgY29sbGVjdGlvbnNcIiwgKCkgPT4ge1xuXG5cbiAgICAgIC8vIEFycmFuZ2VcbiAgICAgIGNvbnN0IG1vY2tJbmRleGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBcInRlc3RDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogXCJ0ZXN0SW5kZXhcIixcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2V5TmFtZVwiOiBcIm5ld0lkXCIsXG4gICAgICAgICAgICAgIFwia2V5U29ydE9yZGVyXCI6IDEuMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgXTtcblxuXG4gICAgICBjb25zdCBtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbiA9IFt7XG4gICAgICAgIFwidlwiOiAxLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJfaWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJfaWRfXCIsXG4gICAgICAgIFwibnNcIjogXCJ0ZXN0ZGIudGVzdENvbGxlY3Rpb25cIlxuICAgICAgfV07XG5cbiAgICAgIGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMud2l0aEFyZ3MoXCJ0ZXN0Q29sbGVjdGlvblwiKS5yZXNvbHZlcyhtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbik7XG4gICAgICBkYXRhU2VydmljZS5jcmVhdGVJbmRleC5yZXNvbHZlcyh0cnVlKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmRyb3BJbmRleC5yZXNvbHZlcyh0cnVlKTtcblxuXG4gICAgICAvLyBBY3RcbiAgICAgIGNvbnN0IGFjdCA9IHN1dC5idWlsZEluZGV4ZXMobW9ja0luZGV4ZXMpO1xuXG4gICAgICAvLyBBc3NlcnRcbiAgICAgIHJldHVybiBhY3RcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChkYXRhU2VydmljZS5jcmVhdGVJbmRleC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpO1xuICAgICAgICAgIGV4cGVjdChkYXRhU2VydmljZS5jcmVhdGVJbmRleC5jYWxsZWRXaXRoKFwidGVzdENvbGxlY3Rpb25cIiwge1wibmV3SWRcIjogMX0sIHtcIm5hbWVcIjogXCJ0ZXN0SW5kZXhcIn0pKS50by5iZS50cnVlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IGNhbGwgdGhlIHRoaXMuZGF0YVNlcnZpY2VfLmRyb3BJbmRleCBhbmQgdGhpcy5kYXRhU2VydmljZV8uY3JlYXRlSW5kZXggbWV0aG9kcyBpZiBkYiBjb2xsZWN0aW9ucyBjb250YWluIGFsbCB0aGUgZGVzaXJlZCBpbmRleGVzXCIsICgpID0+IHtcblxuICAgICAgLy8gQXJyYW5nZVxuICAgICAgY29uc3QgbW9ja0luZGV4ZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImNvbGxlY3Rpb25OYW1lXCI6IFwidGVzdENvbGxlY3Rpb25cIixcbiAgICAgICAgICBcImluZGV4TmFtZVwiOiBcInRlc3RJbmRleFwiLFxuICAgICAgICAgIFwiaW5kZXhLZXlzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJrZXlOYW1lXCI6IFwibmV3SWRcIixcbiAgICAgICAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogMS4wMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICBdO1xuXG5cbiAgICAgIGNvbnN0IG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uID0gW3tcbiAgICAgICAgXCJ2XCI6IDEsXG4gICAgICAgIFwia2V5XCI6IHtcbiAgICAgICAgICBcIl9pZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcIl9pZF9cIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcInZcIjogMSxcbiAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgIFwibmV3SWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJ0ZXN0SW5kZXhcIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9XTtcblxuICAgICAgZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy53aXRoQXJncyhcInRlc3RDb2xsZWN0aW9uXCIpLnJlc29sdmVzKG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LnJlc29sdmVzKHRydWUpO1xuICAgICAgZGF0YVNlcnZpY2UuZHJvcEluZGV4LnJlc29sdmVzKHRydWUpO1xuXG5cbiAgICAgIC8vIEFjdFxuICAgICAgY29uc3QgYWN0ID0gc3V0LmJ1aWxkSW5kZXhlcyhtb2NrSW5kZXhlcyk7XG5cbiAgICAgIC8vIEFzc2VydFxuICAgICAgcmV0dXJuIGFjdFxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LmNhbGxDb3VudCkudG8uZXF1YWwoMCk7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmRyb3BJbmRleC5jYWxsQ291bnQpLnRvLmVxdWFsKDApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJlamVjdCB3aGVuIHdoZW4gZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcyB0aHJvd3NcIiwgKCkgPT4ge1xuXG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBtb2NrSW5kZXhlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIFwiY29sbGVjdGlvbk5hbWVcIjogXCJ0ZXN0Q29sbGVjdGlvblwiLFxuICAgICAgICAgIFwiaW5kZXhOYW1lXCI6IFwidGVzdEluZGV4XCIsXG4gICAgICAgICAgXCJpbmRleEtleXNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtleU5hbWVcIjogXCJuZXdJZFwiLFxuICAgICAgICAgICAgICBcImtleVNvcnRPcmRlclwiOiAxLjAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGNvbnN0IHNvbWV0aGluZ1dlbnRXcm9uZ0Vycm9yID0gbmV3IEVycm9yKFwiU29tZXRoaW5nIHdlbnQgd3JvbmdcIik7XG4gICAgICBkYXRhU2VydmljZS5nZXRJbmRleGVzLnJlamVjdHMoc29tZXRoaW5nV2VudFdyb25nRXJyb3IpO1xuXG4gICAgICAvLyBBY3RcbiAgICAgIGNvbnN0IGFjdCA9IHN1dC5idWlsZEluZGV4ZXMobW9ja0luZGV4ZXMpO1xuXG5cbiAgICAgIC8vIEFzc2VydFxuICAgICAgcmV0dXJuIGFjdFxuICAgICAgICAudGhlbigoKSA9PiBmYWlsKFwic2hvdWxkIHJlamVjdFwiKSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XG5cbiAgICAgICAgICBleHBlY3QoZXJyLm1lc3NhZ2UpLnRvLmVxdWFsKFwiRXJyb3IgaW4gYnVpbGRpbmcgaW5kZXhlcyA6IFNvbWV0aGluZyB3ZW50IHdyb25nXCIpO1xuICAgICAgICAgIFNpbm9uLmFzc2VydC5jYWxsZWRPbmNlKGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMpO1xuICAgICAgICAgIFNpbm9uLmFzc2VydC5ub3RDYWxsZWQoZGF0YVNlcnZpY2UuZHJvcEluZGV4KTtcbiAgICAgICAgICBTaW5vbi5hc3NlcnQubm90Q2FsbGVkKGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4KTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmNhbGxDb3VudCkudG8uZXF1YWwoMyk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzWzBdKS50by5pbmNsdWRlKFtcImluZGV4ZXNTeW5jcm9uaXNhdGlvblN0YXJ0XCJdKTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmFyZ3Nbc3V0LmV2ZW50RW1pdHRlci5lbWl0LmFyZ3MubGVuZ3RoIC0gMV0pLnRvLmluY2x1ZGUoW1wiZXJyb3JcIl0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJlamVjdCBldmVudEVtaXR0ZXIgdGhyb3dzXCIsICgpID0+IHtcblxuICAgICAgLy8gQXJyYW5nZVxuICAgICAgY29uc3QgbW9ja0luZGV4ZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImNvbGxlY3Rpb25OYW1lXCI6IFwidGVzdENvbGxlY3Rpb25cIixcbiAgICAgICAgICBcImluZGV4TmFtZVwiOiBcInRlc3RJbmRleFwiLFxuICAgICAgICAgIFwiaW5kZXhLZXlzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJrZXlOYW1lXCI6IFwibmV3SWRcIixcbiAgICAgICAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogMS4wMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICBdO1xuXG4gICAgICBjb25zdCBzb21ldGhpbmdXZW50V3JvbmdFcnJvciA9IG5ldyBFcnJvcihcIlNvbWV0aGluZyB3ZW50IHdyb25nXCIpO1xuICAgICAgTW9ja0V2ZW50RW1pdHRlci5lbWl0LnRocm93cyhzb21ldGhpbmdXZW50V3JvbmdFcnJvcik7XG5cbiAgICAgIC8vIEFjdFxuICAgICAgY29uc3QgYWN0ID0gc3V0LmJ1aWxkSW5kZXhlcyhtb2NrSW5kZXhlcyk7XG5cblxuICAgICAgLy8gQXNzZXJ0XG4gICAgICByZXR1cm4gYWN0XG4gICAgICAgIC50aGVuKCgpID0+IGZhaWwoXCJzaG91bGQgcmVqZWN0XCIpKVxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcblxuICAgICAgICAgIGV4cGVjdChlcnIubWVzc2FnZSkudG8uZXF1YWwoXCJTb21ldGhpbmcgd2VudCB3cm9uZ1wiKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiZ2V0SW5kZXhCdWlsZGVyXCIsICgpID0+IHtcblxuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIGEgbmV3IGluc3RhbmNlIG9mIGluZGV4IGJ1aWxkZXIgc2VydmljZSBmb3IgdGhlIGZpcnN0IHRpbWUgYW5kIHNhbWUgb2JqZWN0IGZvIHRoZSBzZWNvbmQgdGltZVwiLCBkb25lID0+IHtcblxuICAgICAgLy8gQXJyYW5nZVxuXG4gICAgICAvLyBBY3RcbiAgICAgIGNvbnN0IGluZGV4QnVsZGVyID0gZ2V0SW5kZXhCdWlsZGVyKHtkYXRhU2VydmljZSwgTW9ja0xvZ2dlcn0pO1xuICAgICAgY29uc3QgaW5kZXhCdWxkZXJOZXcgPSBnZXRJbmRleEJ1aWxkZXIoe2RhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyfSk7XG5cbiAgICAgIC8vIEFzc2VydFxuXG4gICAgICBleHBlY3QoaW5kZXhCdWxkZXIpLnRvLmVxdWFsKGluZGV4QnVsZGVyTmV3KTtcbiAgICAgIGV4cGVjdChpbmRleEJ1bGRlcikudG8uZXhpc3QoKS5hbmQuYmUuYW4ub2JqZWN0KCk7XG4gICAgICBleHBlY3QoaW5kZXhCdWxkZXIpLnRvLm9ubHkuaW5jbHVkZShcImV2ZW50RW1pdHRlclwiKTtcbiAgICAgIGV4cGVjdChpbmRleEJ1bGRlci5idWlsZEluZGV4ZXMpLnRvLmV4aXN0KCkuYW5kLmJlLmEuZnVuY3Rpb24oKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICB9KTtcblxufSk7XG4iXX0=
//# sourceMappingURL=indexBuilder.js.map
