"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithStudentId = exports.createOriginalStudent = exports.setAdminRole = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
exports.setAdminRole = functions.https.onCall(async (request) => {
    var _a;
    const email = ((_a = request.data) === null || _a === void 0 ? void 0 : _a.email) || request.email;
    if (!email) {
        throw new functions.https.HttpsError("invalid-argument", "Email is required.");
    }
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
        return { message: `Success! ${email} has been made an admin.` };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", `Error setting admin role: ${error}`);
    }
});
exports.createOriginalStudent = functions.https.onCall(async (request) => {
    var _a;
    if (!request.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated.");
    }
    const callerDoc = await admin.firestore().collection("users").doc(request.auth.uid).get();
    if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
        throw new functions.https.HttpsError("permission-denied", "Must be admin.");
    }
    const { name, surname, studentId, classRoom, email } = request.data;
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
    const authUser = await admin.auth().createUser(Object.assign({ displayName: `${name} ${surname}` }, (email ? { email } : {})));
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
exports.loginWithStudentId = functions.https.onCall(async (request) => {
    const { studentId } = request.data;
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
//# sourceMappingURL=index.js.map