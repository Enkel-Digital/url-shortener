const auth = require("@enkeldigital/firebase-admin").auth();

async function makeAdmin(email) {
  try {
    const { uid } = await auth.getUserByEmail(email);

    await auth.setCustomUserClaims(uid, { admin: true });

    const userRecord = await auth.getUser(uid);

    console.log(userRecord, userRecord.customClaims.admin);
  } catch (error) {
    console.error(error);
  }
}

// Expected sample input from CLI: node .\makeAdmin.js user1@example.com user2@example.com
// Set all of these emails to be admin accounts with their 'admin' custom claim
Promise.all(process.argv.splice(2).map(makeAdmin)).then(() =>
  console.log("complete")
);
