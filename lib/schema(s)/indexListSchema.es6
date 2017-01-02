import * as Joi from "joi";

export const indexListSchema = Joi.array().items(
   Joi.object().keys({
     "collectionName": Joi.string().required(),
     "indexName": Joi.string(),
     "indexOptions": Joi.object().keys({
       "w": Joi.string().description("The write concern"),
       "wtimeout": Joi.number().description("The write concern timeout"),
       "j": Joi.boolean().description("Specify a journal write concern"),
       "unique": Joi.boolean().description("Creates an unique index"),
       "sparse": Joi.boolean().description("Creates a sparse index"),
       "background": Joi.boolean().description("Creates the index in the background, yielding whenever possible"),
       "dropDups": Joi.boolean().description("A unique index cannot be created on a key that has pre-existing duplicate values. If you would like to create the index anyway, keeping the first document the database indexes and deleting all subsequent documents that have duplicate value"),
       "min": Joi.number().description("For geospatial indexes set the lower bound for the co-ordinates"),
       "max": Joi.number().description("For geospatial indexes set the high bound for the co-ordinates"),
       "v": Joi.number().description("Specify the format version of the indexes"),
       "expireAfterSeconds": Joi.number().description("Allows you to expire data on indexes applied to a data (MongoDB 2.2 or higher)")
     }),
     "indexKeys": Joi.array().max(31).items(
       Joi.object().keys({
         "keyName": Joi.string().required(),
         "keySortOrder": Joi.number().valid(1, -1),
         "keyType": Joi.string().valid("text", "2d", "2dsphere", "geoHaystack", "hashed")
       }).xor("keySortOrder", "keyType").required()
     ).required()
   })
)
  .example([{
    "collectionName": "dashboardAvailabilities",
    "indexKeys": [{
      "keyName": "propertyId",
      "keySortOrder": 1
    }]
  }]);
