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
const fbAdmin = require("@enkeldigital/firebase-admin");
const unixseconds = require("unixseconds");

// API to get all mappings
router.get(
  "/all",
  asyncWrap(async (req, res) =>
    fbAdmin
      .firestore()
      .collection("map")
      .where("host", "==", req.jwt.host)
      .orderBy("createdAt", "desc")
      .get()
      .then((snap) =>
        res.status(200).json({
          // Reduce the array of docs into a single object keyed by the doc ID
          mappings: snap.docs.reduce(
            (obj, doc) => ((obj[doc.id] = { id: doc.id, ...doc.data() }), obj),
            {}
          ),
        })
      )
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
    else if (req.body.slug === "__health__" || req.body.slug === "__404__")
      res
        .status(400)
        .json({ error: "'slug' used cannot be a special reserved string" });
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
    const doc = await fbAdmin
      .firestore()
      .collection("map")
      // Filter by slug first as it will narrow the results down much faster first compared to host
      // As a slug will probably be more unique than a hostname
      .where("slug", "==", req.body.slug)
      .where("host", "==", req.jwt.host)
      .get()
      .then((snapshot) => (snapshot.empty ? undefined : snapshot.docs[0]));
    if (doc !== undefined)
      res.status(400).json({ error: "Slug is already used!" });

    fbAdmin
      .firestore()
      .collection("map")
      .add({
        host: req.jwt.host,
        slug: req.body.slug,
        url: req.body.url,
        status: req.body.permanent ? 301 : 302,
        createdAt: unixseconds(),
        createdBy: req.jwt.email,
        used: 0,
      })
      .then(() => res.status(201).json({}));
  })
);

// API to update the mapping for root URL redirect
router.post(
  "/root",
  express.json(),

  (req, res, next) => {
    if (!req.body.url)
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
    const redirectDoc = {
      // Root redirect means that the slug should be an empty string
      slug: "",
      host: req.jwt.host,
      url: req.body.url,
      status: req.body.permanent ? 301 : 302,
      createdAt: unixseconds(),
      createdBy: req.jwt.email,
      used: 0,
    };

    // Check if slug for that particular domain is set already,
    // Override if set, else create a new document.
    await fbAdmin
      .firestore()
      .collection("map")
      // Filter by slug first as it will narrow the results down much faster first compared to host
      // As a slug will probably be more unique than a hostname.
      // Root redirect means that the slug should be an empty string
      .where("slug", "==", "")
      .where("host", "==", req.jwt.host)
      .get()
      .then((snapshot) =>
        snapshot.empty
          ? fbAdmin.firestore().collection("map").add(redirectDoc)
          : fbAdmin
              .firestore()
              .collection("map")
              .doc(snapshot.docs[0].id)
              .set(redirectDoc)
      );

    res.status(201).json({});
  })
);

// API to update mapping for not found URL redirects
router.post(
  "/404",
  express.json(),

  (req, res, next) => {
    if (!req.body.url)
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
    const redirectDoc = {
      // Specially reserved slug for storing the not found mapping
      slug: "__404__",
      host: req.jwt.host,
      url: req.body.url,
      status: 302,
      createdAt: unixseconds(),
      createdBy: req.jwt.email,
      used: 0,
    };

    // Check if slug for that particular domain is set already,
    // Override if set, else create a new document.
    await fbAdmin
      .firestore()
      .collection("map")
      // Filter by slug first as it will narrow the results down much faster first compared to host
      // As a slug will probably be more unique than a hostname.
      // Not found redirect means that the slug is the specially reserved one
      .where("slug", "==", "__404__")
      .where("host", "==", req.jwt.host)
      .get()
      .then((snapshot) =>
        snapshot.empty
          ? fbAdmin.firestore().collection("map").add(redirectDoc)
          : fbAdmin
              .firestore()
              .collection("map")
              .doc(snapshot.docs[0].id)
              .set(redirectDoc)
      );

    res.status(201).json({});
  })
);

// API to delete a mapping
// POST RPC instead of using DEL method to avoid cors pre-flight request
router.post(
  "/delete/:mappingID",
  asyncWrap(async (req, res) => {
    fbAdmin
      .firestore()
      .collection("map")
      .doc(req.params.mappingID)
      .delete()
      .then(() => res.status(200).json({}));
  })
);

module.exports = router;
