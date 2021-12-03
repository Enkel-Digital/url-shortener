// Setup environment variables
require("dotenv").config();

// setup app
const app = require("express")();
const { asyncWrap, _404, _500 } = require("express-error-middlewares");

app.use(require("cors")({ origin: "*" }));

// middleware to add http headers
app.use(require("helmet")());

// Health probe to check if server is up without running any other logic
app.get("/health", (req, res) => res.status(200).send("URL Shortener"));

// Depending on whether a root redirect URL is provided, mount a different root API handler
// Navigating to the base URL will either be a 301 redirect to the root company domain
// Or a simple message to let user know what is this domain for
if (process.env.root_redirect)
  // Using 301 permanent redirect to ensure browsers cache this to prevent invoking server repeatedly to save cost
  app.get("/", (req, res) => res.redirect(301, process.env.root_redirect));
else app.get("/", (req, res) => res.status(200).send("URL Shortener"));

app.get("/:slug", asyncWrap(require("./slugRedirect.js")));

// Mount the 404 and 500 error handling middleware last
// @todo Might use a custom 404 handler to give client more information
app.use(_404);
app.use(_500);

/**
 * @notice Setup PORT last to ensure all setup is done before server starts listening to traffic
 */
const port = process.env.PORT || 3000; // Defaults to PORT 3000
app.listen(port, () => console.log(`Server running on port: ${port}`));
