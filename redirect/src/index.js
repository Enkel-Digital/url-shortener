// Setup environment variables
require("dotenv").config();

// setup app
const app = require("express")();
const { asyncWrap, _500 } = require("express-error-middlewares");

// Precreate the collection ref to avoiding calling this method over and over again
const fsM = require("@enkeldigital/firebase-admin")
  .firestore()
  .collection("map");

const port = process.env.PORT || 5000; // Defaults to PORT 5000

/** Utility function to get slug string from req.path */
const getSlug = (path) =>
  path.at(-1) === "/" && path.length > 1 ? path.slice(0, -1) : path;

/** Utility function to combine the URL queries from the original URL to the final URL. */
function combineQuery(originalUrl, url) {
  const final = new URL(url);
  const newSearchParams = new URLSearchParams(final.search);

  // Get search params that user entered using the shortest fake base URL possible
  const searchParams = new URLSearchParams(
    new URL(originalUrl, "http://a.a").search
  );

  // Combine the search parameters
  for (const [key, value] of searchParams.entries())
    newSearchParams.append(key, value);

  // The setter for .search will add the ? mark even though the .toString does not include it
  final.search = newSearchParams.toString();

  return final.toString();
}

app
  // Use * wildcard for CORS as all domains will be relying on the same server
  .use(require("cors")({ origin: "*" }))

  // middleware to add http headers
  .use(require("helmet")())

  // Ignore all favicon requests, and prevent it from costing us a firestore read operation
  // However this will only be used if the browser gets a 200 or 204 back for the initial response...
  // .get("/favicon.ico", (_, res) => res.status(204).end())

  // Health probe to check if server is up without running any other logic
  // This is the only path that cannot be used as a slug
  .get("/__health__", (_, res) => res.status(200).send("URL Shortener"))

  // Main route handler for URL redirect requests
  .get(
    "*",
    asyncWrap(async (req, res) => {
      // Get the slug string and remove the first slash
      const slug = getSlug(req.path).slice(1);

      // Get mapping from firestore and returns document if found
      const doc = await fsM
        // Filter by slug first as it will narrow the results down much faster first compared to host
        // As a slug will probably be more unique than a hostname
        .where("slug", "==", slug)
        .where("host", "==", req.hostname)
        .get()
        .then((snapshot) => (snapshot.empty ? undefined : snapshot.docs[0]));

      // If the mapping is not found, either show a preconfigured 404 page or a generic 404 page
      if (!doc) {
        // Get 404 mapping from firestore and returns document if found
        const notFoundDoc = await fsM
          // Filter by slug first as it will narrow the results down much faster first compared to host
          // As the number of __404__ slugs will probably be more than the average number of mappings per host
          .where("slug", "==", "__404__")
          .where("host", "==", req.hostname)
          .get()
          .then((snapshot) => (snapshot.empty ? undefined : snapshot.docs[0]));

        // If there is one set by the admin, respond with a temporary redirect to the provided not found page
        // Temporary redirect only as the admin might add the slug later on, and we do not want client to cache the 404
        //
        // Redirects to a statically hosted not found page instead if the user did not set any 404 page
        return notFoundDoc
          ? res.redirect(302, notFoundDoc.data().url)
          : res.redirect(
              302,
              `https://404.short.enkeldigital.com/?notFound=${req.hostname}${req.originalUrl}`
            );
      }

      // @todo Redirect to a statically hosted error page instead, and trigger alert to developer
      // @todo Prevent the developer alert from turning into a ddos attack where alerts are spammed
      const { status, url, passQuery } = doc.data();
      if (!url)
        return res
          .status(500)
          .send("Internal Error: Missing URL Slug in document");

      // Respond with a redirect
      res.redirect(
        status,

        // If user wishes to have URL query passed through, then combine queries with combineQuery to get the final URL
        passQuery ? combineQuery(req.originalUrl, url) : url
      );

      // Only track the API call after responding to the client to reduce client call latency
      // No need to await here as it is a fire and forget type
      // @todo Here it is updating it in the map collection, but we still need to update again in the usage ...
      fsM.doc(doc.id).update({
        used: require("firebase-admin").firestore.FieldValue.increment(1),
      });
    })
  )

  // There is no need for a 404 handler as the default route handler matches all routes
  // and if the redirect mapping is not found, the not found redirect is handled within the main request handler too.
  // .use(_404)

  // Mount the 500 error handling middleware last
  .use(_500)

  // Setup PORT last to ensure all setup is done before server starts listening to traffic
  .listen(port, () => console.log(`Server running on port: ${port}`));
