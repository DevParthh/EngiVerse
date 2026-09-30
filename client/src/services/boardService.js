import { ref, get, child, set, update, onValue, remove, onDisconnect } from "firebase/database";
import { db } from "../firebaseConfig";

// --- CORE UTILS ---

export const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const checkRoomExists = async (roomId) => {
  if (!roomId) return false;
  try {
    const snapshot = await get(child(ref(db), `boards/${roomId}/meta`));
    return snapshot.exists();
  } catch (e) {
    console.error("Check Room Error:", e);
    return false;
  }
};

export const isUserHost = async (roomId, userId) => {
  if (!roomId || !userId) return false;
  try {
    const snapshot = await get(child(ref(db), `boards/${roomId}/meta/hostId`));
    return snapshot.exists() && snapshot.val() === userId;
  } catch (e) {
    console.error("Host Check Error:", e);
    return false;
  }
};

// --- ROOM ACTIONS ---

export const initializeRoom = async (roomId, hostUser) => {
  if (!hostUser?.id || !hostUser?.name) return false;
  
  try {
    await set(ref(db, `boards/${roomId}`), {
      meta: { 
        createdAt: Date.now(), 
        hostId: hostUser.id, 
        hostName: hostUser.name, 
        status: 'active' 
      },
      users: { 
        [hostUser.id]: { 
          name: hostUser.name, 
          role: 'host', 
          status: 'joined', 
          joinedAt: Date.now() 
        } 
      }
    });
    return true;
  } catch (error) { 
    console.error("Room Init Error:", error);
    return false; 
  }
};

export const requestToJoin = async (roomId, user) => {
  const userId = user.id || user._id;
  if (!userId) return;

  const userRef = ref(db, `boards/${roomId}/users/${userId}`);
  
  // 🔥 REFRESH FIX: Check if user already exists.
  // Agar user refresh karega, toh ye check true hoga aur hum re-entry allow karenge bina status reset kiye.
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) return; // User already there, do nothing (keep state)

    await set(userRef, {
      name: user.name || "Guest User",
      role: 'member',
      status: 'waiting', 
      joinedAt: Date.now()
    });

    // ❌ NOTE: onDisconnect yahan SE HATA DIYA GAYA HAI.
    // Isse refresh karne par user kick nahi hoga.
  } catch (e) {
    console.error("Join Request Error:", e);
  }
};

// --- REALTIME CURSORS (Canva Style) ---

export const updateCursor = (roomId, userId, cursorData) => {
  if (!userId || !roomId) return;

  const cursorRef = ref(db, `boards/${roomId}/cursors/${userId}`);
  
  // 1. Cursor position save karo
  set(cursorRef, cursorData).catch(err => console.error(err));

  // 2. 🔥 CURSOR CLEANUP: Agar user tab band kare ya internet jaye, to CURSOR hata do.
  // (User list se nahi hateg, bas cursor gayab hoga, jo sahi behavior hai)
  onDisconnect(cursorRef).remove();
};

export const subscribeToCursors = (roomId, callback) => {
  const cursorRef = ref(db, `boards/${roomId}/cursors`);
  return onValue(cursorRef, (snapshot) => {
    const data = snapshot.val();
    // Object ko Array me convert karke wapas bhejo
    const cursors = data ? Object.values(data) : [];
    callback(cursors);
  });
};

// --- HOST CONTROLS ---

export const approveUser = async (roomId, userId) => {
  await update(ref(db, `boards/${roomId}/users/${userId}`), { status: 'joined' });
};

export const rejectUser = async (roomId, userId) => {
  await update(ref(db, `boards/${roomId}/users/${userId}`), { status: 'rejected' });
  // 5 second baad user ko list se uda do taki DB clean rahe
  setTimeout(() => {
    remove(ref(db, `boards/${roomId}/users/${userId}`)).catch(() => {});
  }, 5000);
};

export const leaveRoom = async (roomId, userId) => {
  if (!userId) return;
  // User ko hatao
  await remove(ref(db, `boards/${roomId}/users/${userId}`));
  // Uska cursor bhi hatao
  await remove(ref(db, `boards/${roomId}/cursors/${userId}`));
};

export const endSession = async (roomId) => {
  await update(ref(db, `boards/${roomId}/meta`), { status: 'ended' });
};

// --- LISTENERS ---

export const subscribeToMyStatus = (roomId, userId, callback) => {
  const statusRef = ref(db, `boards/${roomId}/users/${userId}/status`);
  return onValue(statusRef, (snapshot) => callback(snapshot.val()));
};

export const subscribeToUsers = (roomId, callback) => {
  const usersRef = ref(db, `boards/${roomId}/users`);
  return onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    const users = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
    callback(users);
  });
};

export const subscribeToSessionStatus = (roomId, callback) => {
  const metaRef = ref(db, `boards/${roomId}/meta/status`);
  return onValue(metaRef, (snapshot) => callback(snapshot.val()));
};