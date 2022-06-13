/**
 * API logic to handle main slug to URL redirect requests
 */
module.exports = async (slug, hostname, res) => {
  // This should not happen as the base case / is caught by the base URL handler
  // if (!slug) return res.status(500).send("Internal Error: Missing URL Slug!");

  // Get mapping from firestore and returns document snapshot if found
  const snapshot = await require("@enkeldigital/firebase-admin")
    .firestore()
    .collection("map")
    // Filter by slug first as it will narrow the results down much faster first compared to host
    // As a slug will probably be more unique than a hostname
    .where("slug", "==", slug)
    .where("host", "==", hostname)
    .get()
    .then((snapshot) => (snapshot.empty ? undefined : snapshot.docs[0]));

  // @todo Redirect to a statically hosted not found page instead!
  if (!snapshot) return res.status(404).send("Error: Invalid link");

  const { status, url } = snapshot.data();
  if (!url)
    return res.status(500).send("Internal Error: Missing URL Slug in document");

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
};
