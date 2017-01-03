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
          _this.eventEmitter.emit(customEvents.indexEvents.indexCreate, "Keys : " + Hoek.stringify(indexKeys) + ", Options : " + Hoek.stringify(indexOptions));

          promise = promise.then(function () {
            return getPrivateHub(_this).dataService.createIndex(index.collectionName, indexKeys, indexOptions);
          }).then(function () {
            return _this.eventEmitter.emit(customEvents.indexEvents.indexCreated, "Keys : " + Hoek.stringify(indexKeys) + ", Options : " + Hoek.stringify(indexOptions));
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


          _this2.eventEmitter.emit(customEvents.indexEvents.indexDrop, index.indexName);
          promise = promise.then(function () {
            return getPrivateHub(_this2).dataService.dropIndex(index.collectionName, index.indexName);
          }).then(function () {
            return _this2.eventEmitter.emit(customEvents.indexEvents.indexDropped, index.indexName);
          });
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
      this.eventEmitter.emit(customEvents.indexEvents.collectionNames, collectionList.join());

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
        this.eventEmitter.emit(customEvents.indexEvents.IndexesSyncronisationStart, Hoek.stringify(new Date()));

        return (0, _validateSchema2.default)(indexList, _schemaS.indexListSchema, "Schema validation failed").then(function (validatedIndexList) {
          return _q2.default.all(getPrivateHub(_this6).getIndexSyncPromises(validatedIndexList));
        }).then(function () {
          return getPrivateHub(_this6).dropIndexes(getPrivateHub(_this6).indexDropList);
        }).then(function () {
          return getPrivateHub(_this6).createIndexes(getPrivateHub(_this6).indexCreateList);
        }).then(function () {
          return _this6.eventEmitter.emit(customEvents.indexEvents.IndexesSyncronised, Hoek.stringify(new Date()));
        }).catch(function (error) {

          _this6.eventEmitter.emit(customEvents.indexEvents.Error, error.message);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9pbmRleEJ1aWxkZXIuZXM2Il0sIm5hbWVzIjpbImdldEluZGV4QnVpbGRlciIsIkhvZWsiLCJNb25nb2RiIiwiY3VzdG9tRXZlbnRzIiwicHJvdGVjdGVkSW5zdGFuY2UiLCJkZWZhdWx0TG9nZ2VyQ29uZmlnIiwicHJvY2VzcyIsInN0ZG91dCIsIm1hcCIsIldlYWtNYXAiLCJnZXRQcml2YXRlSHViIiwib2JqZWN0IiwiaGFzIiwic2V0IiwiZ2V0IiwiaW5kZXhCdWlsZGVyU2VydmljZSIsIm1vbmdvQ29uZmlnIiwibG9nZ2VyQ29uZmlnIiwiZGF0YVNlcnZpY2UiLCJNb2NrTG9nZ2VyIiwiTW9ja0V2ZW50RW1pdHRlciIsImF0dGVtcHQiLCJsb2dnZXJTZXJ2aWNlIiwiYXNzZXJ0IiwiY29ubmVjdGlvblN0cmluZyIsIm9wZXJhdGlvblRpbWVvdXQiLCJpbmRleERyb3BMaXN0IiwiaW5kZXhDcmVhdGVMaXN0IiwiY3JlYXRlSW5kZXhlcyIsImNyZWF0ZUxpc3QiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbmRleCIsImluZGV4S2V5cyIsImluZGV4T3B0aW9ucyIsImZvckVhY2giLCJpbmRleEtleSIsImtleU5hbWUiLCJrZXlTb3J0T3JkZXIiLCJpbmRleE5hbWUiLCJuYW1lIiwiT2JqZWN0IiwiYXNzaWduIiwiZXZlbnRFbWl0dGVyIiwiZW1pdCIsImluZGV4RXZlbnRzIiwiaW5kZXhDcmVhdGUiLCJzdHJpbmdpZnkiLCJ0aGVuIiwiY3JlYXRlSW5kZXgiLCJjb2xsZWN0aW9uTmFtZSIsImluZGV4Q3JlYXRlZCIsImJpbmQiLCJkcm9wSW5kZXhlcyIsImRyb3BMaXN0IiwiaW5kZXhEcm9wIiwiZHJvcEluZGV4IiwiaW5kZXhEcm9wcGVkIiwiZXh0cmFjdEtleXMiLCJmb3JtYXR0ZWRLZXlzIiwia2V5cyIsInB1c2giLCJmb3JtYXRSZXN1bHQiLCJpbmRleExpc3QiLCJmb3JtYXR0ZWRSZXN1bHQiLCJucyIsInNwbGl0Iiwia2V5IiwiZ2V0Q29sbGVjdGlvbk5hbWVzIiwiY29sbGVjdGlvbkxpc3QiLCJ1bmlxdWUiLCJjb2xsZWN0aW9uTmFtZXMiLCJqb2luIiwiZ2V0SW5kZXhTeW5jUHJvbWlzZXMiLCJjb2xsZWN0aW9uSW5kZXhMaXN0UHJvbWlzZXMiLCJnZXRJbmRleGVzIiwiY29sbGVjdGlvbiIsImluZGV4UG9zaXRpb24iLCJyZXN1bHQiLCJmaW5kSW5kZXgiLCJkZWVwRXF1YWwiLCJpbmRleFRvQmVDcmVhdGVkIiwic3BsaWNlIiwicmVnaXN0ZXJFdmVudHMiLCJldmVudHNUb1JlZ2lzdGVyIiwib24iLCJldmVudE5hbWUiLCJpbmZvIiwiZXJyb3JIYW5kbGVyIiwiZXJyb3IiLCJJbmRleGVzU3luY3JvbmlzYXRpb25TdGFydCIsIkRhdGUiLCJhbGwiLCJ2YWxpZGF0ZWRJbmRleExpc3QiLCJJbmRleGVzU3luY3JvbmlzZWQiLCJjYXRjaCIsIkVycm9yIiwibWVzc2FnZSIsInJlamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7UUFnUmdCQSxlLEdBQUFBLGU7O0FBaFJoQjs7OztBQUNBOztJQUFZQyxJOztBQUNaOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOztJQUFZQyxPOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7SUFBWUMsWTs7Ozs7Ozs7QUFFWixJQUFJQywwQkFBSjtBQUNBLElBQUlDLHNCQUFzQjtBQUN4QixhQUFXLENBQUM7QUFDVixhQUFTLE9BREM7QUFFVixjQUFVQyxRQUFRQztBQUZSLEdBQUQ7QUFEYSxDQUExQjtBQU1BO0FBQ0EsSUFBTUMsTUFBTSxJQUFJQyxPQUFKLEVBQVo7QUFDQSxTQUFTQyxhQUFULENBQXVCQyxNQUF2QixFQUErQjs7QUFFN0IsTUFBSSxDQUFDSCxJQUFJSSxHQUFKLENBQVFELE1BQVIsQ0FBTCxFQUFzQjtBQUNwQkgsUUFBSUssR0FBSixDQUFRRixNQUFSLEVBQWdCLEVBQWhCO0FBQ0Q7QUFDRCxTQUFPSCxJQUFJTSxHQUFKLENBQVFILE1BQVIs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ZmlsZSI6ImluZGV4QnVpbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBRIGZyb20gXCJxXCI7XG5pbXBvcnQgKiBhcyBIb2VrIGZyb20gXCJob2VrXCI7XG5pbXBvcnQge2luZGV4TGlzdFNjaGVtYSwgbG9nZ2VyU2NoZW1hLCBtb25nb0NvbmZpZ1NjaGVtYX0gZnJvbSBcIi4vc2NoZW1hKHMpXCI7XG5pbXBvcnQgVmFsaWRhdGVTY2hlbWEgZnJvbSBcIi4vdmFsaWRhdGVTY2hlbWFcIjtcbmltcG9ydCBUaHJvd1dyYXBwZWRFcnJvciBmcm9tIFwiLi90aHJvd1dyYXBwZWRFcnJvclwiO1xuaW1wb3J0IHtnZXREYkNvbm5lY3Rpb25NYW5hZ2VyfSBmcm9tIFwiLi9zZXJ2aWNlcy9tb25nby1jb25uZWN0aW9uLWZhY3RvcnlcIjtcbmltcG9ydCBNb25nb2RiQ2xpZW50IGZyb20gXCIuL3NlcnZpY2VzL21vbmdvU2VydmljZVwiO1xuaW1wb3J0ICogYXMgTW9uZ29kYiBmcm9tIFwibW9uZ29kYlwiO1xuaW1wb3J0IExvZ2dlciBmcm9tIFwiLi9zZXJ2aWNlcy9sb2dnZXJcIjtcbmltcG9ydCBKb2kgZnJvbSBcImpvaVwiO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCAqIGFzIGN1c3RvbUV2ZW50cyBmcm9tIFwiLi9jdXN0b21FdmVudHNcIjtcblxubGV0IHByb3RlY3RlZEluc3RhbmNlO1xubGV0IGRlZmF1bHRMb2dnZXJDb25maWcgPSB7XG4gIFwic3RyZWFtc1wiOiBbe1xuICAgIFwibGV2ZWxcIjogXCJ0cmFjZVwiLFxuICAgIFwic3RyZWFtXCI6IHByb2Nlc3Muc3Rkb3V0XG4gIH1dXG59O1xuLy8gbGV0IGludGVybmFscztcbmNvbnN0IG1hcCA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBnZXRQcml2YXRlSHViKG9iamVjdCkge1xuXG4gIGlmICghbWFwLmhhcyhvYmplY3QpKSB7XG4gICAgbWFwLnNldChvYmplY3QsIHt9KTtcbiAgfVxuICByZXR1cm4gbWFwLmdldChvYmplY3QpO1xufVxuXG4vKipcbiAqIFNlcnZpY2VzIGZvciBidWlsZGluZyBpbmRleGVzIGluIGRhdGFiYXNlXG4gKiBAY2xhc3MgaW5kZXhCdWlsZGVyU2VydmljZVxuICogQHBhcmFtIHtPYmplY3R9IG1vbmdvQ29uZmlnIC0gTW9uZ28gZGIgY29uZ2lmIHZhbHVlc1xuICogQHBhcmFtIHtPYmplY3R9IGxvZ2dlckNvbmZpZyAtIExvZ2dlciBjb25maWd1cmF0aW9uc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBpbmRleEJ1aWxkZXJTZXJ2aWNlIHtcblxuICBjb25zdHJ1Y3Rvcih7bW9uZ29Db25maWcsIGxvZ2dlckNvbmZpZywgZGF0YVNlcnZpY2UsIE1vY2tMb2dnZXIsIE1vY2tFdmVudEVtaXR0ZXJ9KSB7XG5cbiAgIC8vIGludGVybmFscyA9IGdldFByaXZhdGVIdWIodGhpcyk7XG5cbiAgICBpZiAoIU1vY2tMb2dnZXIpIHtcbiAgICAgIGlmIChsb2dnZXJDb25maWcpIHtcblxuICAgICAgICBkZWZhdWx0TG9nZ2VyQ29uZmlnID0gSm9pLmF0dGVtcHQobG9nZ2VyQ29uZmlnLCBsb2dnZXJTY2hlbWEsIFwiTG9nZ2VyIGNvbmZpZ3VyYXRpb24gaXMgbm90IGluIHRoZSByZXF1aXJlZCBmb3JtYXRcIik7XG4gICAgICB9XG4gICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmxvZ2dlclNlcnZpY2UgPSBuZXcgTG9nZ2VyKGRlZmF1bHRMb2dnZXJDb25maWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmxvZ2dlclNlcnZpY2UgPSBNb2NrTG9nZ2VyO1xuICAgIH1cblxuICAgIGlmICghZGF0YVNlcnZpY2UpIHtcbiAgICAgIEpvaS5hc3NlcnQobW9uZ29Db25maWcsIG1vbmdvQ29uZmlnU2NoZW1hLCBcIk1vbmdvIERCIGNvbmZpZ3VyYXRpb24gaXMgbm90IGluIHRoZSByZXF1aXJlZCBmb3JtYXRcIik7XG4gICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmRhdGFTZXJ2aWNlID0gbmV3IE1vbmdvZGJDbGllbnQoe1xuICAgICAgICBcIm1vbmdvQ29ubmVjdGlvbkZhY3RvcnlcIjogZ2V0RGJDb25uZWN0aW9uTWFuYWdlcih7XG4gICAgICAgICAgXCJsb2dnZXJcIjogZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlLFxuICAgICAgICAgIFwibmF0aXZlRHJpdmVyXCI6IE1vbmdvZGIsXG4gICAgICAgICAgXCJjb25uZWN0aW9uU3RyaW5nXCI6IG1vbmdvQ29uZmlnLmNvbm5lY3Rpb25TdHJpbmcsXG4gICAgICAgICAgXCJpb1RpbWVvdXRcIjogbW9uZ29Db25maWcub3BlcmF0aW9uVGltZW91dCB8fCA1MDAwXG4gICAgICAgIH0pLFxuICAgICAgICBcImxvZ2dlclNlcnZpY2VcIjogZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kYXRhU2VydmljZSA9IGRhdGFTZXJ2aWNlO1xuICAgIH1cblxuICAgIGdldFByaXZhdGVIdWIodGhpcykuaW5kZXhEcm9wTGlzdCA9IFtdO1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuaW5kZXhDcmVhdGVMaXN0ID0gW107XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBjcmVhdGUgaW5kZXhlcyBpbiBhIGNvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdHM+fSBjcmVhdGVMaXN0IC0gQXJyYXkgb2Ygb2JqZWN0cyBjb250YWluaW5nIGluZGV4IGluZm9ybWF0aW9uXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPEFueT59IC0gVGhlIHJlc3VsdCBvYmplY3Qgb3IgRXJyb3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuY3JlYXRlSW5kZXhlcyA9IGZ1bmN0aW9uIChjcmVhdGVMaXN0KSB7XG5cbiAgICAgIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXG5cbiAgICAgIGZvciAoY29uc3QgaW5kZXggb2YgY3JlYXRlTGlzdCkge1xuXG4gICAgICAgIGNvbnN0IGluZGV4S2V5cyA9IHt9O1xuICAgICAgICBjb25zdCBpbmRleE9wdGlvbnMgPSB7fTtcblxuICAgICAgICBpbmRleC5pbmRleEtleXMuZm9yRWFjaChpbmRleEtleSA9PiB7XG4gICAgICAgICAgaW5kZXhLZXlzW2luZGV4S2V5LmtleU5hbWVdID0gaW5kZXhLZXkua2V5U29ydE9yZGVyO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGluZGV4LmluZGV4TmFtZSkge1xuICAgICAgICAgIGluZGV4T3B0aW9ucy5uYW1lID0gaW5kZXguaW5kZXhOYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluZGV4LmluZGV4T3B0aW9ucykge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24oaW5kZXhPcHRpb25zLCBpbmRleC5pbmRleE9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoY3VzdG9tRXZlbnRzLmluZGV4RXZlbnRzLmluZGV4Q3JlYXRlLCBgS2V5cyA6ICR7SG9lay5zdHJpbmdpZnkoaW5kZXhLZXlzKX0sIE9wdGlvbnMgOiAke0hvZWsuc3RyaW5naWZ5KGluZGV4T3B0aW9ucyl9YCk7XG5cbiAgICAgICAgcHJvbWlzZSA9IHByb21pc2VcbiAgICAgICAgICAudGhlbigoKSA9PiBnZXRQcml2YXRlSHViKHRoaXMpLmRhdGFTZXJ2aWNlLmNyZWF0ZUluZGV4KGluZGV4LmNvbGxlY3Rpb25OYW1lLCBpbmRleEtleXMsIGluZGV4T3B0aW9ucykpXG4gICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChjdXN0b21FdmVudHMuaW5kZXhFdmVudHMuaW5kZXhDcmVhdGVkLCBgS2V5cyA6ICR7SG9lay5zdHJpbmdpZnkoaW5kZXhLZXlzKX0sIE9wdGlvbnMgOiAke0hvZWsuc3RyaW5naWZ5KGluZGV4T3B0aW9ucyl9YCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBkcm9wIGluZGV4ZXMgaW4gYSBjb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheTxPYmplY3RzPn0gZHJvcExpc3QgLSBBcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgaW5kZXggaW5mb3JtYXRpb25cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QW55Pn0gLSBUaGUgcmVzdWx0IG9iamVjdCBvciBFcnJvclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kcm9wSW5kZXhlcyA9IGZ1bmN0aW9uIChkcm9wTGlzdCkge1xuICAgICAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cbiAgICAgIGZvciAoY29uc3QgaW5kZXggb2YgZHJvcExpc3QpIHtcblxuICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KGN1c3RvbUV2ZW50cy5pbmRleEV2ZW50cy5pbmRleERyb3AsIGluZGV4LmluZGV4TmFtZSk7XG4gICAgICAgIHByb21pc2UgPSBwcm9taXNlXG4gICAgICAgICAgLnRoZW4oKCkgPT4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kYXRhU2VydmljZS5kcm9wSW5kZXgoaW5kZXguY29sbGVjdGlvbk5hbWUsIGluZGV4LmluZGV4TmFtZSkpXG4gICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChjdXN0b21FdmVudHMuaW5kZXhFdmVudHMuaW5kZXhEcm9wcGVkLCBpbmRleC5pbmRleE5hbWUpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gZXh0cmFjdCBhbmQgZm9ybWF0IGluZGV4IGtleXMgaW4gZGVzaXJlZCBmb3JtYXRcbiAgICAgKiBAcGFyYW0ge29iamVjdHN9IGluZGV4S2V5cyAtIE9iamVjdCBjb250YWluaW5nIGtleXMgb2YgYW4gaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSByZXN1bHQgb2JqZWN0IG9yIEVycm9yXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmV4dHJhY3RLZXlzID0gZnVuY3Rpb24gKGluZGV4S2V5cykge1xuICAgICAgY29uc3QgZm9ybWF0dGVkS2V5cyA9IFtdO1xuICAgICAgT2JqZWN0LmtleXMoaW5kZXhLZXlzKS5mb3JFYWNoKGluZGV4S2V5ID0+IGZvcm1hdHRlZEtleXMucHVzaCh7XG4gICAgICAgIFwia2V5TmFtZVwiOiBpbmRleEtleSxcbiAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogaW5kZXhLZXlzW2luZGV4S2V5XVxuICAgICAgfSkpO1xuXG4gICAgICByZXR1cm4gZm9ybWF0dGVkS2V5cztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gZm9ybWF0IGluZGV4IGxpc3RcbiAgICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdHM+fSBpbmRleExpc3QgLSBBcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgaW5kZXggaW5mb3JtYXRpb25cbiAgICAgKiBAcmV0dXJucyB7QXJyYXkuPE9iamVjdD59IC0gVGhlIHJlc3VsdCBhcnJheSBjb250YWluaW5nIGZvcm1hdHRlZCBvYmplY3RzIG9yIEVycm9yXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChpbmRleExpc3QpIHtcbiAgICAgIGNvbnN0IGZvcm1hdHRlZFJlc3VsdCA9IFtdO1xuICAgICAgaW5kZXhMaXN0LmZvckVhY2goaW5kZXggPT4ge1xuICAgICAgICBmb3JtYXR0ZWRSZXN1bHQucHVzaCh7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBpbmRleC5ucy5zcGxpdChcIi5cIilbMV0sXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogaW5kZXgubmFtZSxcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBnZXRQcml2YXRlSHViKHRoaXMpLmV4dHJhY3RLZXlzKGluZGV4LmtleSlcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGZvcm1hdHRlZFJlc3VsdDtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBnZXQgY29sbGVjdGlvbiBuYW1lcyBvdXQgb2YgaW5kZXggbGlzdFxuICAgICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0cz59IGluZGV4TGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgICAqIEByZXR1cm5zIHtBcnJheS48U3RyaW5nPn0gLSBUaGUgcmVzdWx0IGFycmF5IGNvbnRhaW5pbmcgdW5pcXVlIGNvbGxlY3Rpb24gbmFtZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuZ2V0Q29sbGVjdGlvbk5hbWVzID0gZnVuY3Rpb24gKGluZGV4TGlzdCkge1xuXG4gICAgICBjb25zdCBjb2xsZWN0aW9uTGlzdCA9IEhvZWsudW5pcXVlKGluZGV4TGlzdC5tYXAoaW5kZXggPT4gaW5kZXguY29sbGVjdGlvbk5hbWUpKTtcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoY3VzdG9tRXZlbnRzLmluZGV4RXZlbnRzLmNvbGxlY3Rpb25OYW1lcywgY29sbGVjdGlvbkxpc3Quam9pbigpKTtcblxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb25MaXN0O1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGdldCBpbmRleCBzeW5jIHByb21pc2VzIGZvciB0aGUgcHJvdmlkZWQgaW5kZXggbGlzdFxuICAgICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0cz59IGluZGV4TGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgICAqIEByZXR1cm5zIHtBcnJheS48UHJvbWlzZT59IC0gVGhlIHJlc3VsdCBhcnJheSBjb250YWluaW5nIHN5bmMgcHJvbWlzZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuZ2V0SW5kZXhTeW5jUHJvbWlzZXMgPSBmdW5jdGlvbiAoaW5kZXhMaXN0KSB7XG5cbiAgICAgIGNvbnN0IGNvbGxlY3Rpb25JbmRleExpc3RQcm9taXNlcyA9IFtdO1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5pbmRleENyZWF0ZUxpc3QgPSBpbmRleExpc3Q7XG4gICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmdldENvbGxlY3Rpb25OYW1lcyhpbmRleExpc3QpLmZvckVhY2goY29sbGVjdGlvbiA9PiB7XG4gICAgICAgIGNvbGxlY3Rpb25JbmRleExpc3RQcm9taXNlcy5wdXNoKGdldFByaXZhdGVIdWIodGhpcykuZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcyhjb2xsZWN0aW9uKVxuICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICBsZXQgaW5kZXhQb3NpdGlvbjtcbiAgICAgICAgICAgIGdldFByaXZhdGVIdWIodGhpcykuZm9ybWF0UmVzdWx0KHJlc3VsdCkuZm9yRWFjaChpbmRleCA9PiB7XG4gICAgICAgICAgICAgIGlmICgoaW5kZXhQb3NpdGlvbiA9IGluZGV4TGlzdC5maW5kSW5kZXgoaW5kZXhUb0JlQ3JlYXRlZCA9PiBIb2VrLmRlZXBFcXVhbChpbmRleFRvQmVDcmVhdGVkLCBpbmRleCwge1wicHJvdG90eXBlXCI6IGZhbHNlfSkpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4RHJvcExpc3QucHVzaChpbmRleCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5pbmRleENyZWF0ZUxpc3Quc3BsaWNlKGluZGV4UG9zaXRpb24sIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb25JbmRleExpc3RQcm9taXNlcztcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byByZWdpc3RlciBoYW5kbGVycyBmb3IgaW5kZXggYnVpbGRpbmcgcHJvY2Vzc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudEVtaXR0ZXIgLSBFdmVudCBFbWl0dGVyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50c1RvUmVnaXN0ZXIgLSBPYmplY3QgY29udGFpbmluZyBldmVudHMgdG8gcmVnaXN0ZXIgYWxvbmcgd2l0aCB0aGVpciBtZXNzYWdlc1xuICAgICAqIEByZXR1cm5zIHtWb2lkfSAtIHJldHVybnMgdm9pZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykucmVnaXN0ZXJFdmVudHMgPSBmdW5jdGlvbiAoZXZlbnRFbWl0dGVyLCBldmVudHNUb1JlZ2lzdGVyKSB7XG5cbiAgICAgIE9iamVjdC5rZXlzKGV2ZW50c1RvUmVnaXN0ZXIpLmZvckVhY2goZXZlbnROYW1lID0+IHtcblxuICAgICAgICBldmVudEVtaXR0ZXIub24oZXZlbnROYW1lLCBpbmZvID0+IHtcblxuICAgICAgICAgIGdldFByaXZhdGVIdWIodGhpcykubG9nZ2VyU2VydmljZS5pbmZvKGV2ZW50c1RvUmVnaXN0ZXJbZXZlbnROYW1lXSArIGluZm8pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBlcnJvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yICBlcnJvciBvYmplY3QuXG4gICAgICogQHJldHVybnMge3ZvaWR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmVycm9ySGFuZGxlciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlLmVycm9yKHtcImVycm9yXCI6IGVycm9yfSk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLmV2ZW50RW1pdHRlciA9IE1vY2tFdmVudEVtaXR0ZXIgfHwgbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIGdldFByaXZhdGVIdWIodGhpcykucmVnaXN0ZXJFdmVudHModGhpcy5ldmVudEVtaXR0ZXIsIGN1c3RvbUV2ZW50cy5pbmRleEV2ZW50cyk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBjcmVhdGUgaW5kZXhlcyBpbiBhIGRhdGFiYXNlXG4gICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0cz59IGluZGV4TGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QW55Pn0gLSBUaGUgcmVzdWx0IG9iamVjdCBvciBFcnJvclxuICAgKiBAcHVibGljXG4gICAqL1xuICBidWlsZEluZGV4ZXMoaW5kZXhMaXN0KSB7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChjdXN0b21FdmVudHMuaW5kZXhFdmVudHMuSW5kZXhlc1N5bmNyb25pc2F0aW9uU3RhcnQsIEhvZWsuc3RyaW5naWZ5KG5ldyBEYXRlKCkpKTtcblxuICAgICAgcmV0dXJuIFZhbGlkYXRlU2NoZW1hKGluZGV4TGlzdCwgaW5kZXhMaXN0U2NoZW1hLCBcIlNjaGVtYSB2YWxpZGF0aW9uIGZhaWxlZFwiKVxuICAgICAgICAudGhlbih2YWxpZGF0ZWRJbmRleExpc3QgPT4gUS5hbGwoZ2V0UHJpdmF0ZUh1Yih0aGlzKS5nZXRJbmRleFN5bmNQcm9taXNlcyh2YWxpZGF0ZWRJbmRleExpc3QpKSlcbiAgICAgICAgLnRoZW4oKCkgPT4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kcm9wSW5kZXhlcyhnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4RHJvcExpc3QpKVxuICAgICAgICAudGhlbigoKSA9PiBnZXRQcml2YXRlSHViKHRoaXMpLmNyZWF0ZUluZGV4ZXMoZ2V0UHJpdmF0ZUh1Yih0aGlzKS5pbmRleENyZWF0ZUxpc3QpKVxuICAgICAgICAudGhlbigoKSA9PiB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KGN1c3RvbUV2ZW50cy5pbmRleEV2ZW50cy5JbmRleGVzU3luY3JvbmlzZWQsIEhvZWsuc3RyaW5naWZ5KG5ldyBEYXRlKCkpKSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcblxuICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoY3VzdG9tRXZlbnRzLmluZGV4RXZlbnRzLkVycm9yLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICByZXR1cm4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5lcnJvckhhbmRsZXIoVGhyb3dXcmFwcGVkRXJyb3IoYEVycm9yIGluIGJ1aWxkaW5nIGluZGV4ZXMgOiAke2Vycm9yLm1lc3NhZ2V9YCwgZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH1cbn1cblxuXG4vKipcbiAqIFJldHVybnMgbW9uZ28gaW5kZXggYnVpbGRlciBzaW5nbGV0b25cbiAqIEBwYXJhbSB7T2JqZWN0fSBtb25nb0NvbmZpZyAtIE1vbmdvIGRiIGNvbmdpZiB2YWx1ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBsb2dnZXJDb25maWcgLSBMb2dnZXIgY29uZmlndXJhdGlvbnNcbiAqIEByZXR1cm5zIHtpbmRleEJ1aWxkZXJTZXJ2aWNlfSAgVGhlIGluZGV4IGJ1aWxkZXIgc2luZ2xldG9uIGluc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbmRleEJ1aWxkZXIoe21vbmdvQ29uZmlnLCBsb2dnZXJDb25maWcsIGRhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyfSkge1xuXG4gIHByb3RlY3RlZEluc3RhbmNlID0gcHJvdGVjdGVkSW5zdGFuY2UgfHwgbmV3IGluZGV4QnVpbGRlclNlcnZpY2Uoe21vbmdvQ29uZmlnLCBsb2dnZXJDb25maWcsIGRhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyfSk7XG4gIHJldHVybiBwcm90ZWN0ZWRJbnN0YW5jZTtcbn1cblxuIl19
//# sourceMappingURL=indexBuilder.js.map
