import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

const STUDENT_EMAIL_DOMAIN = "stemfolio.com";
const STUDENT_DEFAULT_PASSWORD = "Stemfolio2024!";

export const setAdminRole = onCall({ cors: true }, async (request) => {
  const email = request.data?.email;
  if (!email) {
    throw new HttpsError("invalid-argument", "Email is required.");
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    return { message: `Success! ${email} has been made an admin.` };
  } catch (error) {
    throw new HttpsError("internal", `Error setting admin role: ${error}`);
  }
});

export const createOriginalStudent = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be authenticated.");
  }

  const callerDoc = await admin.firestore().collection("users").doc(request.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Must be admin.");
  }

  const { name, surname, studentId, classRoom } = request.data;
  if (!name || !surname || !studentId) {
    throw new HttpsError("invalid-argument", "name, surname, and studentId are required.");
  }

  // Check for duplicate studentId among original-mode users
  const existing = await admin.firestore()
    .collection("users")
    .where("studentId", "==", studentId)
    .get();

  const duplicate = existing.docs.find(d => d.data().loginType === "original");
  if (duplicate) {
    throw new HttpsError("already-exists", "Student ID already exists.");
  }

  const loginEmail = `${studentId}@${STUDENT_EMAIL_DOMAIN}`;

  const authUser = await admin.auth().createUser({
    email: loginEmail,
    password: STUDENT_DEFAULT_PASSWORD,
    displayName: `${name} ${surname}`,
  });

  const now = admin.firestore.FieldValue.serverTimestamp();
  await admin.firestore().collection("users").doc(authUser.uid).set({
    id: authUser.uid,
    email: loginEmail,
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

export const deleteOriginalStudent = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be authenticated.");
  }

  const callerDoc = await admin.firestore().collection("users").doc(request.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Must be admin.");
  }

  const { uid } = request.data;
  if (!uid) {
    throw new HttpsError("invalid-argument", "uid is required.");
  }

  const userDoc = await admin.firestore().collection("users").doc(uid).get();
  if (userDoc.exists) {
    const projectIds: string[] = userDoc.data()?.projectIds || [];
    for (const projectId of projectIds) {
      const projectRef = admin.firestore().collection("projects").doc(projectId);
      const projectSnap = await projectRef.get();
      if (projectSnap.exists) {
        const studentIds: string[] = projectSnap.data()?.studentIds || [];
        await projectRef.update({ studentIds: studentIds.filter((id: string) => id !== uid) });
      }
    }
    await admin.firestore().collection("users").doc(uid).delete();
  }

  try {
    await admin.auth().deleteUser(uid);
  } catch (e: any) {
    if (e?.code !== "auth/user-not-found") throw e;
  }

  return { success: true };
});
