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
      .get()
      .then((snap) => snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      .then((docs) => res.status(200).json({ docs }))
  )
);

// API to create a new slug to URL mapping
router.post(
  "/new",
  express.json(),
  asyncWrap(async (req, res) =>
    require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("map")
      .doc(req.body.slug)
      .set({ url: req.body.url })
      .then(() => res.status(201).json({}))
  )
);

// API to delete a mapping
// POST RPC instead of using DEL method to avoid cors pre-flight request
router.post(
  "/delete/:mappingID",
  asyncWrap(async (req, res) =>
    require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("map")
      .doc(req.params.mappingID)
      .delete()
      .then(() => res.status(200).json({}))
  )
);

module.exports = router;