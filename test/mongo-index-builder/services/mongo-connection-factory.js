"use strict";

require("babel-polyfill");

var _events = require("events");

var _code = require("code");

var _lab = require("lab");

var _lab2 = _interopRequireDefault(_lab);

var _sinon = require("sinon");

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

require("source-map-support/register");

var _mongoConnectionFactory = require("./../../../dist/services/mongo-connection-factory");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lab = exports.lab = _lab2.default.script();
var before = lab.before,
    describe = lab.describe,
    after = lab.after,
    it = lab.it;


var connectionString = "mongodb://user:password@foo:27017/bar";

var ioTimeout = 200;

var loggerMock = {
  "debug": (0, _sinon.stub)(),
  "fatal": (0, _sinon.stub)(),
  "error": (0, _sinon.stub)(),
  "info": (0, _sinon.stub)(),
  "warn": (0, _sinon.stub)(),
  "trace": (0, _sinon.stub)()
};

var DbErrorMock = function (_Error) {
  _inherits(DbErrorMock, _Error);

  function DbErrorMock() {
    _classCallCheck(this, DbErrorMock);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _possibleConstructorReturn(this, (DbErrorMock.__proto__ || Object.getPrototypeOf(DbErrorMock)).call(this, args));
  }

  return DbErrorMock;
}(Error);

function getDbMock() {
  return Object.create(new _events.EventEmitter(), {
    "thisIsADbMock": { "value": "thisIsADbMock", "enumerable": true },
    "close": { "value": (0, _sinon.spy)(function (force, callback) {
        process.nextTick(function () {
          return callback(null, null);
        });
      }) }
  });
}

function getNativeDriverSuccessMock(dbMock) {
  return {
    connect: function connect(url, callback) {
      return process.nextTick(function () {
        return callback(null, dbMock || getDbMock());
      });
    }
  };
}

var connectionError = new Error("connection error");

var nativeDriverErrorMock = {
  connect: function connect(url, callback) {
    return process.nextTick(function () {
      return callback(connectionError, {});
    });
  }
};

var nativeDriverPendingMock = {
  connect: function connect() {}
};

function getEventDispatcher(signature) {
  return Object.create(new _events.EventEmitter(), {
    "signature": { "value": signature, "enumerable": true }
  });
}

