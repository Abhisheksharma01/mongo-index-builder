import {EventEmitter} from "events";
import Q from "q";
import * as customErrors from "./../customErrors";

let protectedInstance;

/**
 * Represents a db connection service instance
 * @class
 */
export class DbConnectionManager {

  /**
   * Creates db connection manager services
   * @param {Object} logger the logger instance
   * @param {Object} nativeDriver The native db driver instance
   * @param {string} connectionString The url string to connect the db
   * @param {number} ioTimeout The max time in ms to wait for asynchronous i/o
   * @param {EventEmitter} [eventDispatcher] The returned event dispatcher instance to fire events on
   * @returns {void}
   */
  constructor({logger, nativeDriver, connectionString, ioTimeout, eventDispatcher}) {

    if (!logger) {
      throw new customErrors.argumentUndefined("logger");
    }

    if (!nativeDriver) {
      throw new customErrors.argumentUndefined("nativeDriver");
    }

    if (!connectionString) {
      throw new customErrors.argumentUndefined("connectionString");
    }

    if (typeof ioTimeout === "undefined") { // Well 0 is falsy so let's shoot for the precise value
      throw new customErrors.argumentUndefined("ioTimeout");
    }

    /** @member {Object} The logger instance */
    this.logger_ = logger;

    /** @member {Object} The native db driver instance */
    this.nativeDriver_ = nativeDriver;

    /** @member {string} The url string to connect the db */
    this.connectionString_ = connectionString;

    /** @member {number} The max time in ms to wait for asynchronous i/o */
    this.ioTimeout_ = ioTimeout;

    /** @member {EventEmitter} The returned event dispatcher instance to fire events on */
    this.eventDispatcher_ = eventDispatcher || new EventEmitter();

    /** @member {Q.Promise} The promise wich represents the connection */
    this.dbPromise_ = Q.reject("Db connection is closed");
  }

  /**
   * The public factory method
   * @public
   * @param {Function} [callback] The node.js style callback to execute if promise is not wanted to return
   * @returns {Q.Promise|undefined} Either a promise or undefined if callback passed in
   */
  getConnection(callback) {

    let dbPromise = this.dbPromise_;
    const eventDispatcher = this.eventDispatcher_;

    if (Q.isRejected(dbPromise)) {
      dbPromise = this.dbPromise_ = Q.ninvoke(this.nativeDriver_, "connect", this.connectionString_)
        .timeout(this.ioTimeout_)
        .catch(err => {
          this.logger_.fatal("The db connection could not be opened: ", err);
          throw err;
        })
        .tap(db => {
          db.on("authenticated", eventData => this.logger_.debug("All db servers are successfully authenticated: ", eventData));
          db.on("close", dbError => this.closeEventHandler_(dbError));
          db.on("error", dbError => this.logger_.error("A db error occurred against a db server: ", dbError));
          db.on("fullsetup", () => this.logger_.debug("All db servers connected and set up"));
          db.on("parseError", dbError => this.logger_.error("An illegal or corrupt BSON received from the server: ", dbError));
          db.on("reconnect", eventData => this.logger_.debug("The driver has successfully reconnected to and authenticated against the server: ", eventData));
          db.on("timeout", dbError => this.logger_.error("The socket timed out against the db server: ", dbError));
          this.eventDispatcher_.emit("dbConnectionOpened");
          this.logger_.trace("The connection with the database has been established");
        });
    }

    if (callback) {
      dbPromise.then(db => callback(null, {db, eventDispatcher}), err => callback(err, null));
      return;
    }

    return dbPromise.then(db => {
      return {db, eventDispatcher};
    });
  }

  /**
   * The public method for closing the db connection
   * @public
   * @returns {Q.Promise<void>} Returns an empty promise after closing the closing the connection
   */
  closeConnection() {
    if (!Q.isRejected(this.dbPromise_)) {
      return this.dbPromise_
        .then(db => Q.ninvoke(db, "close", true))
        .timeout(this.ioTimeout_)
        .then(() => {
          this.dbPromise_ = Q.reject("Db connection is closed");
          this.eventDispatcher_.emit("dbConnectionClosed");
          this.logger_.trace("The connection with the database has been destroyed");
        }, err => this.logger_.fatal("The db connection could not be closed: ", err));
    }

    // If there is no connection established yet, just log and return
    this.logger_.trace("No active connection to be closed");
    return Q.resolve();
  }

  /**
   * Handles the native "close" event
   * 1. Force close the connection.
   * 2. Reassigns this.dbPromise_ with rejected promise.
   * 3. Fires dbConnectionClosed events when i/o is done.
   * @private
   * @param {Error} dbError The db native error instance
   * @private
   * @returns {undefined} undefined
   */
  closeEventHandler_(dbError) {
    this.logger_.error("The socket closed against the db server: ", dbError);
    this.closeConnection()
      .done();
  }
}

/**
 * Returns db manager service singleton
 * @param {*} args The arguments to proxy towards the class
 * @returns {DbConnectionManager}  The db connection manager instance
 */
export function getDbConnectionManager(...args) {

  protectedInstance = protectedInstance || new DbConnectionManager(...args);

  return protectedInstance;
}

