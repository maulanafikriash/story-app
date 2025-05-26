import { openDB } from 'idb';

const DB_NAME = 'story-db';
const DB_VERSION = 1;
const STORIES_STORE = 'stories';
const FAVORITES_STORE = 'favorites';

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORIES_STORE)) {
        db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
        db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
      }
    },
  });
}

export async function saveStories(stories) {
  const db = await getDB();
  const tx = db.transaction(STORIES_STORE, 'readwrite');
  const store = tx.objectStore(STORIES_STORE);
  stories.forEach(story => store.put(story));
  await tx.done;
}

export async function getAllStories() {
  const db = await getDB();
  return db.getAll(STORIES_STORE);
}

export async function getStoryById(id) {
  const db = await getDB();
  return db.get(STORIES_STORE, id);
}

// Section Favorite-----

export async function addFavorite(story) {
  const db = await getDB();
  const tx = db.transaction(FAVORITES_STORE, 'readwrite');
  await tx.store.put(story);
  await tx.done;
}

export async function getAllFavorites() {
  const db = await getDB();
  return db.getAll(FAVORITES_STORE);
}

export async function removeFavorite(id) {
  const db = await getDB();
  const tx = db.transaction(FAVORITES_STORE, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
}

export async function isFavorite(id) {
  const db = await getDB();
  const story = await db.get(FAVORITES_STORE, id);
  return story !== undefined;
}


