/**
 * API logic to handle main slug to URL redirect requests
 */
module.exports = async (req, res) => {
  const { slug } = req.params;
  if (!slug)
    // This should not happen as the base case / is caught by the base URL handler
    return res.status(500).send("Internal Error: Missing URL Slug!");

  const snapshot = await require("@enkeldigital/firebase-admin")
    .firestore()
    .collection("map")
    .doc(slug)
    .get();
  if (!snapshot.exists) return res.status(404).send("Error: Invalid URL Slug");

  const { status, url } = snapshot.data();
  if (!url)
    return res.status(500).send("Internal Error: Missing URL Slug in document");

  res.redirect(status, url);
};
