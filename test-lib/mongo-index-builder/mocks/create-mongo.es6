import Q from "q";

export default function createMongoMock() {

  const mockgo = require("mockgo");

  return {
    getConnection() {
      return Q.Promise(function (resolve, reject) {

        mockgo.getConnection("testDatabase", (err, connection) => {
          if (err !== null) {
            return reject(err);
          }
          return resolve({"db": connection});
        });
      });
    },

    shutdown() {
      return Q.Promise(function (resolve) {
        mockgo.shutDown(resolve);
      });
    }
  };
}
