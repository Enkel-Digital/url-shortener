/**
 * Express Router for handling admin logic for Create/Read/Delete of slug to URL mappings.
 * Entire router will be mounted after a admin only authentication and authorization route gaurd
 * Mounted on /admin/mappings
 * @author JJ
 * @module Admin routes
 */

const express = require("express");
const router = express.Router();
const { asyncWrap } = require("express-error-middlewares");

// API to get all mappings
router.get(
  "/all",
  asyncWrap(async (req, res) =>
    require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("map")
      .where("host", "==", req.hostname)
      .orderBy("createdAt", "desc")
      .get()
      .then((snap) => snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      .then((mappings) => res.status(200).json({ mappings }))
  )
);

// API to create a new slug to URL mapping
router.post(
  "/new",
  express.json(),

  // Middleware to ensure slug/url is available and URL is validated
  // @todo Check for missing host
  // @todo Ensure that slug is unique for that domain
  (req, res, next) => {
    if (!req.body.slug)
      res
        .status(400)
        .json({ error: "Missing 'slug' property in request body" });
    else if (!req.body.url)
      res
        .status(400)
        .json({ error: "Missing 'url' property in request body." });
    else if (require("./isInvalidURL.js")(req.body.url))
      res.status(400).json({
        error:
          "Invalid 'url' property in request body, must be a proper full URL with http/https protocol",
      });
    else next();
  },

  asyncWrap(async (req, res) => {
    // Check to ensure that the slug for that particular domain is not already taken
    const doc = await require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("map")
      // Filter by slug first as it will narrow the results down much faster first compared to host
      // As a slug will probably be more unique than a hostname
      .where("slug", "==", req.body.slug)
      .where("host", "==", req.hostname)
      .get()
      .then((snapshot) => (snapshot.empty ? undefined : snapshot.docs[0]));
    if (doc !== undefined)
      res.status(400).json({ error: "Slug is already used!" });

    require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("map")
      .add({
        host: req.hostname,
        slug: req.body.slug,
        url: req.body.url,
        status: req.body.permanent ? 301 : 302,
        createdAt: require("unixseconds")(),
        createdBy: req.authenticatedUser.email,
        used: 0,
      })
      .then(() => res.status(201).json({}));
  })
);

// API to delete a mapping
// POST RPC instead of using DEL method to avoid cors pre-flight request
router.post(
  "/delete/:mappingID",
  asyncWrap(async (req, res) => {
    require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("map")
      .doc(req.params.mappingID)
      .delete()
      .then(() => res.status(200).json({}));
  })
);

module.exports = router;
