// Setup environment variables
require("dotenv").config();

// setup app
const app = require("express")();
const { _404, _500 } = require("express-error-middlewares");
const port = process.env.PORT || 3000; // Defaults to PORT 3000

// Set to ignore undefined values, for the "passQuery" property of the new mapping API.
require("@enkeldigital/firebase-admin").firestore().settings({
  ignoreUndefinedProperties: true,
});

app
  // Only allow the main domain for production use and localhost for development
  .use(require("cors")({ origin: "*" }))

  // middleware to add http headers
  .use(require("helmet")())

  // Base URL and also the Health probe to check if server is up without running any other logic
  .get("/", (_, res) => res.status(200).send("URL Shortener"))

  // Mount the only route handler for the mappings
  .use(
    "/admin/mappings",
    require("./adminOnlyMiddleware"),
    require("./admin.js")
  )

  // Mount the 404 and 500 error handling middleware last
  .use(_404)
  .use(_500)

  // Setup PORT last to ensure all setup is done before server starts listening to traffic
  .listen(port, () => console.log(`Server running on port: ${port}`));
