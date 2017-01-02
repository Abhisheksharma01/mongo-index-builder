/* eslint-disable no-shadow */
import CreateMongoMock from "./../mocks/create-mongo";
import Lab from "lab";
import Q from "q";
import MockLogger from "./../mocks/logger";
import Sut from "./../../../dist/services/mongoService";
import Uuid from "uuid";
import {expect} from "code";


const lab = exports.lab = Lab.script();
const {after, before, beforeEach, experiment, test} = lab;


experiment("mongoService", {"timeout": 5000}, () => {

  let mongoConnectionFactory;
  let testCollectionName;
  let db;

  before(function () {

    mongoConnectionFactory = CreateMongoMock();
    db = mongoConnectionFactory.getConnection();

    return db;
  });

  beforeEach({"timeout": 5000}, () => {

    testCollectionName = Uuid().toString();

    return db
      .then(({db}) => db.collection(testCollectionName).insertOne({
        "_id": "1234"
      }))
      .then(document => {
        expect(document.insertedCount).to.equal(1);
      });
  });

  after({"timeout": 5000}, done => {

    if (mongoConnectionFactory) {
      return mongoConnectionFactory.shutdown(() => done());
    }

    return done();
  });

  test("createIndex method should return a q promise and build the index with default build options if nothing is passed", () => {

    // Arrange
    const sut = new Sut({
      "loggerService": MockLogger,
      "mongoConnectionFactory": mongoConnectionFactory
    });

    const mockIndexKeys = {"name": 1, "address.geocode": "2dsphere"};
    const expected = {
      "v": 1,
      "key": mockIndexKeys,
      "name": "name_1_address.geocode_2dsphere"
    };

    // Act
    const actual = sut.createIndex(testCollectionName, mockIndexKeys);

    // Assert
    expect(Q.isPromise(actual)).to.be.true();


    return actual
      .then(actual => expect(actual).to.equal("name_1_address.geocode_2dsphere"))
      .then(() => sut.getIndexes(testCollectionName))
      .then(indexes => expect(indexes).to.part.include(expected));
  });

  test("createIndex method should return a q promise and respect the index types and index build options", () => {

    // Arrange
    const sut = new Sut({
      "loggerService": MockLogger,
      "mongoConnectionFactory": mongoConnectionFactory
    });

    const mockIndexKeys = {"name": 1, "address.geocode": "2dsphere"};
    const mockIndexOptions = {"name": "testIndex", "background": true};
    const expected = {
      "key": mockIndexKeys,
      "name": "testIndex",
      "background": true,
      "2dsphereIndexVersion": 3
    };

    // Act
    const actual = sut.createIndex(testCollectionName, mockIndexKeys, mockIndexOptions);

    // Assert
    expect(Q.isPromise(actual)).to.be.true();


    return actual
      .then(actual => expect(actual).to.equal("testIndex"))
      .then(() => sut.getIndexes(testCollectionName))
      .then(indexes => expect(indexes).to.part.include(expected));
  });

  test("createIndex should logWrapAndThrow on an error", () => {

    // Arrange
    const errorMessage = "My Error Message";
    const sut = new Sut({
      "loggerService": MockLogger,
      "mongoConnectionFactory": {
        getConnection() {
          return Promise.reject(new Error(errorMessage));
        }
      }
    });
    const mockIndexKeys = {"name": 1, "address.geocode": "2dsphere"};

    // Act
    const act = sut.createIndex(testCollectionName, mockIndexKeys);

    // Assert

    return act
      .catch(error => expect(error.message).to.equal(errorMessage));

  });

  test("dropIndex method should return a q promise and resolve by dropping the index from the collection", () => {

    // Arrange
    const sut = new Sut({
      "loggerService": MockLogger,
      "mongoConnectionFactory": mongoConnectionFactory
    });

    const mockIndexKeys = {"name": 1, "address.geocode": "2dsphere"};
    const expected = {
      "key": mockIndexKeys,
      "name": "name_1_address.geocode_2dsphere"
    };
    const arrange = sut.createIndex(testCollectionName, mockIndexKeys);

    // Act
    const actual = arrange.then(indexName => {
      expect(indexName).to.equal("name_1_address.geocode_2dsphere");
      return indexName;
    })
      .then(indexName => sut.dropIndex(testCollectionName, indexName));

    // Assert
    expect(Q.isPromise(actual)).to.be.true();

    return actual
      .then(() => sut.getIndexes(testCollectionName))
      .then(indexList => expect(indexList).to.not.include(expected));
  });

  test("dropIndex should logWrapAndThrow on an error", () => {

    // Arrange
    const errorMessage = "My Error Message";
    const sut = new Sut({
      "loggerService": MockLogger,
      "mongoConnectionFactory": {
        getConnection() {
          return Promise.reject(new Error(errorMessage));
        }
      }
    });
    const mockIndexName = "testIndex";

    // Act
    const act = sut.dropIndex(testCollectionName, mockIndexName);

    // Assert

    return act
      .catch(error => expect(error.message).to.equal(errorMessage));

  });

  test("getIndexes method should return a q promise", () => {

    // Arrange
    const sut = new Sut({
      "loggerService": MockLogger,
      "mongoConnectionFactory": mongoConnectionFactory
    });

    const expected = [{
      "v": 1,
      "key": {
        "_id": 1
      },
      "name": "_id_",
      "ns": `testDatabase.${testCollectionName}`
    }];

    // Act
    const actual = sut.getIndexes(testCollectionName);

    // Assert
    expect(Q.isPromise(actual)).to.be.true();


    return actual
      .then(actual => {
        expect(actual).to.equal(expected);
      });
  });

  test("getIndexes should logWrapAndThrow on an error", () => {

    // Arrange
    const errorMessage = "My Error Message";
    const sut = new Sut({
      "loggerService": MockLogger,
      "mongoConnectionFactory": {
        getConnection() {
          return Promise.reject(new Error(errorMessage));
        }
      }
    });

    // Act
    const act = sut.getIndexes(testCollectionName);

    // Assert
    return act
      .catch(error => expect(error.message).to.equal(errorMessage));
  });

});
