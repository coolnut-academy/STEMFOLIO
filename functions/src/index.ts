import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setAdminRole = functions.https.onCall(async (data: any, context: any) => {
  const email = data?.email;
  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email is required.");
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    return { message: `Success! ${email} has been made an admin.` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", `Error setting admin role: ${error}`);
  }
});

export const createOriginalStudent = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated.");
  }

  const callerDoc = await admin.firestore().collection("users").doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Must be admin.");
  }

  const { name, surname, studentId, classRoom, email } = data;
  if (!name || !surname || !studentId) {
    throw new functions.https.HttpsError("invalid-argument", "name, surname, and studentId are required.");
  }

  // Check for duplicate studentId among original-mode users
  const existing = await admin.firestore()
    .collection("users")
    .where("studentId", "==", studentId)
    .get();

  const duplicate = existing.docs.find(d => d.data().loginType === "original");
  if (duplicate) {
    throw new functions.https.HttpsError("already-exists", "Student ID already exists.");
  }

  // Create Firebase Auth user (no email/password — login is via custom token only)
  const authUser = await admin.auth().createUser({
    displayName: `${name} ${surname}`,
    ...(email ? { email } : {}),
  });

  const now = admin.firestore.FieldValue.serverTimestamp();
  await admin.firestore().collection("users").doc(authUser.uid).set({
    id: authUser.uid,
    email: email || "",
    name: `${name} ${surname}`,
    surname,
    studentId,
    classRoom: classRoom || "",
    role: "student",
    loginType: "original",
    status: "approved",
    projectIds: [],
    profileImageUrl: null,
    createdAt: now,
    updatedAt: now,
  });

  return { uid: authUser.uid };
});

export const loginWithStudentId = functions.https.onCall(async (data: any, context: any) => {
  const { studentId } = data;
  if (!studentId) {
    throw new functions.https.HttpsError("invalid-argument", "studentId is required.");
  }

  const snapshot = await admin.firestore()
    .collection("users")
    .where("studentId", "==", studentId)
    .get();

  const studentDoc = snapshot.docs.find(d => d.data().loginType === "original");
  if (!studentDoc) {
    throw new functions.https.HttpsError("not-found", "Student ID not found.");
  }

  const token = await admin.auth().createCustomToken(studentDoc.id);
  return { token };
});
