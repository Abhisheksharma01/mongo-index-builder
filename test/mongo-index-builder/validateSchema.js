"use strict";

var _validateSchema = require("../../dist/validateSchema");

var _validateSchema2 = _interopRequireDefault(_validateSchema);

var _lab = require("lab");

var _lab2 = _interopRequireDefault(_lab);

var _code = require("code");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lab = exports.lab = _lab2.default.script();
var describe = lab.describe,
    it = lab.it,
    fail = lab.fail;


describe("validateSchema", function () {

  it("should reject when value is undefined", function () {

    // Arrange

    // Act
    var act = (0, _validateSchema2.default)();

    // Assert
    return act.then(function () {
      fail("should have gone to catch.");
    }).catch(function (error) {
      (0, _code.expect)(error).to.be.an.error(Error, "undefined: undefined");
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvdmFsaWRhdGVTY2hlbWEuZXM2Il0sIm5hbWVzIjpbImxhYiIsImV4cG9ydHMiLCJzY3JpcHQiLCJkZXNjcmliZSIsIml0IiwiZmFpbCIsImFjdCIsInRoZW4iLCJjYXRjaCIsImVycm9yIiwidG8iLCJiZSIsImFuIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBR0EsSUFBTUEsTUFBTUMsUUFBUUQsR0FBUixHQUFjLGNBQUlFLE1BQUosRUFBMUI7SUFDT0MsUSxHQUFzQkgsRyxDQUF0QkcsUTtJQUFVQyxFLEdBQVlKLEcsQ0FBWkksRTtJQUFJQyxJLEdBQVFMLEcsQ0FBUkssSTs7O0FBRXJCRixTQUFTLGdCQUFULEVBQTJCLFlBQU07O0FBRS9CQyxLQUFHLHVDQUFILEVBQTRDLFlBQU07O0FBRWhEOztBQUVBO0FBQ0EsUUFBTUUsTUFBTSwrQkFBWjs7QUFFQTtBQUNBLFdBQU9BLElBQ0pDLElBREksQ0FDQyxZQUFNO0FBQ1ZGLFdBQUssNEJBQUw7QUFDRCxLQUhJLEVBSUpHLEtBSkksQ0FJRSxpQkFBUztBQUNkLHdCQUFPQyxLQUFQLEVBQWNDLEVBQWQsQ0FBaUJDLEVBQWpCLENBQW9CQyxFQUFwQixDQUF1QkgsS0FBdkIsQ0FBNkJJLEtBQTdCLEVBQW9DLHNCQUFwQztBQUNELEtBTkksQ0FBUDtBQU9ELEdBZkQ7QUFpQkQsQ0FuQkQiLCJmaWxlIjoidmFsaWRhdGVTY2hlbWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU3V0IGZyb20gXCIuLi8uLi9kaXN0L3ZhbGlkYXRlU2NoZW1hXCI7XG5pbXBvcnQgTGFiIGZyb20gXCJsYWJcIjtcbmltcG9ydCB7ZXhwZWN0fSBmcm9tIFwiY29kZVwiO1xuXG5cbmNvbnN0IGxhYiA9IGV4cG9ydHMubGFiID0gTGFiLnNjcmlwdCgpO1xuY29uc3Qge2Rlc2NyaWJlLCBpdCwgZmFpbH0gPSBsYWI7XG5cbmRlc2NyaWJlKFwidmFsaWRhdGVTY2hlbWFcIiwgKCkgPT4ge1xuXG4gIGl0KFwic2hvdWxkIHJlamVjdCB3aGVuIHZhbHVlIGlzIHVuZGVmaW5lZFwiLCAoKSA9PiB7XG5cbiAgICAvLyBBcnJhbmdlXG5cbiAgICAvLyBBY3RcbiAgICBjb25zdCBhY3QgPSBTdXQoKTtcblxuICAgIC8vIEFzc2VydFxuICAgIHJldHVybiBhY3RcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgZmFpbChcInNob3VsZCBoYXZlIGdvbmUgdG8gY2F0Y2guXCIpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgIGV4cGVjdChlcnJvcikudG8uYmUuYW4uZXJyb3IoRXJyb3IsIFwidW5kZWZpbmVkOiB1bmRlZmluZWRcIik7XG4gICAgICB9KTtcbiAgfSk7XG5cbn0pO1xuXG4iXX0=
//# sourceMappingURL=validateSchema.js.map
