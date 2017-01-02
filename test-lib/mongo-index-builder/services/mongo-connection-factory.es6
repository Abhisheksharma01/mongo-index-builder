import "babel-polyfill";
import {EventEmitter} from "events";
import {expect} from "code";
import Lab from "lab";
import {spy, stub} from "sinon";
import Q from "q";
import "source-map-support/register";
import {DbConnectionManager} from "./../../../dist/services/mongo-connection-factory";

const lab = exports.lab = Lab.script();
const {before, describe, after, it} = lab;


const connectionString = "mongodb://user:password@foo:27017/bar";

const ioTimeout = 200;

const loggerMock = {
  "debug": stub(),
  "fatal": stub(),
  "error": stub(),
  "info": stub(),
  "warn": stub(),
  "trace": stub()
};

class DbErrorMock extends Error {
  constructor(...args) {
    super(args);
  }
}

function getDbMock() {
  return Object.create(new EventEmitter(), {
    "thisIsADbMock": {"value": "thisIsADbMock", "enumerable": true},
    "close": {"value": spy((force, callback) => {
      process.nextTick(() => callback(null, null));
    })}
  });
}

function getNativeDriverSuccessMock(dbMock) {
  return {
    connect(url, callback) {
      return process.nextTick(() => callback(null, dbMock || getDbMock()));
    }
  };
}

const connectionError = new Error("connection error");

const nativeDriverErrorMock = {
  connect(url, callback) {
    return process.nextTick(() => callback(connectionError, {}));
  }
};

const nativeDriverPendingMock = {
  connect() {}
};

function getEventDispatcher(signature) {
  return Object.create(new EventEmitter(), {
    "signature": {"value": signature, "enumerable": true}
  });
}

