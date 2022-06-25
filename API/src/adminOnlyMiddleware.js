const firebaseAdmin = require("@enkeldigital/firebase-admin");

/**
 * Middleware to ensure only admins with the admin claim on their JWT can pass through.
 * Business logics need to handle extra conditions locally. E.g. user can only request for their own data.
 */
module.exports = async function auth(req, res, next) {
  try {
    // Get auth token if available and if it follows the "bearer" pattern
    // @notice Headers are all lowercased by express
    // https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_the_firebase_admin_sdk
    // The verifyIdToken needs a project ID, but should be taken care of if firebase admin has been initialised properly or runs on gcp infra
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      req.jwt = await firebaseAdmin
        .auth()
        .verifyIdToken(req.headers.authorization.split(" ")[1]);

      // Only allow request to continue down stream if user is an admin
      return req.jwt.admin === true
        ? next()
        : res.status(403).json({ error: "UNAUTHORIZED" });
    }

    // 401 Missing auth token thus unauthorised
    res.status(401).json({ error: "MISSING AUTH" });
  } catch (error) {
    // 403 identity known but denied / failed authentication
    res.status(403).json({ error: "UNAUTHORIZED" });
  }
};
