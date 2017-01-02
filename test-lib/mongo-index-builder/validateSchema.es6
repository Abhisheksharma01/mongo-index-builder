import Sut from "../../dist/validateSchema";
import Lab from "lab";
import {expect} from "code";


const lab = exports.lab = Lab.script();
const {describe, it, fail} = lab;

describe("validateSchema", () => {

  it("should reject when value is undefined", () => {

    // Arrange

    // Act
    const act = Sut();

    // Assert
    return act
      .then(() => {
        fail("should have gone to catch.");
      })
      .catch(error => {
        expect(error).to.be.an.error(Error, "undefined: undefined");
      });
  });

});

