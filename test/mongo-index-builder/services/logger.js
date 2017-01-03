"use strict";

var _lab = require("lab");

var _lab2 = _interopRequireDefault(_lab);

var _code = require("code");

var _sinon = require("sinon");

var _bunyan = require("bunyan");

var _bunyan2 = _interopRequireDefault(_bunyan);

var _logger = require("./../../../dist/services/logger");

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _exports$lab = exports.lab = _lab2.default.script(),
    describe = _exports$lab.describe,
    it = _exports$lab.it;

var config = {
  "streams": [{
    "level": "fatal",
    "stream": process.stdout
  }],
  "name": "eg-logger"
};

describe("The Logger", function () {

  describe("The constructor", function () {

    describe("on calling with no configuration", function () {

      it("should throw error", function (done) {

        (0, _code.expect)(function () {
          return new _logger2.default();
        }).to.throw(/^configuration argument in correct format is required/);

        return done();
      });
    });

    describe("on calling with configuration", function () {

      it("should create instance", function (done) {

        (0, _code.expect)(new _logger2.default(config)).to.be.an.instanceOf(_logger2.default);

        return done();
      });
    });
  });

  describe("The fatal method", function () {

    describe("on calling with a message parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Trace message test";

      it("should call the Logger fatal function with the message argument", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "fatal");

        logger.fatal(testMessage);

        (0, _code.expect)(_bunyan2.default.prototype.fatal.calledWithExactly(testMessage)).to.be.true();

        _bunyan2.default.prototype.fatal.restore();

        return done();
      });
    });

    describe("on calling with a message and data parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Trace message test";
      var testData = { "Property": "Test Property" };

      it("should call the Logger fatal function with the message and serialized data", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "fatal");

        logger.fatal(testMessage, testData);

        (0, _code.expect)(_bunyan2.default.prototype.fatal.calledWithExactly(testData, testMessage)).to.be.true();

        _bunyan2.default.prototype.fatal.restore();

        return done();
      });
    });
  });

  describe("The error method", function () {

    describe("on calling with a message parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Error message test";

      it("should call the Logger error function with the message argument", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "error");

        logger.error(testMessage);

        (0, _code.expect)(_bunyan2.default.prototype.error.calledWithExactly(testMessage)).to.be.true();

        _bunyan2.default.prototype.error.restore();

        return done();
      });
    });

    describe("on calling with a message and data parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Error message test";
      var testData = { "Property": "Test Property" };

      it("should call the Logger error function with the message and serialized data", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "error");

        logger.error(testMessage, testData);

        (0, _code.expect)(_bunyan2.default.prototype.error.calledWithExactly(testData, testMessage)).to.be.true();

        _bunyan2.default.prototype.error.restore();

        return done();
      });
    });
  });

  describe("The warn method", function () {

    describe("on calling with a message parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Warn message test";

      it("should call the Logger warn function with the message argument", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "warn");

        logger.warn(testMessage);

        (0, _code.expect)(_bunyan2.default.prototype.warn.calledWithExactly(testMessage)).to.be.true();

        _bunyan2.default.prototype.warn.restore();

        return done();
      });
    });

    describe("on calling with a message and data parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Warn message test";
      var testData = { "Property": "Test Property" };

      it("should call the Logger warn function with the message and serialized data", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "warn");

        logger.warn(testMessage, testData);

        (0, _code.expect)(_bunyan2.default.prototype.warn.calledWithExactly(testData, testMessage)).to.be.true();

        _bunyan2.default.prototype.warn.restore();

        return done();
      });
    });
  });

  describe("The info method", function () {

    describe("on calling with a message parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Info message test";

      it("should call the Logger info function with the message argument", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "info");

        logger.info(testMessage);

        (0, _code.expect)(_bunyan2.default.prototype.info.calledWithExactly(testMessage)).to.be.true();

        _bunyan2.default.prototype.info.restore();

        return done();
      });
    });

    describe("on calling with a message and data parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Info message test";
      var testData = { "Property": "Test Property" };

      it("should call the Logger info function with the message and serialized data", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "info");

        logger.info(testMessage, testData);

        (0, _code.expect)(_bunyan2.default.prototype.info.calledWithExactly(testData, testMessage)).to.be.true();

        _bunyan2.default.prototype.info.restore();

        return done();
      });
    });
  });

  describe("The debug method", function () {

    describe("on calling with a message parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Debug message test";

      it("should call the Logger debug function with the message argument", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "debug");

        logger.debug(testMessage);

        (0, _code.expect)(_bunyan2.default.prototype.debug.calledWithExactly(testMessage)).to.be.true();

        _bunyan2.default.prototype.debug.restore();

        return done();
      });
    });

    describe("on calling with a message and data parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Debug message test";
      var testData = { "Property": "Test Property" };

      it("should call the Logger debug function with the message and serialized data", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "debug");

        logger.debug(testMessage, testData);

        (0, _code.expect)(_bunyan2.default.prototype.debug.calledWithExactly(testData, testMessage)).to.be.true();

        _bunyan2.default.prototype.debug.restore();

        return done();
      });
    });
  });

  describe("The trace method", function () {

    describe("on calling with a message parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Trace message test";

      it("should call the Logger trace function with the message argument", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "trace");

        logger.trace(testMessage);

        (0, _code.expect)(_bunyan2.default.prototype.trace.calledWithExactly(testMessage)).to.be.true();

        _bunyan2.default.prototype.trace.restore();

        return done();
      });
    });

    describe("on calling with a message and data parameter", function () {

      var logger = new _logger2.default(config);
      var testMessage = "Trace message test";
      var testData = { "Property": "Test Property" };

      it("should call the Logger trace function with the message and serialized data", function (done) {

        (0, _sinon.stub)(_bunyan2.default.prototype, "trace");

        logger.trace(testMessage, testData);

        (0, _code.expect)(_bunyan2.default.prototype.trace.calledWithExactly(testData, testMessage)).to.be.true();

        _bunyan2.default.prototype.trace.restore();

        return done();
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvc2VydmljZXMvbG9nZ2VyLmVzNiJdLCJuYW1lcyI6WyJleHBvcnRzIiwibGFiIiwic2NyaXB0IiwiZGVzY3JpYmUiLCJpdCIsImNvbmZpZyIsInByb2Nlc3MiLCJzdGRvdXQiLCJ0byIsInRocm93IiwiZG9uZSIsImJlIiwiYW4iLCJpbnN0YW5jZU9mIiwibG9nZ2VyIiwidGVzdE1lc3NhZ2UiLCJwcm90b3R5cGUiLCJmYXRhbCIsImNhbGxlZFdpdGhFeGFjdGx5IiwidHJ1ZSIsInJlc3RvcmUiLCJ0ZXN0RGF0YSIsImVycm9yIiwid2FybiIsImluZm8iLCJkZWJ1ZyIsInRyYWNlIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7Ozs7O21CQUV1QkEsUUFBUUMsR0FBUixHQUFjLGNBQUlDLE1BQUosRTtJQUE5QkMsUSxnQkFBQUEsUTtJQUFVQyxFLGdCQUFBQSxFOztBQUNqQixJQUFNQyxTQUFTO0FBQ2IsYUFBVyxDQUFDO0FBQ1YsYUFBUyxPQURDO0FBRVYsY0FBVUMsUUFBUUM7QUFGUixHQUFELENBREU7QUFLYixVQUFRO0FBTEssQ0FBZjs7QUFRQUosU0FBUyxZQUFULEVBQXVCLFlBQU07O0FBRTNCQSxXQUFTLGlCQUFULEVBQTRCLFlBQU07O0FBRWhDQSxhQUFTLGtDQUFULEVBQTZDLFlBQU07O0FBRWpEQyxTQUFHLG9CQUFILEVBQXlCLGdCQUFROztBQUUvQiwwQkFBTztBQUFBLGlCQUFNLHNCQUFOO0FBQUEsU0FBUCxFQUEyQkksRUFBM0IsQ0FBOEJDLEtBQTlCLENBQW9DLHVEQUFwQzs7QUFFQSxlQUFPQyxNQUFQO0FBQ0QsT0FMRDtBQU1ELEtBUkQ7O0FBVUFQLGFBQVMsK0JBQVQsRUFBMEMsWUFBTTs7QUFFOUNDLFNBQUcsd0JBQUgsRUFBNkIsZ0JBQVE7O0FBRW5DLDBCQUFPLHFCQUFXQyxNQUFYLENBQVAsRUFBMkJHLEVBQTNCLENB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QVE7O0FBRTVFLHlCQUFLLGlCQUFPWSxTQUFaLEVBQXVCLE9BQXZCOztBQUVBRixlQUFPWSxLQUFQLENBQWFYLFdBQWI7O0FBRUEsMEJBQU8saUJBQU9DLFNBQVAsQ0FBaUJVLEtBQWpCLENBQXVCUixpQkFBdkIsQ0FBeUNILFdBQXpDLENBQVAsRUFBOERQLEVBQTlELENBQWlFRyxFQUFqRSxDQUFvRVEsSUFBcEU7O0FBRUEseUJBQU9ILFNBQVAsQ0FBaUJVLEtBQWpCLENBQXVCTixPQUF2Qjs7QUFFQSxlQUFPVixNQUFQO0FBQ0QsT0FYRDtBQWFELEtBbEJEOztBQW9CQVAsYUFBUyw4Q0FBVCxFQUF5RCxZQUFNOztBQUU3RCxVQUFNVyxTQUFTLHFCQUFXVCxNQUFYLENBQWY7QUFDQSxVQUFNVSxjQUFjLG9CQUFwQjtBQUNBLFVBQU1NLFdBQVcsRUFBQyxZQUFZLGVBQWIsRUFBakI7O0FBRUFqQixTQUFHLDRFQUFILEVBQWlGLGdCQUFROztBQUV2Rix5QkFBSyxpQkFBT1ksU0FBWixFQUF1QixPQUF2Qjs7QUFFQUYsZUFBT1ksS0FBUCxDQUFhWCxXQUFiLEVBQTBCTSxRQUExQjs7QUFFQSwwQkFBTyxpQkFBT0wsU0FBUCxDQUFpQlUsS0FBakIsQ0FBdUJSLGlCQUF2QixDQUF5Q0csUUFBekMsRUFBbUROLFdBQW5ELENBQVAsRUFBd0VQLEVBQXhFLENBQTJFRyxFQUEzRSxDQUE4RVEsSUFBOUU7O0FBRUEseUJBQU9ILFNBQVAsQ0FBaUJVLEtBQWpCLENBQXVCTixPQUF2Qjs7QUFFQSxlQUFPVixNQUFQO0FBQ0QsT0FYRDtBQVlELEtBbEJEO0FBbUJELEdBekNEO0FBMENELENBMVJEIiwiZmlsZSI6ImxvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMYWIgZnJvbSBcImxhYlwiO1xuaW1wb3J0IHtleHBlY3R9IGZyb20gXCJjb2RlXCI7XG5pbXBvcnQge3N0dWJ9IGZyb20gXCJzaW5vblwiO1xuaW1wb3J0IGJ1bnlhbiBmcm9tIFwiYnVueWFuXCI7XG5pbXBvcnQge2RlZmF1bHQgYXMgTG9nZ2VyfSBmcm9tIFwiLi8uLi8uLi8uLi9kaXN0L3NlcnZpY2VzL2xvZ2dlclwiO1xuXG5jb25zdCB7ZGVzY3JpYmUsIGl0fSA9IGV4cG9ydHMubGFiID0gTGFiLnNjcmlwdCgpO1xuY29uc3QgY29uZmlnID0ge1xuICBcInN0cmVhbXNcIjogW3tcbiAgICBcImxldmVsXCI6IFwiZmF0YWxcIixcbiAgICBcInN0cmVhbVwiOiBwcm9jZXNzLnN0ZG91dFxuICB9XSxcbiAgXCJuYW1lXCI6IFwiZWctbG9nZ2VyXCJcbn07XG5cbmRlc2NyaWJlKFwiVGhlIExvZ2dlclwiLCAoKSA9PiB7XG5cbiAgZGVzY3JpYmUoXCJUaGUgY29uc3RydWN0b3JcIiwgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoXCJvbiBjYWxsaW5nIHdpdGggbm8gY29uZmlndXJhdGlvblwiLCAoKSA9PiB7XG5cbiAgICAgIGl0KFwic2hvdWxkIHRocm93IGVycm9yXCIsIGRvbmUgPT4ge1xuXG4gICAgICAgIGV4cGVjdCgoKSA9PiBuZXcgTG9nZ2VyKCkpLnRvLnRocm93KC9eY29uZmlndXJhdGlvbiBhcmd1bWVudCBpbiBjb3JyZWN0IGZvcm1hdCBpcyByZXF1aXJlZC8pO1xuXG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKFwib24gY2FsbGluZyB3aXRoIGNvbmZpZ3VyYXRpb25cIiwgKCkgPT4ge1xuXG4gICAgICBpdChcInNob3VsZCBjcmVhdGUgaW5zdGFuY2VcIiwgZG9uZSA9PiB7XG5cbiAgICAgICAgZXhwZWN0KG5ldyBMb2dnZXIoY29uZmlnKSkudG8uYmUuYW4uaW5zdGFuY2VPZihMb2dnZXIpO1xuXG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJUaGUgZmF0YWwgbWV0aG9kXCIsICgpID0+IHtcblxuICAgIGRlc2NyaWJlKFwib24gY2FsbGluZyB3aXRoIGEgbWVzc2FnZSBwYXJhbWV0ZXJcIiwgKCkgPT4ge1xuXG4gICAgICBjb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKGNvbmZpZyk7XG4gICAgICBjb25zdCB0ZXN0TWVzc2FnZSA9IFwiVHJhY2UgbWVzc2FnZSB0ZXN0XCI7XG5cbiAgICAgIGl0KFwic2hvdWxkIGNhbGwgdGhlIExvZ2dlciBmYXRhbCBmdW5jdGlvbiB3aXRoIHRoZSBtZXNzYWdlIGFyZ3VtZW50XCIsIGRvbmUgPT4ge1xuXG4gICAgICAgIHN0dWIoYnVueWFuLnByb3RvdHlwZSwgXCJmYXRhbFwiKTtcblxuICAgICAgICBsb2dnZXIuZmF0YWwodGVzdE1lc3NhZ2UpO1xuXG4gICAgICAgIGV4cGVjdChidW55YW4ucHJvdG90eXBlLmZhdGFsLmNhbGxlZFdpdGhFeGFjdGx5KHRlc3RNZXNzYWdlKSkudG8uYmUudHJ1ZSgpO1xuXG4gICAgICAgIGJ1bnlhbi5wcm90b3R5cGUuZmF0YWwucmVzdG9yZSgpO1xuXG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoXCJvbiBjYWxsaW5nIHdpdGggYSBtZXNzYWdlIGFuZCBkYXRhIHBhcmFtZXRlclwiLCAoKSA9PiB7XG5cbiAgICAgIGNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoY29uZmlnKTtcbiAgICAgIGNvbnN0IHRlc3RNZXNzYWdlID0gXCJUcmFjZSBtZXNzYWdlIHRlc3RcIjtcbiAgICAgIGNvbnN0IHRlc3REYXRhID0ge1wiUHJvcGVydHlcIjogXCJUZXN0IFByb3BlcnR5XCJ9O1xuXG4gICAgICBpdChcInNob3VsZCBjYWxsIHRoZSBMb2dnZXIgZmF0YWwgZnVuY3Rpb24gd2l0aCB0aGUgbWVzc2FnZSBhbmQgc2VyaWFsaXplZCBkYXRhXCIsIGRvbmUgPT4ge1xuXG4gICAgICAgIHN0dWIoYnVueWFuLnByb3RvdHlwZSwgXCJmYXRhbFwiKTtcblxuICAgICAgICBsb2dnZXIuZmF0YWwodGVzdE1lc3NhZ2UsIHRlc3REYXRhKTtcblxuICAgICAgICBleHBlY3QoYnVueWFuLnByb3RvdHlwZS5mYXRhbC5jYWxsZWRXaXRoRXhhY3RseSh0ZXN0RGF0YSwgdGVzdE1lc3NhZ2UpKS50by5iZS50cnVlKCk7XG5cbiAgICAgICAgYnVueWFuLnByb3RvdHlwZS5mYXRhbC5yZXN0b3JlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIlRoZSBlcnJvciBtZXRob2RcIiwgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoXCJvbiBjYWxsaW5nIHdpdGggYSBtZXNzYWdlIHBhcmFtZXRlclwiLCAoKSA9PiB7XG5cbiAgICAgIGNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoY29uZmlnKTtcbiAgICAgIGNvbnN0IHRlc3RNZXNzYWdlID0gXCJFcnJvciBtZXNzYWdlIHRlc3RcIjtcblxuICAgICAgaXQoXCJzaG91bGQgY2FsbCB0aGUgTG9nZ2VyIGVycm9yIGZ1bmN0aW9uIHdpdGggdGhlIG1lc3NhZ2UgYXJndW1lbnRcIiwgZG9uZSA9PiB7XG5cbiAgICAgICAgc3R1YihidW55YW4ucHJvdG90eXBlLCBcImVycm9yXCIpO1xuXG4gICAgICAgIGxvZ2dlci5lcnJvcih0ZXN0TWVzc2FnZSk7XG5cbiAgICAgICAgZXhwZWN0KGJ1bnlhbi5wcm90b3R5cGUuZXJyb3IuY2FsbGVkV2l0aEV4YWN0bHkodGVzdE1lc3NhZ2UpKS50by5iZS50cnVlKCk7XG5cbiAgICAgICAgYnVueWFuLnByb3RvdHlwZS5lcnJvci5yZXN0b3JlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZShcIm9uIGNhbGxpbmcgd2l0aCBhIG1lc3NhZ2UgYW5kIGRhdGEgcGFyYW1ldGVyXCIsICgpID0+IHtcblxuICAgICAgY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcihjb25maWcpO1xuICAgICAgY29uc3QgdGVzdE1lc3NhZ2UgPSBcIkVycm9yIG1lc3NhZ2UgdGVzdFwiO1xuICAgICAgY29uc3QgdGVzdERhdGEgPSB7XCJQcm9wZXJ0eVwiOiBcIlRlc3QgUHJvcGVydHlcIn07XG5cbiAgICAgIGl0KFwic2hvdWxkIGNhbGwgdGhlIExvZ2dlciBlcnJvciBmdW5jdGlvbiB3aXRoIHRoZSBtZXNzYWdlIGFuZCBzZXJpYWxpemVkIGRhdGFcIiwgZG9uZSA9PiB7XG5cbiAgICAgICAgc3R1YihidW55YW4ucHJvdG90eXBlLCBcImVycm9yXCIpO1xuXG4gICAgICAgIGxvZ2dlci5lcnJvcih0ZXN0TWVzc2FnZSwgdGVzdERhdGEpO1xuXG4gICAgICAgIGV4cGVjdChidW55YW4ucHJvdG90eXBlLmVycm9yLmNhbGxlZFdpdGhFeGFjdGx5KHRlc3REYXRhLCB0ZXN0TWVzc2FnZSkpLnRvLmJlLnRydWUoKTtcblxuICAgICAgICBidW55YW4ucHJvdG90eXBlLmVycm9yLnJlc3RvcmUoKTtcblxuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKFwiVGhlIHdhcm4gbWV0aG9kXCIsICgpID0+IHtcblxuICAgIGRlc2NyaWJlKFwib24gY2FsbGluZyB3aXRoIGEgbWVzc2FnZSBwYXJhbWV0ZXJcIiwgKCkgPT4ge1xuXG4gICAgICBjb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKGNvbmZpZyk7XG4gICAgICBjb25zdCB0ZXN0TWVzc2FnZSA9IFwiV2FybiBtZXNzYWdlIHRlc3RcIjtcblxuICAgICAgaXQoXCJzaG91bGQgY2FsbCB0aGUgTG9nZ2VyIHdhcm4gZnVuY3Rpb24gd2l0aCB0aGUgbWVzc2FnZSBhcmd1bWVudFwiLCBkb25lID0+IHtcblxuICAgICAgICBzdHViKGJ1bnlhbi5wcm90b3R5cGUsIFwid2FyblwiKTtcblxuICAgICAgICBsb2dnZXIud2Fybih0ZXN0TWVzc2FnZSk7XG5cbiAgICAgICAgZXhwZWN0KGJ1bnlhbi5wcm90b3R5cGUud2Fybi5jYWxsZWRXaXRoRXhhY3RseSh0ZXN0TWVzc2FnZSkpLnRvLmJlLnRydWUoKTtcblxuICAgICAgICBidW55YW4ucHJvdG90eXBlLndhcm4ucmVzdG9yZSgpO1xuXG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoXCJvbiBjYWxsaW5nIHdpdGggYSBtZXNzYWdlIGFuZCBkYXRhIHBhcmFtZXRlclwiLCAoKSA9PiB7XG5cbiAgICAgIGNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoY29uZmlnKTtcbiAgICAgIGNvbnN0IHRlc3RNZXNzYWdlID0gXCJXYXJuIG1lc3NhZ2UgdGVzdFwiO1xuICAgICAgY29uc3QgdGVzdERhdGEgPSB7XCJQcm9wZXJ0eVwiOiBcIlRlc3QgUHJvcGVydHlcIn07XG5cbiAgICAgIGl0KFwic2hvdWxkIGNhbGwgdGhlIExvZ2dlciB3YXJuIGZ1bmN0aW9uIHdpdGggdGhlIG1lc3NhZ2UgYW5kIHNlcmlhbGl6ZWQgZGF0YVwiLCBkb25lID0+IHtcblxuICAgICAgICBzdHViKGJ1bnlhbi5wcm90b3R5cGUsIFwid2FyblwiKTtcblxuICAgICAgICBsb2dnZXIud2Fybih0ZXN0TWVzc2FnZSwgdGVzdERhdGEpO1xuXG4gICAgICAgIGV4cGVjdChidW55YW4ucHJvdG90eXBlLndhcm4uY2FsbGVkV2l0aEV4YWN0bHkodGVzdERhdGEsIHRlc3RNZXNzYWdlKSkudG8uYmUudHJ1ZSgpO1xuXG4gICAgICAgIGJ1bnlhbi5wcm90b3R5cGUud2Fybi5yZXN0b3JlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIlRoZSBpbmZvIG1ldGhvZFwiLCAoKSA9PiB7XG5cbiAgICBkZXNjcmliZShcIm9uIGNhbGxpbmcgd2l0aCBhIG1lc3NhZ2UgcGFyYW1ldGVyXCIsICgpID0+IHtcblxuICAgICAgY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcihjb25maWcpO1xuICAgICAgY29uc3QgdGVzdE1lc3NhZ2UgPSBcIkluZm8gbWVzc2FnZSB0ZXN0XCI7XG5cbiAgICAgIGl0KFwic2hvdWxkIGNhbGwgdGhlIExvZ2dlciBpbmZvIGZ1bmN0aW9uIHdpdGggdGhlIG1lc3NhZ2UgYXJndW1lbnRcIiwgZG9uZSA9PiB7XG5cbiAgICAgICAgc3R1YihidW55YW4ucHJvdG90eXBlLCBcImluZm9cIik7XG5cbiAgICAgICAgbG9nZ2VyLmluZm8odGVzdE1lc3NhZ2UpO1xuXG4gICAgICAgIGV4cGVjdChidW55YW4ucHJvdG90eXBlLmluZm8uY2FsbGVkV2l0aEV4YWN0bHkodGVzdE1lc3NhZ2UpKS50by5iZS50cnVlKCk7XG5cbiAgICAgICAgYnVueWFuLnByb3RvdHlwZS5pbmZvLnJlc3RvcmUoKTtcblxuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKFwib24gY2FsbGluZyB3aXRoIGEgbWVzc2FnZSBhbmQgZGF0YSBwYXJhbWV0ZXJcIiwgKCkgPT4ge1xuXG4gICAgICBjb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKGNvbmZpZyk7XG4gICAgICBjb25zdCB0ZXN0TWVzc2FnZSA9IFwiSW5mbyBtZXNzYWdlIHRlc3RcIjtcbiAgICAgIGNvbnN0IHRlc3REYXRhID0ge1wiUHJvcGVydHlcIjogXCJUZXN0IFByb3BlcnR5XCJ9O1xuXG4gICAgICBpdChcInNob3VsZCBjYWxsIHRoZSBMb2dnZXIgaW5mbyBmdW5jdGlvbiB3aXRoIHRoZSBtZXNzYWdlIGFuZCBzZXJpYWxpemVkIGRhdGFcIiwgZG9uZSA9PiB7XG5cbiAgICAgICAgc3R1YihidW55YW4ucHJvdG90eXBlLCBcImluZm9cIik7XG5cbiAgICAgICAgbG9nZ2VyLmluZm8odGVzdE1lc3NhZ2UsIHRlc3REYXRhKTtcblxuICAgICAgICBleHBlY3QoYnVueWFuLnByb3RvdHlwZS5pbmZvLmNhbGxlZFdpdGhFeGFjdGx5KHRlc3REYXRhLCB0ZXN0TWVzc2FnZSkpLnRvLmJlLnRydWUoKTtcblxuICAgICAgICBidW55YW4ucHJvdG90eXBlLmluZm8ucmVzdG9yZSgpO1xuXG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoXCJUaGUgZGVidWcgbWV0aG9kXCIsICgpID0+IHtcblxuICAgIGRlc2NyaWJlKFwib24gY2FsbGluZyB3aXRoIGEgbWVzc2FnZSBwYXJhbWV0ZXJcIiwgKCkgPT4ge1xuXG4gICAgICBjb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKGNvbmZpZyk7XG4gICAgICBjb25zdCB0ZXN0TWVzc2FnZSA9IFwiRGVidWcgbWVzc2FnZSB0ZXN0XCI7XG5cbiAgICAgIGl0KFwic2hvdWxkIGNhbGwgdGhlIExvZ2dlciBkZWJ1ZyBmdW5jdGlvbiB3aXRoIHRoZSBtZXNzYWdlIGFyZ3VtZW50XCIsIGRvbmUgPT4ge1xuXG4gICAgICAgIHN0dWIoYnVueWFuLnByb3RvdHlwZSwgXCJkZWJ1Z1wiKTtcblxuICAgICAgICBsb2dnZXIuZGVidWcodGVzdE1lc3NhZ2UpO1xuXG4gICAgICAgIGV4cGVjdChidW55YW4ucHJvdG90eXBlLmRlYnVnLmNhbGxlZFdpdGhFeGFjdGx5KHRlc3RNZXNzYWdlKSkudG8uYmUudHJ1ZSgpO1xuXG4gICAgICAgIGJ1bnlhbi5wcm90b3R5cGUuZGVidWcucmVzdG9yZSgpO1xuXG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoXCJvbiBjYWxsaW5nIHdpdGggYSBtZXNzYWdlIGFuZCBkYXRhIHBhcmFtZXRlclwiLCAoKSA9PiB7XG5cbiAgICAgIGNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoY29uZmlnKTtcbiAgICAgIGNvbnN0IHRlc3RNZXNzYWdlID0gXCJEZWJ1ZyBtZXNzYWdlIHRlc3RcIjtcbiAgICAgIGNvbnN0IHRlc3REYXRhID0ge1wiUHJvcGVydHlcIjogXCJUZXN0IFByb3BlcnR5XCJ9O1xuXG4gICAgICBpdChcInNob3VsZCBjYWxsIHRoZSBMb2dnZXIgZGVidWcgZnVuY3Rpb24gd2l0aCB0aGUgbWVzc2FnZSBhbmQgc2VyaWFsaXplZCBkYXRhXCIsIGRvbmUgPT4ge1xuXG4gICAgICAgIHN0dWIoYnVueWFuLnByb3RvdHlwZSwgXCJkZWJ1Z1wiKTtcblxuICAgICAgICBsb2dnZXIuZGVidWcodGVzdE1lc3NhZ2UsIHRlc3REYXRhKTtcblxuICAgICAgICBleHBlY3QoYnVueWFuLnByb3RvdHlwZS5kZWJ1Zy5jYWxsZWRXaXRoRXhhY3RseSh0ZXN0RGF0YSwgdGVzdE1lc3NhZ2UpKS50by5iZS50cnVlKCk7XG5cbiAgICAgICAgYnVueWFuLnByb3RvdHlwZS5kZWJ1Zy5yZXN0b3JlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZShcIlRoZSB0cmFjZSBtZXRob2RcIiwgKCkgPT4ge1xuXG4gICAgZGVzY3JpYmUoXCJvbiBjYWxsaW5nIHdpdGggYSBtZXNzYWdlIHBhcmFtZXRlclwiLCAoKSA9PiB7XG5cbiAgICAgIGNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoY29uZmlnKTtcbiAgICAgIGNvbnN0IHRlc3RNZXNzYWdlID0gXCJUcmFjZSBtZXNzYWdlIHRlc3RcIjtcblxuICAgICAgaXQoXCJzaG91bGQgY2FsbCB0aGUgTG9nZ2VyIHRyYWNlIGZ1bmN0aW9uIHdpdGggdGhlIG1lc3NhZ2UgYXJndW1lbnRcIiwgZG9uZSA9PiB7XG5cbiAgICAgICAgc3R1YihidW55YW4ucHJvdG90eXBlLCBcInRyYWNlXCIpO1xuXG4gICAgICAgIGxvZ2dlci50cmFjZSh0ZXN0TWVzc2FnZSk7XG5cbiAgICAgICAgZXhwZWN0KGJ1bnlhbi5wcm90b3R5cGUudHJhY2UuY2FsbGVkV2l0aEV4YWN0bHkodGVzdE1lc3NhZ2UpKS50by5iZS50cnVlKCk7XG5cbiAgICAgICAgYnVueWFuLnByb3RvdHlwZS50cmFjZS5yZXN0b3JlKCk7XG5cbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZShcIm9uIGNhbGxpbmcgd2l0aCBhIG1lc3NhZ2UgYW5kIGRhdGEgcGFyYW1ldGVyXCIsICgpID0+IHtcblxuICAgICAgY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcihjb25maWcpO1xuICAgICAgY29uc3QgdGVzdE1lc3NhZ2UgPSBcIlRyYWNlIG1lc3NhZ2UgdGVzdFwiO1xuICAgICAgY29uc3QgdGVzdERhdGEgPSB7XCJQcm9wZXJ0eVwiOiBcIlRlc3QgUHJvcGVydHlcIn07XG5cbiAgICAgIGl0KFwic2hvdWxkIGNhbGwgdGhlIExvZ2dlciB0cmFjZSBmdW5jdGlvbiB3aXRoIHRoZSBtZXNzYWdlIGFuZCBzZXJpYWxpemVkIGRhdGFcIiwgZG9uZSA9PiB7XG5cbiAgICAgICAgc3R1YihidW55YW4ucHJvdG90eXBlLCBcInRyYWNlXCIpO1xuXG4gICAgICAgIGxvZ2dlci50cmFjZSh0ZXN0TWVzc2FnZSwgdGVzdERhdGEpO1xuXG4gICAgICAgIGV4cGVjdChidW55YW4ucHJvdG90eXBlLnRyYWNlLmNhbGxlZFdpdGhFeGFjdGx5KHRlc3REYXRhLCB0ZXN0TWVzc2FnZSkpLnRvLmJlLnRydWUoKTtcblxuICAgICAgICBidW55YW4ucHJvdG90eXBlLnRyYWNlLnJlc3RvcmUoKTtcblxuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=
//# sourceMappingURL=logger.js.map
