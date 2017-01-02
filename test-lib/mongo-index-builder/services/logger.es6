import Lab from "lab";
import {expect} from "code";
import {stub} from "sinon";
import bunyan from "bunyan";
import {default as Logger} from "./../../../dist/services/logger";

const {describe, it} = exports.lab = Lab.script();
const config = {
  "streams": [{
    "level": "fatal",
    "stream": process.stdout
  }],
  "name": "eg-logger"
};

describe("The Logger", () => {

  describe("The constructor", () => {

    describe("on calling with no configuration", () => {

      it("should throw error", done => {

        expect(() => new Logger()).to.throw(/^configuration argument in correct format is required/);

        return done();
      });
    });

    describe("on calling with configuration", () => {

      it("should create instance", done => {

        expect(new Logger(config)).to.be.an.instanceOf(Logger);

        return done();
      });
    });
  });

  describe("The fatal method", () => {

    describe("on calling with a message parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Trace message test";

      it("should call the Logger fatal function with the message argument", done => {

        stub(bunyan.prototype, "fatal");

        logger.fatal(testMessage);

        expect(bunyan.prototype.fatal.calledWithExactly(testMessage)).to.be.true();

        bunyan.prototype.fatal.restore();

        return done();
      });

    });

    describe("on calling with a message and data parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Trace message test";
      const testData = {"Property": "Test Property"};

      it("should call the Logger fatal function with the message and serialized data", done => {

        stub(bunyan.prototype, "fatal");

        logger.fatal(testMessage, testData);

        expect(bunyan.prototype.fatal.calledWithExactly(testData, testMessage)).to.be.true();

        bunyan.prototype.fatal.restore();

        return done();
      });
    });
  });

  describe("The error method", () => {

    describe("on calling with a message parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Error message test";

      it("should call the Logger error function with the message argument", done => {

        stub(bunyan.prototype, "error");

        logger.error(testMessage);

        expect(bunyan.prototype.error.calledWithExactly(testMessage)).to.be.true();

        bunyan.prototype.error.restore();

        return done();
      });

    });

    describe("on calling with a message and data parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Error message test";
      const testData = {"Property": "Test Property"};

      it("should call the Logger error function with the message and serialized data", done => {

        stub(bunyan.prototype, "error");

        logger.error(testMessage, testData);

        expect(bunyan.prototype.error.calledWithExactly(testData, testMessage)).to.be.true();

        bunyan.prototype.error.restore();

        return done();
      });
    });
  });

  describe("The warn method", () => {

    describe("on calling with a message parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Warn message test";

      it("should call the Logger warn function with the message argument", done => {

        stub(bunyan.prototype, "warn");

        logger.warn(testMessage);

        expect(bunyan.prototype.warn.calledWithExactly(testMessage)).to.be.true();

        bunyan.prototype.warn.restore();

        return done();
      });

    });

    describe("on calling with a message and data parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Warn message test";
      const testData = {"Property": "Test Property"};

      it("should call the Logger warn function with the message and serialized data", done => {

        stub(bunyan.prototype, "warn");

        logger.warn(testMessage, testData);

        expect(bunyan.prototype.warn.calledWithExactly(testData, testMessage)).to.be.true();

        bunyan.prototype.warn.restore();

        return done();
      });
    });
  });

  describe("The info method", () => {

    describe("on calling with a message parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Info message test";

      it("should call the Logger info function with the message argument", done => {

        stub(bunyan.prototype, "info");

        logger.info(testMessage);

        expect(bunyan.prototype.info.calledWithExactly(testMessage)).to.be.true();

        bunyan.prototype.info.restore();

        return done();
      });

    });

    describe("on calling with a message and data parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Info message test";
      const testData = {"Property": "Test Property"};

      it("should call the Logger info function with the message and serialized data", done => {

        stub(bunyan.prototype, "info");

        logger.info(testMessage, testData);

        expect(bunyan.prototype.info.calledWithExactly(testData, testMessage)).to.be.true();

        bunyan.prototype.info.restore();

        return done();
      });
    });
  });

  describe("The debug method", () => {

    describe("on calling with a message parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Debug message test";

      it("should call the Logger debug function with the message argument", done => {

        stub(bunyan.prototype, "debug");

        logger.debug(testMessage);

        expect(bunyan.prototype.debug.calledWithExactly(testMessage)).to.be.true();

        bunyan.prototype.debug.restore();

        return done();
      });

    });

    describe("on calling with a message and data parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Debug message test";
      const testData = {"Property": "Test Property"};

      it("should call the Logger debug function with the message and serialized data", done => {

        stub(bunyan.prototype, "debug");

        logger.debug(testMessage, testData);

        expect(bunyan.prototype.debug.calledWithExactly(testData, testMessage)).to.be.true();

        bunyan.prototype.debug.restore();

        return done();
      });
    });
  });

  describe("The trace method", () => {

    describe("on calling with a message parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Trace message test";

      it("should call the Logger trace function with the message argument", done => {

        stub(bunyan.prototype, "trace");

        logger.trace(testMessage);

        expect(bunyan.prototype.trace.calledWithExactly(testMessage)).to.be.true();

        bunyan.prototype.trace.restore();

        return done();
      });

    });

    describe("on calling with a message and data parameter", () => {

      const logger = new Logger(config);
      const testMessage = "Trace message test";
      const testData = {"Property": "Test Property"};

      it("should call the Logger trace function with the message and serialized data", done => {

        stub(bunyan.prototype, "trace");

        logger.trace(testMessage, testData);

        expect(bunyan.prototype.trace.calledWithExactly(testData, testMessage)).to.be.true();

        bunyan.prototype.trace.restore();

        return done();
      });
    });
  });
});
