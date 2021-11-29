// Setup environment variables
require("dotenv").config();

// setup app
const express = require("express");
const app = express();
const { asyncWrap, _404, _500 } = require("express-error-middlewares");

// Allow zca domains for production use and localhost for development
// app.use(require("cors")({ origin: [/zca\.com$/, /localhost/] }));

// middleware to add http headers
app.use(require("helmet")());

app.get("/", (req, res) => res.status(200).send("ZCA URL Shortener"));

app.get(
  "/:slug",
  asyncWrap(async (req, res) => {
    const { slug } = req.params;
    if (!slug)
      // This should not happen as the base case / is caught by the base URL handler
      return res.status(500).send("Internal Error: Missing URL Slug!");

    const snapshot = await require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("map")
      .doc(slug)
      .get();
    if (!snapshot.exists)
      return res.status(404).send("Error: Invalid URL Slug");

    const { url } = snapshot.data();
    if (!url)
      return res
        .status(500)
        .send("Internal Error: Missing URL Slug in document");

    res.redirect(url);
  })
);

// Mount the 404 and 500 error handling middleware last
app.use(_404);
app.use(_500);

/**
 * @notice Setup PORT last to ensure all setup is done before server starts listening to traffic
 */
const port = process.env.PORT || 8080; // Defaults to PORT 8080
app.listen(port, () => console.log(`Server running on port: ${port}`));
