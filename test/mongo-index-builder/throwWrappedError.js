"use strict";

var _throwWrappedError = require("../../dist/throwWrappedError");

var _throwWrappedError2 = _interopRequireDefault(_throwWrappedError);

var _lab = require("lab");

var _lab2 = _interopRequireDefault(_lab);

var _code = require("code");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lab = exports.lab = _lab2.default.script();
var describe = lab.describe,
    it = lab.it;


describe("throwWrappedError", function () {

  it("should throw", function (done) {

    // Arrange
    var errorMessage = "mock";
    var innerException = new Error("mock");

    // Act

    var act = function act() {
      return (0, _throwWrappedError2.default)(errorMessage, innerException);
    };
    // Assert
    (0, _code.expect)(act).to.throw(Error, "mock");

    return done();
  });

  it("should create a new error object with passed in message and preserve passed exception as inner exception", function (done) {

    // Arrange
    var errorMessage = "mock";
    var innerException = new Error("mock");

    // Act
    try {
      (0, _throwWrappedError2.default)(errorMessage, innerException);
    } catch (error) {
      // Assert
      (0, _code.expect)(error).to.be.an.error();
      (0, _code.expect)(error.message).to.equal(errorMessage);
      (0, _code.expect)(error.innerError).to.equal(innerException);
    }

    return done();
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvdGhyb3dXcmFwcGVkRXJyb3IuZXM2Il0sIm5hbWVzIjpbImxhYiIsImV4cG9ydHMiLCJzY3JpcHQiLCJkZXNjcmliZSIsIml0IiwiZXJyb3JNZXNzYWdlIiwiaW5uZXJFeGNlcHRpb24iLCJFcnJvciIsImFjdCIsInRvIiwidGhyb3ciLCJkb25lIiwiZXJyb3IiLCJiZSIsImFuIiwibWVzc2FnZSIsImVxdWFsIiwiaW5uZXJFcnJvciJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFHQSxJQUFNQSxNQUFNQyxRQUFRRCxHQUFSLEdBQWMsY0FBSUUsTUFBSixFQUExQjtJQUNPQyxRLEdBQWdCSCxHLENBQWhCRyxRO0lBQVVDLEUsR0FBTUosRyxDQUFOSSxFOzs7QUFFakJELFNBQVMsbUJBQVQsRUFBOEIsWUFBTTs7QUFFbENDLEtBQUcsY0FBSCxFQUFtQixnQkFBUTs7QUFFekI7QUFDQSxRQUFNQyxlQUFlLE1BQXJCO0FBQ0EsUUFBTUMsaUJBQWlCLElBQUlDLEtBQUosQ0FBVSxNQUFWLENBQXZCOztBQUVBOztBQUVBLFFBQU1DLE1BQU0sU0FBTkEsR0FBTTtBQUFBLGFBQU0saUNBQUlILFlBQUosRUFBa0JDLGNBQWxCLENBQU47QUFBQSxLQUFaO0FBQ0E7QUFDQSxzQkFBT0UsR0FBUCxFQUFZQyxFQUFaLENBQWVDLEtBQWYsQ0FBcUJILEtBQXJCLEVBQTRCLE1BQTVCOztBQUVBLFdBQU9JLE1BQVA7QUFDRCxHQWJEOztBQWVBUCxLQUFHLDBHQUFILEVBQStHLGdCQUFROztBQUVySDtBQUNBLFFBQU1DLGVBQWUsTUFBckI7QUFDQSxRQUFNQyxpQkFBaUIsSUFBSUMsS0FBSixDQUFVLE1BQVYsQ0FBdkI7O0FBRUE7QUFDQSxRQUFJO0FBQ0YsdUNBQUlGLFlBQUosRUFBa0JDLGNBQWxCO0FBQ0QsS0FGRCxDQUVFLE9BQU9NLEtBQVAsRUFBYztBQUNkO0FBQ0Esd0JBQU9BLEtBQVAsRUFBY0gsRUFBZCxDQUFpQkksRUFBakIsQ0FBb0JDLEVBQXBCLENBQXVCRixLQUF2QjtBQUNBLHdCQUFPQSxNQUFNRyxPQUFiLEVBQXNCTixFQUF0QixDQUF5Qk8sS0FBekIsQ0FBK0JYLFlBQS9CO0FBQ0Esd0JBQU9PLE1BQU1LLFVBQWIsRUFBeUJSLEVBQXpCLENBQTRCTyxLQUE1QixDQUFrQ1YsY0FBbEM7QUFDRDs7QUFFRCxXQUFPSyxNQUFQO0FBQ0QsR0FqQkQ7QUFtQkQsQ0FwQ0QiLCJmaWxlIjoidGhyb3dXcmFwcGVkRXJyb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3V0IGZyb20gXCIuLi8uLi9kaXN0L3Rocm93V3JhcHBlZEVycm9yXCI7XG5pbXBvcnQgTGFiIGZyb20gXCJsYWJcIjtcbmltcG9ydCB7ZXhwZWN0fSBmcm9tIFwiY29kZVwiO1xuXG5cbmNvbnN0IGxhYiA9IGV4cG9ydHMubGFiID0gTGFiLnNjcmlwdCgpO1xuY29uc3Qge2Rlc2NyaWJlLCBpdH0gPSBsYWI7XG5cbmRlc2NyaWJlKFwidGhyb3dXcmFwcGVkRXJyb3JcIiwgKCkgPT4ge1xuXG4gIGl0KFwic2hvdWxkIHRocm93XCIsIGRvbmUgPT4ge1xuXG4gICAgLy8gQXJyYW5nZVxuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwibW9ja1wiO1xuICAgIGNvbnN0IGlubmVyRXhjZXB0aW9uID0gbmV3IEVycm9yKFwibW9ja1wiKTtcblxuICAgIC8vIEFjdFxuXG4gICAgY29uc3QgYWN0ID0gKCkgPT4gU3V0KGVycm9yTWVzc2FnZSwgaW5uZXJFeGNlcHRpb24pO1xuICAgIC8vIEFzc2VydFxuICAgIGV4cGVjdChhY3QpLnRvLnRocm93KEVycm9yLCBcIm1vY2tcIik7XG5cbiAgICByZXR1cm4gZG9uZSgpO1xuICB9KTtcblxuICBpdChcInNob3VsZCBjcmVhdGUgYSBuZXcgZXJyb3Igb2JqZWN0IHdpdGggcGFzc2VkIGluIG1lc3NhZ2UgYW5kIHByZXNlcnZlIHBhc3NlZCBleGNlcHRpb24gYXMgaW5uZXIgZXhjZXB0aW9uXCIsIGRvbmUgPT4ge1xuXG4gICAgLy8gQXJyYW5nZVxuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IFwibW9ja1wiO1xuICAgIGNvbnN0IGlubmVyRXhjZXB0aW9uID0gbmV3IEVycm9yKFwibW9ja1wiKTtcblxuICAgIC8vIEFjdFxuICAgIHRyeSB7XG4gICAgICBTdXQoZXJyb3JNZXNzYWdlLCBpbm5lckV4Y2VwdGlvbik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIEFzc2VydFxuICAgICAgZXhwZWN0KGVycm9yKS50by5iZS5hbi5lcnJvcigpO1xuICAgICAgZXhwZWN0KGVycm9yLm1lc3NhZ2UpLnRvLmVxdWFsKGVycm9yTWVzc2FnZSk7XG4gICAgICBleHBlY3QoZXJyb3IuaW5uZXJFcnJvcikudG8uZXF1YWwoaW5uZXJFeGNlcHRpb24pO1xuICAgIH1cblxuICAgIHJldHVybiBkb25lKCk7XG4gIH0pO1xuXG59KTtcblxuIl19
//# sourceMappingURL=throwWrappedError.js.map
