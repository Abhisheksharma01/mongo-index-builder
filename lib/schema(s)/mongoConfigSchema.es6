// Imports

import Joi from "joi";

export const mongoConfigSchema = Joi.object()
  .keys({
    "connectionString": Joi.string().required().description("The mongo db connection string"),
    "operationTimeout": Joi.number().description("The operation timeout for mongo operations.")
  }).required()
  .example({
    "connectionString": "mongo://userName:Password@address:port/db",
    "operationTimeout": 5000
  });
