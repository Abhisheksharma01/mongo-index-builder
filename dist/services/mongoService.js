"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _q = require("q");

var Q = _interopRequireWildcard(_q);

var _customErrors = require("./../customErrors");

var customErrors = _interopRequireWildcard(_customErrors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Services for interacting with database
 * @class MongodbClient
 * @param {mongoConnectionFactory} mongoConnectionFactory - connection factory for Mongo
 * @param {LoggerService} loggerService - It logs when executed
 */
var MongodbClient = function () {

  /**
   * Function :: To initialize object properties
   * @param {Function} mongoConnectionFactory - the callback which connects to database and return it's instance
   * @param {Object} loggerService - the logger service
   */
  function MongodbClient(_ref) {
    var mongoConnectionFactory = _ref.mongoConnectionFactory,
        loggerService = _ref.loggerService;

    _classCallCheck(this, MongodbClient);

    if (!mongoConnectionFactory) {

      throw new customErrors.argumentUndefined("mongoConnectionFactory");
    }

    if (!loggerService) {

      throw new customErrors.argumentUndefined("loggerService");
    }

    this.logger_ = loggerService;
    this.mongoConnectionFactory_ = mongoConnectionFactory;
  }

  /**
   * Function to create an index for a collection
   * @param {string} collectionName - Name of the collection
   * @param {object} indexKeys - Object containing index keys
   * @param {object} indexOptions - options for mongodb for building the indexes
   * @returns {Promise.<Any>} - created index name or Error
   * @public
   */


  _createClass(MongodbClient, [{
    key: "createIndex",
    value: function createIndex(collectionName, indexKeys, indexOptions) {
      var _this = this;

      return this.mongoConnectionFactory_.getConnection().then(function (_ref2) {
        var db = _ref2.db;

        var coll = db.collection(collectionName);

        return Q.npost(coll, "createIndex", [indexKeys, indexOptions ? indexOptions : null]);
      }).catch(function (err) {
        return _this.logAndThrowError_(err, _this.createIndex.name);
      });
    }

    /**
     * Function to create an index for a collection
     * @param {string} collectionName - Name of the collection
     * @param {string} indexName - name of the index
     * @returns {Promise.<Any>} - The result object or Error
     * @public
     */

  }, {
    key: "dropIndex",
    value: function dropIndex(collectionName, indexName) {
      var _this2 = this;

      return this.mongoConnectionFactory_.getConnection().then(function (_ref3) {
        var db = _ref3.db;

        var coll = db.collection(collectionName);

        return Q.npost(coll, "dropIndex", [indexName]);
      }).catch(function (err) {
        return _this2.logAndThrowError_(err, _this2.dropIndex.name);
      });
    }

    /**
     * Function to fetch indexes for a collection
     * @param {string} collection - Name of the collection
     * @returns {Promise.<Any>} - Array of objects (indexes) or Error
     * @public
     */

  }, {
    key: "getIndexes",
    value: function getIndexes(collection) {
      var _this3 = this;

      return this.mongoConnectionFactory_.getConnection().then(function (_ref4) {
        var db = _ref4.db;

        var coll = db.collection(collection);

        return Q.npost(coll, "indexes");
      }).catch(function (err) {
        return _this3.logAndThrowError_(err, _this3.getIndexes.name);
      });
    }

    /**
     * Function - To log and throw error
     * @param {Error} err - error object
     * @param {string} functionName - The name of the function that the error
     * occured in.
     * @returns {Void} - Void
     * @throws err
     * @private
     */

  }, {
    key: "logAndThrowError_",
    value: function logAndThrowError_(err, functionName) {

      this.logger_.error("MongoService -- " + functionName + " : Unexpected error occurred", err);

      throw err;
    }
  }]);

  return MongodbClient;
}();

exports.default = MongodbClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zZXJ2aWNlcy9tb25nb1NlcnZpY2UuZXM2Il0sIm5hbWVzIjpbIlEiLCJjdXN0b21FcnJvcnMiLCJNb25nb2RiQ2xpZW50IiwibW9uZ29Db25uZWN0aW9uRmFjdG9yeSIsImxvZ2dlclNlcnZpY2UiLCJhcmd1bWVudFVuZGVmaW5lZCIsImxvZ2dlcl8iLCJtb25nb0Nvbm5lY3Rpb25GYWN0b3J5XyIsImNvbGxlY3Rpb25OYW1lIiwiaW5kZXhLZXlzIiwiaW5kZXhPcHRpb25zIiwiZ2V0Q29ubmVjdGlvbiIsInRoZW4iLCJkYiIsImNvbGwiLCJjb2xsZWN0aW9uIiwibnBvc3QiLCJjYXRjaCIsImxvZ0FuZFRocm93RXJyb3JfIiwiZXJyIiwiY3JlYXRlSW5kZXgiLCJuYW1lIiwiaW5kZXhOYW1lIiwiZHJvcEluZGV4IiwiZ2V0SW5kZXhlcyIsImZ1bmN0aW9uTmFtZSIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztJQUFZQSxDOztBQUNaOztJQUFZQyxZOzs7Ozs7QUFFWjs7Ozs7O0lBTXFCQyxhOztBQUVuQjs7Ozs7QUFLQSwrQkFBcUQ7QUFBQSxRQUF4Q0Msc0JBQXdDLFFBQXhDQSxzQkFBd0M7QUFBQSxRQUFoQkMsYUFBZ0IsUUFBaEJBLGFBQWdCOztBQUFBOztBQUduRCxRQUFJLENBQUNELHNCQUFMLEVBQTZCOztBQUUzQixZQUFNLElBQUlGLGFBQWFJLGlCQUFqQixDQUFtQyx3QkFBbkMsQ0FBTjtBQUNEOztBQUVELFFBQUksQ0FBQ0QsYUFBTCxFQUFvQjs7QUFFbEIsWUFBTSxJQUFJSCxhQUFhSSxpQkFBakIsQ0FBbUMsZUFBbkMsQ0FBTjtBQUNEOztBQUVELFNBQUtDLE9BQUwsR0FBZUYsYUFBZjtBQUNBLFNBQUtHLHVCQUFMLEdBQStCSixzQkFBL0I7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7O2dDQVFZSyxjLEVBQWdCQyxTLEVBQVdDLFksRUFBYztBQUFBOztBQUVuRCxhQUFPLEtBQUtILHVCQUFMLENBQTZCSSxhQUE3QixHQUNKQyxJQURJLENBQ0MsaUJBQVU7QUFBQSxZQUFSQyxFQUFRLFNBQVJBLEVBQVE7O0FBQ2QsWUFBTUMsT0FBT0QsR0FBR0UsVUFBSCxDQUFjUCxjQUFkLENBQWI7O0FBRUEsZUFBT1IsRUFBRWdCLEtBQUYsQ0FBUUYsSUFBUixFQUFjLGFBQWQsRUFBNkIsQ0FBQ0wsU0FBRCxFQUFhQyxlQUFlQSxZQUFmLEdBQThCLElBQTNDLENBQTdCLENBQVA7QUFDRCxPQUxJLEVBTUpPLEtBTkksQ0FNRTtBQUFBLGVBQU8sTUFBS0MsaUJBQUwsQ0FBdUJDLEdBQXZCLEVBQTRCLE1BQUtDLFdBQUwsQ0FBaUJDLElBQTdDLENBQVA7QUFBQSxPQU5GLENBQVA7QUFPRDs7QUFFRDs7Ozs7Ozs7Ozs4QkFPVWIsYyxFQUFnQmMsUyxFQUFXO0FBQUE7O0FBRW5DLGFBQU8sS0FBS2YsdUJBQUwsQ0FBNkJJLGFBQTdCLEdBQ0pDLElBREksQ0FDQyxpQkFBVTtBQUFBLFlBQVJDLEVBQVEsU0FBUkEsRUFBUTs7QUFDZCxZQUFNQyxPQUFPRCxHQUFHRSxVQUFILENBQWNQLGNBQWQsQ0FBYjs7QUFFQSxlQUFPUixFQUFFZ0IsS0FBRixDQUFRRixJQUFSLEVBQWMsV0FBZCxFQUEyQixDQUFDUSxTQUFELENBQTNCLENBQVA7QUFDRCxPQUxJLEVBTUpMLEtBTkksQ0FNRTtBQUFBLGVBQU8sT0FBS0MsaUJBQUwsQ0FBdUJDLEdBQXZCLEVBQTRCLE9BQUtJLFNBQUwsQ0FBZUYsSUFBM0MsQ0FBUDtBQUFBLE9BTkYsQ0FBUDtBQU9EOztBQUVEOzs7Ozs7Ozs7K0JBTVdOLFUsRUFBWTtBQUFBOztBQUVyQixhQUFPLEtBQUtSLHVCQUFMLENBQTZCSSxhQUE3QixHQUNKQyxJQURJLENBQ0MsaUJBQVU7QUFBQSxZQUFSQyxFQUFRLFNBQVJBLEVBQVE7O0FBQ2QsWUFBTUMsT0FBT0QsR0FBR0UsVUFBSCxDQUFjQSxVQUFkLENBQWI7O0FBRUEsZUFBT2YsRUFBRWdCLEtBQUYsQ0FBUUYsSUFBUixFQUFjLFNBQWQsQ0FBUDtBQUNELE9BTEksRUFNSkcsS0FOSSxDQU1FO0FBQUEsZUFBTyxPQUFLQyxpQkFBTCxDQUF1QkMsR0FBdkIsRUFBNEIsT0FBS0ssVUFBTCxDQUFnQkgsSUFBNUMsQ0FBUDtBQUFBLE9BTkYsQ0FBUDtBQU9EOztBQUVEOzs7Ozs7Ozs7Ozs7c0NBU2tCRixHLEVBQUtNLFksRUFBYzs7QUFFbkMsV0FBS25CLE9BQUwsQ0FBYW9CLEtBQWIsc0JBQXNDRCxZQUF0QyxtQ0FBa0ZOLEdBQWxGOztBQUVBLFlBQU1BLEdBQU47QUFDRDs7Ozs7O2tCQTVGa0JqQixhIiwiZmlsZSI6Im1vbmdvU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFEgZnJvbSBcInFcIjtcbmltcG9ydCAqIGFzIGN1c3RvbUVycm9ycyBmcm9tIFwiLi8uLi9jdXN0b21FcnJvcnNcIjtcblxuLyoqXG4gKiBTZXJ2aWNlcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBkYXRhYmFzZVxuICogQGNsYXNzIE1vbmdvZGJDbGllbnRcbiAqIEBwYXJhbSB7bW9uZ29Db25uZWN0aW9uRmFjdG9yeX0gbW9uZ29Db25uZWN0aW9uRmFjdG9yeSAtIGNvbm5lY3Rpb24gZmFjdG9yeSBmb3IgTW9uZ29cbiAqIEBwYXJhbSB7TG9nZ2VyU2VydmljZX0gbG9nZ2VyU2VydmljZSAtIEl0IGxvZ3Mgd2hlbiBleGVjdXRlZFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb25nb2RiQ2xpZW50IHtcblxuICAvKipcbiAgICogRnVuY3Rpb24gOjogVG8gaW5pdGlhbGl6ZSBvYmplY3QgcHJvcGVydGllc1xuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtb25nb0Nvbm5lY3Rpb25GYWN0b3J5IC0gdGhlIGNhbGxiYWNrIHdoaWNoIGNvbm5lY3RzIHRvIGRhdGFiYXNlIGFuZCByZXR1cm4gaXQncyBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gbG9nZ2VyU2VydmljZSAtIHRoZSBsb2dnZXIgc2VydmljZVxuICAgKi9cbiAgY29uc3RydWN0b3Ioe21vbmdvQ29ubmVjdGlvbkZhY3RvcnksIGxvZ2dlclNlcnZpY2V9KSB7XG5cblxuICAgIGlmICghbW9uZ29Db25uZWN0aW9uRmFjdG9yeSkge1xuXG4gICAgICB0aHJvdyBuZXcgY3VzdG9tRXJyb3JzLmFyZ3VtZW50VW5kZWZpbmVkKFwibW9uZ29Db25uZWN0aW9uRmFjdG9yeVwiKTtcbiAgICB9XG5cbiAgICBpZiAoIWxvZ2dlclNlcnZpY2UpIHtcblxuICAgICAgdGhyb3cgbmV3IGN1c3RvbUVycm9ycy5hcmd1bWVudFVuZGVmaW5lZChcImxvZ2dlclNlcnZpY2VcIik7XG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXJfID0gbG9nZ2VyU2VydmljZTtcbiAgICB0aGlzLm1vbmdvQ29ubmVjdGlvbkZhY3RvcnlfID0gbW9uZ29Db25uZWN0aW9uRmFjdG9yeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBjcmVhdGUgYW4gaW5kZXggZm9yIGEgY29sbGVjdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29sbGVjdGlvbk5hbWUgLSBOYW1lIG9mIHRoZSBjb2xsZWN0aW9uXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBpbmRleEtleXMgLSBPYmplY3QgY29udGFpbmluZyBpbmRleCBrZXlzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBpbmRleE9wdGlvbnMgLSBvcHRpb25zIGZvciBtb25nb2RiIGZvciBidWlsZGluZyB0aGUgaW5kZXhlc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QW55Pn0gLSBjcmVhdGVkIGluZGV4IG5hbWUgb3IgRXJyb3JcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY3JlYXRlSW5kZXgoY29sbGVjdGlvbk5hbWUsIGluZGV4S2V5cywgaW5kZXhPcHRpb25zKSB7XG5cbiAgICByZXR1cm4gdGhpcy5tb25nb0Nvbm5lY3Rpb25GYWN0b3J5Xy5nZXRDb25uZWN0aW9uKClcbiAgICAgIC50aGVuKCh7ZGJ9KSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbGwgPSBkYi5jb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcblxuICAgICAgICByZXR1cm4gUS5ucG9zdChjb2xsLCBcImNyZWF0ZUluZGV4XCIsIFtpbmRleEtleXMsIChpbmRleE9wdGlvbnMgPyBpbmRleE9wdGlvbnMgOiBudWxsKV0pO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnIgPT4gdGhpcy5sb2dBbmRUaHJvd0Vycm9yXyhlcnIsIHRoaXMuY3JlYXRlSW5kZXgubmFtZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhbiBpbmRleCBmb3IgYSBjb2xsZWN0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xsZWN0aW9uTmFtZSAtIE5hbWUgb2YgdGhlIGNvbGxlY3Rpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IGluZGV4TmFtZSAtIG5hbWUgb2YgdGhlIGluZGV4XG4gICAqIEByZXR1cm5zIHtQcm9taXNlLjxBbnk+fSAtIFRoZSByZXN1bHQgb2JqZWN0IG9yIEVycm9yXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRyb3BJbmRleChjb2xsZWN0aW9uTmFtZSwgaW5kZXhOYW1lKSB7XG5cbiAgICByZXR1cm4gdGhpcy5tb25nb0Nvbm5lY3Rpb25GYWN0b3J5Xy5nZXRDb25uZWN0aW9uKClcbiAgICAgIC50aGVuKCh7ZGJ9KSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbGwgPSBkYi5jb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcblxuICAgICAgICByZXR1cm4gUS5ucG9zdChjb2xsLCBcImRyb3BJbmRleFwiLCBbaW5kZXhOYW1lXSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiB0aGlzLmxvZ0FuZFRocm93RXJyb3JfKGVyciwgdGhpcy5kcm9wSW5kZXgubmFtZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRvIGZldGNoIGluZGV4ZXMgZm9yIGEgY29sbGVjdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29sbGVjdGlvbiAtIE5hbWUgb2YgdGhlIGNvbGxlY3Rpb25cbiAgICogQHJldHVybnMge1Byb21pc2UuPEFueT59IC0gQXJyYXkgb2Ygb2JqZWN0cyAoaW5kZXhlcykgb3IgRXJyb3JcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZ2V0SW5kZXhlcyhjb2xsZWN0aW9uKSB7XG5cbiAgICByZXR1cm4gdGhpcy5tb25nb0Nvbm5lY3Rpb25GYWN0b3J5Xy5nZXRDb25uZWN0aW9uKClcbiAgICAgIC50aGVuKCh7ZGJ9KSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbGwgPSBkYi5jb2xsZWN0aW9uKGNvbGxlY3Rpb24pO1xuXG4gICAgICAgIHJldHVybiBRLm5wb3N0KGNvbGwsIFwiaW5kZXhlc1wiKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHRoaXMubG9nQW5kVGhyb3dFcnJvcl8oZXJyLCB0aGlzLmdldEluZGV4ZXMubmFtZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIC0gVG8gbG9nIGFuZCB0aHJvdyBlcnJvclxuICAgKiBAcGFyYW0ge0Vycm9yfSBlcnIgLSBlcnJvciBvYmplY3RcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbiB0aGF0IHRoZSBlcnJvclxuICAgKiBvY2N1cmVkIGluLlxuICAgKiBAcmV0dXJucyB7Vm9pZH0gLSBWb2lkXG4gICAqIEB0aHJvd3MgZXJyXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBsb2dBbmRUaHJvd0Vycm9yXyhlcnIsIGZ1bmN0aW9uTmFtZSkge1xuXG4gICAgdGhpcy5sb2dnZXJfLmVycm9yKGBNb25nb1NlcnZpY2UgLS0gJHtmdW5jdGlvbk5hbWV9IDogVW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZGAsIGVycik7XG5cbiAgICB0aHJvdyBlcnI7XG4gIH1cblxufVxuIl19
//# sourceMappingURL=mongoService.js.map
