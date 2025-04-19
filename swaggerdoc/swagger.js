const swaggerUi = require("swagger-ui-express");
const Swaggerdoc = require("./swaggerdoc"); // contains your path definitions

const options = {
  openapi: "3.0.0",
  info: {
    title: "EV Charger API",
    version: "1.0.0",
    description: "API for managing EV charger",
  },
  servers: [
    {
      url: "https://host.aizoplug.com:3000/",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    ...Swaggerdoc,
  },
};

module.exports = {
  swaggerUi,
  specs: options,
};