describe("The db manager service", () => {

  let mongoConnectionFactory;

  describe("when \"logger \"is not passed to the constructor", () => {

    const constructionParams = {
      // logger missing
      "nativeDriver": getNativeDriverSuccessMock(),
      "ioTimeout": ioTimeout,
      "connectionString": connectionString
    };

    it("should throw an error", done => {

      expect(() => {
        mongoConnectionFactory = new DbConnectionManager(constructionParams);
      }).to.throw(Error, "Argument logger expected to be defined.");

      return done();
    });
  });

  describe("when \"nativeDriver\" is not passed to the constructor", () => {

    const constructionParams = {
      "logger": loggerMock,
      // nativeDriver missing
      "ioTimeout": ioTimeout,
      "connectionString": connectionString
    };

    it("should throw an error", done => {

      expect(() => {
        mongoConnectionFactory = new DbConnectionManager(constructionParams);
      }).to.throw(Error, "Argument nativeDriver expected to be defined.");

      return done();
    });
  });

  describe("when \"ioTimeout\" is not passed to the constructor", () => {

    const constructionParams = {
      "logger": loggerMock,
      "nativeDriver": getNativeDriverSuccessMock(),
      // ioTimeout missing
      "connectionString": connectionString
    };

    it("should throw an error", done => {

      expect(() => {
        mongoConnectionFactory = new DbConnectionManager(constructionParams);
      }).to.throw(Error, "Argument ioTimeout expected to be defined.");

      return done();
    });
  });

  describe("when \"connectionString\" is not passed to the constructor", () => {

    const constructionParams = {
      "logger": loggerMock,
      "nativeDriver": getNativeDriverSuccessMock(),
      "ioTimeout": ioTimeout
      // connectionString missing
    };

    it("should throw an error", done => {

      expect(() => {
        mongoConnectionFactory = new DbConnectionManager(constructionParams);
      }).to.throw(Error, "Argument connectionString expected to be defined.");

      return done();
    });
  });

  describe("when \"eventDispatcher\" is not passed to the constructor", () => {

    const constructionParams = {
      "logger": loggerMock,
      "nativeDriver": getNativeDriverSuccessMock(),
      "ioTimeout": ioTimeout,
      "connectionString": connectionString
      // eventDispatcher missing
    };

    it("should not throw an error (the param is optional)", done => {

      expect(() => {
        mongoConnectionFactory = new DbConnectionManager(constructionParams);
      }).to.not.throw();

      return done();
    });
  });

  describe("when an event dispatcher object passed to the constructor and the service called without a callback", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": getEventDispatcher("thisIsAnEventDispatcher")
      });

      return done();
    });

    it("should return the same event dispatcher", () => {

      return mongoConnectionFactory.getConnection().then(({eventDispatcher}) => {

        expect(eventDispatcher).to.include({"signature": "thisIsAnEventDispatcher"});
      });
    });
  });

  describe("when an event dispatcher object passed to the constructor and the service called with a callback", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": getEventDispatcher("thisIsAnEventDispatcher")
      });

      return done();
    });

    it("should return the same event dispatcher", () => {

      return mongoConnectionFactory.getConnection().then(({eventDispatcher}) => {

        expect(eventDispatcher).to.include({"signature": "thisIsAnEventDispatcher"});

      });
    });
  });

  describe("when no callback passed and connection is successful", () => {

    let ret;

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });
      ret = mongoConnectionFactory.getConnection();

      return done();
    });

    it("should return a promise which gets resolved to a db instance and an event dispatcher ", () => {

      expect(Q.isPromise(ret)).to.be.true();
      return ret.then(({db, eventDispatcher}) => {
        expect(db).to.include({"thisIsADbMock": "thisIsADbMock"});
        expect(eventDispatcher).to.be.an.instanceOf(EventEmitter);
      });
    });
  });

  describe("when no callback passed and connection is not successful", () => {

    let ret;

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverErrorMock,
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });
      ret = mongoConnectionFactory.getConnection();

      return done();
    });

    it("should return a promise which gets rejected with a connection error", done => {

      expect(Q.isPromise(ret)).to.be.true();

      ret.then(() => {
        throw new Error("db connection should fail");
      }, err => {
        expect(err).to.be.equal(connectionError);
        return done();
      });
    });
  });

  describe("when no callback passed and connection times out", () => {

    let ret;

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverPendingMock,
        "ioTimeout": 0,
        "connectionString": connectionString
      });
      ret = mongoConnectionFactory.getConnection();

      return done();
    });

    it("should return a promise which gets rejected with a timeout error", done => {

      expect(Q.isPromise(ret)).to.be.true();

      ret.then(() => {
        throw new Error("db connection should fail with a timeout error");
      }, err => {
        expect(err.message).to.equal("Timed out after 0 ms");
        return done();
      });
    });
  });

  describe("when a callback passed and connection is successful", () => {

    let callback;
    let ret;
    const dbMock = getDbMock();
    const eventdispatcher = getEventDispatcher("thisIsAnEventDispatcher");

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(dbMock),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": eventdispatcher
      });
      callback = stub();
      ret = mongoConnectionFactory.getConnection(callback);

      return done();
    });

    it("should return undefined and execute the passed callback with the success signature", done => {

      expect(ret).to.be.undefined();

      process.nextTick(() => {
        expect(callback.callCount).to.equal(1);
        expect(callback.calledWith(null, {"db": dbMock, "eventDispatcher": eventdispatcher})).to.be.true();

        return done();
      });
    });
  });

  describe("when a callback passed and connection is not successful", () => {

    let callback;
    let ret;

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverErrorMock,
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });
      callback = stub();
      ret = mongoConnectionFactory.getConnection(callback);

      return done();
    });

    it("should return undefined and execute the passed callback with the error signature", done => {

      expect(ret).to.be.undefined();

      process.nextTick(() => {
        expect(callback
          .withArgs(connectionError, null)
          .calledOnce).to.be.true();
        return done();
      });
    });
  });

  describe("when connection get accessed more than once - case1", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should always return the already created connection", done => {

      mongoConnectionFactory.getConnection((err, firstAccess) => {

        if (err) {
          return done(err);
        }

        firstAccess.db.dbStamp = "dbStamp";
        firstAccess.eventDispatcher.eventDispatcherStamp = "eventDispatcherStamp";

        mongoConnectionFactory.getConnection().then(secondAccess => {

          expect(secondAccess.db).to.include({"dbStamp": "dbStamp"});
          expect(secondAccess.eventDispatcher).to.include({"eventDispatcherStamp": "eventDispatcherStamp"});
          return done();
        });
      });
    });
  });

  describe("when connection get accessed more than once - case2", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should always return the already created connection", done => {

      mongoConnectionFactory.getConnection().then(firstAccess => {

        firstAccess.db.dbStamp = "dbStamp";
        firstAccess.eventDispatcher.eventDispatcherStamp = "eventDispatcherStamp";

        mongoConnectionFactory.getConnection((err, secondAccess) => {

          if (err) {
            return done(err);
          }

          try {
            expect(secondAccess.db).to.include({"dbStamp": "dbStamp"});
            expect(secondAccess.eventDispatcher).to.include({"eventDispatcherStamp": "eventDispatcherStamp"});
          } catch (error) {
            return done(error);
          }
          return done();
        });
      });
    });
  });

  describe("when connection get accessed more than once - case3", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should always return the already created connection", done => {

      mongoConnectionFactory.getConnection((err, firstAccess) => {

        if (err) {
          return done(err);
        }

        firstAccess.db.dbStamp = "dbStamp";
        firstAccess.eventDispatcher.eventDispatcherStamp = "eventDispatcherStamp";

        mongoConnectionFactory.getConnection((error, secondAccess) => {

          if (error) {
            return done(error);
          }

          try {
            expect(secondAccess.db).to.include({"dbStamp": "dbStamp"});
            expect(secondAccess.eventDispatcher).to.include({"eventDispatcherStamp": "eventDispatcherStamp"});
          } catch (assertionError) {
            return done(assertionError);
          }
          return done();
        });
      });
    });
  });

  describe("when connection get accessed more than once - case4", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should always return the already created connection", done => {

      mongoConnectionFactory.getConnection().then(firstAccess => {

        firstAccess.db.dbStamp = "dbStamp";
        firstAccess.eventDispatcher.eventDispatcherStamp = "eventDispatcherStamp";

        mongoConnectionFactory.getConnection().then(secondAccess => {

          expect(secondAccess.db).to.include({"dbStamp": "dbStamp"});
          expect(secondAccess.eventDispatcher).to.include({"eventDispatcherStamp": "eventDispatcherStamp"});
          return done();
        });
      });
    });
  });

  describe("when db native \"authenticated\" event gets fired", () => {

    before(done => {
      loggerMock.debug.reset();
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", done => {

      mongoConnectionFactory.getConnection().then(({db}) => {

        const eventData = {"foo": "bar"};

        db.emit("authenticated", eventData);

        expect(loggerMock.debug.calledWith("All db servers are successfully authenticated: ", eventData)).to.be.true();
        return done();
      });
    });
  });

  describe("when db native \"close\" event gets fired", () => {

    before(done => {
      loggerMock.error.reset();
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", done => {

      mongoConnectionFactory.getConnection().then(({db}) => {

        const closeError = new DbErrorMock("close event occurred");

        db.emit("close", closeError);

        expect(loggerMock.error.calledWith("The socket closed against the db server: ", closeError)).to.be.true();

        return done();
      });
    });
  });

  describe("when db native \"error\" event gets fired", () => {

    before(done => {
      loggerMock.error.reset();
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", done => {

      mongoConnectionFactory.getConnection().then(({db}) => {

        const dbError = new DbErrorMock("generic db event occurred");

        db.emit("error", dbError);

        expect(loggerMock.error.calledWith("A db error occurred against a db server: ", dbError)).to.be.true();

        return done();
      });
    });
  });

  describe("when db native \"fullsetup\" event gets fired", () => {

    before(done => {
      loggerMock.debug.reset();
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", done => {

      mongoConnectionFactory.getConnection().then(({db}) => {

        db.emit("fullsetup", {"foo": "bar"});

        expect(loggerMock.debug.calledWith("All db servers connected and set up")).to.be.true();

        return done();
      });
    });
  });

  describe("when db native \"parseError\" event gets fired", () => {

    before(done => {
      loggerMock.error.reset();
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", done => {

      mongoConnectionFactory.getConnection().then(({db}) => {

        const parseError = new DbErrorMock("parse BSON event occurred");

        db.emit("parseError", parseError);

        expect(loggerMock.error.calledWith("An illegal or corrupt BSON received from the server: ", parseError)).to.be.true();

        return done();
      });
    });
  });

  describe("when db native \"reconnect\" event gets fired", () => {

    before(done => {
      loggerMock.debug.reset();
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", done => {

      mongoConnectionFactory.getConnection().then(({db}) => {

        const eventData = {"foo": "bar"};

        db.emit("reconnect", eventData);

        expect(loggerMock.debug.calledWith("The driver has successfully reconnected to and authenticated against the server: ", eventData)).to.be.true();
        return done();
      });
    });
  });

  describe("when db native \"timeout\" event gets fired", () => {

    before(done => {
      loggerMock.error.reset();
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should listen to it and log it", done => {

      mongoConnectionFactory.getConnection().then(({db}) => {

        const timeoutError = new DbErrorMock("timeout error occurred");

        db.emit("timeout", timeoutError);

        expect(loggerMock.error.calledWith("The socket timed out against the db server: ", timeoutError)).to.be.true();

        return done();
      });
    });
  });

  describe("when db connection gets accessed but is already broken", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverErrorMock,
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    after(done => {
      nativeDriverErrorMock.connect.restore();

      return done();
    });

    it("should try to recreate that", done => {

      mongoConnectionFactory.getConnection()
        .then(() => {
          return done(new Error("The connection should be broken initially"));
        }, () => {
          spy(nativeDriverErrorMock, "connect");
          return mongoConnectionFactory.getConnection();
        })
        .catch(() => {
          expect(nativeDriverErrorMock.connect.calledWith(connectionString)).to.be.true();
          expect(nativeDriverErrorMock.connect.callCount).to.equal(1);
          return done();
        });
    });
  });

  describe("when but connection gets accessed but is pending", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": nativeDriverPendingMock,
        "ioTimeout": 20000, // Should be bigger than mocha timeout
        "connectionString": connectionString
      });

      return done();
    });

    after(done => {
      nativeDriverPendingMock.connect.restore();
      return done();
    });

    it("should not try to recreate that", done => {

      mongoConnectionFactory.getConnection().then(() => {
        throw new Error("The connection should be pending initially");
      }, () => {
        throw new Error("The connection should be pending initially");
      });

      spy(nativeDriverPendingMock, "connect");
      mongoConnectionFactory.getConnection();

      expect(nativeDriverPendingMock.connect.called).to.be.false();

      return done();
    });
  });

  describe("when the db native \"close\" event happens", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should force close the current db connection", done => {

      mongoConnectionFactory.getConnection().then(({db, eventDispatcher}) => {

        db.signature = "firstConnection";

        eventDispatcher.on("dbConnectionClosed", () => {

          mongoConnectionFactory.getConnection().then(({"db": newDb}) => {

            try {
              expect(newDb.signature).to.be.undefined();
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

  describe("when the db connection gets closed", () => {

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString
      });

      return done();
    });

    it("should fire the \"dbConnectionClosed\" event on the event dispatcher object", done => {

      mongoConnectionFactory.getConnection().then(({db, eventDispatcher}) => {

        eventDispatcher.on("dbConnectionClosed", () => {
          expect(true).to.be.true();
          return done();
        });

        db.emit("close", new DbErrorMock("i/o error occurred"));
      });
    });
  });

  describe("when the db connection gets opened", () => {

    const eventDispatcher = new EventEmitter();

    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": eventDispatcher
      });

      return done();
    });

    it("should fire the \"dbConnectionOpened\" event on the event dispatcher object", done => {

      eventDispatcher.on("dbConnectionOpened", () => {
        expect(true).to.be.true();
        return done();
      });

      mongoConnectionFactory.getConnection();
    });
  });

  describe("closeConnection", () => {
    const eventDispatcher = new EventEmitter();
    before(done => {
      mongoConnectionFactory = new DbConnectionManager({
        "logger": loggerMock,
        "nativeDriver": getNativeDriverSuccessMock(),
        "ioTimeout": ioTimeout,
        "connectionString": connectionString,
        "eventDispatcher": eventDispatcher
      });

      return done();
    });

    it("should close the connection and emit \"dbConnectionClosed\" event on the event dispatcher object", done => {

      eventDispatcher.on("dbConnectionClosed", () => {
        expect(true).to.be.true();
      });

      // First create a connection and then close it
      mongoConnectionFactory.getConnection()
        .then(mongoConnectionFactory.closeConnection())
        .then(() => {
          expect(loggerMock.trace.calledWith("The connection with the database has been destroyed")).to.be.true();
          return done();
        });
    });

    it("should log and return if there is no connection to be closed", done => {

      eventDispatcher.on("dbConnectionClosed", () => {
        // This should not be called else test case will be failed.
        expect(false).to.be.true();
      });
      // Don't create a connection and just call close
      mongoConnectionFactory.closeConnection()
        .then(() => {
          loggerMock.trace.calledWith("No active connection to be closed");
          return done();
        });
    });
  });

});
