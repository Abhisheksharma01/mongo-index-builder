import Sut from "../../dist/throwWrappedError";
import Lab from "lab";
import {expect} from "code";


const lab = exports.lab = Lab.script();
const {describe, it} = lab;

describe("throwWrappedError", () => {

  it("should throw", done => {

    // Arrange
    const errorMessage = "mock";
    const innerException = new Error("mock");

    // Act

    const act = () => Sut(errorMessage, innerException);
    // Assert
    expect(act).to.throw(Error, "mock");

    return done();
  });

  it("should create a new error object with passed in message and preserve passed exception as inner exception", done => {

    // Arrange
    const errorMessage = "mock";
    const innerException = new Error("mock");

    // Act
    try {
      Sut(errorMessage, innerException);
    } catch (error) {
      // Assert
      expect(error).to.be.an.error();
      expect(error.message).to.equal(errorMessage);
      expect(error.innerError).to.equal(innerException);
    }

    return done();
  });

});

