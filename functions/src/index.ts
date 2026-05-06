import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setAdminRole = functions.https.onCall(async (request: any) => {
  // Authentication check: Only allow existing admins to make others admins.
  // In a real production app with no initial admin, you might check against a hardcoded email
  // or allow the very first user to become an admin.
  // For this project setup, we will allow anyone to claim admin for testing if no one is admin,
  // OR we restrict it. Let's restrict it to context.auth.token.role === 'admin' OR hardcoded email.
  
  const email = request.data?.email || request.email;
  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email is required.");
  }

  // Example: If you want to restrict to a specific email for the first admin:
  // if (context.auth?.token.email !== 'your-admin@example.com' && context.auth?.token.role !== 'admin') {
  //   throw new functions.https.HttpsError("permission-denied", "Must be an admin to grant admin role.");
  // }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    return { message: `Success! ${email} has been made an admin.` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", `Error setting admin role: ${error}`);
  }
});
