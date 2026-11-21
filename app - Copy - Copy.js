
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc,
  query, orderBy, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCsC5eU1ZjxObi6ARA49BoFLmV8U8vDm9I",
  authDomain: "daily-word-7a44a.firebaseapp.com",
  projectId: "daily-word-7a44a",
  storageBucket: "daily-word-7a44a.firebasestorage.app",
  messagingSenderId: "747206481642",
  appId: "1:747206481642:web:3d4cce30c1b58e0c8e6993"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

let currentUser = null;

async function connectFirebase() {
  try {
    const result = await signInAnonymously(auth);
    currentUser = result.user;
    return true;
  } catch (error) {
    console.error('Firebase connection error:', error);
    return false;
  }
}

async function saveReflectionToFirebase(verseRef, reflection) {
  if (!currentUser) {
    throw new Error('Firebase user is not connected');
  }

  const reflectionId = encodeURIComponent(verseRef);

  const reflectionDoc = doc(
    db,
    'users',
    currentUser.uid,
    'reflections',
    reflectionId
  );

  await setDoc(reflectionDoc, {
    verseRef: verseRef,
    reflection: reflection,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function loadReflectionHistory() {
  if (!currentUser) return [];

  const reflectionsRef = collection(
    db,
    'users',
    currentUser.uid,
    'reflections'
  );

  const historyQuery = query(
    reflectionsRef,
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(historyQuery);

  return snapshot.docs.map(item => item.data());
}

const reflectionBox = document.getElementById('reflection');
const saveReflectionButton = document.getElementById('saveReflection');

const historyBox = document.createElement('div');
historyBox.id = 'reflectionHistory';
historyBox.innerHTML = '<h3>My Reflection History</h3>';
saveReflectionButton.insertAdjacentElement('afterend', historyBox);

async function renderReflectionHistory() {
  try {
    const history = await loadReflectionHistory();

    historyBox.innerHTML = '<h3>My Reflection History</h3>';

    if (history.length === 0) {
      historyBox.innerHTML += '<p>No saved reflections yet.</p>';
      return;
    }

    history.forEach(item => {
      const entry = document.createElement('div');
      entry.style.cssText = 'padding:12px;margin:10px 0;border:1px solid #ddd;border-radius:8px;';

      const title = document.createElement('strong');
      title.textContent = item.verseRef;

      const content = document.createElement('p');
      content.textContent = item.reflection;

      entry.append(title, content);
      historyBox.appendChild(entry);
    });
  } catch (error) {
    console.error('History error:', error);
  }
}

async function startReflectionApp() {
  const connected = await connectFirebase();

  if (connected) {
    const saved = await getDoc(doc(
      db,
      'users',
      currentUser.uid,
      'reflections',
      encodeURIComponent(today.ref)
    ));

    if (saved.exists()) {
      reflectionBox.value = saved.data().reflection || '';
    }

    await renderReflectionHistory();
  }
}

saveReflectionButton.addEventListener('click', async () => {
  const reflection = reflectionBox.value.trim();

  if (!reflection) {
    toast('Please write your reflection first');
    return;
  }

  localStorage.setItem(
    'dailyword-reflection-' + today.ref,
    reflection
  );

  try {
    if (!currentUser) {
      const connected = await connectFirebase();
      if (!connected) throw new Error('Firebase connection failed');
    }

    await saveReflectionToFirebase(today.ref, reflection);

    toast('Reflection saved to your account');
    await renderReflectionHistory();
  } catch (error) {
    console.error('Save error:', error);
    toast('Firebase save failed. Check connection.');
  }
});

startReflectionApp();
