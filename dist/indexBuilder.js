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
  }],
  "name": "mongo-index-builder-logger"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9pbmRleEJ1aWxkZXIuZXM2Il0sIm5hbWVzIjpbImdldEluZGV4QnVpbGRlciIsIkhvZWsiLCJNb25nb2RiIiwiY3VzdG9tRXZlbnRzIiwicHJvdGVjdGVkSW5zdGFuY2UiLCJkZWZhdWx0TG9nZ2VyQ29uZmlnIiwicHJvY2VzcyIsInN0ZG91dCIsIm1hcCIsIldlYWtNYXAiLCJnZXRQcml2YXRlSHViIiwib2JqZWN0IiwiaGFzIiwic2V0IiwiZ2V0IiwiaW5kZXhCdWlsZGVyU2VydmljZSIsIm1vbmdvQ29uZmlnIiwibG9nZ2VyQ29uZmlnIiwiZGF0YVNlcnZpY2UiLCJNb2NrTG9nZ2VyIiwiTW9ja0V2ZW50RW1pdHRlciIsImF0dGVtcHQiLCJsb2dnZXJTZXJ2aWNlIiwiYXNzZXJ0IiwiY29ubmVjdGlvblN0cmluZyIsIm9wZXJhdGlvblRpbWVvdXQiLCJpbmRleERyb3BMaXN0IiwiaW5kZXhDcmVhdGVMaXN0IiwiY3JlYXRlSW5kZXhlcyIsImNyZWF0ZUxpc3QiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbmRleCIsImluZGV4S2V5cyIsImluZGV4T3B0aW9ucyIsImZvckVhY2giLCJpbmRleEtleSIsImtleU5hbWUiLCJrZXlTb3J0T3JkZXIiLCJpbmRleE5hbWUiLCJuYW1lIiwiT2JqZWN0IiwiYXNzaWduIiwiZXZlbnRFbWl0dGVyIiwiZW1pdCIsImNvbGxlY3Rpb25OYW1lIiwic3RyaW5naWZ5IiwidGhlbiIsImNyZWF0ZUluZGV4IiwiYmluZCIsImRyb3BJbmRleGVzIiwiZHJvcExpc3QiLCJkcm9wSW5kZXgiLCJleHRyYWN0S2V5cyIsImZvcm1hdHRlZEtleXMiLCJrZXlzIiwicHVzaCIsImZvcm1hdFJlc3VsdCIsImluZGV4TGlzdCIsImZvcm1hdHRlZFJlc3VsdCIsIm5zIiwic3BsaXQiLCJrZXkiLCJnZXRDb2xsZWN0aW9uTmFtZXMiLCJjb2xsZWN0aW9uTGlzdCIsInVuaXF1ZSIsImpvaW4iLCJnZXRJbmRleFN5bmNQcm9taXNlcyIsImNvbGxlY3Rpb25JbmRleExpc3RQcm9taXNlcyIsImdldEluZGV4ZXMiLCJjb2xsZWN0aW9uIiwiaW5kZXhQb3NpdGlvbiIsInJlc3VsdCIsImZpbmRJbmRleCIsImRlZXBFcXVhbCIsImluZGV4VG9CZUNyZWF0ZWQiLCJzcGxpY2UiLCJyZWdpc3RlckV2ZW50cyIsImV2ZW50c1RvUmVnaXN0ZXIiLCJvbiIsImV2ZW50TmFtZSIsImluZm8iLCJlcnJvckhhbmRsZXIiLCJlcnJvciIsImluZGV4RXZlbnRzIiwiRGF0ZSIsImFsbCIsInZhbGlkYXRlZEluZGV4TGlzdCIsImNhdGNoIiwibWVzc2FnZSIsInJlamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7UUFzUmdCQSxlLEdBQUFBLGU7O0FBdFJoQjs7OztBQUNBOztJQUFZQyxJOztBQUNaOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOztJQUFZQyxPOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7SUFBWUMsWTs7Ozs7Ozs7QUFFWixJQUFJQywwQkFBSjtBQUNBLElBQUlDLHNCQUFzQjtBQUN4QixhQUFXLENBQUM7QUFDVixhQUFTLE9BREM7QUFFVixjQUFVQyxRQUFRQztBQUZSLEdBQUQsQ0FEYTtBQUt4QixVQUFRO0FBTGdCLENBQTFCO0FBT0E7QUFDQSxJQUFNQyxNQUFNLElBQUlDLE9BQUosRUFBWjtBQUNBLFNBQVNDLGFBQVQsQ0FBdUJDLE1BQXZCLEVBQStCOztBQUU3QixNQUFJLENBQUNILElBQUlJLEdBQUosQ0FBUUQsTUFBUixDQUFMLEVBQXNCO0FBQ3BCSCxRQUFJSyxHQUFKLENBQVFGLE1BQVIsRUFBZ0IsRUFBaEI7QUFDRDtBQUNELFNBQU9ILElBQUlNLEdBQUosQ0FBUUgsTUFBUixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7SUFNcUJJLG1CO0FBRW5CLHFDQUFvRjtBQUFBLFFBQXZFQyxXQUF1RSxRQUF2RUEsV0FBdUU7QUFBQSxRQUExREMsWUFBMEQsUUFBMURBLFlBQTBEO0FBQUEsUUFB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LENBQWtDbEIsc0JBQW9CaUIsZUFBdEQsQ0FBTjtBQUFBLFNBSEQsRUFJSnFCLElBSkksQ0FJQyxZQUFNO0FBQ1YsaUJBQUtKLFlBQUwsQ0FBa0JDLElBQWxCLENBQXVCLG9CQUF2QixFQUE2QzVDLEtBQUs4QyxTQUFMLENBQWUsSUFBSXVDLElBQUosRUFBZixDQUE3QztBQUNBLGlCQUFPdkQsUUFBUUMsT0FBUixDQUFnQixJQUFoQixDQUFQO0FBQ0QsU0FQSSxFQVFKeUQsS0FSSSxDQVFFLGlCQUFTOztBQUVkLGlCQUFLN0MsWUFBTCxDQUFrQkMsSUFBbEIsQ0FBdUIsT0FBdkIsRUFBZ0N1QyxNQUFNTSxPQUF0QztBQUNBLGlCQUFPaEYsc0JBQW9CeUUsWUFBcEIsQ0FBaUMsa0VBQWlEQyxNQUFNTSxPQUF2RCxFQUFrRU4sS0FBbEUsQ0FBakMsQ0FBUDtBQUNELFNBWkksQ0FBUDtBQWFELE9BaEJELENBZ0JFLE9BQU9BLEtBQVAsRUFBYzs7QUFFZCxlQUFPckQsUUFBUTRELE1BQVIsQ0FBZVAsS0FBZixDQUFQO0FBQ0Q7QUFDRjs7Ozs7O0FBSUg7Ozs7Ozs7O2tCQTNPcUJyRSxtQjtBQWlQZCxTQUFTZixlQUFULFFBQStFO0FBQUEsTUFBckRnQixXQUFxRCxTQUFyREEsV0FBcUQ7QUFBQSxNQUF4Q0MsWUFBd0MsU0FBeENBLFlBQXdDO0FBQUEsTUFBMUJDLFdBQTBCLFNBQTFCQSxXQUEwQjtBQUFBLE1BQWJDLFVBQWEsU0FBYkEsVUFBYTs7O0FBRXBGZixzQkFBb0JBLHFCQUFxQixJQUFJVyxtQkFBSixDQUF3QixFQUFDQyx3QkFBRCxFQUFjQywwQkFBZCxFQUE0QkMsd0JBQTVCLEVBQXlDQyxzQkFBekMsRUFBeEIsQ0FBekM7QUFDQSxTQUFPZixpQkFBUDtBQUNEIiwiZmlsZSI6ImluZGV4QnVpbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBRIGZyb20gXCJxXCI7XG5pbXBvcnQgKiBhcyBIb2VrIGZyb20gXCJob2VrXCI7XG5pbXBvcnQge2luZGV4TGlzdFNjaGVtYSwgbG9nZ2VyU2NoZW1hLCBtb25nb0NvbmZpZ1NjaGVtYX0gZnJvbSBcIi4vc2NoZW1hKHMpXCI7XG5pbXBvcnQgVmFsaWRhdGVTY2hlbWEgZnJvbSBcIi4vdmFsaWRhdGVTY2hlbWFcIjtcbmltcG9ydCBUaHJvd1dyYXBwZWRFcnJvciBmcm9tIFwiLi90aHJvd1dyYXBwZWRFcnJvclwiO1xuaW1wb3J0IHtnZXREYkNvbm5lY3Rpb25NYW5hZ2VyfSBmcm9tIFwiLi9zZXJ2aWNlcy9tb25nby1jb25uZWN0aW9uLWZhY3RvcnlcIjtcbmltcG9ydCBNb25nb2RiQ2xpZW50IGZyb20gXCIuL3NlcnZpY2VzL21vbmdvU2VydmljZVwiO1xuaW1wb3J0ICogYXMgTW9uZ29kYiBmcm9tIFwibW9uZ29kYlwiO1xuaW1wb3J0IExvZ2dlciBmcm9tIFwiLi9zZXJ2aWNlcy9sb2dnZXJcIjtcbmltcG9ydCBKb2kgZnJvbSBcImpvaVwiO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCAqIGFzIGN1c3RvbUV2ZW50cyBmcm9tIFwiLi9jdXN0b21FdmVudHNcIjtcblxubGV0IHByb3RlY3RlZEluc3RhbmNlO1xubGV0IGRlZmF1bHRMb2dnZXJDb25maWcgPSB7XG4gIFwic3RyZWFtc1wiOiBbe1xuICAgIFwibGV2ZWxcIjogXCJ0cmFjZVwiLFxuICAgIFwic3RyZWFtXCI6IHByb2Nlc3Muc3Rkb3V0XG4gIH1dLFxuICBcIm5hbWVcIjogXCJtb25nby1pbmRleC1idWlsZGVyLWxvZ2dlclwiXG59O1xuLy8gbGV0IGludGVybmFscztcbmNvbnN0IG1hcCA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBnZXRQcml2YXRlSHViKG9iamVjdCkge1xuXG4gIGlmICghbWFwLmhhcyhvYmplY3QpKSB7XG4gICAgbWFwLnNldChvYmplY3QsIHt9KTtcbiAgfVxuICByZXR1cm4gbWFwLmdldChvYmplY3QpO1xufVxuXG4vKipcbiAqIFNlcnZpY2VzIGZvciBidWlsZGluZyBpbmRleGVzIGluIGRhdGFiYXNlXG4gKiBAY2xhc3MgaW5kZXhCdWlsZGVyU2VydmljZVxuICogQHBhcmFtIHtPYmplY3R9IG1vbmdvQ29uZmlnIC0gTW9uZ28gZGIgY29uZ2lmIHZhbHVlc1xuICogQHBhcmFtIHtPYmplY3R9IGxvZ2dlckNvbmZpZyAtIExvZ2dlciBjb25maWd1cmF0aW9uc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBpbmRleEJ1aWxkZXJTZXJ2aWNlIHtcblxuICBjb25zdHJ1Y3Rvcih7bW9uZ29Db25maWcsIGxvZ2dlckNvbmZpZywgZGF0YVNlcnZpY2UsIE1vY2tMb2dnZXIsIE1vY2tFdmVudEVtaXR0ZXJ9KSB7XG5cbiAgIC8vIGludGVybmFscyA9IGdldFByaXZhdGVIdWIodGhpcyk7XG5cbiAgICBpZiAoIU1vY2tMb2dnZXIpIHtcbiAgICAgIGlmIChsb2dnZXJDb25maWcpIHtcblxuICAgICAgICBkZWZhdWx0TG9nZ2VyQ29uZmlnID0gSm9pLmF0dGVtcHQobG9nZ2VyQ29uZmlnLCBsb2dnZXJTY2hlbWEsIFwiTG9nZ2VyIGNvbmZpZ3VyYXRpb24gaXMgbm90IGluIHRoZSByZXF1aXJlZCBmb3JtYXRcIik7XG4gICAgICB9XG4gICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmxvZ2dlclNlcnZpY2UgPSBuZXcgTG9nZ2VyKGRlZmF1bHRMb2dnZXJDb25maWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmxvZ2dlclNlcnZpY2UgPSBNb2NrTG9nZ2VyO1xuICAgIH1cblxuICAgIGlmICghZGF0YVNlcnZpY2UpIHtcbiAgICAgIEpvaS5hc3NlcnQobW9uZ29Db25maWcsIG1vbmdvQ29uZmlnU2NoZW1hLCBcIk1vbmdvIERCIGNvbmZpZ3VyYXRpb24gaXMgbm90IGluIHRoZSByZXF1aXJlZCBmb3JtYXRcIik7XG4gICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmRhdGFTZXJ2aWNlID0gbmV3IE1vbmdvZGJDbGllbnQoe1xuICAgICAgICBcIm1vbmdvQ29ubmVjdGlvbkZhY3RvcnlcIjogZ2V0RGJDb25uZWN0aW9uTWFuYWdlcih7XG4gICAgICAgICAgXCJsb2dnZXJcIjogZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlLFxuICAgICAgICAgIFwibmF0aXZlRHJpdmVyXCI6IE1vbmdvZGIsXG4gICAgICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IG1vbmdvQ29uZmlnLmNvbm5lY3Rpb25TdHJpbmcsXG4gICAgICAgICAgXCJpb1RpbWVvdXRcIjogbW9uZ29Db25maWcub3BlcmF0aW9uVGltZW91dCB8fCA1MDAwXG4gICAgICAgIH0pLFxuICAgICAgICBcImxvZ2dlclNlcnZpY2VcIjogZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kYXRhU2VydmljZSA9IGRhdGFTZXJ2aWNlO1xuICAgIH1cblxuICAgIGdldFByaXZhdGVIdWIodGhpcykuaW5kZXhEcm9wTGlzdCA9IFtdO1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuaW5kZXhDcmVhdGVMaXN0ID0gW107XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBjcmVhdGUgaW5kZXhlcyBpbiBhIGNvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdHM+fSBjcmVhdGVMaXN0IC0gQXJyYXkgb2Ygb2JqZWN0cyBjb250YWluaW5nIGluZGV4IGluZm9ybWF0aW9uXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPEFueT59IC0gVGhlIHJlc3VsdCBvYmplY3Qgb3IgRXJyb3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuY3JlYXRlSW5kZXhlcyA9IGZ1bmN0aW9uIChjcmVhdGVMaXN0KSB7XG5cbiAgICAgIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXG5cbiAgICAgIGZvciAoY29uc3QgaW5kZXggb2YgY3JlYXRlTGlzdCkge1xuXG4gICAgICAgIGNvbnN0IGluZGV4S2V5cyA9IHt9O1xuICAgICAgICBjb25zdCBpbmRleE9wdGlvbnMgPSB7fTtcblxuICAgICAgICBpbmRleC5pbmRleEtleXMuZm9yRWFjaChpbmRleEtleSA9PiB7XG4gICAgICAgICAgaW5kZXhLZXlzW2luZGV4S2V5LmtleU5hbWVdID0gaW5kZXhLZXkua2V5U29ydE9yZGVyO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGluZGV4LmluZGV4TmFtZSkge1xuICAgICAgICAgIGluZGV4T3B0aW9ucy5uYW1lID0gaW5kZXguaW5kZXhOYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluZGV4LmluZGV4T3B0aW9ucykge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24oaW5kZXhPcHRpb25zLCBpbmRleC5pbmRleE9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJpbmRleENyZWF0ZVwiLCBgQ29sbGVjdGlvbiBOYW1lIDogJHtpbmRleC5jb2xsZWN0aW9uTmFtZX0sIEtleXMgOiAke0hvZWsuc3RyaW5naWZ5KGluZGV4S2V5cyl9LCBPcHRpb25zIDogJHtIb2VrLnN0cmluZ2lmeShpbmRleE9wdGlvbnMpfWApO1xuXG4gICAgICAgIHByb21pc2UgPSBwcm9taXNlXG4gICAgICAgICAgLnRoZW4oKCkgPT4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kYXRhU2VydmljZS5jcmVhdGVJbmRleChpbmRleC5jb2xsZWN0aW9uTmFtZSwgaW5kZXhLZXlzLCBpbmRleE9wdGlvbnMpKVxuICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJpbmRleENyZWF0ZWRcIiwgYENvbGxlY3Rpb24gTmFtZSA6ICR7aW5kZXguY29sbGVjdGlvbk5hbWV9LCBLZXlzIDogJHtIb2VrLnN0cmluZ2lmeShpbmRleEtleXMpfSwgT3B0aW9ucyA6ICR7SG9lay5zdHJpbmdpZnkoaW5kZXhPcHRpb25zKX1gKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGRyb3AgaW5kZXhlcyBpbiBhIGNvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdHM+fSBkcm9wTGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxBbnk+fSAtIFRoZSByZXN1bHQgb2JqZWN0IG9yIEVycm9yXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmRyb3BJbmRleGVzID0gZnVuY3Rpb24gKGRyb3BMaXN0KSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShudWxsKTtcblxuICAgICAgZm9yIChjb25zdCBpbmRleCBvZiBkcm9wTGlzdCkge1xuXG4gICAgICAgIGlmIChpbmRleC5pbmRleE5hbWUgIT09IFwiX2lkX1wiKSB7XG4gICAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChcImluZGV4RHJvcFwiLCBgQ29sbGVjdGlvbiBOYW1lIDogJHtpbmRleC5jb2xsZWN0aW9uTmFtZX0sIFwiSW5kZXggTmFtZTpcIiA6ICR7aW5kZXguaW5kZXhOYW1lfWApO1xuICAgICAgICAgIHByb21pc2UgPSBwcm9taXNlXG4gICAgICAgICAgICAudGhlbigoKSA9PiBnZXRQcml2YXRlSHViKHRoaXMpLmRhdGFTZXJ2aWNlLmRyb3BJbmRleChpbmRleC5jb2xsZWN0aW9uTmFtZSwgaW5kZXguaW5kZXhOYW1lKSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJpbmRleERyb3BwZWRcIiwgYENvbGxlY3Rpb24gTmFtZSA6ICR7aW5kZXguY29sbGVjdGlvbk5hbWV9LCBcIkluZGV4IE5hbWU6XCIgOiAke2luZGV4LmluZGV4TmFtZX1gKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGV4dHJhY3QgYW5kIGZvcm1hdCBpbmRleCBrZXlzIGluIGRlc2lyZWQgZm9ybWF0XG4gICAgICogQHBhcmFtIHtvYmplY3RzfSBpbmRleEtleXMgLSBPYmplY3QgY29udGFpbmluZyBrZXlzIG9mIGFuIGluZGV4XG4gICAgICogQHJldHVybnMge29iamVjdH0gLSBUaGUgcmVzdWx0IG9iamVjdCBvciBFcnJvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5leHRyYWN0S2V5cyA9IGZ1bmN0aW9uIChpbmRleEtleXMpIHtcbiAgICAgIGNvbnN0IGZvcm1hdHRlZEtleXMgPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKGluZGV4S2V5cykuZm9yRWFjaChpbmRleEtleSA9PiBmb3JtYXR0ZWRLZXlzLnB1c2goe1xuICAgICAgICBcImtleU5hbWVcIjogaW5kZXhLZXksXG4gICAgICAgIFwia2V5U29ydE9yZGVyXCI6IGluZGV4S2V5c1tpbmRleEtleV1cbiAgICAgIH0pKTtcblxuICAgICAgcmV0dXJuIGZvcm1hdHRlZEtleXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGZvcm1hdCBpbmRleCBsaXN0XG4gICAgICogQHBhcmFtIHtBcnJheTxPYmplY3RzPn0gaW5kZXhMaXN0IC0gQXJyYXkgb2Ygb2JqZWN0cyBjb250YWluaW5nIGluZGV4IGluZm9ybWF0aW9uXG4gICAgICogQHJldHVybnMge0FycmF5LjxPYmplY3Q+fSAtIFRoZSByZXN1bHQgYXJyYXkgY29udGFpbmluZyBmb3JtYXR0ZWQgb2JqZWN0cyBvciBFcnJvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5mb3JtYXRSZXN1bHQgPSBmdW5jdGlvbiAoaW5kZXhMaXN0KSB7XG4gICAgICBjb25zdCBmb3JtYXR0ZWRSZXN1bHQgPSBbXTtcbiAgICAgIGluZGV4TGlzdC5mb3JFYWNoKGluZGV4ID0+IHtcbiAgICAgICAgZm9ybWF0dGVkUmVzdWx0LnB1c2goe1xuICAgICAgICAgIFwiY29sbGVjdGlvbk5hbWVcIjogaW5kZXgubnMuc3BsaXQoXCIuXCIpWzFdLFxuICAgICAgICAgIFwiaW5kZXhOYW1lXCI6IGluZGV4Lm5hbWUsXG4gICAgICAgICAgXCJpbmRleEtleXNcIjogZ2V0UHJpdmF0ZUh1Yih0aGlzKS5leHRyYWN0S2V5cyhpbmRleC5rZXkpXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBmb3JtYXR0ZWRSZXN1bHQ7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gZ2V0IGNvbGxlY3Rpb24gbmFtZXMgb3V0IG9mIGluZGV4IGxpc3RcbiAgICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdHM+fSBpbmRleExpc3QgLSBBcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgaW5kZXggaW5mb3JtYXRpb25cbiAgICAgKiBAcmV0dXJucyB7QXJyYXkuPFN0cmluZz59IC0gVGhlIHJlc3VsdCBhcnJheSBjb250YWluaW5nIHVuaXF1ZSBjb2xsZWN0aW9uIG5hbWVzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmdldENvbGxlY3Rpb25OYW1lcyA9IGZ1bmN0aW9uIChpbmRleExpc3QpIHtcblxuICAgICAgY29uc3QgY29sbGVjdGlvbkxpc3QgPSBIb2VrLnVuaXF1ZShpbmRleExpc3QubWFwKGluZGV4ID0+IGluZGV4LmNvbGxlY3Rpb25OYW1lKSk7XG4gICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KFwiY29sbGVjdGlvbk5hbWVzXCIsIGNvbGxlY3Rpb25MaXN0LmpvaW4oKSk7XG5cbiAgICAgIHJldHVybiBjb2xsZWN0aW9uTGlzdDtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBnZXQgaW5kZXggc3luYyBwcm9taXNlcyBmb3IgdGhlIHByb3ZpZGVkIGluZGV4IGxpc3RcbiAgICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdHM+fSBpbmRleExpc3QgLSBBcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgaW5kZXggaW5mb3JtYXRpb25cbiAgICAgKiBAcmV0dXJucyB7QXJyYXkuPFByb21pc2U+fSAtIFRoZSByZXN1bHQgYXJyYXkgY29udGFpbmluZyBzeW5jIHByb21pc2VzXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmdldEluZGV4U3luY1Byb21pc2VzID0gZnVuY3Rpb24gKGluZGV4TGlzdCkge1xuXG4gICAgICBjb25zdCBjb2xsZWN0aW9uSW5kZXhMaXN0UHJvbWlzZXMgPSBbXTtcbiAgICAgIGdldFByaXZhdGVIdWIodGhpcykuaW5kZXhDcmVhdGVMaXN0ID0gaW5kZXhMaXN0O1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5nZXRDb2xsZWN0aW9uTmFtZXMoaW5kZXhMaXN0KS5mb3JFYWNoKGNvbGxlY3Rpb24gPT4ge1xuICAgICAgICBjb2xsZWN0aW9uSW5kZXhMaXN0UHJvbWlzZXMucHVzaChnZXRQcml2YXRlSHViKHRoaXMpLmRhdGFTZXJ2aWNlLmdldEluZGV4ZXMoY29sbGVjdGlvbilcbiAgICAgICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgbGV0IGluZGV4UG9zaXRpb247XG4gICAgICAgICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmZvcm1hdFJlc3VsdChyZXN1bHQpLmZvckVhY2goaW5kZXggPT4ge1xuICAgICAgICAgICAgICBpZiAoKGluZGV4UG9zaXRpb24gPSBpbmRleExpc3QuZmluZEluZGV4KGluZGV4VG9CZUNyZWF0ZWQgPT4gSG9lay5kZWVwRXF1YWwoaW5kZXhUb0JlQ3JlYXRlZCwgaW5kZXgsIHtcInByb3RvdHlwZVwiOiBmYWxzZX0pKSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5pbmRleERyb3BMaXN0LnB1c2goaW5kZXgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGdldFByaXZhdGVIdWIodGhpcykuaW5kZXhDcmVhdGVMaXN0LnNwbGljZShpbmRleFBvc2l0aW9uLCAxKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBjb2xsZWN0aW9uSW5kZXhMaXN0UHJvbWlzZXM7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gcmVnaXN0ZXIgaGFuZGxlcnMgZm9yIGluZGV4IGJ1aWxkaW5nIHByb2Nlc3NcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRFbWl0dGVyIC0gRXZlbnQgRW1pdHRlclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudHNUb1JlZ2lzdGVyIC0gT2JqZWN0IGNvbnRhaW5pbmcgZXZlbnRzIHRvIHJlZ2lzdGVyIGFsb25nIHdpdGggdGhlaXIgbWVzc2FnZXNcbiAgICAgKiBAcmV0dXJucyB7Vm9pZH0gLSByZXR1cm5zIHZvaWQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLnJlZ2lzdGVyRXZlbnRzID0gZnVuY3Rpb24gKGV2ZW50RW1pdHRlciwgZXZlbnRzVG9SZWdpc3Rlcikge1xuXG4gICAgICBPYmplY3Qua2V5cyhldmVudHNUb1JlZ2lzdGVyKS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG5cbiAgICAgICAgZXZlbnRFbWl0dGVyLm9uKGV2ZW50TmFtZSwgaW5mbyA9PiB7XG5cbiAgICAgICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmxvZ2dlclNlcnZpY2UuaW5mbyhldmVudHNUb1JlZ2lzdGVyW2V2ZW50TmFtZV0gKyBpbmZvKTtcblxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBlcnJvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yICBlcnJvciBvYmplY3QuXG4gICAgICogQHJldHVybnMge3ZvaWR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmVycm9ySGFuZGxlciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlLmVycm9yKHtcImVycm9yXCI6IGVycm9yfSk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLmV2ZW50RW1pdHRlciA9IE1vY2tFdmVudEVtaXR0ZXIgfHwgbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIGdldFByaXZhdGVIdWIodGhpcykucmVnaXN0ZXJFdmVudHModGhpcy5ldmVudEVtaXR0ZXIsIGN1c3RvbUV2ZW50cy5pbmRleEV2ZW50cyk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBjcmVhdGUgaW5kZXhlcyBpbiBhIGRhdGFiYXNlXG4gICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0cz59IGluZGV4TGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QW55Pn0gLSBUaGUgcmVzdWx0IG9iamVjdCBvciBFcnJvclxuICAgKiBAcHVibGljXG4gICAqL1xuICBidWlsZEluZGV4ZXMoaW5kZXhMaXN0KSB7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChcImluZGV4ZXNTeW5jcm9uaXNhdGlvblN0YXJ0XCIsIEhvZWsuc3RyaW5naWZ5KG5ldyBEYXRlKCkpKTtcblxuICAgICAgcmV0dXJuIFZhbGlkYXRlU2NoZW1hKGluZGV4TGlzdCwgaW5kZXhMaXN0U2NoZW1hLCBcIlNjaGVtYSB2YWxpZGF0aW9uIGZhaWxlZFwiKVxuICAgICAgICAudGhlbih2YWxpZGF0ZWRJbmRleExpc3QgPT4gUS5hbGwoZ2V0UHJpdmF0ZUh1Yih0aGlzKS5nZXRJbmRleFN5bmNQcm9taXNlcyh2YWxpZGF0ZWRJbmRleExpc3QpKSlcbiAgICAgICAgLnRoZW4oKCkgPT4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kcm9wSW5kZXhlcyhnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4RHJvcExpc3QpKVxuICAgICAgICAudGhlbigoKSA9PiBnZXRQcml2YXRlSHViKHRoaXMpLmNyZWF0ZUluZGV4ZXMoZ2V0UHJpdmF0ZUh1Yih0aGlzKS5pbmRleENyZWF0ZUxpc3QpKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChcImluZGV4ZXNTeW5jcm9uaXNlZFwiLCBIb2VrLnN0cmluZ2lmeShuZXcgRGF0ZSgpKSk7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcblxuICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoXCJlcnJvclwiLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICByZXR1cm4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5lcnJvckhhbmRsZXIoVGhyb3dXcmFwcGVkRXJyb3IoYEVycm9yIGluIGJ1aWxkaW5nIGluZGV4ZXMgOiAke2Vycm9yLm1lc3NhZ2V9YCwgZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH1cbn1cblxuXG4vKipcbiAqIFJldHVybnMgbW9uZ28gaW5kZXggYnVpbGRlciBzaW5nbGV0b25cbiAqIEBwYXJhbSB7T2JqZWN0fSBtb25nb0NvbmZpZyAtIE1vbmdvIGRiIGNvbmdpZiB2YWx1ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBsb2dnZXJDb25maWcgLSBMb2dnZXIgY29uZmlndXJhdGlvbnNcbiAqIEByZXR1cm5zIHtpbmRleEJ1aWxkZXJTZXJ2aWNlfSAgVGhlIGluZGV4IGJ1aWxkZXIgc2luZ2xldG9uIGluc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbmRleEJ1aWxkZXIoe21vbmdvQ29uZmlnLCBsb2dnZXJDb25maWcsIGRhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyfSkge1xuXG4gIHByb3RlY3RlZEluc3RhbmNlID0gcHJvdGVjdGVkSW5zdGFuY2UgfHwgbmV3IGluZGV4QnVpbGRlclNlcnZpY2Uoe21vbmdvQ29uZmlnLCBsb2dnZXJDb25maWcsIGRhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyfSk7XG4gIHJldHVybiBwcm90ZWN0ZWRJbnN0YW5jZTtcbn1cblxuIl19
//# sourceMappingURL=indexBuilder.js.map
