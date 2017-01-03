"use strict";

var _createMongo = require("./../mocks/create-mongo");

var _createMongo2 = _interopRequireDefault(_createMongo);

var _lab = require("lab");

var _lab2 = _interopRequireDefault(_lab);

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _logger = require("./../mocks/logger");

var _logger2 = _interopRequireDefault(_logger);

var _mongoService = require("./../../../dist/services/mongoService");

var _mongoService2 = _interopRequireDefault(_mongoService);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _code = require("code");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lab = exports.lab = _lab2.default.script(); /* eslint-disable no-shadow */
var after = lab.after,
    before = lab.before,
    beforeEach = lab.beforeEach,
    experiment = lab.experiment,
    test = lab.test;


experiment("mongoService", { "timeout": 5000 }, function () {

  var mongoConnectionFactory = void 0;
  var testCollectionName = void 0;
  var db = void 0;

  before(function () {

    mongoConnectionFactory = (0, _createMongo2.default)();
    db = mongoConnectionFactory.getConnection();

    return db;
  });

  beforeEach({ "timeout": 5000 }, function () {

    testCollectionName = (0, _uuid2.default)().toString();

    return db.then(function (_ref) {
      var db = _ref.db;
      return db.collection(testCollectionName).insertOne({
        "_id": "1234"
      });
    }).then(function (document) {
      (0, _code.expect)(document.insertedCount).to.equal(1);
    });
  });

  after({ "timeout": 5000 }, function (done) {

    if (mongoConnectionFactory) {
      return mongoConnectionFactory.shutdown(function () {
        return done();
      });
    }

    return done();
  });

  test("createIndex method should return a q promise and build the index with default build options if nothing is passed", function () {

    // Arrange
    var sut = new _mongoService2.default({
      "loggerService": _logger2.default,
      "mongoConnectionFactory": mongoConnectionFactory
    });

    var mockIndexKeys = { "name": 1, "address.geocode": "2dsphere" };
    var expected = {
      "v": 1,
      "key": mockIndexKeys,
      "name": "name_1_address.geocode_2dsphere"
    };

    // Act
    var actual = sut.createIndex(testCollectionName, mockIndexKeys);

    // Assert
    (0, _code.expect)(_q2.default.isPromise(actual)).to.be.true();

    return actual.then(function (actual) {
      return (0, _code.expect)(actual).to.equal("name_1_address.geocode_2dsphere");
    }).then(function () {
      return sut.getIndexes(testCollectionName);
    }).then(function (indexes) {
      return (0, _code.expect)(indexes).to.part.include(expected);
    });
  });

  test("createIndex method should return a q promise and respect the index types and index build options", function () {

    // Arrange
    var sut = new _mongoService2.default({
      "loggerService": _logger2.default,
      "mongoConnectionFactory": mongoConnectionFactory
    });

    var mockIndexKeys = { "name": 1, "address.geocode": "2dsphere" };
    var mockIndexOptions = { "name": "testIndex", "background": true };
    var expected = {
      "key": mockIndexKeys,
      "name": "testIndex",
      "background": true,
      "2dsphereIndexVersion": 3
    };

    // Act
    var actual = sut.createIndex(testCollectionName, mockIndexKeys, mockIndexOptions);

    // Assert
    (0, _code.expect)(_q2.default.isPromise(actual)).to.be.true();

    return actual.then(function (actual) {
      return (0, _code.expect)(actual).to.equal("testIndex");
    }).then(function () {
      return sut.getIndexes(testCollectionName);
    }).then(function (indexes) {
      return (0, _code.expect)(indexes).to.part.include(expected);
    });
  });

  test("createIndex should logWrapAndThrow on an error", function () {

    // Arrange
    var errorMessage = "My Error Message";
    var sut = new _mongoService2.default({
      "loggerService": _logger2.default,
      "mongoConnectionFactory": {
        getConnection: function getConnection() {
          return Promise.reject(new Error(errorMessage));
        }
      }
    });
    var mockIndexKeys = { "name": 1, "address.geocode": "2dsphere" };

    // Act
    var act = sut.createIndex(testCollectionName, mockIndexKeys);

    // Assert

    return act.catch(function (error) {
      return (0, _code.expect)(error.message).to.equal(errorMessage);
    });
  });

  test("dropIndex method should return a q promise and resolve by dropping the index from the collection", function () {

    // Arrange
    var sut = new _mongoService2.default({
      "loggerService": _logger2.default,
      "mongoConnectionFactory": mongoConnectionFactory
    });

    var mockIndexKeys = { "name": 1, "address.geocode": "2dsphere" };
    var expected = {
      "key": mockIndexKeys,
      "name": "name_1_address.geocode_2dsphere"
    };
    var arrange = sut.createIndex(testCollectionName, mockIndexKeys);

    // Act
    var actual = arrange.then(function (indexName) {
      (0, _code.expect)(indexName).to.equal("name_1_address.geocode_2dsphere");
      return indexName;
    }).then(function (indexName) {
      return sut.dropIndex(testCollectionName, indexName);
    });

    // Assert
    (0, _code.expect)(_q2.default.isPromise(actual)).to.be.true();

    return actual.then(function () {
      return sut.getIndexes(testCollectionName);
    }).then(function (indexList) {
      return (0, _code.expect)(indexList).to.not.include(expected);
    });
  });

  test("dropIndex should logWrapAndThrow on an error", function () {

    // Arrange
    var errorMessage = "My Error Message";
    var sut = new _mongoService2.default({
      "loggerService": _logger2.default,
      "mongoConnectionFactory": {
        getConnection: function getConnection() {
          return Promise.reject(new Error(errorMessage));
        }
      }
    });
    var mockIndexName = "testIndex";

    // Act
    var act = sut.dropIndex(testCollectionName, mockIndexName);

    // Assert

    return act.catch(function (error) {
      return (0, _code.expect)(error.message).to.equal(errorMessage);
    });
  });

  test("getIndexes method should return a q promise", function () {

    // Arrange
    var sut = new _mongoService2.default({
      "loggerService": _logger2.default,
      "mongoConnectionFactory": mongoConnectionFactory
    });

    var expected = [{
      "v": 1,
      "key": {
        "_id": 1
      },
      "name": "_id_",
      "ns": "testDatabase." + testCollectionName
    }];

    // Act
    var actual = sut.getIndexes(testCollectionName);

    // Assert
    (0, _code.expect)(_q2.default.isPromise(actual)).to.be.true();

    return actual.then(function (actual) {
      (0, _code.expect)(actual).to.equal(expected);
    });
  });

  test("getIndexes should logWrapAndThrow on an error", function () {

    // Arrange
    var errorMessage = "My Error Message";
    var sut = new _mongoService2.default({
      "loggerService": _logger2.default,
      "mongoConnectionFactory": {
        getConnection: function getConnection() {
          return Promise.reject(new Error(errorMessage));
        }
      }
    });

    // Act
    var act = sut.getIndexes(testCollectionName);

    // Assert
    return act.catch(function (error) {
      return (0, _code.expect)(error.message).to.equal(errorMessage);
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvc2VydmljZXMvbW9uZ29TZXJ2aWNlLmVzNiJdLCJuYW1lcyI6WyJsYWIiLCJleHBvcnRzIiwic2NyaXB0IiwiYWZ0ZXIiLCJiZWZvcmUiLCJiZWZvcmVFYWNoIiwiZXhwZXJpbWVudCIsInRlc3QiLCJtb25nb0Nvbm5lY3Rpb25GYWN0b3J5IiwidGVzdENvbGxlY3Rpb25OYW1lIiwiZGIiLCJnZXRDb25uZWN0aW9uIiwidG9TdHJpbmciLCJ0aGVuIiwiY29sbGVjdGlvbiIsImluc2VydE9uZSIsImRvY3VtZW50IiwiaW5zZXJ0ZWRDb3VudCIsInRvIiwiZXF1YWwiLCJzaHV0ZG93biIsImRvbmUiLCJzdXQiLCJtb2NrSW5kZXhLZXlzIiwiZXhwZWN0ZWQiLCJhY3R1YWwiLCJjcmVhdGVJbmRleCIsImlzUHJvbWlzZSIsImJlIiwidHJ1ZSIsImdldEluZGV4ZXMiLCJpbmRleGVzIiwicGFydCIsImluY2x1ZGUiLCJtb2NrSW5kZXhPcHRpb25zIiwiZXJyb3JNZXNzYWdlIiwiUHJvbWlzZSIsInJlamVjdCIsIkVycm9yIiwiYWN0IiwiY2F0Y2giLCJlcnJvciIsIm1lc3NhZ2UiLCJhcnJhbmdlIiwiaW5kZXhOYW1lIiwiZHJvcEluZGV4IiwiaW5kZXhMaXN0Iiwibm90IiwibW9ja0luZGV4TmFtZSJdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUdBLElBQU1BLE1BQU1DLFFBQVFELEdBQVIsR0FBYyxjQUFJRSxNQUFKLEVBQTFCLEMsQ0FWQTtJQVdPQyxLLEdBQStDSCxHLENBQS9DRyxLO0lBQU9DLE0sR0FBd0NKLEcsQ0FBeENJLE07SUFBUUMsVSxHQUFnQ0wsRyxDQUFoQ0ssVTtJQUFZQyxVLEdBQW9CTixHLENBQXBCTSxVO0lBQVlDLEksR0FBUVAsRyxDQUFSTyxJOzs7QUFHOUNELFdBQVcsY0FBWCxF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O0FBQ0EsUUFBTUksTUFBTWpCLElBQUlRLFVBQUosQ0FBZXJCLGtCQUFmLENBQVo7O0FBRUE7QUFDQSxXQUFPOEIsSUFDSkMsS0FESSxDQUNFO0FBQUEsYUFBUyxrQkFBT0MsTUFBTUMsT0FBYixFQUFzQnhCLEVBQXRCLENBQXlCQyxLQUF6QixDQUErQmdCLFlBQS9CLENBQVQ7QUFBQSxLQURGLENBQVA7QUFFRCxHQW5CRDtBQXFCRCxDQS9ORCIsImZpbGUiOiJtb25nb1NlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1zaGFkb3cgKi9cbmltcG9ydCBDcmVhdGVNb25nb01vY2sgZnJvbSBcIi4vLi4vbW9ja3MvY3JlYXRlLW1vbmdvXCI7XG5pbXBvcnQgTGFiIGZyb20gXCJsYWJcIjtcbmltcG9ydCBRIGZyb20gXCJxXCI7XG5pbXBvcnQgTW9ja0xvZ2dlciBmcm9tIFwiLi8uLi9tb2Nrcy9sb2dnZXJcIjtcbmltcG9ydCBTdXQgZnJvbSBcIi4vLi4vLi4vLi4vZGlzdC9zZXJ2aWNlcy9tb25nb1NlcnZpY2VcIjtcbmltcG9ydCBVdWlkIGZyb20gXCJ1dWlkXCI7XG5pbXBvcnQge2V4cGVjdH0gZnJvbSBcImNvZGVcIjtcblxuXG5jb25zdCBsYWIgPSBleHBvcnRzLmxhYiA9IExhYi5zY3JpcHQoKTtcbmNvbnN0IHthZnRlciwgYmVmb3JlLCBiZWZvcmVFYWNoLCBleHBlcmltZW50LCB0ZXN0fSA9IGxhYjtcblxuXG5leHBlcmltZW50KFwibW9uZ29TZXJ2aWNlXCIsIHtcInRpbWVvdXRcIjogNTAwMH0sICgpID0+IHtcblxuICBsZXQgbW9uZ29Db25uZWN0aW9uRmFjdG9yeTtcbiAgbGV0IHRlc3RDb2xsZWN0aW9uTmFtZTtcbiAgbGV0IGRiO1xuXG4gIGJlZm9yZShmdW5jdGlvbiAoKSB7XG5cbiAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gQ3JlYXRlTW9uZ29Nb2NrKCk7XG4gICAgZGIgPSBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5LmdldENvbm5lY3Rpb24oKTtcblxuICAgIHJldHVybiBkYjtcbiAgfSk7XG5cbiAgYmVmb3JlRWFjaCh7XCJ0aW1lb3V0XCI6IDUwMDB9LCAoKSA9PiB7XG5cbiAgICB0ZXN0Q29sbGVjdGlvbk5hbWUgPSBVdWlkKCkudG9TdHJpbmcoKTtcblxuICAgIHJldHVybiBkYlxuICAgICAgLnRoZW4oKHtkYn0pID0+IGRiLmNvbGxlY3Rpb24odGVzdENvbGxlY3Rpb25OYW1lKS5pbnNlcnRPbmUoe1xuICAgICAgICBcIl9pZFwiOiBcIjEyMzRcIlxuICAgICAgfSkpXG4gICAgICAudGhlbihkb2N1bWVudCA9PiB7XG4gICAgICAgIGV4cGVjdChkb2N1bWVudC5pbnNlcnRlZENvdW50KS50by5lcXVhbCgxKTtcbiAgICAgIH0pO1xuICB9KTtcblxuICBhZnRlcih7XCJ0aW1lb3V0XCI6IDUwMDB9LCBkb25lID0+IHtcblxuICAgIGlmIChtb25nb0Nvbm5lY3Rpb25GYWN0b3J5KSB7XG4gICAgICByZXR1cm4gbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5zaHV0ZG93bigoKSA9PiBkb25lKCkpO1xuICAgIH1cblxuICAgIHJldHVybiBkb25lKCk7XG4gIH0pO1xuXG4gIHRlc3QoXCJjcmVhdGVJbmRleCBtZXRob2Qgc2hvdWxkIHJldHVybiBhIHEgcHJvbWlzZSBhbmQgYnVpbGQgdGhlIGluZGV4IHdpdGggZGVmYXVsdCBidWlsZCBvcHRpb25zIGlmIG5vdGhpbmcgaXMgcGFzc2VkXCIsICgpID0+IHtcblxuICAgIC8vIEFycmFuZ2VcbiAgICBjb25zdCBzdXQgPSBuZXcgU3V0KHtcbiAgICAgIFwibG9nZ2VyU2VydmljZVwiOiBNb2NrTG9nZ2VyLFxuICAgICAgXCJtb25nb0Nvbm5lY3Rpb25GYWN0b3J5XCI6IG1vbmdvQ29ubmVjdGlvbkZhY3RvcnlcbiAgICB9KTtcblxuICAgIGNvbnN0IG1vY2tJbmRleEtleXMgPSB7XCJuYW1lXCI6IDEsIFwiYWRkcmVzcy5nZW9jb2RlXCI6IFwiMmRzcGhlcmVcIn07XG4gICAgY29uc3QgZXhwZWN0ZWQgPSB7XG4gICAgICBcInZcIjogMSxcbiAgICAgIFwia2V5XCI6IG1vY2tJbmRleEtleXMsXG4gICAgICBcIm5hbWVcIjogXCJuYW1lXzFfYWRkcmVzcy5nZW9jb2RlXzJkc3BoZXJlXCJcbiAgICB9O1xuXG4gICAgLy8gQWN0XG4gICAgY29uc3QgYWN0dWFsID0gc3V0LmNyZWF0ZUluZGV4KHRlc3RDb2xsZWN0aW9uTmFtZSwgbW9ja0luZGV4S2V5cyk7XG5cbiAgICAvLyBBc3NlcnRcbiAgICBleHBlY3QoUS5pc1Byb21pc2UoYWN0dWFsKSkudG8uYmUudHJ1ZSgpO1xuXG5cbiAgICByZXR1cm4gYWN0dWFsXG4gICAgICAudGhlbihhY3R1YWwgPT4gZXhwZWN0KGFjdHVhbCkudG8uZXF1YWwoXCJuYW1lXzFfYWRkcmVzcy5nZW9jb2RlXzJkc3BoZXJlXCIpKVxuICAgICAgLnRoZW4oKCkgPT4gc3V0LmdldEluZGV4ZXModGVzdENvbGxlY3Rpb25OYW1lKSlcbiAgICAgIC50aGVuKGluZGV4ZXMgPT4gZXhwZWN0KGluZGV4ZXMpLnRvLnBhcnQuaW5jbHVkZShleHBlY3RlZCkpO1xuICB9KTtcblxuICB0ZXN0KFwiY3JlYXRlSW5kZXggbWV0aG9kIHNob3VsZCByZXR1cm4gYSBxIHByb21pc2UgYW5kIHJlc3BlY3QgdGhlIGluZGV4IHR5cGVzIGFuZCBpbmRleCBidWlsZCBvcHRpb25zXCIsICgpID0+IHtcblxuICAgIC8vIEFycmFuZ2VcbiAgICBjb25zdCBzdXQgPSBuZXcgU3V0KHtcbiAgICAgIFwibG9nZ2VyU2VydmljZVwiOiBNb2NrTG9nZ2VyLFxuICAgICAgXCJtb25nb0Nvbm5lY3Rpb25GYWN0b3J5XCI6IG1vbmdvQ29ubmVjdGlvbkZhY3RvcnlcbiAgICB9KTtcblxuICAgIGNvbnN0IG1vY2tJbmRleEtleXMgPSB7XCJuYW1lXCI6IDEsIFwiYWRkcmVzcy5nZW9jb2RlXCI6IFwiMmRzcGhlcmVcIn07XG4gICAgY29uc3QgbW9ja0luZGV4T3B0aW9ucyA9IHtcIm5hbWVcIjogXCJ0ZXN0SW5kZXhcIiwgXCJiYWNrZ3JvdW5kXCI6IHRydWV9O1xuICAgIGNvbnN0IGV4cGVjdGVkID0ge1xuICAgICAgXCJrZXlcIjogbW9ja0luZGV4S2V5cyxcbiAgICAgIFwibmFtZVwiOiBcInRlc3RJbmRleFwiLFxuICAgICAgXCJiYWNrZ3JvdW5kXCI6IHRydWUsXG4gICAgICBcIjJkc3BoZXJlSW5kZXhWZXJzaW9uXCI6IDNcbiAgICB9O1xuXG4gICAgLy8gQWN0XG4gICAgY29uc3QgYWN0dWFsID0gc3V0LmNyZWF0ZUluZGV4KHRlc3RDb2xsZWN0aW9uTmFtZSwgbW9ja0luZGV4S2V5cywgbW9ja0luZGV4T3B0aW9ucyk7XG5cbiAgICAvLyBBc3NlcnRcbiAgICBleHBlY3QoUS5pc1Byb21pc2UoYWN0dWFsKSkudG8uYmUudHJ1ZSgpO1xuXG5cbiAgICByZXR1cm4gYWN0dWFsXG4gICAgICAudGhlbihhY3R1YWwgPT4gZXhwZWN0KGFjdHVhbCkudG8uZXF1YWwoXCJ0ZXN0SW5kZXhcIikpXG4gICAgICAudGhlbigoKSA9PiBzdXQuZ2V0SW5kZXhlcyh0ZXN0Q29sbGVjdGlvbk5hbWUpKVxuICAgICAgLnRoZW4oaW5kZXhlcyA9PiBleHBlY3QoaW5kZXhlcykudG8ucGFydC5pbmNsdWRlKGV4cGVjdGVkKSk7XG4gIH0pO1xuXG4gIHRlc3QoXCJjcmVhdGVJbmRleCBzaG91bGQgbG9nV3JhcEFuZFRocm93IG9uIGFuIGVycm9yXCIsICgpID0+IHtcblxuICAgIC8vIEFycmFuZ2VcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBcIk15IEVycm9yIE1lc3NhZ2VcIjtcbiAgICBjb25zdCBzdXQgPSBuZXcgU3V0KHtcbiAgICAgIFwibG9nZ2VyU2VydmljZVwiOiBNb2NrTG9nZ2VyLFxuICAgICAgXCJtb25nb0Nvbm5lY3Rpb25GYWN0b3J5XCI6IHtcbiAgICAgICAgZ2V0Q29ubmVjdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGVycm9yTWVzc2FnZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgbW9ja0luZGV4S2V5cyA9IHtcIm5hbWVcIjogMSwgXCJhZGRyZXNzLmdlb2NvZGVcIjogXCIyZHNwaGVyZVwifTtcblxuICAgIC8vIEFjdFxuICAgIGNvbnN0IGFjdCA9IHN1dC5jcmVhdGVJbmRleCh0ZXN0Q29sbGVjdGlvbk5hbWUsIG1vY2tJbmRleEtleXMpO1xuXG4gICAgLy8gQXNzZXJ0XG5cbiAgICByZXR1cm4gYWN0XG4gICAgICAuY2F0Y2goZXJyb3IgPT4gZXhwZWN0KGVycm9yLm1lc3NhZ2UpLnRvLmVxdWFsKGVycm9yTWVzc2FnZSkpO1xuXG4gIH0pO1xuXG4gIHRlc3QoXCJkcm9wSW5kZXggbWV0aG9kIHNob3VsZCByZXR1cm4gYSBxIHByb21pc2UgYW5kIHJlc29sdmUgYnkgZHJvcHBpbmcgdGhlIGluZGV4IGZyb20gdGhlIGNvbGxlY3Rpb25cIiwgKCkgPT4ge1xuXG4gICAgLy8gQXJyYW5nZVxuICAgIGNvbnN0IHN1dCA9IG5ldyBTdXQoe1xuICAgICAgXCJsb2dnZXJTZXJ2aWNlXCI6IE1vY2tMb2dnZXIsXG4gICAgICBcIm1vbmdvQ29ubmVjdGlvbkZhY3RvcnlcIjogbW9uZ29Db25uZWN0aW9uRmFjdG9yeVxuICAgIH0pO1xuXG4gICAgY29uc3QgbW9ja0luZGV4S2V5cyA9IHtcIm5hbWVcIjogMSwgXCJhZGRyZXNzLmdlb2NvZGVcIjogXCIyZHNwaGVyZVwifTtcbiAgICBjb25zdCBleHBlY3RlZCA9IHtcbiAgICAgIFwia2V5XCI6IG1vY2tJbmRleEtleXMsXG4gICAgICBcIm5hbWVcIjogXCJuYW1lXzFfYWRkcmVzcy5nZW9jb2RlXzJkc3BoZXJlXCJcbiAgICB9O1xuICAgIGNvbnN0IGFycmFuZ2UgPSBzdXQuY3JlYXRlSW5kZXgodGVzdENvbGxlY3Rpb25OYW1lLCBtb2NrSW5kZXhLZXlzKTtcblxuICAgIC8vIEFjdFxuICAgIGNvbnN0IGFjdHVhbCA9IGFycmFuZ2UudGhlbihpbmRleE5hbWUgPT4ge1xuICAgICAgZXhwZWN0KGluZGV4TmFtZSkudG8uZXF1YWwoXCJuYW1lXzFfYWRkcmVzcy5nZW9jb2RlXzJkc3BoZXJlXCIpO1xuICAgICAgcmV0dXJuIGluZGV4TmFtZTtcbiAgICB9KVxuICAgICAgLnRoZW4oaW5kZXhOYW1lID0+IHN1dC5kcm9wSW5kZXgodGVzdENvbGxlY3Rpb25OYW1lLCBpbmRleE5hbWUpKTtcblxuICAgIC8vIEFzc2VydFxuICAgIGV4cGVjdChRLmlzUHJvbWlzZShhY3R1YWwpKS50by5iZS50cnVlKCk7XG5cbiAgICByZXR1cm4gYWN0dWFsXG4gICAgICAudGhlbigoKSA9PiBzdXQuZ2V0SW5kZXhlcyh0ZXN0Q29sbGVjdGlvbk5hbWUpKVxuICAgICAgLnRoZW4oaW5kZXhMaXN0ID0+IGV4cGVjdChpbmRleExpc3QpLnRvLm5vdC5pbmNsdWRlKGV4cGVjdGVkKSk7XG4gIH0pO1xuXG4gIHRlc3QoXCJkcm9wSW5kZXggc2hvdWxkIGxvZ1dyYXBBbmRUaHJvdyBvbiBhbiBlcnJvclwiLCAoKSA9PiB7XG5cbiAgICAvLyBBcnJhbmdlXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJNeSBFcnJvciBNZXNzYWdlXCI7XG4gICAgY29uc3Qgc3V0ID0gbmV3IFN1dCh7XG4gICAgICBcImxvZ2dlclNlcnZpY2VcIjogTW9ja0xvZ2dlcixcbiAgICAgIFwibW9uZ29Db25uZWN0aW9uRmFjdG9yeVwiOiB7XG4gICAgICAgIGdldENvbm5lY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IG1vY2tJbmRleE5hbWUgPSBcInRlc3RJbmRleFwiO1xuXG4gICAgLy8gQWN0XG4gICAgY29uc3QgYWN0ID0gc3V0LmRyb3BJbmRleCh0ZXN0Q29sbGVjdGlvbk5hbWUsIG1vY2tJbmRleE5hbWUpO1xuXG4gICAgLy8gQXNzZXJ0XG5cbiAgICByZXR1cm4gYWN0XG4gICAgICAuY2F0Y2goZXJyb3IgPT4gZXhwZWN0KGVycm9yLm1lc3NhZ2UpLnRvLmVxdWFsKGVycm9yTWVzc2FnZSkpO1xuXG4gIH0pO1xuXG4gIHRlc3QoXCJnZXRJbmRleGVzIG1ldGhvZCBzaG91bGQgcmV0dXJuIGEgcSBwcm9taXNlXCIsICgpID0+IHtcblxuICAgIC8vIEFycmFuZ2VcbiAgICBjb25zdCBzdXQgPSBuZXcgU3V0KHtcbiAgICAgIFwibG9nZ2VyU2VydmljZVwiOiBNb2NrTG9nZ2VyLFxuICAgICAgXCJtb25nb0Nvbm5lY3Rpb25GYWN0b3J5XCI6IG1vbmdvQ29ubmVjdGlvbkZhY3RvcnlcbiAgICB9KTtcblxuICAgIGNvbnN0IGV4cGVjdGVkID0gW3tcbiAgICAgIFwidlwiOiAxLFxuICAgICAgXCJrZXlcIjoge1xuICAgICAgICBcIl9pZFwiOiAxXG4gICAgICB9LFxuICAgICAgXCJuYW1lXCI6IFwiX2lkX1wiLFxuICAgICAgXCJuc1wiOiBgdGVzdERhdGFiYXNlLiR7dGVzdENvbGxlY3Rpb25OYW1lfWBcbiAgICB9XTtcblxuICAgIC8vIEFjdFxuICAgIGNvbnN0IGFjdHVhbCA9IHN1dC5nZXRJbmRleGVzKHRlc3RDb2xsZWN0aW9uTmFtZSk7XG5cbiAgICAvLyBBc3NlcnRcbiAgICBleHBlY3QoUS5pc1Byb21pc2UoYWN0dWFsKSkudG8uYmUudHJ1ZSgpO1xuXG5cbiAgICByZXR1cm4gYWN0dWFsXG4gICAgICAudGhlbihhY3R1YWwgPT4ge1xuICAgICAgICBleHBlY3QoYWN0dWFsKS50by5lcXVhbChleHBlY3RlZCk7XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgdGVzdChcImdldEluZGV4ZXMgc2hvdWxkIGxvZ1dyYXBBbmRUaHJvdyBvbiBhbiBlcnJvclwiLCAoKSA9PiB7XG5cbiAgICAvLyBBcnJhbmdlXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gXCJNeSBFcnJvciBNZXNzYWdlXCI7XG4gICAgY29uc3Qgc3V0ID0gbmV3IFN1dCh7XG4gICAgICBcImxvZ2dlclNlcnZpY2VcIjogTW9ja0xvZ2dlcixcbiAgICAgIFwibW9uZ29Db25uZWN0aW9uRmFjdG9yeVwiOiB7XG4gICAgICAgIGdldENvbm5lY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQWN0XG4gICAgY29uc3QgYWN0ID0gc3V0LmdldEluZGV4ZXModGVzdENvbGxlY3Rpb25OYW1lKTtcblxuICAgIC8vIEFzc2VydFxuICAgIHJldHVybiBhY3RcbiAgICAgIC5jYXRjaChlcnJvciA9PiBleHBlY3QoZXJyb3IubWVzc2FnZSkudG8uZXF1YWwoZXJyb3JNZXNzYWdlKSk7XG4gIH0pO1xuXG59KTtcbiJdfQ==
//# sourceMappingURL=mongoService.js.map
