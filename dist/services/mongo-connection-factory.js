"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DbConnectionManager = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getDbConnectionManager = getDbConnectionManager;

var _events = require("events");

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _customErrors = require("./../customErrors");

var customErrors = _interopRequireWildcard(_customErrors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var protectedInstance = void 0;

/**
 * Represents a db connection service instance
 * @class
 */

var DbConnectionManager = exports.DbConnectionManager = function () {

  /**
   * Creates db connection manager services
   * @param {Object} logger the logger instance
   * @param {Object} nativeDriver The native db driver instance
   * @param {string} connectionString The url string to connect the db
   * @param {number} ioTimeout The max time in ms to wait for asynchronous i/o
   * @param {EventEmitter} [eventDispatcher] The returned event dispatcher instance to fire events on
   * @returns {void}
   */
  function DbConnectionManager(_ref) {
    var logger = _ref.logger,
        nativeDriver = _ref.nativeDriver,
        connectionString = _ref.connectionString,
        ioTimeout = _ref.ioTimeout,
        eventDispatcher = _ref.eventDispatcher;

    _classCallCheck(this, DbConnectionManager);

    if (!logger) {
      throw new customErrors.argumentUndefined("logger");
    }

    if (!nativeDriver) {
      throw new customErrors.argumentUndefined("nativeDriver");
    }

    if (!connectionString) {
      throw new customErrors.argumentUndefined("connectionString");
    }

    if (typeof ioTimeout === "undefined") {
      // Well 0 is falsy so let's shoot for the precise value
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
    this.eventDispatcher_ = eventDispatcher || new _events.EventEmitter();

    /** @member {Q.Promise} The promise wich represents the connection */
    this.dbPromise_ = _q2.default.reject("Db connection is closed");
  }

  /**
   * The public factory method
   * @public
   * @param {Function} [callback] The node.js style callback to execute if promise is not wanted to return
   * @returns {Q.Promise|undefined} Either a promise or undefined if callback passed in
   */


  _createClass(DbConnectionManager, [{
    key: "getConnection",
    value: function getConnection(callback) {
      var _this = this;

      var dbPromise = this.dbPromise_;
      var eventDispatcher = this.eventDispatcher_;

      if (_q2.default.isRejected(dbPromise)) {
        dbPromise = this.dbPromise_ = _q2.default.ninvoke(this.nativeDriver_, "connect", this.connectionString_).timeout(this.ioTimeout_).catch(function (err) {
          _this.logger_.fatal("The db connection could not be opened: ", err);
          throw err;
        }).tap(function (db) {
          db.on("authenticated", function (eventData) {
            return _this.logger_.debug("All db servers are successfully authenticated: ", eventData);
          });
          db.on("close", function (dbError) {
            return _this.closeEventHandler_(dbError);
          });
          db.on("error", function (dbError) {
            return _this.logger_.error("A db error occurred against a db server: ", dbError);
          });
          db.on("fullsetup", function () {
            return _this.logger_.debug("All db servers connected and set up");
          });
          db.on("parseError", function (dbError) {
            return _this.logger_.error("An illegal or corrupt BSON received from the server: ", dbError);
          });
          db.on("reconnect", function (eventData) {
            return _this.logger_.debug("The driver has successfully reconnected to and authenticated against the server: ", eventData);
          });
          db.on("timeout", function (dbError) {
            return _this.logger_.error("The socket timed out against the db server: ", dbError);
          });
          _this.eventDispatcher_.emit("dbConnectionOpened");
          _this.logger_.trace("The connection with the database has been established");
        });
      }

      if (callback) {
        dbPromise.then(function (db) {
          return callback(null, { db: db, eventDispatcher: eventDispatcher });
        }, function (err) {
          return callback(err, null);
        });
        return;
      }

      return dbPromise.then(function (db) {
        return { db: db, eventDispatcher: eventDispatcher };
      });
    }

    /**
     * The public method for closing the db connection
     * @public
     * @returns {Q.Promise<void>} Returns an empty promise after closing the closing the connection
     */

  }, {
    key: "closeConnection",
    value: function closeConnection() {
      var _this2 = this;

      if (!_q2.default.isRejected(this.dbPromise_)) {
        return this.dbPromise_.then(function (db) {
          return _q2.default.ninvoke(db, "close", true);
        }).timeout(this.ioTimeout_).then(function () {
          _this2.dbPromise_ = _q2.default.reject("Db connection is closed");
          _this2.eventDispatcher_.emit("dbConnectionClosed");
          _this2.logger_.trace("The connection with the database has been destroyed");
        }, function (err) {
          return _this2.logger_.fatal("The db connection could not be closed: ", err);
        });
      }

      // If there is no connection established yet, just log and return
      this.logger_.trace("No active connection to be closed");
      return _q2.default.resolve();
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

  }, {
    key: "closeEventHandler_",
    value: function closeEventHandler_(dbError) {
      this.logger_.error("The socket closed against the db server: ", dbError);
      this.closeConnection().done();
    }
  }]);

  return DbConnectionManager;
}();

/**
 * Returns db manager service singleton
 * @param {*} args The arguments to proxy towards the class
 * @returns {DbConnectionManager}  The db connection manager instance
 */


function getDbConnectionManager() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  protectedInstance = protectedInstance || new (Function.prototype.bind.apply(DbConnectionManager, [null].concat(args)))();

  return protectedInstance;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zZXJ2aWNlcy9tb25nby1jb25uZWN0aW9uLWZhY3RvcnkuZXM2Il0sIm5hbWVzIjpbImdldERiQ29ubmVjdGlvbk1hbmFnZXIiLCJjdXN0b21FcnJvcnMiLCJwcm90ZWN0ZWRJbnN0YW5jZSIsIkRiQ29ubmVjdGlvbk1hbmFnZXIiLCJsb2dnZXIiLCJuYXRpdmVEcml2ZXIiLCJjb25uZWN0aW9uU3RyaW5nIiwiaW9UaW1lb3V0IiwiZXZlbnREaXNwYXRjaGVyIiwiYXJndW1lbnRVbmRlZmluZWQiLCJsb2dnZXJfIiwibmF0aXZlRHJpdmVyXyIsImNvbm5lY3Rpb25TdHJpbmdfIiwiaW9UaW1lb3V0XyIsImV2ZW50RGlzcGF0Y2hlcl8iLCJkYlByb21pc2VfIiwicmVqZWN0IiwiY2FsbGJhY2siLCJkYlByb21pc2UiLCJpc1JlamVjdGVkIiwibmludm9rZSIsInRpbWVvdXQiLCJjYXRjaCIsImZhdGFsIiwiZXJyIiwidGFwIiwiZGIiLCJvbiIsImRlYnVnIiwiZXZlbnREYXRhIiwiY2xvc2VFdmVudEhhbmRsZXJfIiwiZGJFcnJvciIsImVycm9yIiwiZW1pdCIsInRyYWNlIiwidGhlbiIsInJlc29sdmUiLCJjbG9zZUNvbm5lY3Rpb24iLCJkb25lIiwiYXJncyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O1FBK0lnQkEsc0IsR0FBQUEsc0I7O0FBL0loQjs7QUFDQTs7OztBQUNBOztJQUFZQyxZOzs7Ozs7OztBQUVaLElBQUlDLDBCQUFKOztBQUVBOzs7OztJQUlhQyxtQixXQUFBQSxtQjs7QUFFWDs7Ozs7Ozs7O0FBU0EscUNBQWtGO0FBQUEsUUFBckVDLE1BQXFFLFFBQXJFQSxNQUFxRTtBQUFBLFFBQTdEQyxZQUE2RCxRQUE3REEsWUFBNkQ7QUFBQSxRQUEvQ0MsZ0JBQStDLFFBQS9DQSxnQkFBK0M7QUFBQSxRQUE3QkMsU0FBNkIsUUFBN0JBLFNBQTZCO0FBQUEsUUFBbEJDLGVBQWtCLFFBQWxCQSxlQUFrQjs7QUFBQTs7QUFFaEYsUUFBSSxDQUFDSixNQUFMLEVBQWE7QUFDWCxZQUFNLElBQUlILGFBQWFRLGlCQUFqQixDQUFtQyxRQUFuQyxDQUFOO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDSixZQUFMLEVBQW1CO0FBQ2pCLFlBQU0sSUFBSUosYUFBYVEsaUJBQWpCLENBQW1DLGNBQW5DLENBQU47QUFDRDs7QUFFRCxRQUFJLENBQUNILGdCQUFMLEVBQXVCO0FBQ3JCLFlBQU0sSUFBSUwsYUFBYVEsaUJBQWpCLENBQW1DLGtCQUFuQyxDQUFOO0FBQ0Q7O0FBRUQsUUFBSSxPQUFPRixTQUFQLEtBQXFCLFdBQXpCLEVBQXNDO0FBQUU7QUFDdEMsWUFBTSxJQUFJTixhQUFhUSxpQkFBakIsQ0FBbUMsV0FBbkMsQ0FBTjtBQUNEOztBQUVEO0FBQ0EsU0FBS0MsT0FBTCxHQUFlTixNQUFmOztBQUVBO0FBQ0EsU0FBS08sYUFBTCxHQUFxQk4sWUFBckI7O0FBRUE7QUFDQSxTQUFLTyxpQkFBTCxHQUF5Qk4sZ0JBQXpCOztBQUVBO0FBQ0EsU0FBS08sVUFBTCxHQUFrQk4sU0FBbEI7O0FBRUE7QUFDQSxTQUFLTyxnQkFBTCxHQUF3Qk4sbUJBQW1CLDBCQUEzQzs7QUFFQTtBQUNBLFNBQUtPLFVBQUwsR0FBa0IsWUFBRUMsTUFBRixDQUFTLHlCQUFULENBQWxCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7a0NBTWNDLFEsRUFBVTtBQUFBOztBQUV0QixVQUFJQyxZQUFZLEtBQUtILFVBQXJCO0FBQ0EsVUFBTVAsa0JBQWtCLEtBQUtNLGdCQUE3Qjs7QUFFQSxVQUFJLFlBQUVLLFVBQUYsQ0FBYUQsU0FBYixDQUFKLEVBQTZCO0FBQzNCQSxvQkFBWSxLQUFLSCxVQUFMLEdBQWtCLFlBQUVLLE9BQUYsQ0FBVSxLQUFLVCxhQUFmLEVBQThCLFNBQTlCLEVBQXlDLEtBQUtDLGlCQUE5QyxFQUMzQlMsT0FEMkIsQ0FDbkIsS0FBS1IsVUFEYyxFQUUzQlMsS0FGMkIsQ0FFckIsZUFBTztBQUNaLGdCQUFLWixPQUFMLENBQWFhLEtBQWIsQ0FBbUIseUNBQW5CLEVBQThEQyxHQUE5RDtBQUNBLGdCQUFNQSxHQUFOO0FBQ0QsU0FMMkIsRUFNM0JDLEdBTjJCLENBTXZCLGNBQU07QUFDVEMsYUFBR0MsRUFBSCxDQUFNLGVBQU4sRUFBdUI7QUFBQSxtQkFBYSxNQUFLakIsT0FBTCxDQUFha0IsS0FBYixDQUFtQixpREFBbkIsRUFBc0VDLFNBQXRFLENBQWI7QUFBQSxXQUF2QjtBQUNBSCxhQUFHQyxFQUFILENBQU0sT0FBTixFQUFlO0FBQUEsbUJBQVcsTUFBS0csa0JBQUwsQ0FBd0JDLE9BQXhCLENBQVg7QUFBQSxXQUFmO0FBQ0FMLGFBQUdDLEVBQUgsQ0FBTSxPQUFOLEVBQWU7QUFBQSxtQkFBVyxNQUFLakIsT0FBTCxDQUFhc0IsS0FBYixDQUFtQiwyQ0FBbkIsRUFBZ0VELE9BQWhFLENBQVg7QUFBQSxXQUFmO0FBQ0FMLGFBQUdDLEVBQUgsQ0FBTSxXQUFOLEVBQW1CO0FBQUEsbUJBQU0sTUFBS2pCLE9BQUwsQ0FBYWtCLEtBQWIsQ0FBbUIscUNBQW5CLENBQU47QUFBQSxXQUFuQjtBQUNBRixhQUFHQyxFQUFILENBQU0sWUFBTixFQUFvQjtBQUFBLG1CQUFXLE1BQUtqQixPQUFMLENBQWFzQixLQUFiLENBQW1CLHVEQUFuQixFQUE0RUQsT0FBNUUsQ0FBWDtBQUFBLFdBQXBCO0FBQ0FMLGFBQUdDLEVBQUgsQ0FBTSxXQUFOLEVBQW1CO0FBQUEsbUJBQWEsTUFBS2pCLE9BQUwsQ0FBYWtCLEtBQWIsQ0FBbUIsbUZBQW5CLEVBQXdHQyxTQUF4RyxDQUFiO0FBQUEsV0FBbkI7QUFDQUgsYUFBR0MsRUFBSCxDQUFNLFNBQU4sRUFBaUI7QUFBQSxtQkFBVyxNQUFLakIsT0FBTCxDQUFhc0IsS0FBYixDQUFtQiw4Q0FBbkIsRUFBbUVELE9BQW5FLENBQVg7QUFBQSxXQUFqQjtBQUNBLGdCQUFLakIsZ0JBQUwsQ0FBc0JtQixJQUF0QixDQUEyQixvQkFBM0I7QUFDQSxnQkFBS3ZCLE9BQUwsQ0FBYXdCLEtBQWIsQ0FBbUIsdURBQW5CO0FBQ0QsU0FoQjJCLENBQTlCO0FBaUJEOztBQUVELFVBQUlqQixRQUFKLEVBQWM7QUFDWkMsa0JBQVVpQixJQUFWLENBQWU7QUFBQSxpQkFBTWxCLFNBQVMsSUFBVCxFQUFlLEVBQUNTLE1BQUQsRUFBS2xCLGdDQUFMLEVBQWYsQ0FBTjtBQUFBLFNBQWYsRUFBNEQ7QUFBQSxpQkFBT1MsU0FBU08sR0FBVCxFQUFjLElBQWQsQ0FBUDtBQUFBLFNBQTVEO0FBQ0E7QUFDRDs7QUFFRCxhQUFPTixVQUFVaUIsSUFBVixDQUFlLGNBQU07QUFDMUIsZUFBTyxFQUFDVCxNQUFELEVBQUtsQixnQ0FBTCxFQUFQO0FBQ0QsT0FGTSxDQUFQO0FBR0Q7O0FBRUQ7Ozs7Ozs7O3NDQUtrQjtBQUFBOztBQUNoQixVQUFJLENBQUMsWUFBRVcsVUFBRixDQUFhLEtBQUtKLFVBQWxCLENBQUwsRUFBb0M7QUFDbEMsZUFBTyxLQUFLQSxVQUFMLENBQ0pvQixJQURJLENBQ0M7QUFBQSxpQkFBTSxZQUFFZixPQUFGLENBQVVNLEVBQVYsRUFBYyxPQUFkLEVBQXVCLElBQXZCLENBQU47QUFBQSxTQURELEVBRUpMLE9BRkksQ0FFSSxLQUFLUixVQUZULEVBR0pzQixJQUhJLENBR0MsWUFBTTtBQUNWLGlCQUFLcEIsVUFBTCxHQUFrQixZQUFFQyxNQUFGLENBQVMseUJBQVQsQ0FBbEI7QUFDQSxpQkFBS0YsZ0JBQUwsQ0FBc0JtQixJQUF0QixDQUEyQixvQkFBM0I7QUFDQSxpQkFBS3ZCLE9BQUwsQ0FBYXdCLEtBQWIsQ0FBbUIscURBQW5CO0FBQ0QsU0FQSSxFQU9GO0FBQUEsaUJBQU8sT0FBS3hCLE9BQUwsQ0FBYWEsS0FBYixDQUFtQix5Q0FBbkIsRUFBOERDLEdBQTlELENBQVA7QUFBQSxTQVBFLENBQVA7QUFRRDs7QUFFRDtBQUNBLFdBQUtkLE9BQUwsQ0FBYXdCLEtBQWIsQ0FBbUIsbUNBQW5CO0FBQ0EsYUFBTyxZQUFFRSxPQUFGLEVBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7Ozt1Q0FVbUJMLE8sRUFBUztBQUMxQixXQUFLckIsT0FBTCxDQUFhc0IsS0FBYixDQUFtQiwyQ0FBbkIsRUFBZ0VELE9BQWhFO0FBQ0EsV0FBS00sZUFBTCxHQUNHQyxJQURIO0FBRUQ7Ozs7OztBQUdIOzs7Ozs7O0FBS08sU0FBU3RDLHNCQUFULEdBQXlDO0FBQUEsb0NBQU51QyxJQUFNO0FBQU5BLFFBQU07QUFBQTs7QUFFOUNyQyxzQkFBb0JBLHdEQUF5QkMsbUJBQXpCLGdCQUFnRG9DLElBQWhELEtBQXBCOztBQUVBLFNBQU9yQyxpQkFBUDtBQUNEIiwiZmlsZSI6Im1vbmdvLWNvbm5lY3Rpb24tZmFjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgUSBmcm9tIFwicVwiO1xuaW1wb3J0ICogYXMgY3VzdG9tRXJyb3JzIGZyb20gXCIuLy4uL2N1c3RvbUVycm9yc1wiO1xuXG5sZXQgcHJvdGVjdGVkSW5zdGFuY2U7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGRiIGNvbm5lY3Rpb24gc2VydmljZSBpbnN0YW5jZVxuICogQGNsYXNzXG4gKi9cbmV4cG9ydCBjbGFzcyBEYkNvbm5lY3Rpb25NYW5hZ2VyIHtcblxuICAvKipcbiAgICogQ3JlYXRlcyBkYiBjb25uZWN0aW9uIG1hbmFnZXIgc2VydmljZXNcbiAgICogQHBhcmFtIHtPYmplY3R9IGxvZ2dlciB0aGUgbG9nZ2VyIGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBuYXRpdmVEcml2ZXIgVGhlIG5hdGl2ZSBkYiBkcml2ZXIgaW5zdGFuY2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvbm5lY3Rpb25TdHJpbmcgVGhlIHVybCBzdHJpbmcgdG8gY29ubmVjdCB0aGUgZGJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlvVGltZW91dCBUaGUgbWF4IHRpbWUgaW4gbXMgdG8gd2FpdCBmb3IgYXN5bmNocm9ub3VzIGkvb1xuICAgKiBAcGFyYW0ge0V2ZW50RW1pdHRlcn0gW2V2ZW50RGlzcGF0Y2hlcl0gVGhlIHJldHVybmVkIGV2ZW50IGRpc3BhdGNoZXIgaW5zdGFuY2UgdG8gZmlyZSBldmVudHMgb25cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7bG9nZ2VyLCBuYXRpdmVEcml2ZXIsIGNvbm5lY3Rpb25TdHJpbmcsIGlvVGltZW91dCwgZXZlbnREaXNwYXRjaGVyfSkge1xuXG4gICAgaWYgKCFsb2dnZXIpIHtcbiAgICAgIHRocm93IG5ldyBjdXN0b21FcnJvcnMuYXJndW1lbnRVbmRlZmluZWQoXCJsb2dnZXJcIik7XG4gICAgfVxuXG4gICAgaWYgKCFuYXRpdmVEcml2ZXIpIHtcbiAgICAgIHRocm93IG5ldyBjdXN0b21FcnJvcnMuYXJndW1lbnRVbmRlZmluZWQoXCJuYXRpdmVEcml2ZXJcIik7XG4gICAgfVxuXG4gICAgaWYgKCFjb25uZWN0aW9uU3RyaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgY3VzdG9tRXJyb3JzLmFyZ3VtZW50VW5kZWZpbmVkKFwiY29ubmVjdGlvblN0cmluZ1wiKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGlvVGltZW91dCA9PT0gXCJ1bmRlZmluZWRcIikgeyAvLyBXZWxsIDAgaXMgZmFsc3kgc28gbGV0J3Mgc2hvb3QgZm9yIHRoZSBwcmVjaXNlIHZhbHVlXG4gICAgICB0aHJvdyBuZXcgY3VzdG9tRXJyb3JzLmFyZ3VtZW50VW5kZWZpbmVkKFwiaW9UaW1lb3V0XCIpO1xuICAgIH1cblxuICAgIC8qKiBAbWVtYmVyIHtPYmplY3R9IFRoZSBsb2dnZXIgaW5zdGFuY2UgKi9cbiAgICB0aGlzLmxvZ2dlcl8gPSBsb2dnZXI7XG5cbiAgICAvKiogQG1lbWJlciB7T2JqZWN0fSBUaGUgbmF0aXZlIGRiIGRyaXZlciBpbnN0YW5jZSAqL1xuICAgIHRoaXMubmF0aXZlRHJpdmVyXyA9IG5hdGl2ZURyaXZlcjtcblxuICAgIC8qKiBAbWVtYmVyIHtzdHJpbmd9IFRoZSB1cmwgc3RyaW5nIHRvIGNvbm5lY3QgdGhlIGRiICovXG4gICAgdGhpcy5jb25uZWN0aW9uU3RyaW5nXyA9IGNvbm5lY3Rpb25TdHJpbmc7XG5cbiAgICAvKiogQG1lbWJlciB7bnVtYmVyfSBUaGUgbWF4IHRpbWUgaW4gbXMgdG8gd2FpdCBmb3IgYXN5bmNocm9ub3VzIGkvbyAqL1xuICAgIHRoaXMuaW9UaW1lb3V0XyA9IGlvVGltZW91dDtcblxuICAgIC8qKiBAbWVtYmVyIHtFdmVudEVtaXR0ZXJ9IFRoZSByZXR1cm5lZCBldmVudCBkaXNwYXRjaGVyIGluc3RhbmNlIHRvIGZpcmUgZXZlbnRzIG9uICovXG4gICAgdGhpcy5ldmVudERpc3BhdGNoZXJfID0gZXZlbnREaXNwYXRjaGVyIHx8IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIC8qKiBAbWVtYmVyIHtRLlByb21pc2V9IFRoZSBwcm9taXNlIHdpY2ggcmVwcmVzZW50cyB0aGUgY29ubmVjdGlvbiAqL1xuICAgIHRoaXMuZGJQcm9taXNlXyA9IFEucmVqZWN0KFwiRGIgY29ubmVjdGlvbiBpcyBjbG9zZWRcIik7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHB1YmxpYyBmYWN0b3J5IG1ldGhvZFxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gVGhlIG5vZGUuanMgc3R5bGUgY2FsbGJhY2sgdG8gZXhlY3V0ZSBpZiBwcm9taXNlIGlzIG5vdCB3YW50ZWQgdG8gcmV0dXJuXG4gICAqIEByZXR1cm5zIHtRLlByb21pc2V8dW5kZWZpbmVkfSBFaXRoZXIgYSBwcm9taXNlIG9yIHVuZGVmaW5lZCBpZiBjYWxsYmFjayBwYXNzZWQgaW5cbiAgICovXG4gIGdldENvbm5lY3Rpb24oY2FsbGJhY2spIHtcblxuICAgIGxldCBkYlByb21pc2UgPSB0aGlzLmRiUHJvbWlzZV87XG4gICAgY29uc3QgZXZlbnREaXNwYXRjaGVyID0gdGhpcy5ldmVudERpc3BhdGNoZXJfO1xuXG4gICAgaWYgKFEuaXNSZWplY3RlZChkYlByb21pc2UpKSB7XG4gICAgICBkYlByb21pc2UgPSB0aGlzLmRiUHJvbWlzZV8gPSBRLm5pbnZva2UodGhpcy5uYXRpdmVEcml2ZXJfLCBcImNvbm5lY3RcIiwgdGhpcy5jb25uZWN0aW9uU3RyaW5nXylcbiAgICAgICAgLnRpbWVvdXQodGhpcy5pb1RpbWVvdXRfKVxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICB0aGlzLmxvZ2dlcl8uZmF0YWwoXCJUaGUgZGIgY29ubmVjdGlvbiBjb3VsZCBub3QgYmUgb3BlbmVkOiBcIiwgZXJyKTtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pXG4gICAgICAgIC50YXAoZGIgPT4ge1xuICAgICAgICAgIGRiLm9uKFwiYXV0aGVudGljYXRlZFwiLCBldmVudERhdGEgPT4gdGhpcy5sb2dnZXJfLmRlYnVnKFwiQWxsIGRiIHNlcnZlcnMgYXJlIHN1Y2Nlc3NmdWxseSBhdXRoZW50aWNhdGVkOiBcIiwgZXZlbnREYXRhKSk7XG4gICAgICAgICAgZGIub24oXCJjbG9zZVwiLCBkYkVycm9yID0+IHRoaXMuY2xvc2VFdmVudEhhbmRsZXJfKGRiRXJyb3IpKTtcbiAgICAgICAgICBkYi5vbihcImVycm9yXCIsIGRiRXJyb3IgPT4gdGhpcy5sb2dnZXJfLmVycm9yKFwiQSBkYiBlcnJvciBvY2N1cnJlZCBhZ2FpbnN0IGEgZGIgc2VydmVyOiBcIiwgZGJFcnJvcikpO1xuICAgICAgICAgIGRiLm9uKFwiZnVsbHNldHVwXCIsICgpID0+IHRoaXMubG9nZ2VyXy5kZWJ1ZyhcIkFsbCBkYiBzZXJ2ZXJzIGNvbm5lY3RlZCBhbmQgc2V0IHVwXCIpKTtcbiAgICAgICAgICBkYi5vbihcInBhcnNlRXJyb3JcIiwgZGJFcnJvciA9PiB0aGlzLmxvZ2dlcl8uZXJyb3IoXCJBbiBpbGxlZ2FsIG9yIGNvcnJ1cHQgQlNPTiByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXI6IFwiLCBkYkVycm9yKSk7XG4gICAgICAgICAgZGIub24oXCJyZWNvbm5lY3RcIiwgZXZlbnREYXRhID0+IHRoaXMubG9nZ2VyXy5kZWJ1ZyhcIlRoZSBkcml2ZXIgaGFzIHN1Y2Nlc3NmdWxseSByZWNvbm5lY3RlZCB0byBhbmQgYXV0aGVudGljYXRlZCBhZ2FpbnN0IHRoZSBzZXJ2ZXI6IFwiLCBldmVudERhdGEpKTtcbiAgICAgICAgICBkYi5vbihcInRpbWVvdXRcIiwgZGJFcnJvciA9PiB0aGlzLmxvZ2dlcl8uZXJyb3IoXCJUaGUgc29ja2V0IHRpbWVkIG91dCBhZ2FpbnN0IHRoZSBkYiBzZXJ2ZXI6IFwiLCBkYkVycm9yKSk7XG4gICAgICAgICAgdGhpcy5ldmVudERpc3BhdGNoZXJfLmVtaXQoXCJkYkNvbm5lY3Rpb25PcGVuZWRcIik7XG4gICAgICAgICAgdGhpcy5sb2dnZXJfLnRyYWNlKFwiVGhlIGNvbm5lY3Rpb24gd2l0aCB0aGUgZGF0YWJhc2UgaGFzIGJlZW4gZXN0YWJsaXNoZWRcIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgZGJQcm9taXNlLnRoZW4oZGIgPT4gY2FsbGJhY2sobnVsbCwge2RiLCBldmVudERpc3BhdGNoZXJ9KSwgZXJyID0+IGNhbGxiYWNrKGVyciwgbnVsbCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiBkYlByb21pc2UudGhlbihkYiA9PiB7XG4gICAgICByZXR1cm4ge2RiLCBldmVudERpc3BhdGNoZXJ9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwdWJsaWMgbWV0aG9kIGZvciBjbG9zaW5nIHRoZSBkYiBjb25uZWN0aW9uXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge1EuUHJvbWlzZTx2b2lkPn0gUmV0dXJucyBhbiBlbXB0eSBwcm9taXNlIGFmdGVyIGNsb3NpbmcgdGhlIGNsb3NpbmcgdGhlIGNvbm5lY3Rpb25cbiAgICovXG4gIGNsb3NlQ29ubmVjdGlvbigpIHtcbiAgICBpZiAoIVEuaXNSZWplY3RlZCh0aGlzLmRiUHJvbWlzZV8pKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYlByb21pc2VfXG4gICAgICAgIC50aGVuKGRiID0+IFEubmludm9rZShkYiwgXCJjbG9zZVwiLCB0cnVlKSlcbiAgICAgICAgLnRpbWVvdXQodGhpcy5pb1RpbWVvdXRfKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kYlByb21pc2VfID0gUS5yZWplY3QoXCJEYiBjb25uZWN0aW9uIGlzIGNsb3NlZFwiKTtcbiAgICAgICAgICB0aGlzLmV2ZW50RGlzcGF0Y2hlcl8uZW1pdChcImRiQ29ubmVjdGlvbkNsb3NlZFwiKTtcbiAgICAgICAgICB0aGlzLmxvZ2dlcl8udHJhY2UoXCJUaGUgY29ubmVjdGlvbiB3aXRoIHRoZSBkYXRhYmFzZSBoYXMgYmVlbiBkZXN0cm95ZWRcIik7XG4gICAgICAgIH0sIGVyciA9PiB0aGlzLmxvZ2dlcl8uZmF0YWwoXCJUaGUgZGIgY29ubmVjdGlvbiBjb3VsZCBub3QgYmUgY2xvc2VkOiBcIiwgZXJyKSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gY29ubmVjdGlvbiBlc3RhYmxpc2hlZCB5ZXQsIGp1c3QgbG9nIGFuZCByZXR1cm5cbiAgICB0aGlzLmxvZ2dlcl8udHJhY2UoXCJObyBhY3RpdmUgY29ubmVjdGlvbiB0byBiZSBjbG9zZWRcIik7XG4gICAgcmV0dXJuIFEucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIG5hdGl2ZSBcImNsb3NlXCIgZXZlbnRcbiAgICogMS4gRm9yY2UgY2xvc2UgdGhlIGNvbm5lY3Rpb24uXG4gICAqIDIuIFJlYXNzaWducyB0aGlzLmRiUHJvbWlzZV8gd2l0aCByZWplY3RlZCBwcm9taXNlLlxuICAgKiAzLiBGaXJlcyBkYkNvbm5lY3Rpb25DbG9zZWQgZXZlbnRzIHdoZW4gaS9vIGlzIGRvbmUuXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7RXJyb3J9IGRiRXJyb3IgVGhlIGRiIG5hdGl2ZSBlcnJvciBpbnN0YW5jZVxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfSB1bmRlZmluZWRcbiAgICovXG4gIGNsb3NlRXZlbnRIYW5kbGVyXyhkYkVycm9yKSB7XG4gICAgdGhpcy5sb2dnZXJfLmVycm9yKFwiVGhlIHNvY2tldCBjbG9zZWQgYWdhaW5zdCB0aGUgZGIgc2VydmVyOiBcIiwgZGJFcnJvcik7XG4gICAgdGhpcy5jbG9zZUNvbm5lY3Rpb24oKVxuICAgICAgLmRvbmUoKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgZGIgbWFuYWdlciBzZXJ2aWNlIHNpbmdsZXRvblxuICogQHBhcmFtIHsqfSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gcHJveHkgdG93YXJkcyB0aGUgY2xhc3NcbiAqIEByZXR1cm5zIHtEYkNvbm5lY3Rpb25NYW5hZ2VyfSAgVGhlIGRiIGNvbm5lY3Rpb24gbWFuYWdlciBpbnN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGJDb25uZWN0aW9uTWFuYWdlciguLi5hcmdzKSB7XG5cbiAgcHJvdGVjdGVkSW5zdGFuY2UgPSBwcm90ZWN0ZWRJbnN0YW5jZSB8fCBuZXcgRGJDb25uZWN0aW9uTWFuYWdlciguLi5hcmdzKTtcblxuICByZXR1cm4gcHJvdGVjdGVkSW5zdGFuY2U7XG59XG5cbiJdfQ==
//# sourceMappingURL=mongo-connection-factory.js.map
