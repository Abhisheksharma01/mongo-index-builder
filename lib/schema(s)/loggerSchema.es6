// Imports

import Joi from "joi";

export const loggerSchema = Joi.object()
  .keys({
    "streams": Joi.array().items(
      Joi.object().keys({
        "level": Joi.alternatives().try(Joi.string().insensitive().valid([
          "trace",
          "debug",
          "info",
          "warn",
          "error",
          "fatal"
        ]),
          Joi.number().valid(
            10,
            20,
            30,
            40,
            50,
            60
          )
        ).required(),
        "stream": Joi.any().required()
      })
    ).min(1).required(),
    "name": Joi.string().required()
  }).required()
  .example({
    "streams": [{
      "level": "fatal",
      "stream": process.stdout
    }],
    "name": "My-logger"
  });
