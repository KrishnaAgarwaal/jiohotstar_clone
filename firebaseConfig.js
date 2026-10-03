const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
  getDocs,
  setLogLevel
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Silence verbose gRPC retry warnings when Cloud Firestore API isn't enabled yet in console
setLogLevel('silent');

/**
 * Live Firebase Configuration for Project: webcopy (webcopy-67d86)
 * Uses your exact Firebase SDK credentials inside Node/Express.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAw-9z2UvQ2zr6ONmaRjXAgOvRduSx6raA",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "webcopy-67d86.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "webcopy-67d86",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "webcopy-67d86.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "976826313767",
  appId: process.env.FIREBASE_APP_ID || "1:976826313767:web:cdee656afa9562c15cf202",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-T3PKWXGFSF"
};

const firebaseApp = initializeApp(firebaseConfig);
const cloudDb = getFirestore(firebaseApp);

let storageMode = 'firebase-cloud-firestore (webcopy-67d86)';
console.log('🔥 Initialized Firebase Cloud Firestore for project:', firebaseConfig.projectId);

// Helper: race a Cloud Firestore operation against a 2500ms timeout so requests never hang
const withTimeout = (promise, ms = 2500) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('CLOUD_FIRESTORE_TIMEOUT')), ms)
    )
  ]);

// Local mirror fallback (`data/firestore-db.json` locally, `/tmp/firestore-db.json` on Vercel)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dataDir = isServerless ? '/tmp' : path.join(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'firestore-db.json');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify({ users: {}, reviews: {} }, null, 2), 'utf8');
  }
} catch {
  // Ignore read-only filesystem warnings in serverless environments
}

const readLocalStore = () => {
  try {
    return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
  } catch {
    return { users: {}, reviews: {} };
  }
};

const writeLocalStore = (store) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(store, null, 2), 'utf8');
  } catch {
    // Ignore on read-only serverless environments (Cloud Firestore is primary)
  }
};

// Unified Firestore Wrapper using your live `webcopy-67d86` Firestore instance
const db = {
  collection(collectionName) {
    return {
      doc(docId) {
        const id = String(docId).toLowerCase().trim();
        const docRef = doc(cloudDb, collectionName, id);

        return {
          async get() {
            try {
              const snap = await withTimeout(getDoc(docRef));
              if (snap.exists()) {
                return {
                  exists: true,
                  id: snap.id,
                  data: () => snap.data()
                };
              }
            } catch (err) {
              // Fallback to local mirror immediately if Cloud Firestore API isn't enabled yet
            }
            const store = readLocalStore();
            const localRecord = (store[collectionName] || {})[id];
            return {
              exists: Boolean(localRecord),
              id,
              data: () => (localRecord ? { ...localRecord } : undefined)
            };
          },

          async set(data, options = {}) {
            const store = readLocalStore();
            if (!store[collectionName]) store[collectionName] = {};
            store[collectionName][id] = options.merge
              ? { ...(store[collectionName][id] || {}), ...data }
              : { ...data };
            writeLocalStore(store);

            // Sync asynchronously / with timeout to Cloud Firestore (`webcopy-67d86`)
            try {
              await withTimeout(setDoc(docRef, data, options));
              console.log(`✅ Saved [${collectionName}/${id}] to Firebase Cloud Firestore (webcopy-67d86)`);
            } catch (err) {
              // Saved in local mirror
            }
            return true;
          },

          async update(updates) {
            const store = readLocalStore();
            if (!store[collectionName]) store[collectionName] = {};
            store[collectionName][id] = { ...(store[collectionName][id] || {}), ...updates };
            writeLocalStore(store);

            try {
              await withTimeout(setDoc(docRef, updates, { merge: true }));
              console.log(`✅ Updated [${collectionName}/${id}] in Firebase Cloud Firestore (webcopy-67d86)`);
            } catch (err) {
              // Updated in local mirror
            }
            return true;
          },

          async delete() {
            const store = readLocalStore();
            if (store[collectionName]) {
              delete store[collectionName][id];
              writeLocalStore(store);
            }

            try {
              await withTimeout(deleteDoc(docRef));
            } catch (err) {
              // Deleted in local mirror
            }
            return true;
          }
        };
      },

      async add(data) {
        const fallbackId = 'doc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        const store = readLocalStore();
        if (!store[collectionName]) store[collectionName] = {};

        try {
          const colRef = collection(cloudDb, collectionName);
          const addedRef = await withTimeout(addDoc(colRef, data));
          store[collectionName][addedRef.id] = { id: addedRef.id, ...data };
          writeLocalStore(store);
          console.log(`✅ Added [${collectionName}/${addedRef.id}] to Firebase Cloud Firestore (webcopy-67d86)`);
          return { id: addedRef.id };
        } catch (err) {
          store[collectionName][fallbackId] = { id: fallbackId, ...data };
          writeLocalStore(store);
          return { id: fallbackId };
        }
      },

      async get() {
        try {
          const colRef = collection(cloudDb, collectionName);
          const querySnapshot = await withTimeout(getDocs(colRef));
          if (!querySnapshot.empty) {
            const docs = [];
            querySnapshot.forEach((d) => {
              docs.push({
                id: d.id,
                data: () => ({ id: d.id, ...d.data() })
              });
            });
            return { docs, empty: docs.length === 0 };
          }
        } catch (err) {
          // Fallback to local mirror
        }

        const store = readLocalStore();
        const col = store[collectionName] || {};
        const docs = Object.entries(col).map(([id, val]) => ({
          id,
          data: () => ({ id, ...val })
        }));
        return { docs, empty: docs.length === 0 };
      }
    };
  }
};

module.exports = { db, firebaseApp, firebaseConfig, storageMode };
