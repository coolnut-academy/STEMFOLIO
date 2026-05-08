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
exports.deleteOriginalStudent = exports.createOriginalStudent = exports.setAdminRole = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const STUDENT_EMAIL_DOMAIN = "stemfolio.com";
const STUDENT_DEFAULT_PASSWORD = "Stemfolio2024!";
exports.setAdminRole = (0, https_1.onCall)({ cors: true }, async (request) => {
    var _a;
    const email = (_a = request.data) === null || _a === void 0 ? void 0 : _a.email;
    if (!email) {
        throw new https_1.HttpsError("invalid-argument", "Email is required.");
    }
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
        return { message: `Success! ${email} has been made an admin.` };
    }
    catch (error) {
        throw new https_1.HttpsError("internal", `Error setting admin role: ${error}`);
    }
});
exports.createOriginalStudent = (0, https_1.onCall)({ cors: true }, async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be authenticated.");
    }
    const callerDoc = await admin.firestore().collection("users").doc(request.auth.uid).get();
    if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
        throw new https_1.HttpsError("permission-denied", "Must be admin.");
    }
    const { name, surname, studentId, classRoom } = request.data;
    if (!name || !surname || !studentId) {
        throw new https_1.HttpsError("invalid-argument", "name, surname, and studentId are required.");
    }
    // Check for duplicate studentId among original-mode users
    const existing = await admin.firestore()
        .collection("users")
        .where("studentId", "==", studentId)
        .get();
    const duplicate = existing.docs.find(d => d.data().loginType === "original");
    if (duplicate) {
        throw new https_1.HttpsError("already-exists", "Student ID already exists.");
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
exports.deleteOriginalStudent = (0, https_1.onCall)({ cors: true }, async (request) => {
    var _a, _b, _c;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Must be authenticated.");
    }
    const callerDoc = await admin.firestore().collection("users").doc(request.auth.uid).get();
    if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
        throw new https_1.HttpsError("permission-denied", "Must be admin.");
    }
    const { uid } = request.data;
    if (!uid) {
        throw new https_1.HttpsError("invalid-argument", "uid is required.");
    }
    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    if (userDoc.exists) {
        const projectIds = ((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.projectIds) || [];
        for (const projectId of projectIds) {
            const projectRef = admin.firestore().collection("projects").doc(projectId);
            const projectSnap = await projectRef.get();
            if (projectSnap.exists) {
                const studentIds = ((_c = projectSnap.data()) === null || _c === void 0 ? void 0 : _c.studentIds) || [];
                await projectRef.update({ studentIds: studentIds.filter((id) => id !== uid) });
            }
        }
        await admin.firestore().collection("users").doc(uid).delete();
    }
    try {
        await admin.auth().deleteUser(uid);
    }
    catch (e) {
        if ((e === null || e === void 0 ? void 0 : e.code) !== "auth/user-not-found")
            throw e;
    }
    return { success: true };
});
//# sourceMappingURL=index.js.map