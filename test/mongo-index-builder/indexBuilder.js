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
        (0, _code.expect)(sut.eventEmitter.emit.args[0]).to.include(["Index syncronisation started @ : "]);
        (0, _code.expect)(sut.eventEmitter.emit.args[sut.eventEmitter.emit.args.length - 1]).to.include(["Index sync is completed."]);
        (0, _code.expect)(sut.eventEmitter.emit.callCount).to.equal(7);
        (0, _code.expect)(sut.eventEmitter.emit.args[1]).to.include(["List of collections to be built :", "testCollection"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[2]).to.include(["Starting index dropping For :", "testid_1"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[3]).to.include(["Completed index dropping For :", "testid_1"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[3]).to.include(["Completed index dropping For :", "testid_1"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[4]).to.include(["Starting index creation For :", "Keys : {\"newId\":1}, Options : {\"name\":\"testIndex\"}"]);
        (0, _code.expect)(sut.eventEmitter.emit.args[5]).to.include(["Completed index creation For :", "Keys : {\"newId\":1}, Options : {\"name\":\"testIndex\"}"]);
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
        (0, _code.expect)(sut.eventEmitter.emit.args[0]).to.include(["Index syncronisation started @ : "]);
        (0, _code.expect)(sut.eventEmitter.emit.args[sut.eventEmitter.emit.args.length - 1]).to.include([customEvents.indexEvents.Error]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvaW5kZXhCdWlsZGVyLmVzNiJdLCJuYW1lcyI6WyJIb2VrIiwiY3VzdG9tRXZlbnRzIiwibGFiIiwiZXhwb3J0cyIsInNjcmlwdCIsImJlZm9yZUVhY2giLCJkZXNjcmliZSIsIml0IiwiZGF0YVNlcnZpY2UiLCJNb2NrRXZlbnRFbWl0dGVyIiwic3V0Iiwic3V0RmFjdG9yeSIsImNvbmZpZyIsImNvbmZpZ18iLCJtb2NrTW9uZ29Db25maWciLCJtb25nb0NvbmZpZyIsIm1vY2tMb2dnZXJDb25maWciLCJsb2dnZXJDb25maWciLCJwcm9jZXNzIiwic3Rkb3V0IiwidG8iLCJleGlzdCIsImFuZCIsImJlIiwiYSIsImZ1bmN0aW9uIiwiZG9uZSIsImFjdCIsIm5vdCIsInRocm93IiwiRXJyb3IiLCJNb2NrTG9nZ2VyIiwibW9ja0luZGV4ZXMiLCJtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbiIsIm1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uMSIsImdldEluZGV4ZXMiLCJ3aXRoQXJncyIsInJlc29sdmVzIiwiY3JlYXRlSW5kZXgiLCJkcm9wSW5kZXgiLCJidWlsZEluZGV4ZXMiLCJ0aGVuIiwiY2FsbENvdW50IiwiZXF1YWwiLCJ1bmlxdWUiLCJtYXAiLCJpbmRleCIsImNvbGxlY3Rpb25OYW1lIiwibGVuZ3RoIiwiZmlyc3RDYWxsIiwiY2FsbGVkV2l0aCIsInRydWUiLCJzZWNvbmRDYWxsIiwiZXZlbnRFbWl0dGVyIiwiZW1pdCIsImFyZ3MiLCJpbmNsdWRlIiwib24iLCJpdGVtIiwiT2JqZWN0Iiwia2V5cyIsImluZGV4RXZlbnRzIiwic29tZXRoaW5nV2VudFdyb25nRXJyb3IiLCJyZWplY3RzIiwiY2F0Y2giLCJlcnIiLCJtZXNzYWdlIiwiYXNzZXJ0IiwiY2FsbGVkT25jZSIsIm5vdENhbGxlZCIsInRocm93cyIsImluZGV4QnVsZGVyIiwiaW5kZXhC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RUEsYUFBT0MsTUFBUDtBQUNELEtBaEJEO0FBa0JELEdBckJEO0FBdUJELENBcGJEIiwiZmlsZSI6ImluZGV4QnVpbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZGVmYXVsdCBhcyBTdXQsIGdldEluZGV4QnVpbGRlcn0gZnJvbSBcIi4uLy4uL2Rpc3QvaW5kZXhCdWlsZGVyXCI7XG5pbXBvcnQgTW9ja0RhdGFTZXJ2aWNlUHJvdmlkZXIgZnJvbSBcIi4vbW9ja3MvbW9ja01vbmdvU2VydmljZVwiO1xuaW1wb3J0IExhYiBmcm9tIFwibGFiXCI7XG5pbXBvcnQgTW9ja0xvZ2dlciBmcm9tIFwiLi9tb2Nrcy9sb2dnZXJcIjtcbmltcG9ydCB7ZXhwZWN0LCBmYWlsfSBmcm9tIFwiY29kZVwiO1xuaW1wb3J0ICogYXMgSG9layBmcm9tIFwiaG9la1wiO1xuaW1wb3J0IE1vY2tlZEV2ZW50RW1pdHRlciBmcm9tIFwiLi9tb2Nrcy9tb2NrRXZlbnRFbWl0dGVyXCI7XG5pbXBvcnQgKiBhcyBjdXN0b21FdmVudHMgZnJvbSBcIi4vLi4vLi4vZGlzdC9jdXN0b21FdmVudHNcIjtcbmltcG9ydCB1bmRlZmluZWRGYWN0b3J5IGZyb20gXCIuL21vY2tzL3VuZGVmaW5lZEZhY3RvcnlcIjtcbmltcG9ydCBTaW5vbiBmcm9tIFwic2lub25cIjtcblxuXG5jb25zdCBsYWIgPSBleHBvcnRzLmxhYiA9IExhYi5zY3JpcHQoKTtcbmNvbnN0IHtiZWZvcmVFYWNoLCBkZXNjcmliZSwgaXR9ID0gbGFiO1xuXG5kZXNjcmliZShcImluZGV4QnVpbGRlclNlcnZpY2VcIiwgKCkgPT4ge1xuXG4gIGxldCBkYXRhU2VydmljZTtcbiAgbGV0IE1vY2tFdmVudEVtaXR0ZXI7XG4gIGxldCBzdXQ7XG5cbiAgZGVzY3JpYmUoXCJDb25zdHJ1dG9yXCIsICgpID0+IHtcblxuICAgIGZ1bmN0aW9uIHN1dEZhY3RvcnkoY29uZmlnKSB7XG5cbiAgICAgIGNvbnN0IGNvbmZpZ18gPSBjb25maWcgfHwge307XG4gICAgICBjb25zdCBtb2NrTW9uZ29Db25maWcgPSBjb25maWdfLm1vbmdvQ29uZmlnIHx8IHtcbiAgICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IFwibW9uZ286Ly91c2VyTmFtZTpQYXNzd29yZEBhZGRyZXNzOnBvcnQvZGJcIixcbiAgICAgICAgXCJvcGVyYXRpb25UaW1lb3V0XCI6IDUwMDBcbiAgICAgIH07XG4gICAgICBjb25zdCBtb2NrTG9nZ2VyQ29uZmlnID0gY29uZmlnXy5sb2dnZXJDb25maWcgfHwge1xuICAgICAgICBcInN0cmVhbXNcIjogW3tcbiAgICAgICAgICBcImxldmVsXCI6IFwiZmF0YWxcIixcbiAgICAgICAgICBcInN0cmVhbVwiOiBwcm9jZXNzLnN0ZG91dFxuICAgICAgICB9XSxcbiAgICAgICAgXCJuYW1lXCI6IFwiTXktbG9nZ2VyXCJcbiAgICAgIH07XG4gICAgICBzdXQgPSBuZXcgU3V0KHtcIm1vbmdvQ29uZmlnXCI6IG1vY2tNb25nb0NvbmZpZywgXCJsb2dnZXJDb25maWdcIjogbW9ja0xvZ2dlckNvbmZpZ30pO1xuICAgIH1cblxuICAgIGl0KFwic2hvdWxkIGJlIGEgZnVuY3Rpb25cIiwgZG9uZSA9PiB7XG5cbiAgICAgIGV4cGVjdChTdXQpLnRvLmV4aXN0KCkuYW5kLmJlLmEuZnVuY3Rpb24oKTtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBiZSBuZXdhYmxlXCIsIGRvbmUgPT4ge1xuXG4gICAgICBjb25zdCBhY3QgPSAoKSA9PiBzdXRGYWN0b3J5KCk7XG5cbiAgICAgIGV4cGVjdChhY3QpLnRvLm5vdC50aHJvdygpO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgdGhyb3cgd2hlbiBjYWxsZWQgd2l0aG91dCBuZXdcIiwgZG9uZSA9PiB7XG5cbiAgICAgIGNvbnN0IGFjdCA9ICgpID0+IFN1dCgpO1xuXG4gICAgICBleHBlY3QoYWN0KS50by50aHJvdyhFcnJvciwgXCJDYW5ub3QgcmVhZCBwcm9wZXJ0eSBcXCdtb25nb0NvbmZpZ1xcJyBvZiB1bmRlZmluZWRcIik7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBhc3NlcnQgdGhlIG1vbmdvIGNvbmZpZy5cIiwgZG9uZSA9PiB7XG5cbiAgICAgIGNvbnN0IGFjdCA9ICgpID0+IG5ldyBTdXQoe1wibW9uZ29Db25maWdcIjogdW5kZWZpbmVkRmFjdG9yeSgpfSk7XG5cbiAgICAgIGV4cGVjdChhY3QpLnRvLnRocm93KEVycm9yLCAvXk1vbmdvIERCIGNvbmZpZ3VyYXRpb24gaXMgbm90IGluIHRoZSByZXF1aXJlZCBmb3JtYXQvKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHRha2UgdXNlIG9mIGRlZmF1bHQgbG9nZ2VyIGNvbmZpZyBpZiBjdXN0b20gaXMgbm90IHByb3ZpZGVkLlwiLCBkb25lID0+IHtcblxuICAgICAgY29uc3QgYWN0ID0gKCkgPT4gc3V0RmFjdG9yeSh7XCJtb25nb0NvbmZpZ1wiOiB7XG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBcIm1vbmdvOi8vdXNlck5hbWU6UGFzc3dvcmRAYWRkcmVzczpwb3J0L2RiXCJ9fSk7XG5cbiAgICAgIGV4cGVjdChhY3QpLnRvLm5vdC50aHJvdygpO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiYnVpbGRJbmRleGVzXCIsICgpID0+IHtcblxuICAgIGJlZm9yZUVhY2goZG9uZSA9PiB7XG5cbiAgICAgIGRhdGFTZXJ2aWNlID0gbmV3IE1vY2tEYXRhU2VydmljZVByb3ZpZGVyKCk7XG4gICAgICBNb2NrRXZlbnRFbWl0dGVyID0gbmV3IE1vY2tlZEV2ZW50RW1pdHRlcigpO1xuICAgICAgc3V0ID0gbmV3IFN1dCh7ZGF0YVNlcnZpY2UsIE1vY2tMb2dnZXIsIE1vY2tFdmVudEVtaXR0ZXJ9KTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuXG4gICAgaXQoXCJzaG91bGQgY2FsbCB0aGUgdGhpcy5kYXRhU2VydmljZV8uZ2V0SW5kZXhlcyBtZXRob2QgZm9yIGVhY2ggY29sbGVjdGlvbiBpbiBpbmRleCBsaXN0XCIsICgpID0+IHtcblxuICAgICAgLy8gQXJyYW5nZVxuICAgICAgY29uc3QgbW9ja0luZGV4ZXMgPSBbXG5cbiAgICAgICAge1xuICAgICAgICAgIFwiY29sbGVjdGlvbk5hbWVcIjogXCJ0ZXN0Q29sbGVjdGlvblwiLFxuICAgICAgICAgIFwiaW5kZXhOYW1lXCI6IFwidGVzdEluZGV4XCIsXG4gICAgICAgICAgXCJpbmRleEtleXNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtleU5hbWVcIjogXCJuZXdJZFwiLFxuICAgICAgICAgICAgICBcImtleVNvcnRPcmRlclwiOiAxLjAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBcImNvbGxlY3Rpb25OYW1lXCI6IFwidGVzdENvbGxlY3Rpb24xXCIsXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogXCJ0ZXN0SW5kZXgxXCIsXG4gICAgICAgICAgXCJpbmRleEtleXNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtleU5hbWVcIjogXCJuZXdJZFwiLFxuICAgICAgICAgICAgICBcImtleVNvcnRPcmRlclwiOiAxLjAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1dO1xuICAgICAgY29uc3QgbW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24gPSBbe1xuICAgICAgICBcInZcIjogMSxcbiAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgIFwiX2lkXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJuYW1lXCI6IFwiX2lkX1wiLFxuICAgICAgICBcIm5zXCI6IFwidGVzdGRiLnRlc3RDb2xsZWN0aW9uXCJcbiAgICAgIH1dO1xuXG4gICAgICBjb25zdCBtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbjEgPSBbe1xuICAgICAgICBcInZcIjogMSxcbiAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgIFwiX2lkXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJuYW1lXCI6IFwiX2lkX1wiLFxuICAgICAgICBcIm5zXCI6IFwidGVzdGRiLnRlc3RDb2xsZWN0aW9uMVwiXG4gICAgICB9XTtcblxuICAgICAgZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy53aXRoQXJncyhcInRlc3RDb2xsZWN0aW9uXCIpLnJlc29sdmVzKG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMud2l0aEFyZ3MoXCJ0ZXN0Q29sbGVjdGlvbjFcIikucmVzb2x2ZXMobW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24xKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LnJlc29sdmVzKHRydWUpO1xuICAgICAgZGF0YVNlcnZpY2UuZHJvcEluZGV4LnJlc29sdmVzKHRydWUpO1xuXG5cbiAgICAgIC8vIEFjdFxuICAgICAgY29uc3QgYWN0ID0gc3V0LmJ1aWxkSW5kZXhlcyhtb2NrSW5kZXhlcyk7XG5cbiAgICAgIC8vIEFzc2VydFxuICAgICAgcmV0dXJuIGFjdFxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMuY2FsbENvdW50KS50by5lcXVhbChIb2VrLnVuaXF1ZShtb2NrSW5kZXhlcy5tYXAoaW5kZXggPT4gaW5kZXguY29sbGVjdGlvbk5hbWUpKS5sZW5ndGgpO1xuICAgICAgICAgIGV4cGVjdChkYXRhU2VydmljZS5nZXRJbmRleGVzLmZpcnN0Q2FsbC5jYWxsZWRXaXRoKG1vY2tJbmRleGVzWzBdLmNvbGxlY3Rpb25OYW1lKSkudG8uYmUudHJ1ZSgpO1xuICAgICAgICAgIGV4cGVjdChkYXRhU2VydmljZS5nZXRJbmRleGVzLnNlY29uZENhbGwuY2FsbGVkV2l0aChtb2NrSW5kZXhlc1sxXS5jb2xsZWN0aW9uTmFtZSkpLnRvLmJlLnRydWUoKTtcbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGNhbGwgdGhlIHRoaXMuZGF0YVNlcnZpY2VfLmRyb3BJbmRleCBtZXRob2QgaWYgZGIgY29sbGVjdGlvbiBjb250YWlucyBleHRyYSBpbmRleGVzIHRoYW4gZGVzaXJlZFwiLCAoKSA9PiB7XG5cbiAgICAgIC8vIEFycmFuZ2VcbiAgICAgIGNvbnN0IG1vY2tJbmRleGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBcInRlc3RDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogXCJ0ZXN0SW5kZXhcIixcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2V5TmFtZVwiOiBcIm5ld0lkXCIsXG4gICAgICAgICAgICAgIFwia2V5U29ydE9yZGVyXCI6IDEuMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgXTtcblxuXG4gICAgICBjb25zdCBtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbiA9IFt7XG4gICAgICAgIFwidlwiOiAxLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJfaWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJfaWRfXCIsXG4gICAgICAgIFwibnNcIjogXCJ0ZXN0ZGIudGVzdENvbGxlY3Rpb25cIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJ2XCI6IDEsXG4gICAgICAgIFwia2V5XCI6IHtcbiAgICAgICAgICBcInRlc3RpZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcInRlc3RpZF8xXCIsXG4gICAgICAgIFwibnNcIjogXCJ0ZXN0ZGIudGVzdENvbGxlY3Rpb25cIlxuICAgICAgfVxuICAgICAgXTtcblxuICAgICAgZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy53aXRoQXJncyhcInRlc3RDb2xsZWN0aW9uXCIpLnJlc29sdmVzKG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LnJlc29sdmVzKHRydWUpO1xuICAgICAgZGF0YVNlcnZpY2UuZHJvcEluZGV4LnJlc29sdmVzKHRydWUpO1xuXG5cbiAgICAgIC8vIEFjdFxuICAgICAgY29uc3QgYWN0ID0gc3V0LmJ1aWxkSW5kZXhlcyhtb2NrSW5kZXhlcyk7XG5cbiAgICAgIC8vIEFzc2VydFxuICAgICAgcmV0dXJuIGFjdFxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmRyb3BJbmRleC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpO1xuICAgICAgICAgIGV4cGVjdChkYXRhU2VydmljZS5kcm9wSW5kZXguY2FsbGVkV2l0aChcInRlc3RDb2xsZWN0aW9uXCIsIFwidGVzdGlkXzFcIikpLnRvLmJlLnRydWUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBjYWxsIHRoZSB0aGlzLmV2ZW50RW1pdHRlci5lbWl0IG1ldGhvZCBmb3IgYWxsIHRoZSBpbmRleGVzIHRvIGJlIGRyb3BwZWQgYW5kIGNyZWF0ZWRcIiwgKCkgPT4ge1xuXG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBtb2NrSW5kZXhlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIFwiY29sbGVjdGlvbk5hbWVcIjogXCJ0ZXN0Q29sbGVjdGlvblwiLFxuICAgICAgICAgIFwiaW5kZXhOYW1lXCI6IFwidGVzdEluZGV4XCIsXG4gICAgICAgICAgXCJpbmRleEtleXNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtleU5hbWVcIjogXCJuZXdJZFwiLFxuICAgICAgICAgICAgICBcImtleVNvcnRPcmRlclwiOiAxLjAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGNvbnN0IG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uID0gW3tcbiAgICAgICAgXCJ2XCI6IDEsXG4gICAgICAgIFwia2V5XCI6IHtcbiAgICAgICAgICBcIl9pZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcIl9pZF9cIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcInZcIjogMSxcbiAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgIFwidGVzdGlkXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJuYW1lXCI6IFwidGVzdGlkXzFcIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9XG4gICAgICBdO1xuXG4gICAgICBkYXRhU2VydmljZS5nZXRJbmRleGVzLndpdGhBcmdzKFwidGVzdENvbGxlY3Rpb25cIikucmVzb2x2ZXMobW9ja0NvbGxlY3Rpb25JbmRleGVzVGVzdENvbGxlY3Rpb24pO1xuICAgICAgZGF0YVNlcnZpY2UuY3JlYXRlSW5kZXgucmVzb2x2ZXModHJ1ZSk7XG4gICAgICBkYXRhU2VydmljZS5kcm9wSW5kZXgucmVzb2x2ZXModHJ1ZSk7XG5cbiAgICAgIC8vIEFjdFxuICAgICAgY29uc3QgYWN0ID0gc3V0LmJ1aWxkSW5kZXhlcyhtb2NrSW5kZXhlcyk7XG5cblxuICAgICAgLy8gQXNzZXJ0XG4gICAgICByZXR1cm4gYWN0XG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmNhbGxDb3VudCkudG8uZXF1YWwoNyk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzWzBdKS50by5pbmNsdWRlKFtcIkluZGV4IHN5bmNyb25pc2F0aW9uIHN0YXJ0ZWQgQCA6IFwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzW3N1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzLmxlbmd0aCAtIDFdKS50by5pbmNsdWRlKFtcIkluZGV4IHN5bmMgaXMgY29tcGxldGVkLlwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5jYWxsQ291bnQpLnRvLmVxdWFsKDcpO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJnc1sxXSkudG8uaW5jbHVkZShbXCJMaXN0IG9mIGNvbGxlY3Rpb25zIHRvIGJlIGJ1aWx0IDpcIiwgXCJ0ZXN0Q29sbGVjdGlvblwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzWzJdKS50by5pbmNsdWRlKFtcIlN0YXJ0aW5nIGluZGV4IGRyb3BwaW5nIEZvciA6XCIsIFwidGVzdGlkXzFcIl0pO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLmVtaXQuYXJnc1szXSkudG8uaW5jbHVkZShbXCJDb21wbGV0ZWQgaW5kZXggZHJvcHBpbmcgRm9yIDpcIiwgXCJ0ZXN0aWRfMVwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzWzNdKS50by5pbmNsdWRlKFtcIkNvbXBsZXRlZCBpbmRleCBkcm9wcGluZyBGb3IgOlwiLCBcInRlc3RpZF8xXCJdKTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmFyZ3NbNF0pLnRvLmluY2x1ZGUoW1wiU3RhcnRpbmcgaW5kZXggY3JlYXRpb24gRm9yIDpcIiwgXCJLZXlzIDoge1xcXCJuZXdJZFxcXCI6MX0sIE9wdGlvbnMgOiB7XFxcIm5hbWVcXFwiOlxcXCJ0ZXN0SW5kZXhcXFwifVwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzWzVdKS50by5pbmNsdWRlKFtcIkNvbXBsZXRlZCBpbmRleCBjcmVhdGlvbiBGb3IgOlwiLCBcIktleXMgOiB7XFxcIm5ld0lkXFxcIjoxfSwgT3B0aW9ucyA6IHtcXFwibmFtZVxcXCI6XFxcInRlc3RJbmRleFxcXCJ9XCJdKTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5vbi5jYWxsQ291bnQpLnRvLmVxdWFsKDkpO1xuICAgICAgICAgIGV4cGVjdChzdXQuZXZlbnRFbWl0dGVyLm9uLmFyZ3MubWFwKGl0ZW0gPT4gaXRlbVswXSkpLnRvLmluY2x1ZGUoT2JqZWN0LmtleXMoY3VzdG9tRXZlbnRzLmluZGV4RXZlbnRzKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgY2FsbCB0aGUgdGhpcy5kYXRhU2VydmljZV8uY3JlYXRlSW5kZXggbWV0aG9kIHdpdGggaW5kZXggbGlzdCB3aGljaCBhcmUgbm90IHByZXNlbnQgaW4gZGIgY29sbGVjdGlvbnNcIiwgKCkgPT4ge1xuXG5cbiAgICAgIC8vIEFycmFuZ2VcbiAgICAgIGNvbnN0IG1vY2tJbmRleGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBcInRlc3RDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogXCJ0ZXN0SW5kZXhcIixcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2V5TmFtZVwiOiBcIm5ld0lkXCIsXG4gICAgICAgICAgICAgIFwia2V5U29ydE9yZGVyXCI6IDEuMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgXTtcblxuXG4gICAgICBjb25zdCBtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbiA9IFt7XG4gICAgICAgIFwidlwiOiAxLFxuICAgICAgICBcImtleVwiOiB7XG4gICAgICAgICAgXCJfaWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJfaWRfXCIsXG4gICAgICAgIFwibnNcIjogXCJ0ZXN0ZGIudGVzdENvbGxlY3Rpb25cIlxuICAgICAgfV07XG5cbiAgICAgIGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMud2l0aEFyZ3MoXCJ0ZXN0Q29sbGVjdGlvblwiKS5yZXNvbHZlcyhtb2NrQ29sbGVjdGlvbkluZGV4ZXNUZXN0Q29sbGVjdGlvbik7XG4gICAgICBkYXRhU2VydmljZS5jcmVhdGVJbmRleC5yZXNvbHZlcyh0cnVlKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmRyb3BJbmRleC5yZXNvbHZlcyh0cnVlKTtcblxuXG4gICAgICAvLyBBY3RcbiAgICAgIGNvbnN0IGFjdCA9IHN1dC5idWlsZEluZGV4ZXMobW9ja0luZGV4ZXMpO1xuXG4gICAgICAvLyBBc3NlcnRcbiAgICAgIHJldHVybiBhY3RcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChkYXRhU2VydmljZS5jcmVhdGVJbmRleC5jYWxsQ291bnQpLnRvLmVxdWFsKDEpO1xuICAgICAgICAgIGV4cGVjdChkYXRhU2VydmljZS5jcmVhdGVJbmRleC5jYWxsZWRXaXRoKFwidGVzdENvbGxlY3Rpb25cIiwge1wibmV3SWRcIjogMX0sIHtcIm5hbWVcIjogXCJ0ZXN0SW5kZXhcIn0pKS50by5iZS50cnVlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbm90IGNhbGwgdGhlIHRoaXMuZGF0YVNlcnZpY2VfLmRyb3BJbmRleCBhbmQgdGhpcy5kYXRhU2VydmljZV8uY3JlYXRlSW5kZXggbWV0aG9kcyBpZiBkYiBjb2xsZWN0aW9ucyBjb250YWluIGFsbCB0aGUgZGVzaXJlZCBpbmRleGVzXCIsICgpID0+IHtcblxuICAgICAgLy8gQXJyYW5nZVxuICAgICAgY29uc3QgbW9ja0luZGV4ZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBcImNvbGxlY3Rpb25OYW1lXCI6IFwidGVzdENvbGxlY3Rpb25cIixcbiAgICAgICAgICBcImluZGV4TmFtZVwiOiBcInRlc3RJbmRleFwiLFxuICAgICAgICAgIFwiaW5kZXhLZXlzXCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJrZXlOYW1lXCI6IFwibmV3SWRcIixcbiAgICAgICAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogMS4wMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICBdO1xuXG5cbiAgICAgIGNvbnN0IG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uID0gW3tcbiAgICAgICAgXCJ2XCI6IDEsXG4gICAgICAgIFwia2V5XCI6IHtcbiAgICAgICAgICBcIl9pZFwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwibmFtZVwiOiBcIl9pZF9cIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcInZcIjogMSxcbiAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgIFwibmV3SWRcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcIm5hbWVcIjogXCJ0ZXN0SW5kZXhcIixcbiAgICAgICAgXCJuc1wiOiBcInRlc3RkYi50ZXN0Q29sbGVjdGlvblwiXG4gICAgICB9XTtcblxuICAgICAgZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcy53aXRoQXJncyhcInRlc3RDb2xsZWN0aW9uXCIpLnJlc29sdmVzKG1vY2tDb2xsZWN0aW9uSW5kZXhlc1Rlc3RDb2xsZWN0aW9uKTtcbiAgICAgIGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LnJlc29sdmVzKHRydWUpO1xuICAgICAgZGF0YVNlcnZpY2UuZHJvcEluZGV4LnJlc29sdmVzKHRydWUpO1xuXG5cbiAgICAgIC8vIEFjdFxuICAgICAgY29uc3QgYWN0ID0gc3V0LmJ1aWxkSW5kZXhlcyhtb2NrSW5kZXhlcyk7XG5cbiAgICAgIC8vIEFzc2VydFxuICAgICAgcmV0dXJuIGFjdFxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4LmNhbGxDb3VudCkudG8uZXF1YWwoMCk7XG4gICAgICAgICAgZXhwZWN0KGRhdGFTZXJ2aWNlLmRyb3BJbmRleC5jYWxsQ291bnQpLnRvLmVxdWFsKDApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJlamVjdCB3aGVuIHdoZW4gZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcyB0aHJvd3NcIiwgKCkgPT4ge1xuXG4gICAgICAvLyBBcnJhbmdlXG4gICAgICBjb25zdCBtb2NrSW5kZXhlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIFwiY29sbGVjdGlvbk5hbWVcIjogXCJ0ZXN0Q29sbGVjdGlvblwiLFxuICAgICAgICAgIFwiaW5kZXhOYW1lXCI6IFwidGVzdEluZGV4XCIsXG4gICAgICAgICAgXCJpbmRleEtleXNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcImtleU5hbWVcIjogXCJuZXdJZFwiLFxuICAgICAgICAgICAgICBcImtleVNvcnRPcmRlclwiOiAxLjAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGNvbnN0IHNvbWV0aGluZ1dlbnRXcm9uZ0Vycm9yID0gbmV3IEVycm9yKFwiU29tZXRoaW5nIHdlbnQgd3JvbmdcIik7XG4gICAgICBkYXRhU2VydmljZS5nZXRJbmRleGVzLnJlamVjdHMoc29tZXRoaW5nV2VudFdyb25nRXJyb3IpO1xuXG4gICAgICAvLyBBY3RcbiAgICAgIGNvbnN0IGFjdCA9IHN1dC5idWlsZEluZGV4ZXMobW9ja0luZGV4ZXMpO1xuXG5cbiAgICAgIC8vIEFzc2VydFxuICAgICAgcmV0dXJuIGFjdFxuICAgICAgICAudGhlbigoKSA9PiBmYWlsKFwic2hvdWxkIHJlamVjdFwiKSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XG5cbiAgICAgICAgICBleHBlY3QoZXJyLm1lc3NhZ2UpLnRvLmVxdWFsKFwiRXJyb3IgaW4gYnVpbGRpbmcgaW5kZXhlcyA6IFNvbWV0aGluZyB3ZW50IHdyb25nXCIpO1xuICAgICAgICAgIFNpbm9uLmFzc2VydC5jYWxsZWRPbmNlKGRhdGFTZXJ2aWNlLmdldEluZGV4ZXMpO1xuICAgICAgICAgIFNpbm9uLmFzc2VydC5ub3RDYWxsZWQoZGF0YVNlcnZpY2UuZHJvcEluZGV4KTtcbiAgICAgICAgICBTaW5vbi5hc3NlcnQubm90Q2FsbGVkKGRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4KTtcbiAgICAgICAgICBleHBlY3Qoc3V0LmV2ZW50RW1pdHRlci5lbWl0LmNhbGxDb3VudCkudG8uZXF1YWwoMyk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzWzBdKS50by5pbmNsdWRlKFtcIkluZGV4IHN5bmNyb25pc2F0aW9uIHN0YXJ0ZWQgQCA6IFwiXSk7XG4gICAgICAgICAgZXhwZWN0KHN1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzW3N1dC5ldmVudEVtaXR0ZXIuZW1pdC5hcmdzLmxlbmd0aCAtIDFdKS50by5pbmNsdWRlKFtjdXN0b21FdmVudHMuaW5kZXhFdmVudHMuRXJyb3JdKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCByZWplY3QgZXZlbnRFbWl0dGVyIHRocm93c1wiLCAoKSA9PiB7XG5cbiAgICAgIC8vIEFycmFuZ2VcbiAgICAgIGNvbnN0IG1vY2tJbmRleGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBcInRlc3RDb2xsZWN0aW9uXCIsXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogXCJ0ZXN0SW5kZXhcIixcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwia2V5TmFtZVwiOiBcIm5ld0lkXCIsXG4gICAgICAgICAgICAgIFwia2V5U29ydE9yZGVyXCI6IDEuMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgY29uc3Qgc29tZXRoaW5nV2VudFdyb25nRXJyb3IgPSBuZXcgRXJyb3IoXCJTb21ldGhpbmcgd2VudCB3cm9uZ1wiKTtcbiAgICAgIE1vY2tFdmVudEVtaXR0ZXIuZW1pdC50aHJvd3Moc29tZXRoaW5nV2VudFdyb25nRXJyb3IpO1xuXG4gICAgICAvLyBBY3RcbiAgICAgIGNvbnN0IGFjdCA9IHN1dC5idWlsZEluZGV4ZXMobW9ja0luZGV4ZXMpO1xuXG5cbiAgICAgIC8vIEFzc2VydFxuICAgICAgcmV0dXJuIGFjdFxuICAgICAgICAudGhlbigoKSA9PiBmYWlsKFwic2hvdWxkIHJlamVjdFwiKSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XG5cbiAgICAgICAgICBleHBlY3QoZXJyLm1lc3NhZ2UpLnRvLmVxdWFsKFwiU29tZXRoaW5nIHdlbnQgd3JvbmdcIik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcImdldEluZGV4QnVpbGRlclwiLCAoKSA9PiB7XG5cblxuICAgIGl0KFwic2hvdWxkIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiBpbmRleCBidWlsZGVyIHNlcnZpY2UgZm9yIHRoZSBmaXJzdCB0aW1lIGFuZCBzYW1lIG9iamVjdCBmbyB0aGUgc2Vjb25kIHRpbWVcIiwgZG9uZSA9PiB7XG5cbiAgICAgIC8vIEFycmFuZ2VcblxuICAgICAgLy8gQWN0XG4gICAgICBjb25zdCBpbmRleEJ1bGRlciA9IGdldEluZGV4QnVpbGRlcih7ZGF0YVNlcnZpY2UsIE1vY2tMb2dnZXJ9KTtcbiAgICAgIGNvbnN0IGluZGV4QnVsZGVyTmV3ID0gZ2V0SW5kZXhCdWlsZGVyKHtkYXRhU2VydmljZSwgTW9ja0xvZ2dlcn0pO1xuXG4gICAgICAvLyBBc3NlcnRcblxuICAgICAgZXhwZWN0KGluZGV4QnVsZGVyKS50by5lcXVhbChpbmRleEJ1bGRlck5ldyk7XG4gICAgICBleHBlY3QoaW5kZXhCdWxkZXIpLnRvLmV4aXN0KCkuYW5kLmJlLmFuLm9iamVjdCgpO1xuICAgICAgZXhwZWN0KGluZGV4QnVsZGVyKS50by5vbmx5LmluY2x1ZGUoXCJldmVudEVtaXR0ZXJcIik7XG4gICAgICBleHBlY3QoaW5kZXhCdWxkZXIuYnVpbGRJbmRleGVzKS50by5leGlzdCgpLmFuZC5iZS5hLmZ1bmN0aW9uKCk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgfSk7XG5cbn0pO1xuIl19
//# sourceMappingURL=indexBuilder.js.map