describe("The db manager service", function () {

  var mongoConnectionFactory = void 0;

  describe("when \"logger \"is not passed to the constructor", function () {

    var constructionParams = {
      // logger missing
      "nativeDriver": getNativeDriverSuccessMock(),
      "ioTimeout": ioTimeout,
      "connectionString": connectionString
    };

    it("should throw an error", function (done) {

      (0, _code.expect)(function () {
        mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager(constructionParams);
      }).to.throw(Error, "Argument logger expected to be defined.");

      return done();
    });
  });

  describe("when \"nativeDriver\" is not passed to the constructor", function () {

    var constructionParams = {
      "logger": loggerMock,
      // nativeDriver missing
      "ioTimeout": ioTimeout,
      "connectionString": connectionString
    };

    it("should throw an error", function (done) {

      (0, _code.expect)(function () {
        mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager(constructionParams);
      }).to.throw(Error, "Argument nativeDriver expected to be defined.");

      return done();
    });
  });

  describe("when \"ioTimeout\" is not passed to the constructor", function () {

    var constructionParams = {
      "logger": loggerMock,
      "nativeDriver": getNativeDriverSuccessMock(),
      // ioTimeout missing
      "connectionString": connectionString
    };

    it("should throw an error", function (done) {

      (0, _code.expect)(function () {
        mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager(constructionParams);
      }).to.throw(Error, "Argument ioTimeout expected to be defined.");

      return done();
    });
  });

  describe("when \"connectionString\" is not passed to the constructor", function () {

    var constructionParams = {
      "logger": loggerMock,
      "nativeDriver": getNativeDriverSuccessMock(),
      "ioTimeout": ioTimeout
      // connectionString missing
    };

    it("should throw an error", function (done) {

      (0, _code.expect)(function () {
        mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager(constructionParams);
      }).to.throw(Error, "Argument connectionString expected to be defined.");

      return done();
    });
  });

  describe("when \"eventDispatcher\" is not passed to the constructor", function () {

    var constructionParams = {
      "logger": loggerMock,
      "nativeDriver": getNativeDriverSuccessMock(),
      "ioTimeout": ioTimeout,
      "connectionString": connectionString
      // eventDispatcher missing
    };

    it("should not throw an error (the param is optional)", function (done) {

      (0, _code.expect)(function () {
        mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager(constructionParams);
      }).to.not.throw();

      return done();
    });
  });

  describe("when an event dispatcher object passed to the constructor and the service called without a callback", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": getEventDispatcher("thisIsAnEventDispatcher")
      });

      return done();
    });

    it("should return the same event dispatcher", function () {

      return mongoConnectionFactory.getConnection().then(function (_ref) {
        var eventDispatcher = _ref.eventDispatcher;


        (0, _code.expect)(eventDispatcher).to.include({ "signature": "thisIsAnEventDispatcher" });
      });
    });
  });

  describe("when an event dispatcher object passed to the constructor and the service called with a callback", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": getEventDispatcher("thisIsAnEventDispatcher")
      });

      return done();
    });

    it("should return the same event dispatcher", function () {

      return mongoConnectionFactory.getConnection().then(function (_ref2) {
        var eventDispatcher = _ref2.eventDispatcher;


        (0, _code.expect)(eventDispatcher).to.include({ "signature": "thisIsAnEventDispatcher" });
      });
    });
  });

  describe("when no callback passed and connection is successful", function () {

    var ret = void 0;

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });
      ret = mongoConnectionFactory.getConnection();

      return done();
    });

    it("should return a promise which gets resolved to a db instance and an event dispatcher ", function () {

      (0, _code.expect)(_q2.default.isPromise(ret)).to.be.true();
      return ret.then(function (_ref3) {
        var db = _ref3.db,
            eventDispatcher = _ref3.eventDispatcher;

        (0, _code.expect)(db).to.include({ "thisIsADbMock": "thisIsADbMock" });
        (0, _code.expect)(eventDispatcher).to.be.an.instanceOf(_events.EventEmitter);
      });
    });
  });

  describe("when no callback passed and connection is not successful", function () {

    var ret = void 0;

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverErrorMock,
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });
      ret = mongoConnectionFactory.getConnection();

      return done();
    });

    it("should return a promise which gets rejected with a connection error", function (done) {

      (0, _code.expect)(_q2.default.isPromise(ret)).to.be.true();

      ret.then(function () {
        throw new Error("db connection should fail");
      }, function (err) {
        (0, _code.expect)(err).to.be.equal(connectionError);
        return done();
      });
    });
  });

  describe("when no callback passed and connection times out", function () {

    var ret = void 0;

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverPendingMock,
        "ioTimeout": 0,
        "connectionString": connectionString
      });
      ret = mongoConnectionFactory.getConnection();

      return done();
    });

    it("should return a promise which gets rejected with a timeout error", function (done) {

      (0, _code.expect)(_q2.default.isPromise(ret)).to.be.true();

      ret.then(function () {
        throw new Error("db connection should fail with a timeout error");
      }, function (err) {
        (0, _code.expect)(err.message).to.equal("Timed out after 0 ms");
        return done();
      });
    });
  });

  describe("when a callback passed and connection is successful", function () {

    var callback = void 0;
    var ret = void 0;
    var dbMock = getDbMock();
    var eventdispatcher = getEventDispatcher("thisIsAnEventDispatcher");

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(dbMock),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": eventdispatcher
      });
      callback = (0, _sinon.stub)();
      ret = mongoConnectionFactory.getConnection(callback);

      return done();
    });

    it("should return undefined and execute the passed callback with the success signature", function (done) {

      (0, _code.expect)(ret).to.be.undefined();

      process.nextTick(function () {
        (0, _code.expect)(callback.callCount).to.equal(1);
        (0, _code.expect)(callback.calledWith(null, { "db": dbMock, "eventDispatcher": eventdispatcher })).to.be.true();

        return done();
      });
    });
  });

  describe("when a callback passed and connection is not successful", function () {

    var callback = void 0;
    var ret = void 0;

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverErrorMock,
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });
      callback = (0, _sinon.stub)();
      ret = mongoConnectionFactory.getConnection(callback);

      return done();
    });

    it("should return undefined and execute the passed callback with the error signature", function (done) {

      (0, _code.expect)(ret).to.be.undefined();

      process.nextTick(function () {
        (0, _code.expect)(callback.withArgs(connectionError, null).calledOnce).to.be.true();
        return done();
      });
    });
  });

  describe("when connection get accessed more than once - case1", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should always return the already created connection", function (done) {

      mongoConnectionFactory.getConnection(function (err, firstAccess) {

        if (err) {
          return done(err);
        }

        firstAccess.db.dbStamp = "dbStamp";
        firstAccess.eventDispatcher.eventDispatcherStamp = "eventDispatcherStamp";

        mongoConnectionFactory.getConnection().then(function (secondAccess) {

          (0, _code.expect)(secondAccess.db).to.include({ "dbStamp": "dbStamp" });
          (0, _code.expect)(secondAccess.eventDispatcher).to.include({ "eventDispatcherStamp": "eventDispatcherStamp" });
          return done();
        });
      });
    });
  });

  describe("when connection get accessed more than once - case2", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should always return the already created connection", function (done) {

      mongoConnectionFactory.getConnection().then(function (firstAccess) {

        firstAccess.db.dbStamp = "dbStamp";
        firstAccess.eventDispatcher.eventDispatcherStamp = "eventDispatcherStamp";

        mongoConnectionFactory.getConnection(function (err, secondAccess) {

          if (err) {
            return done(err);
          }

          try {
            (0, _code.expect)(secondAccess.db).to.include({ "dbStamp": "dbStamp" });
            (0, _code.expect)(secondAccess.eventDispatcher).to.include({ "eventDispatcherStamp": "eventDispatcherStamp" });
          } catch (error) {
            return done(error);
          }
          return done();
        });
      });
    });
  });

  describe("when connection get accessed more than once - case3", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should always return the already created connection", function (done) {

      mongoConnectionFactory.getConnection(function (err, firstAccess) {

        if (err) {
          return done(err);
        }

        firstAccess.db.dbStamp = "dbStamp";
        firstAccess.eventDispatcher.eventDispatcherStamp = "eventDispatcherStamp";

        mongoConnectionFactory.getConnection(function (error, secondAccess) {

          if (error) {
            return done(error);
          }

          try {
            (0, _code.expect)(secondAccess.db).to.include({ "dbStamp": "dbStamp" });
            (0, _code.expect)(secondAccess.eventDispatcher).to.include({ "eventDispatcherStamp": "eventDispatcherStamp" });
          } catch (assertionError) {
            return done(assertionError);
          }
          return done();
        });
      });
    });
  });

  describe("when connection get accessed more than once - case4", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should always return the already created connection", function (done) {

      mongoConnectionFactory.getConnection().then(function (firstAccess) {

        firstAccess.db.dbStamp = "dbStamp";
        firstAccess.eventDispatcher.eventDispatcherStamp = "eventDispatcherStamp";

        mongoConnectionFactory.getConnection().then(function (secondAccess) {

          (0, _code.expect)(secondAccess.db).to.include({ "dbStamp": "dbStamp" });
          (0, _code.expect)(secondAccess.eventDispatcher).to.include({ "eventDispatcherStamp": "eventDispatcherStamp" });
          return done();
        });
      });
    });
  });

  describe("when db native \"authenticated\" event gets fired", function () {

    before(function (done) {
      loggerMock.debug.reset();
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", function (done) {

      mongoConnectionFactory.getConnection().then(function (_ref4) {
        var db = _ref4.db;


        var eventData = { "foo": "bar" };

        db.emit("authenticated", eventData);

        (0, _code.expect)(loggerMock.debug.calledWith("All db servers are successfully authenticated: ", eventData)).to.be.true();
        return done();
      });
    });
  });

  describe("when db native \"close\" event gets fired", function () {

    before(function (done) {
      loggerMock.error.reset();
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", function (done) {

      mongoConnectionFactory.getConnection().then(function (_ref5) {
        var db = _ref5.db;


        var closeError = new DbErrorMock("close event occurred");

        db.emit("close", closeError);

        (0, _code.expect)(loggerMock.error.calledWith("The socket closed against the db server: ", closeError)).to.be.true();

        return done();
      });
    });
  });

  describe("when db native \"error\" event gets fired", function () {

    before(function (done) {
      loggerMock.error.reset();
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", function (done) {

      mongoConnectionFactory.getConnection().then(function (_ref6) {
        var db = _ref6.db;


        var dbError = new DbErrorMock("generic db event occurred");

        db.emit("error", dbError);

        (0, _code.expect)(loggerMock.error.calledWith("A db error occurred against a db server: ", dbError)).to.be.true();

        return done();
      });
    });
  });

  describe("when db native \"fullsetup\" event gets fired", function () {

    before(function (done) {
      loggerMock.debug.reset();
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", function (done) {

      mongoConnectionFactory.getConnection().then(function (_ref7) {
        var db = _ref7.db;


        db.emit("fullsetup", { "foo": "bar" });

        (0, _code.expect)(loggerMock.debug.calledWith("All db servers connected and set up")).to.be.true();

        return done();
      });
    });
  });

  describe("when db native \"parseError\" event gets fired", function () {

    before(function (done) {
      loggerMock.error.reset();
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", function (done) {

      mongoConnectionFactory.getConnection().then(function (_ref8) {
        var db = _ref8.db;


        var parseError = new DbErrorMock("parse BSON event occurred");

        db.emit("parseError", parseError);

        (0, _code.expect)(loggerMock.error.calledWith("An illegal or corrupt BSON received from the server: ", parseError)).to.be.true();

        return done();
      });
    });
  });

  describe("when db native \"reconnect\" event gets fired", function () {

    before(function (done) {
      loggerMock.debug.reset();
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", function (done) {

      mongoConnectionFactory.getConnection().then(function (_ref9) {
        var db = _ref9.db;


        var eventData = { "foo": "bar" };

        db.emit("reconnect", eventData);

        (0, _code.expect)(loggerMock.debug.calledWith("The driver has successfully reconnected to and authenticated against the server: ", eventData)).to.be.true();
        return done();
      });
    });
  });

  describe("when db native \"timeout\" event gets fired", function () {

    before(function (done) {
      loggerMock.error.reset();
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", function (done) {

      mongoConnectionFactory.getConnection().then(function (_ref10) {
        var db = _ref10.db;


        var timeoutError = new DbErrorMock("timeout error occurred");

        db.emit("timeout", timeoutError);

        (0, _code.expect)(loggerMock.error.calledWith("The socket timed out against the db server: ", timeoutError)).to.be.true();

        return done();
      });
    });
  });

  describe("when db connection gets accessed but is already broken", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverErrorMock,
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    after(function (done) {
      nativeDriverErrorMock.connect.restore();

      return done();
    });

    it("should try to recreate that", function (done) {

      mongoConnectionFactory.getConnection().then(function () {
        return done(new Error("The connection should be broken initially"));
      }, function () {
        (0, _sinon.spy)(nativeDriverErrorMock, "connect");
        return mongoConnectionFactory.getConnection();
      }).catch(function () {
        (0, _code.expect)(nativeDriverErrorMock.connect.calledWith(connectionString)).to.be.true();
        (0, _code.expect)(nativeDriverErrorMock.connect.callCount).to.equal(1);
        return done();
      });
    });
  });

  describe("when but connection gets accessed but is pending", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverPendingMock,
        "ioTimeout": 20000, // Should be bigger than mocha timeout
        "connectionString": connectionString
      });

      return done();
    });

    after(function (done) {
      nativeDriverPendingMock.connect.restore();
      return done();
    });

    it("should not try to recreate that", function (done) {

      mongoConnectionFactory.getConnection().then(function () {
        throw new Error("The connection should be pending initially");
      }, function () {
        throw new Error("The connection should be pending initially");
      });

      (0, _sinon.spy)(nativeDriverPendingMock, "connect");
      mongoConnectionFactory.getConnection();

      (0, _code.expect)(nativeDriverPendingMock.connect.called).to.be.false();

      return done();
    });
  });

  describe("when the db native \"close\" event happens", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should force close the current db connection", function (done) {

      mongoConnectionFactory.getConnection().then(function (_ref11) {
        var db = _ref11.db,
            eventDispatcher = _ref11.eventDispatcher;


        db.signature = "firstConnection";

        eventDispatcher.on("dbConnectionClosed", function () {

          mongoConnectionFactory.getConnection().then(function (_ref12) {
            var newDb = _ref12["db"];


            try {
              (0, _code.expect)(newDb.signature).to.be.undefined();
              return done();
            } catch (err) {
              return done(err);
            }
          });
        });

        db.emit("close", new DbErrorMock("i/o error occurred"));
      });
    });
  });

  describe("when the db connection gets closed", function () {

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should fire the \"dbConnectionClosed\" event on the event dispatcher object", function (done) {

      mongoConnectionFactory.getConnection().then(function (_ref13) {
        var db = _ref13.db,
            eventDispatcher = _ref13.eventDispatcher;


        eventDispatcher.on("dbConnectionClosed", function () {
          (0, _code.expect)(true).to.be.true();
          return done();
        });

        db.emit("close", new DbErrorMock("i/o error occurred"));
      });
    });
  });

  describe("when the db connection gets opened", function () {

    var eventDispatcher = new _events.EventEmitter();

    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": eventDispatcher
      });

      return done();
    });

    it("should fire the \"dbConnectionOpened\" event on the event dispatcher object", function (done) {

      eventDispatcher.on("dbConnectionOpened", function () {
        (0, _code.expect)(true).to.be.true();
        return done();
      });

      mongoConnectionFactory.getConnection();
    });
  });

  describe("closeConnection", function () {
    var eventDispatcher = new _events.EventEmitter();
    before(function (done) {
      mongoConnectionFactory = new _mongoConnectionFactory.DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": eventDispatcher
      });

      return done();
    });

    it("should close the connection and emit \"dbConnectionClosed\" event on the event dispatcher object", function (done) {

      eventDispatcher.on("dbConnectionClosed", function () {
        (0, _code.expect)(true).to.be.true();
      });

      // First create a connection and then close it
      mongoConnectionFactory.getConnection().then(mongoConnectionFactory.closeConnection()).then(function () {
        (0, _code.expect)(loggerMock.trace.calledWith("The connection with the database has been destroyed")).to.be.true();
        return done();
      });
    });

    it("should log and return if there is no connection to be closed", function (done) {

      eventDispatcher.on("dbConnectionClosed", function () {
        // This should not be called else test case will be failed.
        (0, _code.expect)(false).to.be.true();
      });
      // Don't create a connection and just call close
      mongoConnectionFactory.closeConnection().then(function () {
        loggerMock.trace.calledWith("No active connection to be closed");
        return done();
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvc2VydmljZXMvbW9uZ28tY29ubmVjdGlvbi1mYWN0b3J5LmVzNiJdLCJuYW1lcyI6WyJsYWIiLCJleHBvcnRzIiwic2NyaXB0IiwiYmVmb3JlIiwiZGVzY3JpYmUiLCJhZnRlciIsIml0IiwiY29ubmVjdGlvblN0cmluZyIsImlvVGltZW91dCIsImxvZ2dlck1vY2siLCJEYkVycm9yTW9jayIsImFyZ3MiLCJFcnJvciIsImdldERiTW9jayIsIk9iamVjdCIsImNyZWF0ZSIsImZvcmNlIiwiY2FsbGJhY2siLCJwcm9jZXNzIiwibmV4dFRpY2siLCJnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jayIsImRiTW9jayIsImNvbm5lY3QiLCJ1cmwiLCJjb25uZWN0aW9uRXJyb3IiLCJuYXRpdmVEcml2ZXJFcnJvck1vY2siLCJuYXRpdmVEcml2ZXJQZW5kaW5nTW9jayIsImdldEV2ZW50RGlzcGF0Y2hlciIsInNpZ25hdHVyZSIsIm1vbmdvQ29ubmVjdGlvbkZhY3RvcnkiLCJjb25zdHJ1Y3Rpb25QYXJhbXMiLCJ0byIsInRocm93IiwiZG9uZSIsIm5vdCIsImdldENvbm5lY3Rpb24iLCJ0aGVuIiwiZXZlbnREaXNwYXRjaGVyIiwiaW5jbHVkZSIsInJldCIsImlzUHJvbWlzZSIsImJlIiwidHJ1ZSIsImRiIiwiYW4iLCJpbnN0YW5jZU9mIiwiZXJyIiwiZXF1YWwiLCJtZXNzYWdlIiwiZXZlbnRkaXNwYXRjaGVyIiwidW5kZWZpbmVkIiwiY2FsbENvdW50IiwiY2FsbGVkV2l0aCIsIndpdGhBcmdzIiwiY2FsbGVkT25jZSIsImZpcnN0QWNjZXNzIiwiZGJTdGFtcCIsImV2ZW50RGlzcGF0Y2hlclN0YW1wIiwic2Vjb25kQWNjZXNzIiwiZXJyb3IiLCJhc3NlcnRpb25FcnJvciIsImRlYnVnIiwicmVzZXQiLCJldmVudERhdGEiLCJlbWl0IiwiY2xvc2VFcnJvciIsImRiRXJyb3IiLCJwYXJzZUVycm9yIiwidGltZW91dEVycm9yIiwicmVzdG9yZSIsImNhdGNoIiwiY2FsbGVkIiwiZmFsc2UiLCJvbiIsIm5ld0RiIiwiY2xvc2VDb25uZWN0aW9uIiwidHJhY2UiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUEsSUFBTUEsTUFBTUMsUUFBUUQsR0FBUixHQUFjLGNBQUlFLE1BQUosRUFBMUI7SUFDT0MsTSxHQUErQkgsRyxDQUEvQkcsTTtJQUFRQyxRLEdBQXVCSixHLENBQXZCSSxRO0lBQVVDLEssR0FBYUwsRyxDQUFiSyxLO0lBQU9DLEUsR0FBTU4sRyxDQUFOTSxFOzs7QUFHaEMsSUFBTUMsbUJBQW1CLHVDQUF6Qjs7QUFFQSxJQUFNQyxZQUFZLEdBQWxCOztBQUVBLElBQU1DLGFBQWE7QUFDakIsV0FBUyxrQkFEUTtBQUVqQixXQUFTLGtCQUZRO0FBR2pCLFdBQVMsa0JBSFE7QUFJakIsVUFBUSxrQkFKUztBQUtqQixVQUFRLGtCQUxTO0FBTWpCLFdBQVM7QUFOUSxDQUFuQjs7SUFTTUMsVzs7O0FBQ0oseUJBQXFCO0FBQUE7O0FBQUEsc0NBQU5DLElBQU07QUFBTkEsVUFBTTtBQUFBOztBQUFBLHFIQUNiQSxJQURhO0FBRXBCOzs7RUFIdUJDLEs7O0FBTTFCLFNBQVNDLFNBQVQsR0FBcUI7QUFDbkIsU0FBT0MsT0FBT0MsTUFBUCxDQUFjLDBCQUFkLEVBQWtDO0FBQ3ZDLHFCQUFpQixFQUFDLFNBQVMsZUFBVixFQUEyQixjQUFjLElBQXpDLEVBRHNCO0FBRXZDLGFBQVMsRUFBQyxTQUFTLGdCQUFJLFVBQUNDLEtBQUQsRUFBUUMsUUFBUixFQUFxQjtBQUMxQ0MsZ0JBQVFDLFFBQVIsQ0FBaUI7QUFBQSxpQkFBTUYsU0FBUyxJQUFULEVBQWUsSUFBZixDQUFOO0FBQUEsU0FBakI7QUFDRCxPQUZrQixDQUFWO0FBRjhCLEdBQWxDLENBQVA7QUFNRDs7QUFFRCxTQUFTRywwQkFBVCxDQUFvQ0MsTUFB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c0NvbnRlbnQiOlsiaW1wb3J0IFwiYmFiZWwtcG9seWZpbGxcIjtcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQge2V4cGVjdH0gZnJvbSBcImNvZGVcIjtcbmltcG9ydCBMYWIgZnJvbSBcImxhYlwiO1xuaW1wb3J0IHtzcHksIHN0dWJ9IGZyb20gXCJzaW5vblwiO1xuaW1wb3J0IFEgZnJvbSBcInFcIjtcbmltcG9ydCBcInNvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlclwiO1xuaW1wb3J0IHtEYkNvbm5lY3Rpb25NYW5hZ2VyfSBmcm9tIFwiLi8uLi8uLi8uLi9kaXN0L3NlcnZpY2VzL21vbmdvLWNvbm5lY3Rpb24tZmFjdG9yeVwiO1xuXG5jb25zdCBsYWIgPSBleHBvcnRzLmxhYiA9IExhYi5zY3JpcHQoKTtcbmNvbnN0IHtiZWZvcmUsIGRlc2NyaWJlLCBhZnRlciwgaXR9ID0gbGFiO1xuXG5cbmNvbnN0IGNvbm5lY3Rpb25TdHJpbmcgPSBcIm1vbmdvZGI6Ly91c2VyOnBhc3N3b3JkQGZvbzoyNzAxNy9iYXJcIjtcblxuY29uc3QgaW9UaW1lb3V0ID0gMjAwO1xuXG5jb25zdCBsb2dnZXJNb2NrID0ge1xuICBcImRlYnVnXCI6IHN0dWIoKSxcbiAgXCJmYXRhbFwiOiBzdHViKCksXG4gIFwiZXJyb3JcIjogc3R1YigpLFxuICBcImluZm9cIjogc3R1YigpLFxuICBcIndhcm5cIjogc3R1YigpLFxuICBcInRyYWNlXCI6IHN0dWIoKVxufTtcblxuY2xhc3MgRGJFcnJvck1vY2sgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICBzdXBlcihhcmdzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREYk1vY2soKSB7XG4gIHJldHVybiBPYmplY3QuY3JlYXRlKG5ldyBFdmVudEVtaXR0ZXIoKSwge1xuICAgIFwidGhpc0lzQURiTW9ja1wiOiB7XCJ2YWx1ZVwiOiBcInRoaXNJc0FEYk1vY2tcIiwgXCJlbnVtZXJhYmxlXCI6IHRydWV9LFxuICAgIFwiY2xvc2VcIjoge1widmFsdWVcIjogc3B5KChmb3JjZSwgY2FsbGJhY2spID0+IHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4gY2FsbGJhY2sobnVsbCwgbnVsbCkpO1xuICAgIH0pfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soZGJNb2NrKSB7XG4gIHJldHVybiB7XG4gICAgY29ubmVjdCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljaygoKSA9PiBjYWxsYmFjayhudWxsLCBkYk1vY2sgfHwgZ2V0RGJNb2NrKCkpKTtcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IGNvbm5lY3Rpb25FcnJvciA9IG5ldyBFcnJvcihcImNvbm5lY3Rpb24gZXJyb3JcIik7XG5cbmNvbnN0IG5hdGl2ZURyaXZlckVycm9yTW9jayA9IHtcbiAgY29ubmVjdCh1cmwsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soKCkgPT4gY2FsbGJhY2soY29ubmVjdGlvbkVycm9yLCB7fSkpO1xuICB9XG59O1xuXG5jb25zdCBuYXRpdmVEcml2ZXJQZW5kaW5nTW9jayA9IHtcbiAgY29ubmVjdCgpIHt9XG59O1xuXG5mdW5jdGlvbiBnZXRFdmVudERpc3BhdGNoZXIoc2lnbmF0dXJlKSB7XG4gIHJldHVybiBPYmplY3QuY3JlYXRlKG5ldyBFdmVudEVtaXR0ZXIoKSwge1xuICAgIFwic2lnbmF0dXJlXCI6IHtcInZhbHVlXCI6IHNpZ25hdHVyZSwgXCJlbnVtZXJhYmxlXCI6IHRydWV9XG4gIH0pO1xufVxuXG5kZXNjcmliZShcIlRoZSBkYiBtYW5hZ2VyIHNlcnZpY2VcIiwgKCkgPT4ge1xuXG4gIGxldCBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5O1xuXG4gIGRlc2NyaWJlKFwid2hlbiBcXFwibG9nZ2VyIFxcXCJpcyBub3QgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3RvclwiLCAoKSA9PiB7XG5cbiAgICBjb25zdCBjb25zdHJ1Y3Rpb25QYXJhbXMgPSB7XG4gICAgICAvLyBsb2dnZXIgbWlzc2luZ1xuICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soKSxcbiAgICAgIFwiaW9UaW1lb3V0XCI6IGlvVGltZW91dCxcbiAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nXG4gICAgfTtcblxuICAgIGl0KFwic2hvdWxkIHRocm93IGFuIGVycm9yXCIsIGRvbmUgPT4ge1xuXG4gICAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gbmV3IERiQ29ubmVjdGlvbk1hbmFnZXIoY29uc3RydWN0aW9uUGFyYW1zKTtcbiAgICAgIH0pLnRvLnRocm93KEVycm9yLCBcIkFyZ3VtZW50IGxvZ2dlciBleHBlY3RlZCB0byBiZSBkZWZpbmVkLlwiKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIFxcXCJuYXRpdmVEcml2ZXJcXFwiIGlzIG5vdCBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yXCIsICgpID0+IHtcblxuICAgIGNvbnN0IGNvbnN0cnVjdGlvblBhcmFtcyA9IHtcbiAgICAgIFwibG9nZ2VyXCI6IGxvZ2dlck1vY2ssXG4gICAgICAvLyBuYXRpdmVEcml2ZXIgbWlzc2luZ1xuICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IGNvbm5lY3Rpb25TdHJpbmdcbiAgICB9O1xuXG4gICAgaXQoXCJzaG91bGQgdGhyb3cgYW4gZXJyb3JcIiwgZG9uZSA9PiB7XG5cbiAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkgPSBuZXcgRGJDb25uZWN0aW9uTWFuYWdlcihjb25zdHJ1Y3Rpb25QYXJhbXMpO1xuICAgICAgfSkudG8udGhyb3coRXJyb3IsIFwiQXJndW1lbnQgbmF0aXZlRHJpdmVyIGV4cGVjdGVkIHRvIGJlIGRlZmluZWQuXCIpO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIndoZW4gXFxcImlvVGltZW91dFxcXCIgaXMgbm90IHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3JcIiwgKCkgPT4ge1xuXG4gICAgY29uc3QgY29uc3RydWN0aW9uUGFyYW1zID0ge1xuICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgIFwibmF0aXZlRHJpdmVyXCI6IGdldE5hdGl2ZURyaXZlclN1Y2Nlc3NNb2NrKCksXG4gICAgICAvLyBpb1RpbWVvdXQgbWlzc2luZ1xuICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IGNvbm5lY3Rpb25TdHJpbmdcbiAgICB9O1xuXG4gICAgaXQoXCJzaG91bGQgdGhyb3cgYW4gZXJyb3JcIiwgZG9uZSA9PiB7XG5cbiAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkgPSBuZXcgRGJDb25uZWN0aW9uTWFuYWdlcihjb25zdHJ1Y3Rpb25QYXJhbXMpO1xuICAgICAgfSkudG8udGhyb3coRXJyb3IsIFwiQXJndW1lbnQgaW9UaW1lb3V0IGV4cGVjdGVkIHRvIGJlIGRlZmluZWQuXCIpO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIndoZW4gXFxcImNvbm5lY3Rpb25TdHJpbmdcXFwiIGlzIG5vdCBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yXCIsICgpID0+IHtcblxuICAgIGNvbnN0IGNvbnN0cnVjdGlvblBhcmFtcyA9IHtcbiAgICAgIFwibG9nZ2VyXCI6IGxvZ2dlck1vY2ssXG4gICAgICBcIm5hdGl2ZURyaXZlclwiOiBnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jaygpLFxuICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0XG4gICAgICAvLyBjb25uZWN0aW9uU3RyaW5nIG1pc3NpbmdcbiAgICB9O1xuXG4gICAgaXQoXCJzaG91bGQgdGhyb3cgYW4gZXJyb3JcIiwgZG9uZSA9PiB7XG5cbiAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkgPSBuZXcgRGJDb25uZWN0aW9uTWFuYWdlcihjb25zdHJ1Y3Rpb25QYXJhbXMpO1xuICAgICAgfSkudG8udGhyb3coRXJyb3IsIFwiQXJndW1lbnQgY29ubmVjdGlvblN0cmluZyBleHBlY3RlZCB0byBiZSBkZWZpbmVkLlwiKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIFxcXCJldmVudERpc3BhdGNoZXJcXFwiIGlzIG5vdCBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yXCIsICgpID0+IHtcblxuICAgIGNvbnN0IGNvbnN0cnVjdGlvblBhcmFtcyA9IHtcbiAgICAgIFwibG9nZ2VyXCI6IGxvZ2dlck1vY2ssXG4gICAgICBcIm5hdGl2ZURyaXZlclwiOiBnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jaygpLFxuICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IGNvbm5lY3Rpb25TdHJpbmdcbiAgICAgIC8vIGV2ZW50RGlzcGF0Y2hlciBtaXNzaW5nXG4gICAgfTtcblxuICAgIGl0KFwic2hvdWxkIG5vdCB0aHJvdyBhbiBlcnJvciAodGhlIHBhcmFtIGlzIG9wdGlvbmFsKVwiLCBkb25lID0+IHtcblxuICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKGNvbnN0cnVjdGlvblBhcmFtcyk7XG4gICAgICB9KS50by5ub3QudGhyb3coKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIGFuIGV2ZW50IGRpc3BhdGNoZXIgb2JqZWN0IHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IgYW5kIHRoZSBzZXJ2aWNlIGNhbGxlZCB3aXRob3V0IGEgY2FsbGJhY2tcIiwgKCkgPT4ge1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soKSxcbiAgICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZyxcbiAgICAgICAgXCJldmVudERpc3BhdGNoZXJcIjogZ2V0RXZlbnREaXNwYXRjaGVyKFwidGhpc0lzQW5FdmVudERpc3BhdGNoZXJcIilcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIHRoZSBzYW1lIGV2ZW50IGRpc3BhdGNoZXJcIiwgKCkgPT4ge1xuXG4gICAgICByZXR1cm4gbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKCkudGhlbigoe2V2ZW50RGlzcGF0Y2hlcn0pID0+IHtcblxuICAgICAgICBleHBlY3QoZXZlbnREaXNwYXRjaGVyKS50by5pbmNsdWRlKHtcInNpZ25hdHVyZVwiOiBcInRoaXNJc0FuRXZlbnREaXNwYXRjaGVyXCJ9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIndoZW4gYW4gZXZlbnQgZGlzcGF0Y2hlciBvYmplY3QgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3RvciBhbmQgdGhlIHNlcnZpY2UgY2FsbGVkIHdpdGggYSBjYWxsYmFja1wiLCAoKSA9PiB7XG5cbiAgICBiZWZvcmUoZG9uZSA9PiB7XG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gbmV3IERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICBcImxvZ2dlclwiOiBsb2dnZXJNb2NrLFxuICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jaygpLFxuICAgICAgICBcImlvVGltZW91dFwiOiBpb1RpbWVvdXQsXG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nLFxuICAgICAgICBcImV2ZW50RGlzcGF0Y2hlclwiOiBnZXRFdmVudERpc3BhdGNoZXIoXCJ0aGlzSXNBbkV2ZW50RGlzcGF0Y2hlclwiKVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCByZXR1cm4gdGhlIHNhbWUgZXZlbnQgZGlzcGF0Y2hlclwiLCAoKSA9PiB7XG5cbiAgICAgIHJldHVybiBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5LmdldENvbm5lY3Rpb24oKS50aGVuKCh7ZXZlbnREaXNwYXRjaGVyfSkgPT4ge1xuXG4gICAgICAgIGV4cGVjdChldmVudERpc3BhdGNoZXIpLnRvLmluY2x1ZGUoe1wic2lnbmF0dXJlXCI6IFwidGhpc0lzQW5FdmVudERpc3BhdGNoZXJcIn0pO1xuXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIG5vIGNhbGxiYWNrIHBhc3NlZCBhbmQgY29ubmVjdGlvbiBpcyBzdWNjZXNzZnVsXCIsICgpID0+IHtcblxuICAgIGxldCByZXQ7XG5cbiAgICBiZWZvcmUoZG9uZSA9PiB7XG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gbmV3IERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICBcImxvZ2dlclwiOiBsb2dnZXJNb2NrLFxuICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jaygpLFxuICAgICAgICBcImlvVGltZW91dFwiOiBpb1RpbWVvdXQsXG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nXG4gICAgICB9KTtcbiAgICAgIHJldCA9IG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgcmV0dXJuIGEgcHJvbWlzZSB3aGljaCBnZXRzIHJlc29sdmVkIHRvIGEgZGIgaW5zdGFuY2UgYW5kIGFuIGV2ZW50IGRpc3BhdGNoZXIgXCIsICgpID0+IHtcblxuICAgICAgZXhwZWN0KFEuaXNQcm9taXNlKHJldCkpLnRvLmJlLnRydWUoKTtcbiAgICAgIHJldHVybiByZXQudGhlbigoe2RiLCBldmVudERpc3BhdGNoZXJ9KSA9PiB7XG4gICAgICAgIGV4cGVjdChkYikudG8uaW5jbHVkZSh7XCJ0aGlzSXNBRGJNb2NrXCI6IFwidGhpc0lzQURiTW9ja1wifSk7XG4gICAgICAgIGV4cGVjdChldmVudERpc3BhdGNoZXIpLnRvLmJlLmFuLmluc3RhbmNlT2YoRXZlbnRFbWl0dGVyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIndoZW4gbm8gY2FsbGJhY2sgcGFzc2VkIGFuZCBjb25uZWN0aW9uIGlzIG5vdCBzdWNjZXNzZnVsXCIsICgpID0+IHtcblxuICAgIGxldCByZXQ7XG5cbiAgICBiZWZvcmUoZG9uZSA9PiB7XG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gbmV3IERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICBcImxvZ2dlclwiOiBsb2dnZXJNb2NrLFxuICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBuYXRpdmVEcml2ZXJFcnJvck1vY2ssXG4gICAgICAgIFwiaW9UaW1lb3V0XCI6IGlvVGltZW91dCxcbiAgICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IGNvbm5lY3Rpb25TdHJpbmdcbiAgICAgIH0pO1xuICAgICAgcmV0ID0gbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKCk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCByZXR1cm4gYSBwcm9taXNlIHdoaWNoIGdldHMgcmVqZWN0ZWQgd2l0aCBhIGNvbm5lY3Rpb24gZXJyb3JcIiwgZG9uZSA9PiB7XG5cbiAgICAgIGV4cGVjdChRLmlzUHJvbWlzZShyZXQpKS50by5iZS50cnVlKCk7XG5cbiAgICAgIHJldC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZGIgY29ubmVjdGlvbiBzaG91bGQgZmFpbFwiKTtcbiAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgIGV4cGVjdChlcnIpLnRvLmJlLmVxdWFsKGNvbm5lY3Rpb25FcnJvcik7XG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIG5vIGNhbGxiYWNrIHBhc3NlZCBhbmQgY29ubmVjdGlvbiB0aW1lcyBvdXRcIiwgKCkgPT4ge1xuXG4gICAgbGV0IHJldDtcblxuICAgIGJlZm9yZShkb25lID0+IHtcbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkgPSBuZXcgRGJDb25uZWN0aW9uTWFuYWdlcih7XG4gICAgICAgIFwibG9nZ2VyXCI6IGxvZ2dlck1vY2ssXG4gICAgICAgIFwibmF0aXZlRHJpdmVyXCI6IG5hdGl2ZURyaXZlclBlbmRpbmdNb2NrLFxuICAgICAgICBcImlvVGltZW91dFwiOiAwLFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZ1xuICAgICAgfSk7XG4gICAgICByZXQgPSBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5LmdldENvbm5lY3Rpb24oKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybiBhIHByb21pc2Ugd2hpY2ggZ2V0cyByZWplY3RlZCB3aXRoIGEgdGltZW91dCBlcnJvclwiLCBkb25lID0+IHtcblxuICAgICAgZXhwZWN0KFEuaXNQcm9taXNlKHJldCkpLnRvLmJlLnRydWUoKTtcblxuICAgICAgcmV0LnRoZW4oKCkgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJkYiBjb25uZWN0aW9uIHNob3VsZCBmYWlsIHdpdGggYSB0aW1lb3V0IGVycm9yXCIpO1xuICAgICAgfSwgZXJyID0+IHtcbiAgICAgICAgZXhwZWN0KGVyci5tZXNzYWdlKS50by5lcXVhbChcIlRpbWVkIG91dCBhZnRlciAwIG1zXCIpO1xuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwid2hlbiBhIGNhbGxiYWNrIHBhc3NlZCBhbmQgY29ubmVjdGlvbiBpcyBzdWNjZXNzZnVsXCIsICgpID0+IHtcblxuICAgIGxldCBjYWxsYmFjaztcbiAgICBsZXQgcmV0O1xuICAgIGNvbnN0IGRiTW9jayA9IGdldERiTW9jaygpO1xuICAgIGNvbnN0IGV2ZW50ZGlzcGF0Y2hlciA9IGdldEV2ZW50RGlzcGF0Y2hlcihcInRoaXNJc0FuRXZlbnREaXNwYXRjaGVyXCIpO1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soZGJNb2NrKSxcbiAgICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZyxcbiAgICAgICAgXCJldmVudERpc3BhdGNoZXJcIjogZXZlbnRkaXNwYXRjaGVyXG4gICAgICB9KTtcbiAgICAgIGNhbGxiYWNrID0gc3R1YigpO1xuICAgICAgcmV0ID0gbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKGNhbGxiYWNrKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybiB1bmRlZmluZWQgYW5kIGV4ZWN1dGUgdGhlIHBhc3NlZCBjYWxsYmFjayB3aXRoIHRoZSBzdWNjZXNzIHNpZ25hdHVyZVwiLCBkb25lID0+IHtcblxuICAgICAgZXhwZWN0KHJldCkudG8uYmUudW5kZWZpbmVkKCk7XG5cbiAgICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgICBleHBlY3QoY2FsbGJhY2suY2FsbENvdW50KS50by5lcXVhbCgxKTtcbiAgICAgICAgZXhwZWN0KGNhbGxiYWNrLmNhbGxlZFdpdGgobnVsbCwge1wiZGJcIjogZGJNb2NrLCBcImV2ZW50RGlzcGF0Y2hlclwiOiBldmVudGRpc3BhdGNoZXJ9KSkudG8uYmUudHJ1ZSgpO1xuXG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIGEgY2FsbGJhY2sgcGFzc2VkIGFuZCBjb25uZWN0aW9uIGlzIG5vdCBzdWNjZXNzZnVsXCIsICgpID0+IHtcblxuICAgIGxldCBjYWxsYmFjaztcbiAgICBsZXQgcmV0O1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogbmF0aXZlRHJpdmVyRXJyb3JNb2NrLFxuICAgICAgICBcImlvVGltZW91dFwiOiBpb1RpbWVvdXQsXG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nXG4gICAgICB9KTtcbiAgICAgIGNhbGxiYWNrID0gc3R1YigpO1xuICAgICAgcmV0ID0gbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKGNhbGxiYWNrKTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIHJldHVybiB1bmRlZmluZWQgYW5kIGV4ZWN1dGUgdGhlIHBhc3NlZCBjYWxsYmFjayB3aXRoIHRoZSBlcnJvciBzaWduYXR1cmVcIiwgZG9uZSA9PiB7XG5cbiAgICAgIGV4cGVjdChyZXQpLnRvLmJlLnVuZGVmaW5lZCgpO1xuXG4gICAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNhbGxiYWNrXG4gICAgICAgICAgLndpdGhBcmdzKGNvbm5lY3Rpb25FcnJvciwgbnVsbClcbiAgICAgICAgICAuY2FsbGVkT25jZSkudG8uYmUudHJ1ZSgpO1xuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwid2hlbiBjb25uZWN0aW9uIGdldCBhY2Nlc3NlZCBtb3JlIHRoYW4gb25jZSAtIGNhc2UxXCIsICgpID0+IHtcblxuICAgIGJlZm9yZShkb25lID0+IHtcbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkgPSBuZXcgRGJDb25uZWN0aW9uTWFuYWdlcih7XG4gICAgICAgIFwibG9nZ2VyXCI6IGxvZ2dlck1vY2ssXG4gICAgICAgIFwibmF0aXZlRHJpdmVyXCI6IGdldE5hdGl2ZURyaXZlclN1Y2Nlc3NNb2NrKCksXG4gICAgICAgIFwiaW9UaW1lb3V0XCI6IGlvVGltZW91dCxcbiAgICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IGNvbm5lY3Rpb25TdHJpbmdcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgYWx3YXlzIHJldHVybiB0aGUgYWxyZWFkeSBjcmVhdGVkIGNvbm5lY3Rpb25cIiwgZG9uZSA9PiB7XG5cbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigoZXJyLCBmaXJzdEFjY2VzcykgPT4ge1xuXG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZmlyc3RBY2Nlc3MuZGIuZGJTdGFtcCA9IFwiZGJTdGFtcFwiO1xuICAgICAgICBmaXJzdEFjY2Vzcy5ldmVudERpc3BhdGNoZXIuZXZlbnREaXNwYXRjaGVyU3RhbXAgPSBcImV2ZW50RGlzcGF0Y2hlclN0YW1wXCI7XG5cbiAgICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKCkudGhlbihzZWNvbmRBY2Nlc3MgPT4ge1xuXG4gICAgICAgICAgZXhwZWN0KHNlY29uZEFjY2Vzcy5kYikudG8uaW5jbHVkZSh7XCJkYlN0YW1wXCI6IFwiZGJTdGFtcFwifSk7XG4gICAgICAgICAgZXhwZWN0KHNlY29uZEFjY2Vzcy5ldmVudERpc3BhdGNoZXIpLnRvLmluY2x1ZGUoe1wiZXZlbnREaXNwYXRjaGVyU3RhbXBcIjogXCJldmVudERpc3BhdGNoZXJTdGFtcFwifSk7XG4gICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIGNvbm5lY3Rpb24gZ2V0IGFjY2Vzc2VkIG1vcmUgdGhhbiBvbmNlIC0gY2FzZTJcIiwgKCkgPT4ge1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soKSxcbiAgICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZ1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBhbHdheXMgcmV0dXJuIHRoZSBhbHJlYWR5IGNyZWF0ZWQgY29ubmVjdGlvblwiLCBkb25lID0+IHtcblxuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKCkudGhlbihmaXJzdEFjY2VzcyA9PiB7XG5cbiAgICAgICAgZmlyc3RBY2Nlc3MuZGIuZGJTdGFtcCA9IFwiZGJTdGFtcFwiO1xuICAgICAgICBmaXJzdEFjY2Vzcy5ldmVudERpc3BhdGNoZXIuZXZlbnREaXNwYXRjaGVyU3RhbXAgPSBcImV2ZW50RGlzcGF0Y2hlclN0YW1wXCI7XG5cbiAgICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKChlcnIsIHNlY29uZEFjY2VzcykgPT4ge1xuXG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZXhwZWN0KHNlY29uZEFjY2Vzcy5kYikudG8uaW5jbHVkZSh7XCJkYlN0YW1wXCI6IFwiZGJTdGFtcFwifSk7XG4gICAgICAgICAgICBleHBlY3Qoc2Vjb25kQWNjZXNzLmV2ZW50RGlzcGF0Y2hlcikudG8uaW5jbHVkZSh7XCJldmVudERpc3BhdGNoZXJTdGFtcFwiOiBcImV2ZW50RGlzcGF0Y2hlclN0YW1wXCJ9KTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIndoZW4gY29ubmVjdGlvbiBnZXQgYWNjZXNzZWQgbW9yZSB0aGFuIG9uY2UgLSBjYXNlM1wiLCAoKSA9PiB7XG5cbiAgICBiZWZvcmUoZG9uZSA9PiB7XG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gbmV3IERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICBcImxvZ2dlclwiOiBsb2dnZXJNb2NrLFxuICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jaygpLFxuICAgICAgICBcImlvVGltZW91dFwiOiBpb1RpbWVvdXQsXG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGFsd2F5cyByZXR1cm4gdGhlIGFscmVhZHkgY3JlYXRlZCBjb25uZWN0aW9uXCIsIGRvbmUgPT4ge1xuXG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5LmdldENvbm5lY3Rpb24oKGVyciwgZmlyc3RBY2Nlc3MpID0+IHtcblxuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpcnN0QWNjZXNzLmRiLmRiU3RhbXAgPSBcImRiU3RhbXBcIjtcbiAgICAgICAgZmlyc3RBY2Nlc3MuZXZlbnREaXNwYXRjaGVyLmV2ZW50RGlzcGF0Y2hlclN0YW1wID0gXCJldmVudERpc3BhdGNoZXJTdGFtcFwiO1xuXG4gICAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigoZXJyb3IsIHNlY29uZEFjY2VzcykgPT4ge1xuXG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9uZShlcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGV4cGVjdChzZWNvbmRBY2Nlc3MuZGIpLnRvLmluY2x1ZGUoe1wiZGJTdGFtcFwiOiBcImRiU3RhbXBcIn0pO1xuICAgICAgICAgICAgZXhwZWN0KHNlY29uZEFjY2Vzcy5ldmVudERpc3BhdGNoZXIpLnRvLmluY2x1ZGUoe1wiZXZlbnREaXNwYXRjaGVyU3RhbXBcIjogXCJldmVudERpc3BhdGNoZXJTdGFtcFwifSk7XG4gICAgICAgICAgfSBjYXRjaCAoYXNzZXJ0aW9uRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBkb25lKGFzc2VydGlvbkVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIGNvbm5lY3Rpb24gZ2V0IGFjY2Vzc2VkIG1vcmUgdGhhbiBvbmNlIC0gY2FzZTRcIiwgKCkgPT4ge1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soKSxcbiAgICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZ1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBhbHdheXMgcmV0dXJuIHRoZSBhbHJlYWR5IGNyZWF0ZWQgY29ubmVjdGlvblwiLCBkb25lID0+IHtcblxuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKCkudGhlbihmaXJzdEFjY2VzcyA9PiB7XG5cbiAgICAgICAgZmlyc3RBY2Nlc3MuZGIuZGJTdGFtcCA9IFwiZGJTdGFtcFwiO1xuICAgICAgICBmaXJzdEFjY2Vzcy5ldmVudERpc3BhdGNoZXIuZXZlbnREaXNwYXRjaGVyU3RhbXAgPSBcImV2ZW50RGlzcGF0Y2hlclN0YW1wXCI7XG5cbiAgICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKCkudGhlbihzZWNvbmRBY2Nlc3MgPT4ge1xuXG4gICAgICAgICAgZXhwZWN0KHNlY29uZEFjY2Vzcy5kYikudG8uaW5jbHVkZSh7XCJkYlN0YW1wXCI6IFwiZGJTdGFtcFwifSk7XG4gICAgICAgICAgZXhwZWN0KHNlY29uZEFjY2Vzcy5ldmVudERpc3BhdGNoZXIpLnRvLmluY2x1ZGUoe1wiZXZlbnREaXNwYXRjaGVyU3RhbXBcIjogXCJldmVudERpc3BhdGNoZXJTdGFtcFwifSk7XG4gICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIGRiIG5hdGl2ZSBcXFwiYXV0aGVudGljYXRlZFxcXCIgZXZlbnQgZ2V0cyBmaXJlZFwiLCAoKSA9PiB7XG5cbiAgICBiZWZvcmUoZG9uZSA9PiB7XG4gICAgICBsb2dnZXJNb2NrLmRlYnVnLnJlc2V0KCk7XG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gbmV3IERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICBcImxvZ2dlclwiOiBsb2dnZXJNb2NrLFxuICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jaygpLFxuICAgICAgICBcImlvVGltZW91dFwiOiBpb1RpbWVvdXQsXG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGxpc3RlbiB0byBpdCBhbmQgbG9nIGl0XCIsIGRvbmUgPT4ge1xuXG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5LmdldENvbm5lY3Rpb24oKS50aGVuKCh7ZGJ9KSA9PiB7XG5cbiAgICAgICAgY29uc3QgZXZlbnREYXRhID0ge1wiZm9vXCI6IFwiYmFyXCJ9O1xuXG4gICAgICAgIGRiLmVtaXQoXCJhdXRoZW50aWNhdGVkXCIsIGV2ZW50RGF0YSk7XG5cbiAgICAgICAgZXhwZWN0KGxvZ2dlck1vY2suZGVidWcuY2FsbGVkV2l0aChcIkFsbCBkYiBzZXJ2ZXJzIGFyZSBzdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZDogXCIsIGV2ZW50RGF0YSkpLnRvLmJlLnRydWUoKTtcbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIndoZW4gZGIgbmF0aXZlIFxcXCJjbG9zZVxcXCIgZXZlbnQgZ2V0cyBmaXJlZFwiLCAoKSA9PiB7XG5cbiAgICBiZWZvcmUoZG9uZSA9PiB7XG4gICAgICBsb2dnZXJNb2NrLmVycm9yLnJlc2V0KCk7XG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gbmV3IERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICBcImxvZ2dlclwiOiBsb2dnZXJNb2NrLFxuICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jaygpLFxuICAgICAgICBcImlvVGltZW91dFwiOiBpb1RpbWVvdXQsXG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGxpc3RlbiB0byBpdCBhbmQgbG9nIGl0XCIsIGRvbmUgPT4ge1xuXG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5LmdldENvbm5lY3Rpb24oKS50aGVuKCh7ZGJ9KSA9PiB7XG5cbiAgICAgICAgY29uc3QgY2xvc2VFcnJvciA9IG5ldyBEYkVycm9yTW9jayhcImNsb3NlIGV2ZW50IG9jY3VycmVkXCIpO1xuXG4gICAgICAgIGRiLmVtaXQoXCJjbG9zZVwiLCBjbG9zZUVycm9yKTtcblxuICAgICAgICBleHBlY3QobG9nZ2VyTW9jay5lcnJvci5jYWxsZWRXaXRoKFwiVGhlIHNvY2tldCBjbG9zZWQgYWdhaW5zdCB0aGUgZGIgc2VydmVyOiBcIiwgY2xvc2VFcnJvcikpLnRvLmJlLnRydWUoKTtcblxuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwid2hlbiBkYiBuYXRpdmUgXFxcImVycm9yXFxcIiBldmVudCBnZXRzIGZpcmVkXCIsICgpID0+IHtcblxuICAgIGJlZm9yZShkb25lID0+IHtcbiAgICAgIGxvZ2dlck1vY2suZXJyb3IucmVzZXQoKTtcbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkgPSBuZXcgRGJDb25uZWN0aW9uTWFuYWdlcih7XG4gICAgICAgIFwibG9nZ2VyXCI6IGxvZ2dlck1vY2ssXG4gICAgICAgIFwibmF0aXZlRHJpdmVyXCI6IGdldE5hdGl2ZURyaXZlclN1Y2Nlc3NNb2NrKCksXG4gICAgICAgIFwiaW9UaW1lb3V0XCI6IGlvVGltZW91dCxcbiAgICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IGNvbm5lY3Rpb25TdHJpbmdcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbGlzdGVuIHRvIGl0IGFuZCBsb2cgaXRcIiwgZG9uZSA9PiB7XG5cbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpLnRoZW4oKHtkYn0pID0+IHtcblxuICAgICAgICBjb25zdCBkYkVycm9yID0gbmV3IERiRXJyb3JNb2NrKFwiZ2VuZXJpYyBkYiBldmVudCBvY2N1cnJlZFwiKTtcblxuICAgICAgICBkYi5lbWl0KFwiZXJyb3JcIiwgZGJFcnJvcik7XG5cbiAgICAgICAgZXhwZWN0KGxvZ2dlck1vY2suZXJyb3IuY2FsbGVkV2l0aChcIkEgZGIgZXJyb3Igb2NjdXJyZWQgYWdhaW5zdCBhIGRiIHNlcnZlcjogXCIsIGRiRXJyb3IpKS50by5iZS50cnVlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIndoZW4gZGIgbmF0aXZlIFxcXCJmdWxsc2V0dXBcXFwiIGV2ZW50IGdldHMgZmlyZWRcIiwgKCkgPT4ge1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbG9nZ2VyTW9jay5kZWJ1Zy5yZXNldCgpO1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soKSxcbiAgICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZ1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBsaXN0ZW4gdG8gaXQgYW5kIGxvZyBpdFwiLCBkb25lID0+IHtcblxuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKCkudGhlbigoe2RifSkgPT4ge1xuXG4gICAgICAgIGRiLmVtaXQoXCJmdWxsc2V0dXBcIiwge1wiZm9vXCI6IFwiYmFyXCJ9KTtcblxuICAgICAgICBleHBlY3QobG9nZ2VyTW9jay5kZWJ1Zy5jYWxsZWRXaXRoKFwiQWxsIGRiIHNlcnZlcnMgY29ubmVjdGVkIGFuZCBzZXQgdXBcIikpLnRvLmJlLnRydWUoKTtcblxuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwid2hlbiBkYiBuYXRpdmUgXFxcInBhcnNlRXJyb3JcXFwiIGV2ZW50IGdldHMgZmlyZWRcIiwgKCkgPT4ge1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbG9nZ2VyTW9jay5lcnJvci5yZXNldCgpO1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soKSxcbiAgICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZ1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBsaXN0ZW4gdG8gaXQgYW5kIGxvZyBpdFwiLCBkb25lID0+IHtcblxuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKCkudGhlbigoe2RifSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IHBhcnNlRXJyb3IgPSBuZXcgRGJFcnJvck1vY2soXCJwYXJzZSBCU09OIGV2ZW50IG9jY3VycmVkXCIpO1xuXG4gICAgICAgIGRiLmVtaXQoXCJwYXJzZUVycm9yXCIsIHBhcnNlRXJyb3IpO1xuXG4gICAgICAgIGV4cGVjdChsb2dnZXJNb2NrLmVycm9yLmNhbGxlZFdpdGgoXCJBbiBpbGxlZ2FsIG9yIGNvcnJ1cHQgQlNPTiByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXI6IFwiLCBwYXJzZUVycm9yKSkudG8uYmUudHJ1ZSgpO1xuXG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIGRiIG5hdGl2ZSBcXFwicmVjb25uZWN0XFxcIiBldmVudCBnZXRzIGZpcmVkXCIsICgpID0+IHtcblxuICAgIGJlZm9yZShkb25lID0+IHtcbiAgICAgIGxvZ2dlck1vY2suZGVidWcucmVzZXQoKTtcbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkgPSBuZXcgRGJDb25uZWN0aW9uTWFuYWdlcih7XG4gICAgICAgIFwibG9nZ2VyXCI6IGxvZ2dlck1vY2ssXG4gICAgICAgIFwibmF0aXZlRHJpdmVyXCI6IGdldE5hdGl2ZURyaXZlclN1Y2Nlc3NNb2NrKCksXG4gICAgICAgIFwiaW9UaW1lb3V0XCI6IGlvVGltZW91dCxcbiAgICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IGNvbm5lY3Rpb25TdHJpbmdcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgbGlzdGVuIHRvIGl0IGFuZCBsb2cgaXRcIiwgZG9uZSA9PiB7XG5cbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpLnRoZW4oKHtkYn0pID0+IHtcblxuICAgICAgICBjb25zdCBldmVudERhdGEgPSB7XCJmb29cIjogXCJiYXJcIn07XG5cbiAgICAgICAgZGIuZW1pdChcInJlY29ubmVjdFwiLCBldmVudERhdGEpO1xuXG4gICAgICAgIGV4cGVjdChsb2dnZXJNb2NrLmRlYnVnLmNhbGxlZFdpdGgoXCJUaGUgZHJpdmVyIGhhcyBzdWNjZXNzZnVsbHkgcmVjb25uZWN0ZWQgdG8gYW5kIGF1dGhlbnRpY2F0ZWQgYWdhaW5zdCB0aGUgc2VydmVyOiBcIiwgZXZlbnREYXRhKSkudG8uYmUudHJ1ZSgpO1xuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwid2hlbiBkYiBuYXRpdmUgXFxcInRpbWVvdXRcXFwiIGV2ZW50IGdldHMgZmlyZWRcIiwgKCkgPT4ge1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbG9nZ2VyTW9jay5lcnJvci5yZXNldCgpO1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soKSxcbiAgICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZ1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBsaXN0ZW4gdG8gaXQgYW5kIGxvZyBpdFwiLCBkb25lID0+IHtcblxuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5nZXRDb25uZWN0aW9uKCkudGhlbigoe2RifSkgPT4ge1xuXG4gICAgICAgIGNvbnN0IHRpbWVvdXRFcnJvciA9IG5ldyBEYkVycm9yTW9jayhcInRpbWVvdXQgZXJyb3Igb2NjdXJyZWRcIik7XG5cbiAgICAgICAgZGIuZW1pdChcInRpbWVvdXRcIiwgdGltZW91dEVycm9yKTtcblxuICAgICAgICBleHBlY3QobG9nZ2VyTW9jay5lcnJvci5jYWxsZWRXaXRoKFwiVGhlIHNvY2tldCB0aW1lZCBvdXQgYWdhaW5zdCB0aGUgZGIgc2VydmVyOiBcIiwgdGltZW91dEVycm9yKSkudG8uYmUudHJ1ZSgpO1xuXG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJ3aGVuIGRiIGNvbm5lY3Rpb24gZ2V0cyBhY2Nlc3NlZCBidXQgaXMgYWxyZWFkeSBicm9rZW5cIiwgKCkgPT4ge1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogbmF0aXZlRHJpdmVyRXJyb3JNb2NrLFxuICAgICAgICBcImlvVGltZW91dFwiOiBpb1RpbWVvdXQsXG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGFmdGVyKGRvbmUgPT4ge1xuICAgICAgbmF0aXZlRHJpdmVyRXJyb3JNb2NrLmNvbm5lY3QucmVzdG9yZSgpO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgdHJ5IHRvIHJlY3JlYXRlIHRoYXRcIiwgZG9uZSA9PiB7XG5cbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gZG9uZShuZXcgRXJyb3IoXCJUaGUgY29ubmVjdGlvbiBzaG91bGQgYmUgYnJva2VuIGluaXRpYWxseVwiKSk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICBzcHkobmF0aXZlRHJpdmVyRXJyb3JNb2NrLCBcImNvbm5lY3RcIik7XG4gICAgICAgICAgcmV0dXJuIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChuYXRpdmVEcml2ZXJFcnJvck1vY2suY29ubmVjdC5jYWxsZWRXaXRoKGNvbm5lY3Rpb25TdHJpbmcpKS50by5iZS50cnVlKCk7XG4gICAgICAgICAgZXhwZWN0KG5hdGl2ZURyaXZlckVycm9yTW9jay5jb25uZWN0LmNhbGxDb3VudCkudG8uZXF1YWwoMSk7XG4gICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwid2hlbiBidXQgY29ubmVjdGlvbiBnZXRzIGFjY2Vzc2VkIGJ1dCBpcyBwZW5kaW5nXCIsICgpID0+IHtcblxuICAgIGJlZm9yZShkb25lID0+IHtcbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkgPSBuZXcgRGJDb25uZWN0aW9uTWFuYWdlcih7XG4gICAgICAgIFwibG9nZ2VyXCI6IGxvZ2dlck1vY2ssXG4gICAgICAgIFwibmF0aXZlRHJpdmVyXCI6IG5hdGl2ZURyaXZlclBlbmRpbmdNb2NrLFxuICAgICAgICBcImlvVGltZW91dFwiOiAyMDAwMCwgLy8gU2hvdWxkIGJlIGJpZ2dlciB0aGFuIG1vY2hhIHRpbWVvdXRcbiAgICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IGNvbm5lY3Rpb25TdHJpbmdcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgYWZ0ZXIoZG9uZSA9PiB7XG4gICAgICBuYXRpdmVEcml2ZXJQZW5kaW5nTW9jay5jb25uZWN0LnJlc3RvcmUoKTtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBub3QgdHJ5IHRvIHJlY3JlYXRlIHRoYXRcIiwgZG9uZSA9PiB7XG5cbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgY29ubmVjdGlvbiBzaG91bGQgYmUgcGVuZGluZyBpbml0aWFsbHlcIik7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBjb25uZWN0aW9uIHNob3VsZCBiZSBwZW5kaW5nIGluaXRpYWxseVwiKTtcbiAgICAgIH0pO1xuXG4gICAgICBzcHkobmF0aXZlRHJpdmVyUGVuZGluZ01vY2ssIFwiY29ubmVjdFwiKTtcbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpO1xuXG4gICAgICBleHBlY3QobmF0aXZlRHJpdmVyUGVuZGluZ01vY2suY29ubmVjdC5jYWxsZWQpLnRvLmJlLmZhbHNlKCk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwid2hlbiB0aGUgZGIgbmF0aXZlIFxcXCJjbG9zZVxcXCIgZXZlbnQgaGFwcGVuc1wiLCAoKSA9PiB7XG5cbiAgICBiZWZvcmUoZG9uZSA9PiB7XG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gbmV3IERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICBcImxvZ2dlclwiOiBsb2dnZXJNb2NrLFxuICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jaygpLFxuICAgICAgICBcImlvVGltZW91dFwiOiBpb1RpbWVvdXQsXG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGZvcmNlIGNsb3NlIHRoZSBjdXJyZW50IGRiIGNvbm5lY3Rpb25cIiwgZG9uZSA9PiB7XG5cbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpLnRoZW4oKHtkYiwgZXZlbnREaXNwYXRjaGVyfSkgPT4ge1xuXG4gICAgICAgIGRiLnNpZ25hdHVyZSA9IFwiZmlyc3RDb25uZWN0aW9uXCI7XG5cbiAgICAgICAgZXZlbnREaXNwYXRjaGVyLm9uKFwiZGJDb25uZWN0aW9uQ2xvc2VkXCIsICgpID0+IHtcblxuICAgICAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpLnRoZW4oKHtcImRiXCI6IG5ld0RifSkgPT4ge1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBleHBlY3QobmV3RGIuc2lnbmF0dXJlKS50by5iZS51bmRlZmluZWQoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBkYi5lbWl0KFwiY2xvc2VcIiwgbmV3IERiRXJyb3JNb2NrKFwiaS9vIGVycm9yIG9jY3VycmVkXCIpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIndoZW4gdGhlIGRiIGNvbm5lY3Rpb24gZ2V0cyBjbG9zZWRcIiwgKCkgPT4ge1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soKSxcbiAgICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZ1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBmaXJlIHRoZSBcXFwiZGJDb25uZWN0aW9uQ2xvc2VkXFxcIiBldmVudCBvbiB0aGUgZXZlbnQgZGlzcGF0Y2hlciBvYmplY3RcIiwgZG9uZSA9PiB7XG5cbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpLnRoZW4oKHtkYiwgZXZlbnREaXNwYXRjaGVyfSkgPT4ge1xuXG4gICAgICAgIGV2ZW50RGlzcGF0Y2hlci5vbihcImRiQ29ubmVjdGlvbkNsb3NlZFwiLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHRydWUpLnRvLmJlLnRydWUoKTtcbiAgICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBkYi5lbWl0KFwiY2xvc2VcIiwgbmV3IERiRXJyb3JNb2NrKFwiaS9vIGVycm9yIG9jY3VycmVkXCIpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIndoZW4gdGhlIGRiIGNvbm5lY3Rpb24gZ2V0cyBvcGVuZWRcIiwgKCkgPT4ge1xuXG4gICAgY29uc3QgZXZlbnREaXNwYXRjaGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgYmVmb3JlKGRvbmUgPT4ge1xuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeSA9IG5ldyBEYkNvbm5lY3Rpb25NYW5hZ2VyKHtcbiAgICAgICAgXCJsb2dnZXJcIjogbG9nZ2VyTW9jayxcbiAgICAgICAgXCJuYXRpdmVEcml2ZXJcIjogZ2V0TmF0aXZlRHJpdmVyU3VjY2Vzc01vY2soKSxcbiAgICAgICAgXCJpb1RpbWVvdXRcIjogaW9UaW1lb3V0LFxuICAgICAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogY29ubmVjdGlvblN0cmluZyxcbiAgICAgICAgXCJldmVudERpc3BhdGNoZXJcIjogZXZlbnREaXNwYXRjaGVyXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9KTtcblxuICAgIGl0KFwic2hvdWxkIGZpcmUgdGhlIFxcXCJkYkNvbm5lY3Rpb25PcGVuZWRcXFwiIGV2ZW50IG9uIHRoZSBldmVudCBkaXNwYXRjaGVyIG9iamVjdFwiLCBkb25lID0+IHtcblxuICAgICAgZXZlbnREaXNwYXRjaGVyLm9uKFwiZGJDb25uZWN0aW9uT3BlbmVkXCIsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHRydWUpLnRvLmJlLnRydWUoKTtcbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0pO1xuXG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5LmdldENvbm5lY3Rpb24oKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJjbG9zZUNvbm5lY3Rpb25cIiwgKCkgPT4ge1xuICAgIGNvbnN0IGV2ZW50RGlzcGF0Y2hlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBiZWZvcmUoZG9uZSA9PiB7XG4gICAgICBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5ID0gbmV3IERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICBcImxvZ2dlclwiOiBsb2dnZXJNb2NrLFxuICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBnZXROYXRpdmVEcml2ZXJTdWNjZXNzTW9jaygpLFxuICAgICAgICBcImlvVGltZW91dFwiOiBpb1RpbWVvdXQsXG4gICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBjb25uZWN0aW9uU3RyaW5nLFxuICAgICAgICBcImV2ZW50RGlzcGF0Y2hlclwiOiBldmVudERpc3BhdGNoZXJcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoXCJzaG91bGQgY2xvc2UgdGhlIGNvbm5lY3Rpb24gYW5kIGVtaXQgXFxcImRiQ29ubmVjdGlvbkNsb3NlZFxcXCIgZXZlbnQgb24gdGhlIGV2ZW50IGRpc3BhdGNoZXIgb2JqZWN0XCIsIGRvbmUgPT4ge1xuXG4gICAgICBldmVudERpc3BhdGNoZXIub24oXCJkYkNvbm5lY3Rpb25DbG9zZWRcIiwgKCkgPT4ge1xuICAgICAgICBleHBlY3QodHJ1ZSkudG8uYmUudHJ1ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEZpcnN0IGNyZWF0ZSBhIGNvbm5lY3Rpb24gYW5kIHRoZW4gY2xvc2UgaXRcbiAgICAgIG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuZ2V0Q29ubmVjdGlvbigpXG4gICAgICAgIC50aGVuKG1vbmdvQ29ubmVjdGlvbkZhY3RvcnkuY2xvc2VDb25uZWN0aW9uKCkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBleHBlY3QobG9nZ2VyTW9jay50cmFjZS5jYWxsZWRXaXRoKFwiVGhlIGNvbm5lY3Rpb24gd2l0aCB0aGUgZGF0YWJhc2UgaGFzIGJlZW4gZGVzdHJveWVkXCIpKS50by5iZS50cnVlKCk7XG4gICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdChcInNob3VsZCBsb2cgYW5kIHJldHVybiBpZiB0aGVyZSBpcyBubyBjb25uZWN0aW9uIHRvIGJlIGNsb3NlZFwiLCBkb25lID0+IHtcblxuICAgICAgZXZlbnREaXNwYXRjaGVyLm9uKFwiZGJDb25uZWN0aW9uQ2xvc2VkXCIsICgpID0+IHtcbiAgICAgICAgLy8gVGhpcyBzaG91bGQgbm90IGJlIGNhbGxlZCBlbHNlIHRlc3QgY2FzZSB3aWxsIGJlIGZhaWxlZC5cbiAgICAgICAgZXhwZWN0KGZhbHNlKS50by5iZS50cnVlKCk7XG4gICAgICB9KTtcbiAgICAgIC8vIERvbid0IGNyZWF0ZSBhIGNvbm5lY3Rpb24gYW5kIGp1c3QgY2FsbCBjbG9zZVxuICAgICAgbW9uZ29Db25uZWN0aW9uRmFjdG9yeS5jbG9zZUNvbm5lY3Rpb24oKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgbG9nZ2VyTW9jay50cmFjZS5jYWxsZWRXaXRoKFwiTm8gYWN0aXZlIGNvbm5lY3Rpb24gdG8gYmUgY2xvc2VkXCIpO1xuICAgICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxufSk7XG4iXX0=
//# sourceMappingURL=mongo-connection-factory.js.map
