"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bunyan = require("bunyan");

var _bunyan2 = _interopRequireDefault(_bunyan);

var _schemaS = require("./../schema(s)");

var _joi = require("joi");

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents an eg logger
 * @class
 */
var Logger = function () {

  /**
   * @constructor
   * @param {Object} configuration The configurations
   */
  function Logger(configuration) {
    _classCallCheck(this, Logger);

    _joi2.default.assert(configuration, _schemaS.loggerSchema, "configuration argument in correct format is required");

    /** @member {Bunyan.Logger} The bunyan logger instance */
    this.logger_ = _bunyan2.default.createLogger(configuration);
  }

  /**
   * Produces a fatal level log
   * @param {string|object} message The message to be logged
   * @param {object} data The relevant data to be logged
   * @returns {undefined} undefined
   * @public
   */


  _createClass(Logger, [{
    key: "fatal",
    value: function fatal(message, data) {
      var _logger_;

      var args = data ? [data, message] : [message];

      (_logger_ = this.logger_).fatal.apply(_logger_, args);
    }

    /**
     * Produces a error level log
     * @param {string|object} message The message to be logged
     * @param {object} data The relevant data to be logged
     * @returns {undefined} undefined
     * @public
     */

  }, {
    key: "error",
    value: function error(message, data) {
      var _logger_2;

      var args = data ? [data, message] : [message];

      (_logger_2 = this.logger_).error.apply(_logger_2, args);
    }

    /**
     * Produces a warn level log
     * @param {string|object} message The message to be logged
     * @param {object} data The relevant data to be logged
     * @returns {undefined} undefined
     * @public
     */

  }, {
    key: "warn",
    value: function warn(message, data) {
      var _logger_3;

      var args = data ? [data, message] : [message];

      (_logger_3 = this.logger_).warn.apply(_logger_3, args);
    }

    /**
     * Produces a info level log
     * @param {string|object} message The message to be logged
     * @param {object} data The relevant data to be logged
     * @returns {undefined} undefined
     * @public
     */

  }, {
    key: "info",
    value: function info(message, data) {
      var _logger_4;

      var args = data ? [data, message] : [message];

      (_logger_4 = this.logger_).info.apply(_logger_4, args);
    }

    /**
     * Produces a debug level log
     * @param {string|object} message The message to be logged
     * @param {object} data The relevant data to be logged
     * @returns {undefined} undefined
     * @public
     */

  }, {
    key: "debug",
    value: function debug(message, data) {
      var _logger_5;

      var args = data ? [data, message] : [message];

      (_logger_5 = this.logger_).debug.apply(_logger_5, args);
    }

    /**
     * Produces a trace level log
     * @param {string|object} message The message to be logged
     * @param {object} data The relevant data to be logged
     * @returns {undefined} undefined
     * @public
     */

  }, {
    key: "trace",
    value: function trace(message, data) {
      var _logger_6;

      var args = data ? [data, message] : [message];

      (_logger_6 = this.logger_).trace.apply(_logger_6, args);
    }
  }]);

  return Logger;
}();

