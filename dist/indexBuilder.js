"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getIndexBuilder = getIndexBuilder;

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _hoek = require("hoek");

var Hoek = _interopRequireWildcard(_hoek);

var _schemaS = require("./schema(s)");

var _validateSchema = require("./validateSchema");

var _validateSchema2 = _interopRequireDefault(_validateSchema);

var _throwWrappedError = require("./throwWrappedError");

var _throwWrappedError2 = _interopRequireDefault(_throwWrappedError);

var _mongoConnectionFactory = require("./services/mongo-connection-factory");

var _mongoService = require("./services/mongoService");

var _mongoService2 = _interopRequireDefault(_mongoService);

var _mongodb = require("mongodb");

var Mongodb = _interopRequireWildcard(_mongodb);

var _logger = require("./services/logger");

var _logger2 = _interopRequireDefault(_logger);

var _joi = require("joi");

var _joi2 = _interopRequireDefault(_joi);

var _events = require("events");

var _customEvents = require("./customEvents");

var customEvents = _interopRequireWildcard(_customEvents);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var protectedInstance = void 0;
var defaultLoggerConfig = {
  "streams": [{
    "level": "trace",
    "stream": process.stdout
  }]
};
// let internals;
var map = new WeakMap();
function getPrivateHub(object) {

  if (!map.has(object)) {
    map.set(object, {});
  }
  return map.get(object);
}

/**
 * Services for building indexes in database
 * @class indexBuilderService
 * @param {Object} mongoConfig - Mongo db congif values
 * @param {Object} loggerConfig - Logger configurations
 */

