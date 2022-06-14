// Setup environment variables
require("dotenv").config();

// setup app
const app = require("express")();
const { asyncWrap, _404, _500 } = require("express-error-middlewares");

app
  // Use * wildcard for CORS as all domains will be relying on the same server
  .use(require("cors")({ origin: "*" }))

  // middleware to add http headers
  .use(require("helmet")())

  // Health probe to check if server is up without running any other logic
  // This is the only path that cannot be used as a slug
  .get("/__health__", (_, res) => res.status(200).send("URL Shortener"));

const getSlug = (path) =>
  path.at(-1) === "/" && path.length > 1 ? path.slice(0, -1) : path;

/** Main route handler for URL redirect requests */
app.get(
  "*",
  asyncWrap(async (req, res) => {
    // Get the slug string and remove the first slash
    const slug = getSlug(req.path).slice(1);

    // Get mapping from firestore and returns document snapshot if found
    const snapshot = await require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("map")
      // Filter by slug first as it will narrow the results down much faster first compared to host
      // As a slug will probably be more unique than a hostname
      .where("slug", "==", slug)
      .where("host", "==", req.hostname)
      .get()
      .then((snapshot) => (snapshot.empty ? undefined : snapshot.docs[0]));

    // @todo Redirect to a statically hosted not found page instead!
    if (!snapshot) return res.status(404).send("Error: Invalid link");

    const { status, url } = snapshot.data();
    if (!url)
      return res
        .status(500)
        .send("Internal Error: Missing URL Slug in document");

    // Respond with a redirect
    res.redirect(status, url);

    // Only track the API call after responding to the client to reduce client call latency
    // No need to await here as it is a fire and forget type
    // @todo Here it is updating it in the map collection, but we still need to update again in the usage ...
    require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("map")
      .doc(snapshot.id)
      .update({
        used: require("firebase-admin").firestore.FieldValue.increment(1),
      });
  })
);

// Mount the 404 and 500 error handling middleware last
// @todo Might use a custom 404 handler to give client more information, can be a route in the domain's landing page to tell them 404
app.use(_404);
app.use(_500);

/**
 * @notice Setup PORT last to ensure all setup is done before server starts listening to traffic
 */
const port = process.env.PORT || 5000; // Defaults to PORT 5000
app.listen(port, () => console.log(`Server running on port: ${port}`));