exports.default = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zZXJ2aWNlcy9sb2dnZXIuZXM2Il0sIm5hbWVzIjpbIkxvZ2dlciIsImNvbmZpZ3VyYXRpb24iLCJhc3NlcnQiLCJsb2dnZXJfIiwiY3JlYXRlTG9nZ2VyIiwibWVzc2FnZSIsImRhdGEiLCJhcmdzIiwiZmF0YWwiLCJlcnJvciIsIndhcm4iLCJpbmZvIiwiZGVidWciLCJ0cmFjZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOzs7Ozs7OztBQUdBOzs7O0lBSXFCQSxNOztBQUVuQjs7OztBQUlBLGtCQUFZQyxhQUFaLEVBQTJCO0FBQUE7O0FBRXpCLGtCQUFJQyxNQUFKLENBQVdELGFBQVgseUJBQXdDLHNEQUF4Qzs7QUFFQTtBQUNBLFNBQUtFLE9BQUwsR0FBZSxpQkFBT0MsWUFBUCxDQUFvQkgsYUFBcEIsQ0FBZjtBQUNEOztBQUVEOzs7Ozs7Ozs7OzswQkFPTUksTyxFQUFTQyxJLEVBQU07QUFBQTs7QUFFbkIsVUFBTUMsT0FBT0QsT0FBTyxDQUFDQSxJQUFELEVBQU9ELE9BQVAsQ0FBUCxHQUF5QixDQUFDQSxPQUFELENBQXRDOztBQUVBLHVCQUFLRixPQUFMLEVBQWFLLEtBQWIsaUJBQXNCRCxJQUF0QjtBQUNEOztBQUVEOzs7Ozs7Ozs7OzBCQU9NRixPLEVBQVNDLEksRUFBTTtBQUFBOztBQUVuQixVQUFNQyxPQUFPRCxPQUFPLENBQUNBLElBQUQsRUFBT0QsT0FBUCxDQUFQLEdBQXlCLENBQUNBLE9BQUQsQ0FBdEM7O0FBRUEsd0JBQUtGLE9BQUwsRUFBYU0sS0FBYixrQkFBc0JGLElBQXRCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7eUJBT0tGLE8sRUFBU0MsSSxFQUFNO0FBQUE7O0FBRWxCLFVBQU1DLE9BQU9ELE9BQU8sQ0FBQ0EsSUFBRCxFQUFPRCxPQUFQLENBQVAsR0FBeUIsQ0FBQ0EsT0FBRCxDQUF0Qzs7QUFFQSx3QkFBS0YsT0FBTCxFQUFhTyxJQUFiLGtCQUFxQkgsSUFBckI7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozt5QkFPS0YsTyxFQUFTQyxJLEVBQU07QUFBQTs7QUFFbEIsVUFBTUMsT0FBT0QsT0FBTyxDQUFDQSxJQUFELEVBQU9ELE9BQVAsQ0FBUCxHQUF5QixDQUFDQSxPQUFELENBQXRDOztBQUVBLHdCQUFLRixPQUFMLEVBQWFRLElBQWIsa0JBQXFCSixJQUFyQjtBQUNEOztBQUVEOzs7Ozs7Ozs7OzBCQU9NRixPLEVBQVNDLEksRUFBTTtBQUFBOztBQUVuQixVQUFNQyxPQUFPRCxPQUFPLENBQUNBLElBQUQsRUFBT0QsT0FBUCxDQUFQLEdBQXlCLENBQUNBLE9BQUQsQ0FBdEM7O0FBRUEsd0JBQUtGLE9BQUwsRUFBYVMsS0FBYixrQkFBc0JMLElBQXRCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7MEJBT01GLE8sRUFBU0MsSSxFQUFNO0FBQUE7O0FBRW5CLFVBQU1DLE9BQU9ELE9BQU8sQ0FBQ0EsSUFBRCxFQUFPRCxPQUFQLENBQVAsR0FBeUIsQ0FBQ0EsT0FBRCxDQUF0Qzs7QUFFQSx3QkFBS0YsT0FBTCxFQUFhVSxLQUFiLGtCQUFzQk4sSUFBdEI7QUFDRDs7Ozs7O2tCQWhHa0JQLE0iLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGJ1bnlhbiBmcm9tIFwiYnVueWFuXCI7XG5pbXBvcnQge2xvZ2dlclNjaGVtYX0gZnJvbSBcIi4vLi4vc2NoZW1hKHMpXCI7XG5pbXBvcnQgSm9pIGZyb20gXCJqb2lcIjtcblxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gZWcgbG9nZ2VyXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9nZ2VyIHtcblxuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWd1cmF0aW9uIFRoZSBjb25maWd1cmF0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IoY29uZmlndXJhdGlvbikge1xuXG4gICAgSm9pLmFzc2VydChjb25maWd1cmF0aW9uLCBsb2dnZXJTY2hlbWEsIFwiY29uZmlndXJhdGlvbiBhcmd1bWVudCBpbiBjb3JyZWN0IGZvcm1hdCBpcyByZXF1aXJlZFwiKTtcblxuICAgIC8qKiBAbWVtYmVyIHtCdW55YW4uTG9nZ2VyfSBUaGUgYnVueWFuIGxvZ2dlciBpbnN0YW5jZSAqL1xuICAgIHRoaXMubG9nZ2VyXyA9IGJ1bnlhbi5jcmVhdGVMb2dnZXIoY29uZmlndXJhdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgYSBmYXRhbCBsZXZlbCBsb2dcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBtZXNzYWdlIFRoZSBtZXNzYWdlIHRvIGJlIGxvZ2dlZFxuICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBUaGUgcmVsZXZhbnQgZGF0YSB0byBiZSBsb2dnZWRcbiAgICogQHJldHVybnMge3VuZGVmaW5lZH0gdW5kZWZpbmVkXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGZhdGFsKG1lc3NhZ2UsIGRhdGEpIHtcblxuICAgIGNvbnN0IGFyZ3MgPSBkYXRhID8gW2RhdGEsIG1lc3NhZ2VdIDogW21lc3NhZ2VdO1xuXG4gICAgdGhpcy5sb2dnZXJfLmZhdGFsKC4uLmFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2R1Y2VzIGEgZXJyb3IgbGV2ZWwgbG9nXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBiZSBsb2dnZWRcbiAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgVGhlIHJlbGV2YW50IGRhdGEgdG8gYmUgbG9nZ2VkXG4gICAqIEByZXR1cm5zIHt1bmRlZmluZWR9IHVuZGVmaW5lZFxuICAgKiBAcHVibGljXG4gICAqL1xuICBlcnJvcihtZXNzYWdlLCBkYXRhKSB7XG5cbiAgICBjb25zdCBhcmdzID0gZGF0YSA/IFtkYXRhLCBtZXNzYWdlXSA6IFttZXNzYWdlXTtcblxuICAgIHRoaXMubG9nZ2VyXy5lcnJvciguLi5hcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlcyBhIHdhcm4gbGV2ZWwgbG9nXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBiZSBsb2dnZWRcbiAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgVGhlIHJlbGV2YW50IGRhdGEgdG8gYmUgbG9nZ2VkXG4gICAqIEByZXR1cm5zIHt1bmRlZmluZWR9IHVuZGVmaW5lZFxuICAgKiBAcHVibGljXG4gICAqL1xuICB3YXJuKG1lc3NhZ2UsIGRhdGEpIHtcblxuICAgIGNvbnN0IGFyZ3MgPSBkYXRhID8gW2RhdGEsIG1lc3NhZ2VdIDogW21lc3NhZ2VdO1xuXG4gICAgdGhpcy5sb2dnZXJfLndhcm4oLi4uYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgYSBpbmZvIGxldmVsIGxvZ1xuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIFRoZSByZWxldmFudCBkYXRhIHRvIGJlIGxvZ2dlZFxuICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfSB1bmRlZmluZWRcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgaW5mbyhtZXNzYWdlLCBkYXRhKSB7XG5cbiAgICBjb25zdCBhcmdzID0gZGF0YSA/IFtkYXRhLCBtZXNzYWdlXSA6IFttZXNzYWdlXTtcblxuICAgIHRoaXMubG9nZ2VyXy5pbmZvKC4uLmFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2R1Y2VzIGEgZGVidWcgbGV2ZWwgbG9nXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBiZSBsb2dnZWRcbiAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEgVGhlIHJlbGV2YW50IGRhdGEgdG8gYmUgbG9nZ2VkXG4gICAqIEByZXR1cm5zIHt1bmRlZmluZWR9IHVuZGVmaW5lZFxuICAgKiBAcHVibGljXG4gICAqL1xuICBkZWJ1ZyhtZXNzYWdlLCBkYXRhKSB7XG5cbiAgICBjb25zdCBhcmdzID0gZGF0YSA/IFtkYXRhLCBtZXNzYWdlXSA6IFttZXNzYWdlXTtcblxuICAgIHRoaXMubG9nZ2VyXy5kZWJ1ZyguLi5hcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlcyBhIHRyYWNlIGxldmVsIGxvZ1xuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIFRoZSByZWxldmFudCBkYXRhIHRvIGJlIGxvZ2dlZFxuICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfSB1bmRlZmluZWRcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgdHJhY2UobWVzc2FnZSwgZGF0YSkge1xuXG4gICAgY29uc3QgYXJncyA9IGRhdGEgPyBbZGF0YSwgbWVzc2FnZV0gOiBbbWVzc2FnZV07XG5cbiAgICB0aGlzLmxvZ2dlcl8udHJhY2UoLi4uYXJncyk7XG4gIH1cbn1cbiJdfQ==
//# sourceMappingURL=logger.js.map