var indexBuilderService = function () {
  function indexBuilderService(_ref) {
    var mongoConfig = _ref.mongoConfig,
        loggerConfig = _ref.loggerConfig,
        dataService = _ref.dataService,
        MockLogger = _ref.MockLogger,
        MockEventEmitter = _ref.MockEventEmitter;

    _classCallCheck(this, indexBuilderService);

    // internals = getPrivateHub(this);

    if (!MockLogger) {
      if (loggerConfig) {

        defaultLoggerConfig = _joi2.default.attempt(loggerConfig, _schemaS.loggerSchema, "Logger configuration is not in the required format");
      }
      getPrivateHub(this).loggerService = new _logger2.default(defaultLoggerConfig);
    } else {
      getPrivateHub(this).loggerService = MockLogger;
    }

    if (!dataService) {
      _joi2.default.assert(mongoConfig, _schemaS.mongoConfigSchema, "Mongo DB configuration is not in the required format");
      getPrivateHub(this).dataService = new _mongoService2.default({
        "mongoConnectionFactory": (0, _mongoConnectionFactory.getDbConnectionManager)({
          "logger": getPrivateHub(this).loggerService,
          "nativeDriver": Mongodb,
          "connectionString": mongoConfig.connectionString,
          "ioTimeout": mongoConfig.operationTimeout || 5000
        }),
        "loggerService": getPrivateHub(this).loggerService
      });
    } else {
      getPrivateHub(this).dataService = dataService;
    }

    getPrivateHub(this).indexDropList = [];
    getPrivateHub(this).indexCreateList = [];

    /**
     * Function to create indexes in a collection
     * @param {Array<Objects>} createList - Array of objects containing index information
     * @returns {Promise.<Any>} - The result object or Error
     * @private
     */
    getPrivateHub(this).createIndexes = function (createList) {
      var _this = this;

      var promise = Promise.resolve(null);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var index = _step.value;


          var indexKeys = {};
          var indexOptions = {};

          index.indexKeys.forEach(function (indexKey) {
            indexKeys[indexKey.keyName] = indexKey.keySortOrder;
          });
          if (index.indexName) {
            indexOptions.name = index.indexName;
          }

          if (index.indexOptions) {
            Object.assign(indexOptions, index.indexOptions);
          }
          _this.eventEmitter.emit("indexCreate", "Collection Name : " + index.collectionName + ", Keys : " + Hoek.stringify(indexKeys) + ", Options : " + Hoek.stringify(indexOptions));

          promise = promise.then(function () {
            return getPrivateHub(_this).dataService.createIndex(index.collectionName, indexKeys, indexOptions);
          }).then(function () {
            return _this.eventEmitter.emit("indexCreated", "Collection Name : " + index.collectionName + ", Keys : " + Hoek.stringify(indexKeys) + ", Options : " + Hoek.stringify(indexOptions));
          });
        };

        for (var _iterator = createList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return promise;
    }.bind(this);

    /**
     * Function to drop indexes in a collection
     * @param {Array<Objects>} dropList - Array of objects containing index information
     * @returns {Promise.<Any>} - The result object or Error
     * @private
     */
    getPrivateHub(this).dropIndexes = function (dropList) {
      var _this2 = this;

      var promise = Promise.resolve(null);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop2 = function _loop2() {
          var index = _step2.value;


          if (index.indexName !== "_id_") {
            _this2.eventEmitter.emit("indexDrop", "Collection Name : " + index.collectionName + ", \"Index Name:\" : " + index.indexName);
            promise = promise.then(function () {
              return getPrivateHub(_this2).dataService.dropIndex(index.collectionName, index.indexName);
            }).then(function () {
              return _this2.eventEmitter.emit("indexDropped", "Collection Name : " + index.collectionName + ", \"Index Name:\" : " + index.indexName);
            });
          }
        };

        for (var _iterator2 = dropList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop2();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return promise;
    }.bind(this);

    /**
     * Function to extract and format index keys in desired format
     * @param {objects} indexKeys - Object containing keys of an index
     * @returns {object} - The result object or Error
     * @private
     */
    getPrivateHub(this).extractKeys = function (indexKeys) {
      var formattedKeys = [];
      Object.keys(indexKeys).forEach(function (indexKey) {
        return formattedKeys.push({
          "keyName": indexKey,
          "keySortOrder": indexKeys[indexKey]
        });
      });

      return formattedKeys;
    };

    /**
     * Function to format index list
     * @param {Array<Objects>} indexList - Array of objects containing index information
     * @returns {Array.<Object>} - The result array containing formatted objects or Error
     * @private
     */
    getPrivateHub(this).formatResult = function (indexList) {
      var _this3 = this;

      var formattedResult = [];
      indexList.forEach(function (index) {
        formattedResult.push({
          "collectionName": index.ns.split(".")[1],
          "indexName": index.name,
          "indexKeys": getPrivateHub(_this3).extractKeys(index.key)
        });
      });

      return formattedResult;
    }.bind(this);

    /**
     * Function to get collection names out of index list
     * @param {Array<Objects>} indexList - Array of objects containing index information
     * @returns {Array.<String>} - The result array containing unique collection names
     * @private
     */
    getPrivateHub(this).getCollectionNames = function (indexList) {

      var collectionList = Hoek.unique(indexList.map(function (index) {
        return index.collectionName;
      }));
      this.eventEmitter.emit("collectionNames", collectionList.join());

      return collectionList;
    }.bind(this);

    /**
     * Function to get index sync promises for the provided index list
     * @param {Array<Objects>} indexList - Array of objects containing index information
     * @returns {Array.<Promise>} - The result array containing sync promises
     * @private
     */
    getPrivateHub(this).getIndexSyncPromises = function (indexList) {
      var _this4 = this;

      var collectionIndexListPromises = [];
      getPrivateHub(this).indexCreateList = indexList;
      getPrivateHub(this).getCollectionNames(indexList).forEach(function (collection) {
        collectionIndexListPromises.push(getPrivateHub(_this4).dataService.getIndexes(collection).then(function (result) {
          var indexPosition = void 0;
          getPrivateHub(_this4).formatResult(result).forEach(function (index) {
            if ((indexPosition = indexList.findIndex(function (indexToBeCreated) {
              return Hoek.deepEqual(indexToBeCreated, index, { "prototype": false });
            })) === -1) {
              getPrivateHub(_this4).indexDropList.push(index);
            } else {
              getPrivateHub(_this4).indexCreateList.splice(indexPosition, 1);
            }
          });
        }));
      });

      return collectionIndexListPromises;
    }.bind(this);

    /**
     * Function to register handlers for index building process
     * @param {Object} eventEmitter - Event Emitter
     * @param {Object} eventsToRegister - Object containing events to register along with their messages
     * @returns {Void} - returns void.
     * @private
     */
    getPrivateHub(this).registerEvents = function (eventEmitter, eventsToRegister) {
      var _this5 = this;

      Object.keys(eventsToRegister).forEach(function (eventName) {

        eventEmitter.on(eventName, function (info) {

          getPrivateHub(_this5).loggerService.info(eventsToRegister[eventName] + info);
        });
      });
    }.bind(this);

    /**
     * Function to handle error.
     *
     * @param {Error} error  error object.
     * @returns {void}
     * @private
     */
    getPrivateHub(this).errorHandler = function (error) {
      getPrivateHub(this).loggerService.error({ "error": error });
      throw error;
    }.bind(this);

    this.eventEmitter = MockEventEmitter || new _events.EventEmitter();
    getPrivateHub(this).registerEvents(this.eventEmitter, customEvents.indexEvents);
  }

  /**
   * Function to create indexes in a database
   * @param {Array<Objects>} indexList - Array of objects containing index information
   * @returns {Promise.<Any>} - The result object or Error
   * @public
   */


  _createClass(indexBuilderService, [{
    key: "buildIndexes",
    value: function buildIndexes(indexList) {
      var _this6 = this;

      try {
        this.eventEmitter.emit("indexesSyncronisationStart", Hoek.stringify(new Date()));

        return (0, _validateSchema2.default)(indexList, _schemaS.indexListSchema, "Schema validation failed").then(function (validatedIndexList) {
          return _q2.default.all(getPrivateHub(_this6).getIndexSyncPromises(validatedIndexList));
        }).then(function () {
          return getPrivateHub(_this6).dropIndexes(getPrivateHub(_this6).indexDropList);
        }).then(function () {
          return getPrivateHub(_this6).createIndexes(getPrivateHub(_this6).indexCreateList);
        }).then(function () {
          _this6.eventEmitter.emit("indexesSyncronised", Hoek.stringify(new Date()));
          return Promise.resolve(true);
        }).catch(function (error) {

          _this6.eventEmitter.emit("error", error.message);
          return getPrivateHub(_this6).errorHandler((0, _throwWrappedError2.default)("Error in building indexes : " + error.message, error));
        });
      } catch (error) {

        return Promise.reject(error);
      }
    }
  }]);

  return indexBuilderService;
}();

/**
 * Returns mongo index builder singleton
 * @param {Object} mongoConfig - Mongo db congif values
 * @param {Object} loggerConfig - Logger configurations
 * @returns {indexBuilderService}  The index builder singleton instance
 */


exports.default = indexBuilderService;
function getIndexBuilder(_ref2) {
  var mongoConfig = _ref2.mongoConfig,
      loggerConfig = _ref2.loggerConfig,
      dataService = _ref2.dataService,
      MockLogger = _ref2.MockLogger;


  protectedInstance = protectedInstance || new indexBuilderService({ mongoConfig: mongoConfig, loggerConfig: loggerConfig, dataService: dataService, MockLogger: MockLogger });
  return protectedInstance;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9pbmRleEJ1aWxkZXIuZXM2Il0sIm5hbWVzIjpbImdldEluZGV4QnVpbGRlciIsIkhvZWsiLCJNb25nb2RiIiwiY3VzdG9tRXZlbnRzIiwicHJvdGVjdGVkSW5zdGFuY2UiLCJkZWZhdWx0TG9nZ2VyQ29uZmlnIiwicHJvY2VzcyIsInN0ZG91dCIsIm1hcCIsIldlYWtNYXAiLCJnZXRQcml2YXRlSHViIiwib2JqZWN0IiwiaGFzIiwic2V0IiwiZ2V0IiwiaW5kZXhCdWlsZGVyU2VydmljZSIsIm1vbmdvQ29uZmlnIiwibG9nZ2VyQ29uZmlnIiwiZGF0YVNlcnZpY2UiLCJNb2NrTG9nZ2VyIiwiTW9ja0V2ZW50RW1pdHRlciIsImF0dGVtcHQiLCJsb2dnZXJTZXJ2aWNlIiwiYXNzZXJ0IiwiY29ubmVjdGlvblN0cmluZyIsIm9wZXJhdGlvblRpbWVvdXQiLCJpbmRleERyb3BMaXN0IiwiaW5kZXhDcmVhdGVMaXN0IiwiY3JlYXRlSW5kZXhlcyIsImNyZWF0ZUxpc3QiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbmRleCIsImluZGV4S2V5cyIsImluZGV4T3B0aW9ucyIsImZvckVhY2giLCJpbmRleEtleSIsImtleU5hbWUiLCJrZXlTb3J0T3JkZXIiLCJpbmRleE5hbWUiLCJuYW1lIiwiT2JqZWN0IiwiYXNzaWduIiwiZXZlbnRFbWl0dGVyIiwiZW1pdCIsImNvbGxlY3Rpb25OYW1lIiwic3RyaW5naWZ5IiwidGhlbiIsImNyZWF0ZUluZGV4IiwiYmluZCIsImRyb3BJbmRleGVzIiwiZHJvcExpc3QiLCJkcm9wSW5kZXgiLCJleHRyYWN0S2V5cyIsImZvcm1hdHRlZEtleXMiLCJrZXlzIiwicHVzaCIsImZvcm1hdFJlc3VsdCIsImluZGV4TGlzdCIsImZvcm1hdHRlZFJlc3VsdCIsIm5zIiwic3BsaXQiLCJrZXkiLCJnZXRDb2xsZWN0aW9uTmFtZXMiLCJjb2xsZWN0aW9uTGlzdCIsInVuaXF1ZSIsImpvaW4iLCJnZXRJbmRleFN5bmNQcm9taXNlcyIsImNvbGxlY3Rpb25JbmRleExpc3RQcm9taXNlcyIsImdldEluZGV4ZXMiLCJjb2xsZWN0aW9uIiwiaW5kZXhQb3NpdGlvbiIsInJlc3VsdCIsImZpbmRJbmRleCIsImRlZXBFcXVhbCIsImluZGV4VG9CZUNyZWF0ZWQiLCJzcGxpY2UiLCJyZWdpc3RlckV2ZW50cyIsImV2ZW50c1RvUmVnaXN0ZXIiLCJvbiIsImV2ZW50TmFtZSIsImluZm8iLCJlcnJvckhhbmRsZXIiLCJlcnJvciIsImluZGV4RXZlbnRzIiwiRGF0ZSIsImFsbCIsInZhbGlkYXRlZEluZGV4TGlzdCIsImNhdGNoIiwibWVzc2FnZSIsInJlamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7UUFxUmdCQSxlLEdBQUFBLGU7O0FBclJoQjs7OztBQUNBOztJQUFZQyxJOztBQUNaOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOztJQUFZQyxPOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7SUFBWUMsWTs7Ozs7Ozs7QUFFWixJQUFJQywwQkFBSjtBQUNBLElBQUlDLHNCQUFzQjtBQUN4QixhQUFXLENBQUM7QUFDVixhQUFTLE9BREM7QUFFVixjQUFVQyxRQUFRQztBQUZSLEdBQUQ7QUFEYSxDQUExQjtBQU1BO0FBQ0EsSUFBTUMsTUFBTSxJQUFJQyxPQUFKLEVBQVo7QUFDQSxTQUFTQyxhQUFULENBQXVCQyxNQUF2QixFQUErQjs7QUFFN0IsTUFBSSxDQUFDSCxJQUFJSSxHQUFKLENBQVFELE1BQVIsQ0FBTCxFQUFzQjtBQUNwQkgsUUFBSUssR0FBSixDQUFRRixNQUFSLEVBQWdCLEVBQWhCO0FBQ0Q7QUFDRCxTQUFPSCxJQUFJTSxHQUFKLENBQVFILE1BQVIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7O0lBTXFCSSxtQjtBQUVuQixxQ0FBb0Y7QUFBQSxRQUF2RUMsV0FBdUUsUUFBdkVBLFdBQXVFO0FBQUEsUUFBMURDLFlBQTBELFFBQTFEQSxZQUEwRDtBQUFBLFFBQTVDQyxXQUE0QyxRQUE1Q0EsV0FBNEM7QUFBQSxRQUEvQkMsVUFBK0IsUUFBL0JBLFVBQStCO0FBQUEsUUFBbkJDLGdCQUFtQixRQUFuQkEsZ0JBQW1COztBQUFBOztBQUVuRjs7QUFFQyxRQUFJLENBQUNELFVBQUwsRUFBaUI7QUFDZixVQUFJRixZQUFKLEVBQWtCOztBQUVoQlosOEJBQXNCLGNBQUlnQixPQUFKLENBQVlKLFlBQVoseUJBQXdDLG9EQUF4QyxDQUF0QjtBQUNEO0FBQ0RQLG9CQUFjLElBQWQsRUFBb0JZLGFBQXBCLEdBQW9DLHFCQUFXakIsbUJBQVgsQ0FBcEM7QUFDRCxLQU5ELE1BTU87QUFDTEssb0JBQWMsSUFBZCxFQUFvQlksYUFBcEIsR0FBb0NILFVBQXBDO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDRCxXQUFMLEVBQWtCO0FBQ2hCLG9CQUFJSyxNQUFKLENBQVdQLFdBQVgsOEJBQTJDLHNEQUEzQztBQUNBTixvQkFBYyxJQUFkLEVBQW9CUSxXQUFwQixHQUFrQywyQkFBa0I7QUFDbEQsa0NBQTBCLG9EQUF1QjtBQUMvQyxvQkFBVVIsY0FBYyxJQUFkLEVBQW9CWSxhQURpQjtBQUUvQywwQkFBZ0JwQixPQUYrQjtBQUcvQyw4QkFBb0JjLFlBQVlRLGdCQUhlO0FBSS9DLHVCQUFhUixZQUFZUyxnQkFBWixJQUFnQztBQUpFLFNBQXZCLENBRHdCO0FBT2xELHlCQUFpQmYsY0FBYyxJQUFkLEVBQW9CWTtBQVBhLE9BQWxCLENBQWxDO0FBU0QsS0FYRCxNQVdPO0FBQ0xaLG9CQUFjLElBQWQsRUFBb0JRLFdBQXBCLEdBQWtDQSxXQUFsQztBQUNEOztBQUVEUixrQkFBYyxJQUFkLEVBQW9CZ0IsYUFBcEIsR0FBb0MsRUFBcEM7QUFDQWhCLGtCQUFjLElBQWQsRUFBb0JpQixlQUFwQixHQUFzQyxFQUF0Qzs7QUFFQTs7Ozs7O0FBTUFqQixrQkFBYyxJQUFkLEVBQW9Ca0IsYUFBcEIsR0FBb0MsVUFBVUMsVUFBVixFQUFzQjtBQUFBOztBQUV4RCxVQUFJQyxVQUFVQyxRQUFRQyxPQUFSLENBQWdCLElBQWhCLENBQWQ7O0FBRndEO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsY0FLN0NDLEtBTDZDOzs7QUFPdEQsY0FBTUMsWUFBWSxFQUFsQjtBQUNBLGNBQU1DLGVBQWUsRUFBckI7O0FBRUFGLGdCQUFNQyxTQUFOLENBQWdCRSxPQUFoQixDQUF3QixvQkFBWTtBQUNsQ0Ysc0JBQVVHLFNBQVNDLE9BQW5CLElBQThCRCxTQUFTRSxZQUF2QztBQUNELFdBRkQ7QUFHQSxjQUFJTixNQUFNTyxTQUFWLEVBQXFCO0FBQ25CTCx5QkFBYU0sSUFBYixHQUFvQlIsTUFBTU8sU0FBMUI7QUFDRDs7QUFFRCxjQUFJUCxNQUFNRSxZQUFWLEVBQXdCO0FBQ3RCTyxtQkFBT0MsTUFBUCxDQUFjUixZQUFkLEVBQTRCRixNQUFNRSxZQUFsQztBQUNEO0FBQ0QsZ0JBQUtTLFlBQUwsQ0FBa0JDLElBQWxCLENBQXVCLGFBQXZCLHlCQUEyRFosTUFBTWEsY0FBakUsaUJBQTJGN0MsS0FBSzhDLFNBQUwsQ0FBZWIsU0FBZixDQUEzRixvQkFBbUlqQyxLQUFLOEMsU0FBTCxDQUFlWixZQUFmLENBQW5JOztBQUVBTCxvQkFBVUEsUUFDUGtCLElBRE8sQ0FDRjtBQUFBLG1CQUFNdEMscUJBQW9CUSxXQUFwQixDQUFnQytCLFdBQWhDLENBQTRDaEIsTUFBTWEsY0FBbEQsRUFBa0VaLFNBQWxFLEVBQTZFQyxZQUE3RSxDQUFOO0FBQUEsV0FERSxFQUVQYSxJQUZPLENBRUY7QUFBQSxtQkFBTSxNQUFLSixZQUFMLENBQWtCQyxJQUFsQixDQUF1QixjQUF2Qix5QkFBNERaLE1BQU1hLGNBQWxFLGlCQUE0RjdDLEtBQUs4QyxTQUFMLENBQWViLFNBQWYsQ0FBNUYsb0JBQW9JakMsS0FBSzhDLFNBQUwsQ0FBZVosWUFBZixDQUFwSSxDQUFOO0FBQUEsV0FGRSxDQUFWO0FBdEJzRDs7QUFLeEQsNkJBQW9CTixVQUFwQiw4SEFBZ0M7QUFBQTtBQW9CL0I7QUF6QnVEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBMkJ4RCxhQUFPQyxPQUFQO0FBQ0QsS0E1Qm1DLENBNEJsQ29CLElBNUJrQyxDQTRCN0IsSUE1QjZCLENBQXBDOztBQThCQTs7Ozs7O0FBTUF4QyxrQkFBYyxJQUFkLEVBQW9CeUMsV0FBcEIsR0FBa0MsVUFBVUMsUUFBVixFQUFvQjtBQUFBOztBQUNwRCxVQUFJdEIsVUFBVUMsUUFBUUMsT0FBUixDQUFnQixJQUFoQixDQUFkOztBQURvRDtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBLGNBR3pDQyxLQUh5Qzs7O0FBS2xELGNBQUlBLE1BQU1PLFNBQU4sS0FBb0IsTUFBeEIsRUFBZ0M7QUFDOUIsbUJBQUtJLFlBQUwsQ0FBa0JDLElBQWxCLENBQXVCLFdBQXZCLHlCQUF5RFosTUFBTWEsY0FBL0QsNEJBQWtHYixNQUFNTyxTQUF4RztBQUNBVixzQkFBVUEsUUFDUGtCLElBRE8sQ0FDRjtBQUFBLHFCQUFNdEMsc0JBQW9CUSxXQUFwQixDQUFnQ21DLFNBQWhDLENBQTBDcEIsTUFBTWEsY0FBaEQsRUFBZ0ViLE1BQU1PLFNBQXRFLENBQU47QUFBQSxhQURFLEVBRVBRLElBRk8sQ0FFRjtBQUFBLHFCQUFNLE9BQUtKLFlBQUwsQ0FBa0JDLElBQWxCLENBQXVCLGNBQXZCLHlCQUE0RFosTUFBTWEsY0FBbEUsNEJBQXFHYixNQUFNTyxTQUEzRyxDQUFOO0FBQUEsYUFGRSxDQUFWO0FBR0Q7QUFWaUQ7O0FBR3BELDhCQUFvQlksUUFBcEIsbUlBQThCO0FBQUE7QUFRN0I7QUFYbUQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFZcEQsYUFBT3RCLE9BQVA7QUFDRCxLQWJpQyxDQWFoQ29CLElBYmdDLENBYTNCLElBYjJCLENBQWxDOztBQWVBOzs7Ozs7QUFNQXhDLGtCQUFjLElBQWQsRUFBb0I0QyxXQUFwQixHQUFrQyxVQUFVcEIsU0FBVixFQUFxQjtBQUNyRCxVQUFNcUIsZ0JBQWdCLEVBQXRCO0FBQ0FiLGFBQU9jLElBQVAsQ0FBWXRCLFNBQVosRUFBdUJFLE9BQXZCLENBQStCO0FBQUEsZUFBWW1CLGNBQWNFLElBQWQsQ0FBbUI7QUFDNUQscUJBQVdwQixRQURpRDtBQUU1RCwwQkFBZ0JILFVBQVVHLFFBQVY7QUFGNEMsU0FBbkIsQ0FBWjtBQUFBLE9BQS9COztBQUtBLGFBQU9rQixhQUFQO0FBQ0QsS0FSRDs7QUFVQTs7Ozs7O0FBTUE3QyxrQkFBYyxJQUFkLEVBQW9CZ0QsWUFBcEIsR0FBbUMsVUFBVUMsU0FBVixFQUFxQjtBQUFBOztBQUN0RCxVQUFNQyxrQkFBa0IsRUFBeEI7QUFDQUQsZ0JBQVV2QixPQUFWLENBQWtCLGlCQUFTO0FBQ3pCd0Isd0JBQWdCSCxJQUFoQixDQUFxQjtBQUNuQiw0QkFBa0J4QixNQUFNNEIsRUFBTixDQUFTQyxLQUFULENBQWUsR0FBZixFQUFvQixDQUFwQixDQURDO0FBRW5CLHVCQUFhN0IsTUFBTVEsSUFGQTtBQUduQix1QkFBYS9CLHNCQUFvQjRDLFdBQXBCLENBQWdDckIsTUFBTThCLEdBQXRDO0FBSE0sU0FBckI7QUFLRCxPQU5EOztBQVFBLGFBQU9ILGVBQVA7QUFDRCxLQVhrQyxDQVdqQ1YsSUFYaUMsQ0FXNUIsSUFYNEIsQ0FBbkM7O0FBYUE7Ozs7OztBQU1BeEMsa0JBQWMsSUFBZCxFQUFvQnNELGtCQUFwQixHQUF5QyxVQUFVTCxTQUFWLEVBQXFCOztBQUU1RCxVQUFNTSxpQkFBaUJoRSxLQUFLaUUsTUFBTCxDQUFZUCxVQUFVbkQsR0FBVixDQUFjO0FBQUEsZUFBU3lCLE1BQU1hLGNBQWY7QUFBQSxPQUFkLENBQVosQ0FBdkI7QUFDQSxXQUFLRixZQUFMLENBQWtCQyxJQUFsQixDQUF1QixpQkFBdkIsRUFBMENvQixlQUFlRSxJQUFmLEVBQTFDOztBQUVBLGFBQU9GLGNBQVA7QUFDRCxLQU53QyxDQU12Q2YsSUFOdUMsQ0FNbEMsSUFOa0MsQ0FBekM7O0FBUUE7Ozs7OztBQU1BeEMsa0JBQWMsSUFBZCxFQUFvQjBELG9CQUFwQixHQUEyQyxVQUFVVCxTQUFWLEVBQXFCO0FBQUE7O0FBRTlELFVBQU1VLDhCQUE4QixFQUFwQztBQUNBM0Qsb0JBQWMsSUFBZCxFQUFvQmlCLGVBQXBCLEdBQXNDZ0MsU0FBdEM7QUFDQWpELG9CQUFjLElBQWQsRUFBb0JzRCxrQkFBcEIsQ0FBdUNMLFNBQXZDLEVBQWtEdkIsT0FBbEQsQ0FBMEQsc0JBQWM7QUFDdEVpQyxvQ0FBNEJaLElBQTVCLENBQWlDL0Msc0JBQW9CUSxXQUFwQixDQUFnQ29ELFVBQWhDLENBQTJDQyxVQUEzQyxFQUM5QnZCLElBRDhCLENBQ3pCLGtCQUFVO0FBQ2QsY0FBSXdCLHNCQUFKO0FBQ0E5RCxnQ0FBb0JnRCxZQUFwQixDQUFpQ2UsTUFBakMsRUFBeUNyQyxPQUF6QyxDQUFpRCxpQkFBUztBQUN4RCxnQkFBSSxDQUFDb0MsZ0JBQWdCYixVQUFVZSxTQUFWLENBQW9CO0FBQUEscUJBQW9CekUsS0FBSzBFLFNBQUwsQ0FBZUMsZ0JBQWYsRUFBaUMzQyxLQUFqQyxFQUF3QyxFQUFDLGFBQWEsS0FBZCxFQUF4QyxDQUFwQjtBQUFBLGFBQXBCLENBQWpCLE1BQTZILENBQUMsQ0FBbEksRUFBcUk7QUFDbkl2QixvQ0FBb0JnQixhQUFwQixDQUFrQytCLElBQWxDLENBQXVDeEIsS0FBdkM7QUFDRCxhQUZELE1BRU87QUFDTHZCLG9DQUFvQmlCLGVBQXBCLENBQW9Da0QsTUFBcEMsQ0FBMkNMLGFBQTNDLEVBQTBELENBQTFEO0FBQ0Q7QUFDRixXQU5EO0FBT0QsU0FWOEIsQ0FBakM7QUFXRCxPQVpEOztBQWNBLGFBQU9ILDJCQUFQO0FBQ0QsS0FuQjBDLENBbUJ6Q25CLElBbkJ5QyxDQW1CcEMsSUFuQm9DLENBQTNDOztBQXFCQTs7Ozs7OztBQU9BeEMsa0JBQWMsSUFBZCxFQUFvQm9FLGNBQXBCLEdBQXFDLFVBQVVsQyxZQUFWLEVBQXdCbUMsZ0JBQXhCLEVBQTBDO0FBQUE7O0FBRTdFckMsYUFBT2MsSUFBUCxDQUFZdUIsZ0JBQVosRUFBOEIzQyxPQUE5QixDQUFzQyxxQkFBYTs7QUFFakRRLHFCQUFhb0MsRUFBYixDQUFnQkMsU0FBaEIsRUFBMkIsZ0JBQVE7O0FBRWpDdkUsZ0NBQW9CWSxhQUFwQixDQUFrQzRELElBQWxDLENBQXVDSCxpQkFBaUJFLFNBQWpCLElBQThCQyxJQUFyRTtBQUVELFNBSkQ7QUFLRCxPQVBEO0FBUUQsS0FWb0MsQ0FVbkNoQyxJQVZtQyxDQVU5QixJQVY4QixDQUFyQzs7QUFZQTs7Ozs7OztBQU9BeEMsa0JBQWMsSUFBZCxFQUFvQnlFLFlBQXBCLEdBQW1DLFVBQVVDLEtBQVYsRUFBaUI7QUFDbEQxRSxvQkFBYyxJQUFkLEVBQW9CWSxhQUFwQixDQUFrQzhELEtBQWxDLENBQXdDLEVBQUMsU0FBU0EsS0FBVixFQUF4QztBQUNBLFlBQU1BLEtBQU47QUFDRCxLQUhrQyxDQUdqQ2xDLElBSGlDLENBRzVCLElBSDRCLENBQW5DOztBQUtBLFNBQUtOLFlBQUwsR0FBb0J4QixvQkFBb0IsMEJBQXhDO0FBQ0FWLGtCQUFjLElBQWQsRUFBb0JvRSxjQUFwQixDQUFtQyxLQUFLbEMsWUFBeEMsRUFBc0R6QyxhQUFha0YsV0FBbkU7QUFFRDs7QUFFRDs7Ozs7Ozs7OztpQ0FNYTFCLFMsRUFBVztBQUFBOztBQUV0QixVQUFJO0FBQ0YsYUFBS2YsWUFBTCxDQUFrQkMsSUFBbEIsQ0FBdUIsNEJBQXZCLEVBQXFENUMsS0FBSzhDLFNBQUwsQ0FBZSxJQUFJdUMsSUFBSixFQUFmLENBQXJEOztBQUVBLGVBQU8sOEJBQWUzQixTQUFmLDRCQUEyQywwQkFBM0MsRUFDSlgsSUFESSxDQUNDO0FBQUEsaUJBQXNCLFlBQUV1QyxHQUFGLENBQU03RSxzQkFBb0IwRCxvQkFBcEIsQ0FBeUNvQixrQkFBekMsQ0FBTixDQUF0QjtBQUFBLFNBREQsRUFFSnhDLElBRkksQ0FFQztBQUFBLGlCQUFNdEMsc0JBQW9CeUMsV0FBcEIsQ0FBZ0N6QyxzQkFBb0JnQixhQUFwRCxDQUFOO0FBQUEsU0FGRCxFQUdKc0IsSUFISSxDQUdDO0FBQUEsaUJBQU10QyxzQkFBb0JrQixhQUFwQixDQUFrQ2xCLHNCQUFvQmlCLGVBQXRELENBQU47QUFBQSxTQUhELEVBSUpxQixJQUpJLENBSUMsWUFBTTtBQUNWLGlCQUFLSixZQUFMLENBQWtCQyxJQUFsQixDQUF1QixvQkFBdkIsRUFBNkM1QyxLQUFLOEMsU0FBTCxDQUFlLElBQUl1QyxJQUFKLEVBQWYsQ0FBN0M7QUFDQSxpQkFBT3ZELFFBQVFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBUDtBQUNELFNBUEksRUFRSnlELEtBUkksQ0FRRSxpQkFBUzs7QUFFZCxpQkFBSzdDLFlBQUwsQ0FBa0JDLElBQWxCLENBQXVCLE9BQXZCLEVBQWdDdUMsTUFBTU0sT0FBdEM7QUFDQSxpQkFBT2hGLHNCQUFvQnlFLFlBQXBCLENBQWlDLGtFQUFpREMsTUFBTU0sT0FBdkQsRUFBa0VOLEtBQWxFLENBQWpDLENBQVA7QUFDRCxTQVpJLENBQVA7QUFhRCxPQWhCRCxDQWdCRSxPQUFPQSxLQUFQLEVBQWM7O0FBRWQsZUFBT3JELFFBQVE0RCxNQUFSLENBQWVQLEtBQWYsQ0FBUDtBQUNEO0FBQ0Y7Ozs7OztBQUlIOzs7Ozs7OztrQkEzT3FCckUsbUI7QUFpUGQsU0FBU2YsZUFBVCxRQUErRTtBQUFBLE1BQXJEZ0IsV0FBcUQsU0FBckRBLFdBQXFEO0FBQUEsTUFBeENDLFlBQXdDLFNBQXhDQSxZQUF3QztBQUFBLE1BQTFCQyxXQUEwQixTQUExQkEsV0FBMEI7QUFBQSxNQUFiQyxVQUFhLFNBQWJBLFVBQWE7OztBQUVwRmYsc0JBQW9CQSxxQkFBcUIsSUFBSVcsbUJBQUosQ0FBd0IsRUFBQ0Msd0JBQUQsRUFBY0MsMEJBQWQsRUFBNEJDLHdCQUE1QixFQUF5Q0Msc0JBQXpDLEVBQXhCLENBQXpDO0FBQ0EsU0FBT2YsaUJBQVA7QUFDRCIsImZpbGUiOiJpbmRleEJ1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUSBmcm9tIFwicVwiO1xuaW1wb3J0ICogYXMgSG9layBmcm9tIFwiaG9la1wiO1xuaW1wb3J0IHtpbmRleExpc3RTY2hlbWEsIGxvZ2dlclNjaGVtYSwgbW9uZ29Db25maWdTY2hlbWF9IGZyb20gXCIuL3NjaGVtYShzKVwiO1xuaW1wb3J0IFZhbGlkYXRlU2NoZW1hIGZyb20gXCIuL3ZhbGlkYXRlU2NoZW1hXCI7XG5pbXBvcnQgVGhyb3dXcmFwcGVkRXJyb3IgZnJvbSBcIi4vdGhyb3dXcmFwcGVkRXJyb3JcIjtcbmltcG9ydCB7Z2V0RGJDb25uZWN0aW9uTWFuYWdlcn0gZnJvbSBcIi4vc2VydmljZXMvbW9uZ28tY29ubmVjdGlvbi1mYWN0b3J5XCI7XG5pbXBvcnQgTW9uZ29kYkNsaWVudCBmcm9tIFwiLi9zZXJ2aWNlcy9tb25nb1NlcnZpY2VcIjtcbmltcG9ydCAqIGFzIE1vbmdvZGIgZnJvbSBcIm1vbmdvZGJcIjtcbmltcG9ydCBMb2dnZXIgZnJvbSBcIi4vc2VydmljZXMvbG9nZ2VyXCI7XG5pbXBvcnQgSm9pIGZyb20gXCJqb2lcIjtcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgKiBhcyBjdXN0b21FdmVudHMgZnJvbSBcIi4vY3VzdG9tRXZlbnRzXCI7XG5cbmxldCBwcm90ZWN0ZWRJbnN0YW5jZTtcbmxldCBkZWZhdWx0TG9nZ2VyQ29uZmlnID0ge1xuICBcInN0cmVhbXNcIjogW3tcbiAgICBcImxldmVsXCI6IFwidHJhY2VcIixcbiAgICBcInN0cmVhbVwiOiBwcm9jZXNzLnN0ZG91dFxuICB9XVxufTtcbi8vIGxldCBpbnRlcm5hbHM7XG5jb25zdCBtYXAgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gZ2V0UHJpdmF0ZUh1YihvYmplY3QpIHtcblxuICBpZiAoIW1hcC5oYXMob2JqZWN0KSkge1xuICAgIG1hcC5zZXQob2JqZWN0LCB7fSk7XG4gIH1cbiAgcmV0dXJuIG1hcC5nZXQob2JqZWN0KTtcbn1cblxuLyoqXG4gKiBTZXJ2aWNlcyBmb3IgYnVpbGRpbmcgaW5kZXhlcyBpbiBkYXRhYmFzZVxuICogQGNsYXNzIGluZGV4QnVpbGRlclNlcnZpY2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBtb25nb0NvbmZpZyAtIE1vbmdvIGRiIGNvbmdpZiB2YWx1ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBsb2dnZXJDb25maWcgLSBMb2dnZXIgY29uZmlndXJhdGlvbnNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgaW5kZXhCdWlsZGVyU2VydmljZSB7XG5cbiAgY29uc3RydWN0b3Ioe21vbmdvQ29uZmlnLCBsb2dnZXJDb25maWcsIGRhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyLCBNb2NrRXZlbnRFbWl0dGVyfSkge1xuXG4gICAvLyBpbnRlcm5hbHMgPSBnZXRQcml2YXRlSHViKHRoaXMpO1xuXG4gICAgaWYgKCFNb2NrTG9nZ2VyKSB7XG4gICAgICBpZiAobG9nZ2VyQ29uZmlnKSB7XG5cbiAgICAgICAgZGVmYXVsdExvZ2dlckNvbmZpZyA9IEpvaS5hdHRlbXB0KGxvZ2dlckNvbmZpZywgbG9nZ2VyU2NoZW1hLCBcIkxvZ2dlciBjb25maWd1cmF0aW9uIGlzIG5vdCBpbiB0aGUgcmVxdWlyZWQgZm9ybWF0XCIpO1xuICAgICAgfVxuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlID0gbmV3IExvZ2dlcihkZWZhdWx0TG9nZ2VyQ29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlID0gTW9ja0xvZ2dlcjtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGFTZXJ2aWNlKSB7XG4gICAgICBKb2kuYXNzZXJ0KG1vbmdvQ29uZmlnLCBtb25nb0NvbmZpZ1NjaGVtYSwgXCJNb25nbyBEQiBjb25maWd1cmF0aW9uIGlzIG5vdCBpbiB0aGUgcmVxdWlyZWQgZm9ybWF0XCIpO1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kYXRhU2VydmljZSA9IG5ldyBNb25nb2RiQ2xpZW50KHtcbiAgICAgICAgXCJtb25nb0Nvbm5lY3Rpb25GYWN0b3J5XCI6IGdldERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICAgIFwibG9nZ2VyXCI6IGdldFByaXZhdGVIdWIodGhpcykubG9nZ2VyU2VydmljZSxcbiAgICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBNb25nb2RiLFxuICAgICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBtb25nb0NvbmZpZy5jb25uZWN0aW9uU3RyaW5nLFxuICAgICAgICAgIFwiaW9UaW1lb3V0XCI6IG1vbmdvQ29uZmlnLm9wZXJhdGlvblRpbWVvdXQgfHwgNTAwMFxuICAgICAgICB9KSxcbiAgICAgICAgXCJsb2dnZXJTZXJ2aWNlXCI6IGdldFByaXZhdGVIdWIodGhpcykubG9nZ2VyU2VydmljZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdldFByaXZhdGVIdWIodGhpcykuZGF0YVNlcnZpY2UgPSBkYXRhU2VydmljZTtcbiAgICB9XG5cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4RHJvcExpc3QgPSBbXTtcbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4Q3JlYXRlTGlzdCA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gY3JlYXRlIGluZGV4ZXMgaW4gYSBjb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheTxPYmplY3RzPn0gY3JlYXRlTGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxBbnk+fSAtIFRoZSByZXN1bHQgb2JqZWN0IG9yIEVycm9yXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmNyZWF0ZUluZGV4ZXMgPSBmdW5jdGlvbiAoY3JlYXRlTGlzdCkge1xuXG4gICAgICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShudWxsKTtcblxuXG4gICAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGNyZWF0ZUxpc3QpIHtcblxuICAgICAgICBjb25zdCBpbmRleEtleXMgPSB7fTtcbiAgICAgICAgY29uc3QgaW5kZXhPcHRpb25zID0ge307XG5cbiAgICAgICAgaW5kZXguaW5kZXhLZXlzLmZvckVhY2goaW5kZXhLZXkgPT4ge1xuICAgICAgICAgIGluZGV4S2V5c1tpbmRleEtleS5rZXlOYW1lXSA9IGluZGV4S2V5LmtleVNvcnRPcmRlcjtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpbmRleC5pbmRleE5hbWUpIHtcbiAgICAgICAgICBpbmRleE9wdGlvbnMubmFtZSA9IGluZGV4LmluZGV4TmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbmRleC5pbmRleE9wdGlvbnMpIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGluZGV4T3B0aW9ucywgaW5kZXguaW5kZXhPcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KFwiaW5kZXhDcmVhdGVcIiwgYENvbGxlY3Rpb24gTmFtZSA6ICR7aW5kZXguY29sbGVjdGlvbk5hbWV9LCBLZXlzIDogJHtIb2VrLnN0cmluZ2lmeShpbmRleEtleXMpfSwgT3B0aW9ucyA6ICR7SG9lay5zdHJpbmdpZnkoaW5kZXhPcHRpb25zKX1gKTtcblxuICAgICAgICBwcm9taXNlID0gcHJvbWlzZVxuICAgICAgICAgIC50aGVuKCgpID0+IGdldFByaXZhdGVIdWIodGhpcykuZGF0YVNlcnZpY2UuY3JlYXRlSW5kZXgoaW5kZXguY29sbGVjdGlvbk5hbWUsIGluZGV4S2V5cywgaW5kZXhPcHRpb25zKSlcbiAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KFwiaW5kZXhDcmVhdGVkXCIsIGBDb2xsZWN0aW9uIE5hbWUgOiAke2luZGV4LmNvbGxlY3Rpb25OYW1lfSwgS2V5cyA6ICR7SG9lay5zdHJpbmdpZnkoaW5kZXhLZXlzKX0sIE9wdGlvbnMgOiAke0hvZWsuc3RyaW5naWZ5KGluZGV4T3B0aW9ucyl9YCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBkcm9wIGluZGV4ZXMgaW4gYSBjb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheTxPYmplY3RzPn0gZHJvcExpc3QgLSBBcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgaW5kZXggaW5mb3JtYXRpb25cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QW55Pn0gLSBUaGUgcmVzdWx0IG9iamVjdCBvciBFcnJvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kcm9wSW5kZXhlcyA9IGZ1bmN0aW9uIChkcm9wTGlzdCkge1xuICAgICAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cbiAgICAgIGZvciAoY29uc3QgaW5kZXggb2YgZHJvcExpc3QpIHtcblxuICAgICAgICBpZiAoaW5kZXguaW5kZXhOYW1lICE9PSBcIl9pZF9cIikge1xuICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJpbmRleERyb3BcIiwgYENvbGxlY3Rpb24gTmFtZSA6ICR7aW5kZXguY29sbGVjdGlvbk5hbWV9LCBcIkluZGV4IE5hbWU6XCIgOiAke2luZGV4LmluZGV4TmFtZX1gKTtcbiAgICAgICAgICBwcm9taXNlID0gcHJvbWlzZVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kYXRhU2VydmljZS5kcm9wSW5kZXgoaW5kZXguY29sbGVjdGlvbk5hbWUsIGluZGV4LmluZGV4TmFtZSkpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KFwiaW5kZXhEcm9wcGVkXCIsIGBDb2xsZWN0aW9uIE5hbWUgOiAke2luZGV4LmNvbGxlY3Rpb25OYW1lfSwgXCJJbmRleCBOYW1lOlwiIDogJHtpbmRleC5pbmRleE5hbWV9YCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBleHRyYWN0IGFuZCBmb3JtYXQgaW5kZXgga2V5cyBpbiBkZXNpcmVkIGZvcm1hdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0c30gaW5kZXhLZXlzIC0gT2JqZWN0IGNvbnRhaW5pbmcga2V5cyBvZiBhbiBpbmRleFxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IC0gVGhlIHJlc3VsdCBvYmplY3Qgb3IgRXJyb3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuZXh0cmFjdEtleXMgPSBmdW5jdGlvbiAoaW5kZXhLZXlzKSB7XG4gICAgICBjb25zdCBmb3JtYXR0ZWRLZXlzID0gW107XG4gICAgICBPYmplY3Qua2V5cyhpbmRleEtleXMpLmZvckVhY2goaW5kZXhLZXkgPT4gZm9ybWF0dGVkS2V5cy5wdXNoKHtcbiAgICAgICAgXCJrZXlOYW1lXCI6IGluZGV4S2V5LFxuICAgICAgICBcImtleVNvcnRPcmRlclwiOiBpbmRleEtleXNbaW5kZXhLZXldXG4gICAgICB9KSk7XG5cbiAgICAgIHJldHVybiBmb3JtYXR0ZWRLZXlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBmb3JtYXQgaW5kZXggbGlzdFxuICAgICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0cz59IGluZGV4TGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgICAqIEByZXR1cm5zIHtBcnJheS48T2JqZWN0Pn0gLSBUaGUgcmVzdWx0IGFycmF5IGNvbnRhaW5pbmcgZm9ybWF0dGVkIG9iamVjdHMgb3IgRXJyb3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKGluZGV4TGlzdCkge1xuICAgICAgY29uc3QgZm9ybWF0dGVkUmVzdWx0ID0gW107XG4gICAgICBpbmRleExpc3QuZm9yRWFjaChpbmRleCA9PiB7XG4gICAgICAgIGZvcm1hdHRlZFJlc3VsdC5wdXNoKHtcbiAgICAgICAgICBcImNvbGxlY3Rpb25OYW1lXCI6IGluZGV4Lm5zLnNwbGl0KFwiLlwiKVsxXSxcbiAgICAgICAgICBcImluZGV4TmFtZVwiOiBpbmRleC5uYW1lLFxuICAgICAgICAgIFwiaW5kZXhLZXlzXCI6IGdldFByaXZhdGVIdWIodGhpcykuZXh0cmFjdEtleXMoaW5kZXgua2V5KVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZm9ybWF0dGVkUmVzdWx0O1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGdldCBjb2xsZWN0aW9uIG5hbWVzIG91dCBvZiBpbmRleCBsaXN0XG4gICAgICogQHBhcmFtIHtBcnJheTxPYmplY3RzPn0gaW5kZXhMaXN0IC0gQXJyYXkgb2Ygb2JqZWN0cyBjb250YWluaW5nIGluZGV4IGluZm9ybWF0aW9uXG4gICAgICogQHJldHVybnMge0FycmF5LjxTdHJpbmc+fSAtIFRoZSByZXN1bHQgYXJyYXkgY29udGFpbmluZyB1bmlxdWUgY29sbGVjdGlvbiBuYW1lc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5nZXRDb2xsZWN0aW9uTmFtZXMgPSBmdW5jdGlvbiAoaW5kZXhMaXN0KSB7XG5cbiAgICAgIGNvbnN0IGNvbGxlY3Rpb25MaXN0ID0gSG9lay51bmlxdWUoaW5kZXhMaXN0Lm1hcChpbmRleCA9PiBpbmRleC5jb2xsZWN0aW9uTmFtZSkpO1xuICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChcImNvbGxlY3Rpb25OYW1lc1wiLCBjb2xsZWN0aW9uTGlzdC5qb2luKCkpO1xuXG4gICAgICByZXR1cm4gY29sbGVjdGlvbkxpc3Q7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gZ2V0IGluZGV4IHN5bmMgcHJvbWlzZXMgZm9yIHRoZSBwcm92aWRlZCBpbmRleCBsaXN0XG4gICAgICogQHBhcmFtIHtBcnJheTxPYmplY3RzPn0gaW5kZXhMaXN0IC0gQXJyYXkgb2Ygb2JqZWN0cyBjb250YWluaW5nIGluZGV4IGluZm9ybWF0aW9uXG4gICAgICogQHJldHVybnMge0FycmF5LjxQcm9taXNlPn0gLSBUaGUgcmVzdWx0IGFycmF5IGNvbnRhaW5pbmcgc3luYyBwcm9taXNlc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5nZXRJbmRleFN5bmNQcm9taXNlcyA9IGZ1bmN0aW9uIChpbmRleExpc3QpIHtcblxuICAgICAgY29uc3QgY29sbGVjdGlvbkluZGV4TGlzdFByb21pc2VzID0gW107XG4gICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4Q3JlYXRlTGlzdCA9IGluZGV4TGlzdDtcbiAgICAgIGdldFByaXZhdGVIdWIodGhpcykuZ2V0Q29sbGVjdGlvbk5hbWVzKGluZGV4TGlzdCkuZm9yRWFjaChjb2xsZWN0aW9uID0+IHtcbiAgICAgICAgY29sbGVjdGlvbkluZGV4TGlzdFByb21pc2VzLnB1c2goZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kYXRhU2VydmljZS5nZXRJbmRleGVzKGNvbGxlY3Rpb24pXG4gICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIGxldCBpbmRleFBvc2l0aW9uO1xuICAgICAgICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5mb3JtYXRSZXN1bHQocmVzdWx0KS5mb3JFYWNoKGluZGV4ID0+IHtcbiAgICAgICAgICAgICAgaWYgKChpbmRleFBvc2l0aW9uID0gaW5kZXhMaXN0LmZpbmRJbmRleChpbmRleFRvQmVDcmVhdGVkID0+IEhvZWsuZGVlcEVxdWFsKGluZGV4VG9CZUNyZWF0ZWQsIGluZGV4LCB7XCJwcm90b3R5cGVcIjogZmFsc2V9KSkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGdldFByaXZhdGVIdWIodGhpcykuaW5kZXhEcm9wTGlzdC5wdXNoKGluZGV4KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4Q3JlYXRlTGlzdC5zcGxpY2UoaW5kZXhQb3NpdGlvbiwgMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY29sbGVjdGlvbkluZGV4TGlzdFByb21pc2VzO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIHJlZ2lzdGVyIGhhbmRsZXJzIGZvciBpbmRleCBidWlsZGluZyBwcm9jZXNzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50RW1pdHRlciAtIEV2ZW50IEVtaXR0ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRzVG9SZWdpc3RlciAtIE9iamVjdCBjb250YWluaW5nIGV2ZW50cyB0byByZWdpc3RlciBhbG9uZyB3aXRoIHRoZWlyIG1lc3NhZ2VzXG4gICAgICogQHJldHVybnMge1ZvaWR9IC0gcmV0dXJucyB2b2lkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5yZWdpc3RlckV2ZW50cyA9IGZ1bmN0aW9uIChldmVudEVtaXR0ZXIsIGV2ZW50c1RvUmVnaXN0ZXIpIHtcblxuICAgICAgT2JqZWN0LmtleXMoZXZlbnRzVG9SZWdpc3RlcikuZm9yRWFjaChldmVudE5hbWUgPT4ge1xuXG4gICAgICAgIGV2ZW50RW1pdHRlci5vbihldmVudE5hbWUsIGluZm8gPT4ge1xuXG4gICAgICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlLmluZm8oZXZlbnRzVG9SZWdpc3RlcltldmVudE5hbWVdICsgaW5mbyk7XG5cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBoYW5kbGUgZXJyb3IuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Vycm9yfSBlcnJvciAgZXJyb3Igb2JqZWN0LlxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5lcnJvckhhbmRsZXIgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgIGdldFByaXZhdGVIdWIodGhpcykubG9nZ2VyU2VydmljZS5lcnJvcih7XCJlcnJvclwiOiBlcnJvcn0pO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5ldmVudEVtaXR0ZXIgPSBNb2NrRXZlbnRFbWl0dGVyIHx8IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLnJlZ2lzdGVyRXZlbnRzKHRoaXMuZXZlbnRFbWl0dGVyLCBjdXN0b21FdmVudHMuaW5kZXhFdmVudHMpO1xuXG4gIH1cblxuICAvKipcbiAgICogRnVuY3Rpb24gdG8gY3JlYXRlIGluZGV4ZXMgaW4gYSBkYXRhYmFzZVxuICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdHM+fSBpbmRleExpc3QgLSBBcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgaW5kZXggaW5mb3JtYXRpb25cbiAgICogQHJldHVybnMge1Byb21pc2UuPEFueT59IC0gVGhlIHJlc3VsdCBvYmplY3Qgb3IgRXJyb3JcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYnVpbGRJbmRleGVzKGluZGV4TGlzdCkge1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJpbmRleGVzU3luY3JvbmlzYXRpb25TdGFydFwiLCBIb2VrLnN0cmluZ2lmeShuZXcgRGF0ZSgpKSk7XG5cbiAgICAgIHJldHVybiBWYWxpZGF0ZVNjaGVtYShpbmRleExpc3QsIGluZGV4TGlzdFNjaGVtYSwgXCJTY2hlbWEgdmFsaWRhdGlvbiBmYWlsZWRcIilcbiAgICAgICAgLnRoZW4odmFsaWRhdGVkSW5kZXhMaXN0ID0+IFEuYWxsKGdldFByaXZhdGVIdWIodGhpcykuZ2V0SW5kZXhTeW5jUHJvbWlzZXModmFsaWRhdGVkSW5kZXhMaXN0KSkpXG4gICAgICAgIC50aGVuKCgpID0+IGdldFByaXZhdGVIdWIodGhpcykuZHJvcEluZGV4ZXMoZ2V0UHJpdmF0ZUh1Yih0aGlzKS5pbmRleERyb3BMaXN0KSlcbiAgICAgICAgLnRoZW4oKCkgPT4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5jcmVhdGVJbmRleGVzKGdldFByaXZhdGVIdWIodGhpcykuaW5kZXhDcmVhdGVMaXN0KSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJpbmRleGVzU3luY3JvbmlzZWRcIiwgSG9lay5zdHJpbmdpZnkobmV3IERhdGUoKSkpO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG5cbiAgICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KFwiZXJyb3JcIiwgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgcmV0dXJuIGdldFByaXZhdGVIdWIodGhpcykuZXJyb3JIYW5kbGVyKFRocm93V3JhcHBlZEVycm9yKGBFcnJvciBpbiBidWlsZGluZyBpbmRleGVzIDogJHtlcnJvci5tZXNzYWdlfWAsIGVycm9yKSk7XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgfVxuICB9XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIG1vbmdvIGluZGV4IGJ1aWxkZXIgc2luZ2xldG9uXG4gKiBAcGFyYW0ge09iamVjdH0gbW9uZ29Db25maWcgLSBNb25nbyBkYiBjb25naWYgdmFsdWVzXG4gKiBAcGFyYW0ge09iamVjdH0gbG9nZ2VyQ29uZmlnIC0gTG9nZ2VyIGNvbmZpZ3VyYXRpb25zXG4gKiBAcmV0dXJucyB7aW5kZXhCdWlsZGVyU2VydmljZX0gIFRoZSBpbmRleCBidWlsZGVyIHNpbmdsZXRvbiBpbnN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5kZXhCdWlsZGVyKHttb25nb0NvbmZpZywgbG9nZ2VyQ29uZmlnLCBkYXRhU2VydmljZSwgTW9ja0xvZ2dlcn0pIHtcblxuICBwcm90ZWN0ZWRJbnN0YW5jZSA9IHByb3RlY3RlZEluc3RhbmNlIHx8IG5ldyBpbmRleEJ1aWxkZXJTZXJ2aWNlKHttb25nb0NvbmZpZywgbG9nZ2VyQ29uZmlnLCBkYXRhU2VydmljZSwgTW9ja0xvZ2dlcn0pO1xuICByZXR1cm4gcHJvdGVjdGVkSW5zdGFuY2U7XG59XG5cbiJdfQ==
//# sourceMappingURL=indexBuilder.js.map
