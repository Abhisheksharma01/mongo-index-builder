"use strict";

require("source-map-support/register");

var _lab = require("lab");

var _lab2 = _interopRequireDefault(_lab);

var _code = require("code");

var _customErrors = require("../../../dist/customErrors");

var CustomErrors = _interopRequireWildcard(_customErrors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lab = exports.lab = _lab2.default.script();
var describe = lab.describe,
    it = lab.it;


describe("CustomErrors.argumentUndefined", function () {

  it("should be defined", function (done) {
    (0, _code.expect)(CustomErrors.argumentUndefined).to.not.be.undefined();

    return done();
  });

  it("should be an instance of Error", function (done) {
    // arrange
    var parameterName = "foo bar baz";

    // act
    var err = new CustomErrors.argumentUndefined(parameterName);

    // assert
    (0, _code.expect)(err).to.be.an.instanceof(Error);

    return done();
  });

  it("should have a stack trace", function (done) {
    var err = new CustomErrors.argumentUndefined();

    (0, _code.expect)(err.stack).to.be.a.string();

    return done();
  });

  describe("constructor", function () {

    it("should set parameter ParameterName", function (done) {
      // arrange
      var parameterName = "free beer";

      // act
      var actual = new CustomErrors.argumentUndefined(parameterName);

      // assert
      (0, _code.expect)(actual[parameterName]).to.equal(parameterName);

      return done();
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvY3VzdG9tRXJyb3JzL2FyZ3VtZW50VW5kZWZpbmVkLmVzNiJdLCJuYW1lcyI6WyJDdXN0b21FcnJvcnMiLCJsYWIiLCJleHBvcnRzIiwic2NyaXB0IiwiZGVzY3JpYmUiLCJpdCIsImFyZ3VtZW50VW5kZWZpbmVkIiwidG8iLCJub3QiLCJiZSIsInVuZGVmaW5lZCIsImRvbmUiLCJwYXJhbWV0ZXJOYW1lIiwiZXJyIiwiYW4iLCJpbnN0YW5jZW9mIiwiRXJyb3IiLCJzdGFjayIsImEiLCJzdHJpbmciLCJhY3R1YWwiLCJlcXVhbCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7OztBQUNBOztBQUNBOztJQUFZQSxZOzs7Ozs7QUFFWixJQUFNQyxNQUFNQyxRQUFRRCxHQUFSLEdBQWMsY0FBSUUsTUFBSixFQUExQjtJQUNPQyxRLEdBQWdCSCxHLENBQWhCRyxRO0lBQVVDLEUsR0FBTUosRyxDQUFOSSxFOzs7QUFFakJELFNBQVMsZ0NBQVQsRUFBMkMsWUFBTTs7QUFFL0NDLEtBQUcsbUJBQUgsRUFBd0IsZ0JBQVE7QUFDOUIsc0JBQU9MLGFBQWFNLGlCQUFwQixFQUF1Q0MsRUFBdkMsQ0FBMENDLEdBQTFDLENBQThDQyxFQUE5QyxDQUFpREMsU0FBakQ7O0FBRUEsV0FBT0MsTUFBUDtBQUNELEdBSkQ7O0FBTUFOLEtBQUcsZ0NBQUgsRUFBcUMsZ0JBQVE7QUFDM0M7QUFDQSxRQUFNTyxnQkFBZ0IsYUFBdEI7O0FBRUE7QUFDQSxRQUFNQyxNQUFNLElBQUliLGFBQWFNLGlCQUFqQixDQUFtQ00sYUFBbkMsQ0FBWjs7QUFFQTtBQUNBLHNCQUFPQyxHQUFQLEVBQVlOLEVBQVosQ0FBZUUsRUFBZixDQUFrQkssRUFBbEIsQ0FBcUJDLFVBQXJCLENBQWdDQyxLQUFoQzs7QUFFQSxXQUFPTCxNQUFQO0FBQ0QsR0FYRDs7QUFhQU4sS0FBRywyQkFBSCxFQUFnQyxnQkFBUTtBQUN0QyxRQUFNUSxNQUFNLElBQUliLGFBQWFNLGlCQUFqQixFQUFaOztBQUVBLHNCQUFPTyxJQUFJSSxLQUFYLEVBQWtCVixFQUFsQixDQUFxQkUsRUFBckIsQ0FBd0JTLENBQXhCLENBQTBCQyxNQUExQjs7QUFFQSxXQUFPUixNQUFQO0FBQ0QsR0FORDs7QUFRQVAsV0FBUyxhQUFULEVBQXdCLFlBQU07O0FBRTVCQyxPQUFHLG9DQUFILEVBQXlDLGdCQUFRO0FBQy9DO0FBQ0EsVUFBTU8sZ0JBQWdCLFdBQXRCOztBQUVBO0FBQ0EsVUFBTVEsU0FBUyxJQUFJcEIsYUFBYU0saUJBQWpCLENBQW1DTSxhQUFuQyxDQUFmOztBQUVBO0FBQ0Esd0JBQU9RLE9BQU9SLGFBQVAsQ0FBUCxFQUE4QkwsRUFBOUIsQ0FBaUNjLEtBQWpDLENBQXVDVCxhQUF2Qzs7QUFFQSxhQUFPRCxNQUFQO0FBQ0QsS0FYRDtBQWFELEdBZkQ7QUFnQkQsQ0E3Q0QiLCJmaWxlIjoiYXJndW1lbnRVbmRlZmluZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXJcIjtcbmltcG9ydCBMYWIgZnJvbSBcImxhYlwiO1xuaW1wb3J0IHtleHBlY3R9IGZyb20gXCJjb2RlXCI7XG5pbXBvcnQgKiBhcyBDdXN0b21FcnJvcnMgZnJvbSBcIi4uLy4uLy4uL2Rpc3QvY3VzdG9tRXJyb3JzXCI7XG5cbmNvbnN0IGxhYiA9IGV4cG9ydHMubGFiID0gTGFiLnNjcmlwdCgpO1xuY29uc3Qge2Rlc2NyaWJlLCBpdH0gPSBsYWI7XG5cbmRlc2NyaWJlKFwiQ3VzdG9tRXJyb3JzLmFyZ3VtZW50VW5kZWZpbmVkXCIsICgpID0+IHtcblxuICBpdChcInNob3VsZCBiZSBkZWZpbmVkXCIsIGRvbmUgPT4ge1xuICAgIGV4cGVjdChDdXN0b21FcnJvcnMuYXJndW1lbnRVbmRlZmluZWQpLnRvLm5vdC5iZS51bmRlZmluZWQoKTtcblxuICAgIHJldHVybiBkb25lKCk7XG4gIH0pO1xuXG4gIGl0KFwic2hvdWxkIGJlIGFuIGluc3RhbmNlIG9mIEVycm9yXCIsIGRvbmUgPT4ge1xuICAgIC8vIGFycmFuZ2VcbiAgICBjb25zdCBwYXJhbWV0ZXJOYW1lID0gXCJmb28gYmFyIGJhelwiO1xuXG4gICAgLy8gYWN0XG4gICAgY29uc3QgZXJyID0gbmV3IEN1c3RvbUVycm9ycy5hcmd1bWVudFVuZGVmaW5lZChwYXJhbWV0ZXJOYW1lKTtcblxuICAgIC8vIGFzc2VydFxuICAgIGV4cGVjdChlcnIpLnRvLmJlLmFuLmluc3RhbmNlb2YoRXJyb3IpO1xuXG4gICAgcmV0dXJuIGRvbmUoKTtcbiAgfSk7XG5cbiAgaXQoXCJzaG91bGQgaGF2ZSBhIHN0YWNrIHRyYWNlXCIsIGRvbmUgPT4ge1xuICAgIGNvbnN0IGVyciA9IG5ldyBDdXN0b21FcnJvcnMuYXJndW1lbnRVbmRlZmluZWQoKTtcblxuICAgIGV4cGVjdChlcnIuc3RhY2spLnRvLmJlLmEuc3RyaW5nKCk7XG5cbiAgICByZXR1cm4gZG9uZSgpO1xuICB9KTtcblxuICBkZXNjcmliZShcImNvbnN0cnVjdG9yXCIsICgpID0+IHtcblxuICAgIGl0KFwic2hvdWxkIHNldCBwYXJhbWV0ZXIgUGFyYW1ldGVyTmFtZVwiLCBkb25lID0+IHtcbiAgICAgIC8vIGFycmFuZ2VcbiAgICAgIGNvbnN0IHBhcmFtZXRlck5hbWUgPSBcImZyZWUgYmVlclwiO1xuXG4gICAgICAvLyBhY3RcbiAgICAgIGNvbnN0IGFjdHVhbCA9IG5ldyBDdXN0b21FcnJvcnMuYXJndW1lbnRVbmRlZmluZWQocGFyYW1ldGVyTmFtZSk7XG5cbiAgICAgIC8vIGFzc2VydFxuICAgICAgZXhwZWN0KGFjdHVhbFtwYXJhbWV0ZXJOYW1lXSkudG8uZXF1YWwocGFyYW1ldGVyTmFtZSk7XG5cbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfSk7XG5cbiAgfSk7XG59KTtcbiJdfQ==
//# sourceMappingURL=argumentUndefined.js.map
