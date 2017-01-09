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
        (0, _code.expect)(sut.eventEmitter.emit.args[2]).to.include(["indexDrop", "Collection Name : testCollection, \"Index Name:\" : testid_1"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[3]).to.include(["indexDropped", "Collection Name : testCollection, \"Index Name:\" : testid_1"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[4]).to.include(["indexCreate", "Collection Name : testCollection, Keys : {\"newId\":1}, Options : {\"name\":\"testIndex\"}"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[5]).to.include(["indexCreated", "Collection Name : testCollection, Keys : {\"newId\":1}, Options : {\"name\":\"testIndex\"}"]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvaW5kZXhCdWlsZGVyLmVzNiJdLCJuYW1lcyI6WyJIb2VrIiwiY3VzdG9tRXZlbnRzIiwibGFiIiwiZXhwb3J0cyIsInNjcmlwdCIsImJlZm9yZUVhY2giLCJkZXNjcmliZSIsIml0IiwiZGF0YVNlcnZpY2UiLCJNb2NrRXZlbnRFbWl0dGVyIiwic3V0Iiwic3V0RmFjdG9yeSIsImNvbmZpZyIsImNvbmZpZ18iLCJtb2NrTW9uZ29Db25maWciLCJtb25nb0NvbmZpZyIsIm1vY2tMb2dnZXJDb25maWciLCJsb2dnZXJDb25maWciLCJwcm9jZXNzIiwic3Rkb3V0IiwidG8iLCJleGlzdCIsImFuZCIsImJlIiwiYSIsImZ1bmN0aW9uIiwiZG9uZSIsImFjdCIsIm5vdCIsInRocm93IiwiRXJyb3IiLCJNb2NrTG9nZ2VyIiwibW9ja0luZGV4ZXMiLCJtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbiIsIm1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uMSIsImdldEluZGV4ZXMiLCJ3aXRoQXJncyIsInJlc29sdmVzIiwiY3JlYXRlSW5kZXgiLCJkcm9wSW5kZXgiLCJidWlsZEluZGV4ZXMiLCJ0aGVuIiwiY2FsbENvdW50IiwiZXF1YWwiLCJ1bmlxdWUiLCJtYXAiLCJpbmRleCIsImNvbGxlY3Rpb25OYW1lIiwibGVuZ3RoIiwiZmlyc3RDYWxsIiwiY2FsbGVkV2l0aCIsInRydWUiLCJzZWNvbmRDYWxsIiwiZXZlbnRFbWl0dGVyIiwiZW1pdCIsImFyZ3MiLCJpbmNsdWRlIiwib24iLCJpdGVtIiwiT2JqZWN0Iiwia2V5cyIsImluZGV4RXZlbnRzIiwic29tZXRoaW5nV2VudFdyb25nRXJyb3IiLCJyZWplY3RzIiwiY2F0Y2giLCJlcnIiLCJtZXNzYWdlIiwiYXNzZXJ0IiwiY2FsbGVkT25jZSIsIm5vdENhbGxlZCIsInRocm93cyIsImluZGV4QnVsZGVyIiwiaW5kZXhC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Q0FBWjs7QUFHQTtBQUNBLGFBQU9MLElBQ0pjLElBREksQ0FDQztBQUFBLGVBQU0sZ0JBQUssZUFBTCxDQUFOO0FBQUEsT0FERCxFQUVKdUIsS0FGSSxDQUVFLGVBQU87O0FBRVosMEJBQU9DLElBQUlDLE9BQVgsRUFBb0I5QyxFQUFwQixDQUF1QnVCLEtBQXZCLENBQTZCLHNCQUE3QjtBQUNELE9BTEksQ0FBUDtBQU1ELEtBN0JEO0FBOEJELEdBcFZEOztBQXNWQXJDLFdBQVMsaUJBQVQsRUFBNEIsWUFBTTs7QUFHaENDLE9BQUcsNkdBQUgsRUFBa0gsZ0JBQVE7O0FBRXhIOztBQUVBO0FBQ0EsVUFBTWdFLGNBQWMsbUNBQWdCLEVBQUMvRCx3QkFBRCxFQUFjdUIsNEJBQWQsRUFBaEIsQ0FBcEI7QUFDQSxVQUFNeUMsaUJBQWlCLG1DQUFnQixFQUFDaEUsd0JBQUQsRUFBY3VCLDRCQUFkLEVBQWhCLENBQXZCOztBQUVBOztBQUVBLHdCQUFPd0MsV0FBUCxFQUFvQm5ELEVBQXBCLENBQXVCdUIsS0FBdkIsQ0FBNkI2QixjQUE3QjtBQUNBLHdCQUFPRCxXQUFQLEVBQW9CbkQsRUFBcEIsQ0FBdUJDLEtBQXZCLEdBQStCQyxHQUEvQixDQUFtQ0MsRUFBbkMsQ0FBc0NrRCxFQUF0QyxDQUF5Q0MsTUFBekM7QUFDQSx3QkFBT0gsV0FBUCxFQUFvQm5ELEVBQXBCLENBQXVCdUQsSUFBdkIsQ0FBNEJuQixPQUE1QixDQUFvQyxjQUFwQztBQUNBLHdCQUFPZSxZQUFZL0IsWUFBbkIsRUFBaUNwQixFQUFqQyxDQUFvQ0MsS0FBcEMsR0FBNENDLEdBQTVDLENBQWdEQyxFQUFoRCxDQUFtREMsQ0FBbkQsQ0FBcURDLFFBQXJEOztBQUVBLGFBQU9DLE1BQVA7QUFDRCxLQWhCRDtBQWtCRCxHQXJCRDtBQXVCRCxDQW5iRCIsImZpbGUiOiJpbmRleEJ1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2RlZmF1bHQgYXMgU3V0LCBnZXRJbmRleEJ1aWxkZXJ9IGZyb20gXCIuLi8uLi9kaXN0L2luZGV4QnVpbGRlclwiO1xuaW1wb3J0IE1vY2tEYXRhU2VydmljZVByb3ZpZGVyIGZyb20gXCIuL21vY2tzL21vY2tNb25nb1NlcnZpY2VcIjtcbmltcG9ydCBMYWIgZnJvbSBcImxhYlwiO1xuaW1wb3J0IE1vY2tMb2dnZXIgZnJvbSBcIi4vbW9ja3MvbG9nZ2VyXCI7XG5pbXBvcnQge2V4cGVjdCwgZmFpbH0gZnJvbSBcImNvZGVcIjtcbmltcG9ydCAqIGFzIEhvZWsgZnJvbSBcImhvZWtcIjtcbmltcG9ydCBNb2NrZWRFdmVudEVtaXR0ZXIgZnJvbSBcIi4vbW9ja3MvbW9ja0V2ZW50RW1pdHRlclwiO1xuaW1wb3J0ICogYXMgY3VzdG9tRXZlbnRzIGZyb20gXCIuLy4uLy4uL2Rpc3QvY3VzdG9tRXZlbnRzXCI7XG5pbXBvcnQgdW5kZWZpbmVkRmFjdG9yeSBmcm9tIFwiLi9tb2Nrcy91bmRlZmluZWRGYWN0b3J5XCI7XG5pbXBvcnQgU2lub24gZnJvbSBcInNpbm9uXCI7XG5cblxuY29uc3QgbGFiID0gZXhwb3J0cy5sYWIgPSBMYWIuc2NyaXB0KCk7XG5jb25zdCB7YmVmb3JlRWFjaCwgZGVzY3JpYmUsIGl0fSA9IGxhYjtcblxuZGVzY3JpYmUoXCJpbmRleEJ1aWxkZXJTZXJ2aWNlXCIsICgpID0+IHtcblxuICBsZXQgZGF0YVNlcnZpY2U7XG4gIGxldCBNb2NrRXZlbnRFbWl0dGVyO1xuICBsZXQgc3V0O1xuXG4gIGRlc2NyaWJlKFwiQ29uc3RydXRvclwiLCAoKSA9PiB7XG5cbiAgICBmdW5jdGlvbiBzdXRGYWN0b3J5KGNvbmZpZykge1xuXG4gICAgICBjb25zdCBjb25maWdfID0gY29uZmlnIHx8IHt9O1xuICAgICAgY29uc3QgbW9ja01vbmdvQ29uZmlnID0gY29uZmlnXy5tb25nb0NvbmZpZyB8fCB7XG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBcIm1vbmdvOi8vdXNlck5hbWU6UGFzc3dvcmRAYWRkcmVzczpwb3J0L2RiXCIsXG4gICAgICAgIFwib3BlcmF0aW9uVGltZW91dFwiOiA1MDAwXG4gICAgICB9O1xuICAgICAgY29uc3QgbW9ja0xvZ2dlckNvbmZpZyA9IGNvbmZpZ18ubG9nZ2VyQ29uZmlnIHx8IHtcbiAgICAgICAgXCJzdHJlYW1zXCI6IFt7XG4gICAgICAgICAgXCJsZXZlbFwiOiBcImZhdGFsXCIsXG4gICAgICAgICAgXCJzdHJlYW1cIjogcHJvY2Vzcy5zdGRvdXRcbiAgICAgICAgfV0sXG4gICAgICAgIFwibmFtZVwiOiBcIk15LWxvZ2dlclwiXG4gICAgICB9O1xuICAgICAgc3V0ID0gbmV3IFN1dCh7XCJtb25nb0NvbmZpZ1wiOiBtb2NrTW9uZ29Db25maWcsIFwibG9nZ2VyQ29uZmlnXCI6IG1vY2tMb2dnZXJDb25maWd9KTtcbiAgICB9XG5cbiAgICBpdChcInNob3VsZCBiZSBhIGZ1bmN0aW9uXCIsIGRvbmUgPT4ge1xuXG4gICAgICBleHBlY3QoU3V0KS50by5leGlzdCgpLmFuZC5iZS5hLmZ1bmN0aW9uKCk7XG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgYmUgbmV3YWJsZVwiLCBkb25lID0+IHtcblxuICAgICAgY29uc3QgYWN0ID0gKCkgPT4gc3V0RmFjdG9yeSgpO1xuXG4gICAgICBleHBlY3QoYWN0KS50by5ub3QudGhyb3coKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHRocm93IHdoZW4gY2FsbGVkIHdpdGhvdXQgbmV3XCIsIGRvbmUgPT4ge1xuXG4gICAgICBjb25zdCBhY3QgPSAoKSA9PiBTdXQoKTtcblxuICAgICAgZXhwZWN0KGFjdCkudG8udGhyb3coRXJyb3IsIFwiQ2Fubm90IHJlYWQgcHJvcGVydHkgXFwnbW9uZ29Db25maWdcXCcgb2YgdW5kZWZpbmVkXCIpO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgYXNzZXJ0IHRoZSBtb25nbyBjb25maWcuXCIsIGRvbmUgPT4ge1xuXG4gICAgICBjb25zdCBhY3QgPSAoKSA9PiBuZXcgU3V0KHtcIm1vbmdvQ29uZmlnXCI6IHVuZGVmaW5lZEZhY3RvcnkoKX0pO1xuXG4gICAgICBleHBlY3QoYWN0KS50by50aHJvdyhFcnJvciwgL15Nb25nbyBEQiBjb25maWd1cmF0aW9uIGlzIG5vdCBpbiB0aGUgcmVxdWlyZWQgZm9ybWF0Lyk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCB0YWtlIHVzZSBvZiBkZWZhdWx0IGxvZ2dlciBjb25maWcgaWYgY3VzdG9tIGlzIG5vdCBwcm92aWRlZC5cIiwgZG9uZSA9PiB7XG5cbiAgICAgIGNvbnN0IGFjdCA9ICgpID0+IHN1dEZhY3Rvcnkoe1wibW9uZ29Db25maWdcIjoge1xuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogXCJtb25nbzovL3VzZXJOYW1lOlBhc3N3b3JkQGFkZHJlc3M6cG9ydC9kYlwifX0pO1xuXG4gICAgICBleHBlY3QoYWN0KS50by5ub3QudGhyb3coKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICB9KTtcblxuICBkZXNjcmliZShcImJ1aWxkSW5kZXhlc1wiLCAoKSA9PiB7XG5cbiAgICBiZWZvcmVFYWNoKGRvbmUgPT4ge1xuXG4gICAgICBkYXRhU2VydmljZSA9IG5ldyBNb2NrRGF0YVNlcnZpY2VQcm92aWRlcigpO1xuICAgICAgTW9ja0V2ZW50RW1pdHRlciA9IG5ldyBNb2NrZWRFdmVudEVtaXR0ZXIoKTtcbiAgICAgIHN1dCA9IG5ldyBTdXQoe2RhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyLCBNb2NrRXZlbnRFbWl0dGVyfSk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cblxuICAgIGl0KFwic2hvdWxkIGNhbGwgdGhlIHRoaXMuZGF0YVNlcnZpY2VfLmdldEluZGV4ZXMgbWV0aG9kIGZvciBlYWNoIGNvbGxlY3Rpb24gaW4gaW5kZXggbGlzdFwiLCAoKSA9PiB7XG5cbiAgICAgIC8vIEFycmFuZ2VcbiAgICAgIGNvbnN0IG1vY2tJbmRleGVzID0gW1xuXG4gICAgICAgIHtcbiAgICAgICAgICBcImNvbGxlY3Rpb25OYW1lXCI6IFwidGVzdENvbGxlY3Rpb25cIixcbiAgICAgICAgICBcImluZGV4TmFtZVwiOiBcInRlc3RJbmRleFwiLFxuICAgICAgICAgIFwiaW5kZXhLZXlzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJrZXlOYW1lXCI6IFwibmV3SWRcIixcbiAgICAgICAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogMS4wMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBcInRlc3RDb2xsZWN0aW9uMVwiLFxuICAgICAgICAgIFwiaW5kZXhOYW1lXCI6IFwidGVzdEluZGV4MVwiLFxuICAgICAgICAgIFwiaW5kZXhLZXlzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJrZXlOYW1lXCI6IFwibmV3SWRcIixcbiAgICAgICAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogMS4wMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9XTtcbiAgICAgIGNvbnN0IG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uID0gW3tcbiAgICAgICAgXCJ2XCI6IDEsXG4gICAgICAgIFwia2V5XCI6IHtcbiAgICAgICAgICBcIl9pZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcIl9pZF9cIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9XTtcblxuICAgICAgY29uc3QgbW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24xID0gW3tcbiAgICAgICAgXCJ2XCI6IDEsXG4gICAgICAgIFwia2V5XCI6IHtcbiAgICAgICAgICBcIl9pZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcIl9pZF9cIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvbjFcIlxuICAgICAgfV07XG5cbiAgICAgIGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMud2l0aEFyZ3MoXCJ0ZXN0Q29sbGVjdGlvblwiKS5yZXNvbHZlcyhtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbik7XG4gICAgICBkYXRhU2VydmljZS5nZXRJbmRleGVzLndpdGhBcmdzKFwidGVzdENvbGxlY3Rpb24xXCIpLnJlc29sdmVzKG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uMSk7XG4gICAgICBkYXRhU2VydmljZS5jcmVhdGVJbmRleC5yZXNvbHZlcyh0cnVlKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmRyb3BJbmRleC5yZXNvbHZlcyh0cnVlKTtcblxuXG4gICAgICAvLyBBY3RcbiAgICAgIGNvbnN0IGFjdCA9IHN1dC5idWlsZEluZGV4ZXMobW9ja0luZGV4ZXMpO1xuXG4gICAgICAvLyBBc3NlcnRcbiAgICAgIHJldHVybiBhY3RcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChkYXRhU2VydmljZS5nZXRJbmRleGVzLmNhbGxDb3VudCkudG8uZXF1YWwoSG9lay51bmlxdWUobW9ja0luZGV4ZXMubWFwKGluZGV4ID0+IGluZGV4LmNvbGxlY3Rpb25OYW1lKSkubGVuZ3RoKTtcbiAgICAgICAgICBleHBlY3QoZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy5maXJzdENhbGwuY2FsbGVkV2l0aChtb2NrSW5kZXhlc1swXS5jb2xsZWN0aW9uTmFtZSkpLnRvLmJlLnRydWUoKTtcbiAgICAgICAgICBleHBlY3QoZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy5zZWNvbmRDYWxsLmNhbGxlZFdpdGgobW9ja0luZGV4ZXNbMV0uY29sbGVjdGlvbk5hbWUpKS50by5iZS50cnVlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBjYWxsIHRoZSB0aGlzLmRhdGFTZXJ2aWNlXy5kcm9wSW5kZXggbWV0aG9kIGlmIGRiIGNvbGxlY3Rpb24gY29udGFpbnMgZXh0cmEgaW5kZXhlcyB0aGFuIGRlc2lyZWRcIiwgKCkgPT4ge1xuXG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBtb2NrSW5kZXhlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIFwiY29sbGVjdGlvbk5hbWVcIjogXCJ0ZXN0Q29sbGVjdGlvblwiLFxuICAgICAgICAgIFwiaW5kZXhOYW1lXCI6IFwidGVzdEluZGV4XCIsXG4gICAgICAgICAgXCJpbmRleEtleXNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtleU5hbWVcIjogXCJuZXdJZFwiLFxuICAgICAgICAgICAgICBcImtleVNvcnRPcmRlclwiOiAxLjAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIF07XG5cblxuICAgICAgY29uc3QgbW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24gPSBbe1xuICAgICAgICBcInZcIjogMSxcbiAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgIFwiX2lkXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJuYW1lXCI6IFwiX2lkX1wiLFxuICAgICAgICBcIm5zXCI6IFwidGVzdGRiLnRlc3RDb2xsZWN0aW9uXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwidlwiOiAxLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJ0ZXN0aWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJ0ZXN0aWRfMVwiLFxuICAgICAgICBcIm5zXCI6IFwidGVzdGRiLnRlc3RDb2xsZWN0aW9uXCJcbiAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMud2l0aEFyZ3MoXCJ0ZXN0Q29sbGVjdGlvblwiKS5yZXNvbHZlcyhtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbik7XG4gICAgICBkYXRhU2VydmljZS5jcmVhdGVJbmRleC5yZXNvbHZlcyh0cnVlKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmRyb3BJbmRleC5yZXNvbHZlcyh0cnVlKTtcblxuXG4gICAgICAvLyBBY3RcbiAgICAgIGNvbnN0IGFjdCA9IHN1dC5idWlsZEluZGV4ZXMobW9ja0luZGV4ZXMpO1xuXG4gICAgICAvLyBBc3NlcnRcbiAgICAgIHJldHVybiBhY3RcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChkYXRhU2VydmljZS5kcm9wSW5kZXguY2FsbENvdW50KS50by5lcXVhbCgxKTtcbiAgICAgICAgICBleHBlY3QoZGF0YVNlcnZpY2UuZHJvcEluZGV4LmNhbGxlZFdpdGgoXCJ0ZXN0Q29sbGVjdGlvblwiLCBcInRlc3RpZF8xXCIpKS50by5iZS50cnVlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgY2FsbCB0aGUgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdCBtZXRob2QgZm9yIGFsbCB0aGUgaW5kZXhlcyB0byBiZSBkcm9wcGVkIGFuZCBjcmVhdGVkXCIsICgpID0+IHtcblxuICAgICAgLy8gQXJyYW5nZVxuICAgICAgY29uc3QgbW9ja0luZGV4ZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImNvbGxlY3Rpb25OYW1lXCI6IFwidGVzdENvbGxlY3Rpb25cIixcbiAgICAgICAgICBcImluZGV4TmFtZVwiOiBcInRlc3RJbmRleFwiLFxuICAgICAgICAgIFwiaW5kZXhLZXlzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJrZXlOYW1lXCI6IFwibmV3SWRcIixcbiAgICAgICAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogMS4wMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICBdO1xuXG4gICAgICBjb25zdCBtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbiA9IFt7XG4gICAgICAgIFwidlwiOiAxLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJfaWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJfaWRfXCIsXG4gICAgICAgIFwibnNcIjogXCJ0ZXN0ZGIudGVzdENvbGxlY3Rpb25cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJ2XCI6IDEsXG4gICAgICAgIFwia2V5XCI6IHtcbiAgICAgICAgICBcInRlc3RpZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcInRlc3RpZF8xXCIsXG4gICAgICAgIFwibnNcIjogXCJ0ZXN0ZGIudGVzdENvbGxlY3Rpb25cIlxuICAgICAgfVxuICAgICAgXTtcblxuICAgICAgZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy53aXRoQXJncyhcInRlc3RDb2xsZWN0aW9uXCIpLnJlc29sdmVzKG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LnJlc29sdmVzKHRydWUpO1xuICAgICAgZGF0YVNlcnZpY2UuZHJvcEluZGV4LnJlc29sdmVzKHRydWUpO1xuXG4gICAgICAvLyBBY3RcbiAgICAgIGNvbnN0IGFjdCA9IHN1dC5idWlsZEluZGV4ZXMobW9ja0luZGV4ZXMpO1xuXG5cbiAgICAgIC8vIEFzc2VydFxuICAgICAgcmV0dXJuIGFjdFxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5jYWxsQ291bnQpLnRvLmVxdWFsKDcpO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJnc1swXSkudG8uaW5jbHVkZShbXCJpbmRleGVzU3luY3JvbmlzYXRpb25TdGFydFwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzW3N1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzLmxlbmd0aCAtIDFdKS50by5pbmNsdWRlKFtcImluZGV4ZXNTeW5jcm9uaXNlZFwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5jYWxsQ291bnQpLnRvLmVxdWFsKDcpO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJnc1sxXSkudG8uaW5jbHVkZShbXCJjb2xsZWN0aW9uTmFtZXNcIiwgXCJ0ZXN0Q29sbGVjdGlvblwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzWzJdKS50by5pbmNsdWRlKFtcImluZGV4RHJvcFwiLCBcIkNvbGxlY3Rpb24gTmFtZSA6IHRlc3RDb2xsZWN0aW9uLCBcXFwiSW5kZXggTmFtZTpcXFwiIDogdGVzdGlkXzFcIl0pO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJnc1szXSkudG8uaW5jbHVkZShbXCJpbmRleERyb3BwZWRcIiwgXCJDb2xsZWN0aW9uIE5hbWUgOiB0ZXN0Q29sbGVjdGlvbiwgXFxcIkluZGV4IE5hbWU6XFxcIiA6IHRlc3RpZF8xXCJdKTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmFyZ3NbNF0pLnRvLmluY2x1ZGUoW1wiaW5kZXhDcmVhdGVcIiwgXCJDb2xsZWN0aW9uIE5hbWUgOiB0ZXN0Q29sbGVjdGlvbiwgS2V5cyA6IHtcXFwibmV3SWRcXFwiOjF9LCBPcHRpb25zIDoge1xcXCJuYW1lXFxcIjpcXFwidGVzdEluZGV4XFxcIn1cIl0pO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJnc1s1XSkudG8uaW5jbHVkZShbXCJpbmRleENyZWF0ZWRcIiwgXCJDb2xsZWN0aW9uIE5hbWUgOiB0ZXN0Q29sbGVjdGlvbiwgS2V5cyA6IHtcXFwibmV3SWRcXFwiOjF9LCBPcHRpb25zIDoge1xcXCJuYW1lXFxcIjpcXFwidGVzdEluZGV4XFxcIn1cIl0pO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLm9uLmNhbGxDb3VudCkudG8uZXF1YWwoOSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIub24uYXJncy5tYXAoaXRlbSA9PiBpdGVtWzBdKSkudG8uaW5jbHVkZShPYmplY3Qua2V5cyhjdXN0b21FdmVudHMuaW5kZXhFdmVudHMpKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBjYWxsIHRoZSB0aGlzLmRhdGFTZXJ2aWNlXy5jcmVhdGVJbmRleCBtZXRob2Qgd2l0aCBpbmRleCBsaXN0IHdoaWNoIGFyZSBub3QgcHJlc2VudCBpbiBkYiBjb2xsZWN0aW9uc1wiLCAoKSA9PiB7XG5cblxuICAgICAgLy8gQXJyYW5nZVxuICAgICAgY29uc3QgbW9ja0luZGV4ZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImNvbGxlY3Rpb25OYW1lXCI6IFwidGVzdENvbGxlY3Rpb25cIixcbiAgICAgICAgICBcImluZGV4TmFtZVwiOiBcInRlc3RJbmRleFwiLFxuICAgICAgICAgIFwiaW5kZXhLZXlzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJrZXlOYW1lXCI6IFwibmV3SWRcIixcbiAgICAgICAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogMS4wMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICBdO1xuXG5cbiAgICAgIGNvbnN0IG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uID0gW3tcbiAgICAgICAgXCJ2XCI6IDEsXG4gICAgICAgIFwia2V5XCI6IHtcbiAgICAgICAgICBcIl9pZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcIl9pZF9cIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9XTtcblxuICAgICAgZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy53aXRoQXJncyhcInRlc3RDb2xsZWN0aW9uXCIpLnJlc29sdmVzKG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LnJlc29sdmVzKHRydWUpO1xuICAgICAgZGF0YVNlcnZpY2UuZHJvcEluZGV4LnJlc29sdmVzKHRydWUpO1xuXG5cbiAgICAgIC8vIEFjdFxuICAgICAgY29uc3QgYWN0ID0gc3V0LmJ1aWxkSW5kZXhlcyhtb2NrSW5kZXhlcyk7XG5cbiAgICAgIC8vIEFzc2VydFxuICAgICAgcmV0dXJuIGFjdFxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LmNhbGxDb3VudCkudG8uZXF1YWwoMSk7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LmNhbGxlZFdpdGgoXCJ0ZXN0Q29sbGVjdGlvblwiLCB7XCJuZXdJZFwiOiAxfSwge1wibmFtZVwiOiBcInRlc3RJbmRleFwifSkpLnRvLmJlLnRydWUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBub3QgY2FsbCB0aGUgdGhpcy5kYXRhU2VydmljZV8uZHJvcEluZGV4IGFuZCB0aGlzLmRhdGFTZXJ2aWNlXy5jcmVhdGVJbmRleCBtZXRob2RzIGlmIGRiIGNvbGxlY3Rpb25zIGNvbnRhaW4gYWxsIHRoZSBkZXNpcmVkIGluZGV4ZXNcIiwgKCkgPT4ge1xuXG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBtb2NrSW5kZXhlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIFwiY29sbGVjdGlvbk5hbWVcIjogXCJ0ZXN0Q29sbGVjdGlvblwiLFxuICAgICAgICAgIFwiaW5kZXhOYW1lXCI6IFwidGVzdEluZGV4XCIsXG4gICAgICAgICAgXCJpbmRleEtleXNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtleU5hbWVcIjogXCJuZXdJZFwiLFxuICAgICAgICAgICAgICBcImtleVNvcnRPcmRlclwiOiAxLjAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIF07XG5cblxuICAgICAgY29uc3QgbW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24gPSBbe1xuICAgICAgICBcInZcIjogMSxcbiAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgIFwiX2lkXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJuYW1lXCI6IFwiX2lkX1wiLFxuICAgICAgICBcIm5zXCI6IFwidGVzdGRiLnRlc3RDb2xsZWN0aW9uXCJcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwidlwiOiAxLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJuZXdJZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcInRlc3RJbmRleFwiLFxuICAgICAgICBcIm5zXCI6IFwidGVzdGRiLnRlc3RDb2xsZWN0aW9uXCJcbiAgICAgIH1dO1xuXG4gICAgICBkYXRhU2VydmljZS5nZXRJbmRleGVzLndpdGhBcmdzKFwidGVzdENvbGxlY3Rpb25cIikucmVzb2x2ZXMobW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24pO1xuICAgICAgZGF0YVNlcnZpY2UuY3JlYXRlSW5kZXgucmVzb2x2ZXModHJ1ZSk7XG4gICAgICBkYXRhU2VydmljZS5kcm9wSW5kZXgucmVzb2x2ZXModHJ1ZSk7XG5cblxuICAgICAgLy8gQWN0XG4gICAgICBjb25zdCBhY3QgPSBzdXQuYnVpbGRJbmRleGVzKG1vY2tJbmRleGVzKTtcblxuICAgICAgLy8gQXNzZXJ0XG4gICAgICByZXR1cm4gYWN0XG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZGF0YVNlcnZpY2UuY3JlYXRlSW5kZXguY2FsbENvdW50KS50by5lcXVhbCgwKTtcbiAgICAgICAgICBleHBlY3QoZGF0YVNlcnZpY2UuZHJvcEluZGV4LmNhbGxDb3VudCkudG8uZXF1YWwoMCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmVqZWN0IHdoZW4gd2hlbiBkYXRhU2VydmljZS5nZXRJbmRleGVzIHRocm93c1wiLCAoKSA9PiB7XG5cbiAgICAgIC8vIEFycmFuZ2VcbiAgICAgIGNvbnN0IG1vY2tJbmRleGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBcInRlc3RDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogXCJ0ZXN0SW5kZXhcIixcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2V5TmFtZVwiOiBcIm5ld0lkXCIsXG4gICAgICAgICAgICAgIFwia2V5U29ydE9yZGVyXCI6IDEuMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgY29uc3Qgc29tZXRoaW5nV2VudFdyb25nRXJyb3IgPSBuZXcgRXJyb3IoXCJTb21ldGhpbmcgd2VudCB3cm9uZ1wiKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMucmVqZWN0cyhzb21ldGhpbmdXZW50V3JvbmdFcnJvcik7XG5cbiAgICAgIC8vIEFjdFxuICAgICAgY29uc3QgYWN0ID0gc3V0LmJ1aWxkSW5kZXhlcyhtb2NrSW5kZXhlcyk7XG5cblxuICAgICAgLy8gQXNzZXJ0XG4gICAgICByZXR1cm4gYWN0XG4gICAgICAgIC50aGVuKCgpID0+IGZhaWwoXCJzaG91bGQgcmVqZWN0XCIpKVxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcblxuICAgICAgICAgIGV4cGVjdChlcnIubWVzc2FnZSkudG8uZXF1YWwoXCJFcnJvciBpbiBidWlsZGluZyBpbmRleGVzIDogU29tZXRoaW5nIHdlbnQgd3JvbmdcIik7XG4gICAgICAgICAgU2lub24uYXNzZXJ0LmNhbGxlZE9uY2UoZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcyk7XG4gICAgICAgICAgU2lub24uYXNzZXJ0Lm5vdENhbGxlZChkYXRhU2VydmljZS5kcm9wSW5kZXgpO1xuICAgICAgICAgIFNpbm9uLmFzc2VydC5ub3RDYWxsZWQoZGF0YVNlcnZpY2UuY3JlYXRlSW5kZXgpO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuY2FsbENvdW50KS50by5lcXVhbCgzKTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmFyZ3NbMF0pLnRvLmluY2x1ZGUoW1wiaW5kZXhlc1N5bmNyb25pc2F0aW9uU3RhcnRcIl0pO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJnc1tzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJncy5sZW5ndGggLSAxXSkudG8uaW5jbHVkZShbXCJlcnJvclwiXSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmVqZWN0IGV2ZW50RW1pdHRlciB0aHJvd3NcIiwgKCkgPT4ge1xuXG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBtb2NrSW5kZXhlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIFwiY29sbGVjdGlvbk5hbWVcIjogXCJ0ZXN0Q29sbGVjdGlvblwiLFxuICAgICAgICAgIFwiaW5kZXhOYW1lXCI6IFwidGVzdEluZGV4XCIsXG4gICAgICAgICAgXCJpbmRleEtleXNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtleU5hbWVcIjogXCJuZXdJZFwiLFxuICAgICAgICAgICAgICBcImtleVNvcnRPcmRlclwiOiAxLjAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGNvbnN0IHNvbWV0aGluZ1dlbnRXcm9uZ0Vycm9yID0gbmV3IEVycm9yKFwiU29tZXRoaW5nIHdlbnQgd3JvbmdcIik7XG4gICAgICBNb2NrRXZlbnRFbWl0dGVyLmVtaXQudGhyb3dzKHNvbWV0aGluZ1dlbnRXcm9uZ0Vycm9yKTtcblxuICAgICAgLy8gQWN0XG4gICAgICBjb25zdCBhY3QgPSBzdXQuYnVpbGRJbmRleGVzKG1vY2tJbmRleGVzKTtcblxuXG4gICAgICAvLyBBc3NlcnRcbiAgICAgIHJldHVybiBhY3RcbiAgICAgICAgLnRoZW4oKCkgPT4gZmFpbChcInNob3VsZCByZWplY3RcIikpXG4gICAgICAgIC5jYXRjaChlcnIgPT4ge1xuXG4gICAgICAgICAgZXhwZWN0KGVyci5tZXNzYWdlKS50by5lcXVhbChcIlNvbWV0aGluZyB3ZW50IHdyb25nXCIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJnZXRJbmRleEJ1aWxkZXJcIiwgKCkgPT4ge1xuXG5cbiAgICBpdChcInNob3VsZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgaW5kZXggYnVpbGRlciBzZXJ2aWNlIGZvciB0aGUgZmlyc3QgdGltZSBhbmQgc2FtZSBvYmplY3QgZm8gdGhlIHNlY29uZCB0aW1lXCIsIGRvbmUgPT4ge1xuXG4gICAgICAvLyBBcnJhbmdlXG5cbiAgICAgIC8vIEFjdFxuICAgICAgY29uc3QgaW5kZXhCdWxkZXIgPSBnZXRJbmRleEJ1aWxkZXIoe2RhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyfSk7XG4gICAgICBjb25zdCBpbmRleEJ1bGRlck5ldyA9IGdldEluZGV4QnVpbGRlcih7ZGF0YVNlcnZpY2UsIE1vY2tMb2dnZXJ9KTtcblxuICAgICAgLy8gQXNzZXJ0XG5cbiAgICAgIGV4cGVjdChpbmRleEJ1bGRlcikudG8uZXF1YWwoaW5kZXhCdWxkZXJOZXcpO1xuICAgICAgZXhwZWN0KGluZGV4QnVsZGVyKS50by5leGlzdCgpLmFuZC5iZS5hbi5vYmplY3QoKTtcbiAgICAgIGV4cGVjdChpbmRleEJ1bGRlcikudG8ub25seS5pbmNsdWRlKFwiZXZlbnRFbWl0dGVyXCIpO1xuICAgICAgZXhwZWN0KGluZGV4QnVsZGVyLmJ1aWxkSW5kZXhlcykudG8uZXhpc3QoKS5hbmQuYmUuYS5mdW5jdGlvbigpO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gIH0pO1xuXG59KTtcbiJdfQ==
//# sourceMappingURL=indexBuilder.js.map
