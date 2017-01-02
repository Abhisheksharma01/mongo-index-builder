import "source-map-support/register";
import Lab from "lab";
import {expect} from "code";
import * as CustomErrors from "../../../dist/customErrors";

const lab = exports.lab = Lab.script();
const {describe, it} = lab;

describe("CustomErrors.argumentUndefined", () => {

  it("should be defined", done => {
    expect(CustomErrors.argumentUndefined).to.not.be.undefined();

    return done();
  });

  it("should be an instance of Error", done => {
    // arrange
    const parameterName = "foo bar baz";

    // act
    const err = new CustomErrors.argumentUndefined(parameterName);

    // assert
    expect(err).to.be.an.instanceof(Error);

    return done();
  });

  it("should have a stack trace", done => {
    const err = new CustomErrors.argumentUndefined();

    expect(err.stack).to.be.a.string();

    return done();
  });

  describe("constructor", () => {

    it("should set parameter ParameterName", done => {
      // arrange
      const parameterName = "free beer";

      // act
      const actual = new CustomErrors.argumentUndefined(parameterName);

      // assert
      expect(actual[parameterName]).to.equal(parameterName);

      return done();
    });

  });
});
