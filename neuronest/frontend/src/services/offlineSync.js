/**
 * Offline Sync Layer
 * -----------------------------------------------------------------------
 * NeuroNest's "full offline mode with auto-sync" differentiator.
 *
 * Design:
 *  - An IndexedDB database ("neuronest-offline") stores two kinds of data:
 *      1. `cache`   — last-known-good copies of server data (patient
 *                     profile, reminders, scores summary) so the app has
 *                     something meaningful to show when there's no network.
 *      2. `outbox`  — a queue of mutations made while offline (game scores,
 *                     mood check-ins, reminder status updates) that need
 *                     to be POSTed/PATCHed to the server once back online.
 *
 *  - Every write-type action in the app should go through `queueOrSend()`:
 *    if online, it sends immediately and also updates the cache; if
 *    offline, it stores the action in the outbox and updates the cache
 *    optimistically so the UI still reflects the change instantly.
 *
 *  - `flushOutbox()` is called automatically when the browser fires the
 *    'online' event (see useOfflineSync hook) and replays queued actions
 *    against the real API in order.
 */

import { openDB } from 'idb';
import { api } from './api';

const DB_NAME = 'neuronest-offline';
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache'); // key -> value
      }
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

// --- Cache helpers ---

export async function cacheSet(key, value) {
  const db = await getDB();
  await db.put('cache', value, key);
}

export async function cacheGet(key) {
  const db = await getDB();
  return db.get('cache', key);
}

// --- Outbox helpers ---

/**
 * @param {'POST'|'PUT'|'PATCH'|'DELETE'} method
 * @param {string} path - API path, e.g. '/api/scores'
 * @param {object} data - request body
 * @param {string} label - human-readable description for the pending-sync UI
 */
export async function enqueueAction(method, path, data, label) {
  const db = await getDB();
  await db.add('outbox', {
    method,
    path,
    data,
    label,
    createdAt: new Date().toISOString(),
  });
}

export async function getOutbox() {
  const db = await getDB();
  return db.getAll('outbox');
}

export async function getOutboxCount() {
  const db = await getDB();
  return db.count('outbox');
}

async function removeFromOutbox(id) {
  const db = await getDB();
  await db.delete('outbox', id);
}

/**
 * Replays every queued action against the real API, in the order they
 * were created. Stops and reports on the first failure so we don't lose
 * track of what's still pending (e.g. server briefly unreachable again).
 * @returns {{ succeeded: number, failed: number, remaining: number }}
 */
export async function flushOutbox() {
  const items = await getOutbox();
  let succeeded = 0;
  let failed = 0;

  for (const item of items) {
    try {
      if (item.method === 'POST') await api.post(item.path, item.data);
      else if (item.method === 'PUT') await api.put(item.path, item.data);
      else if (item.method === 'PATCH') await api.patch(item.path, item.data);
      else if (item.method === 'DELETE') await api.delete(item.path);
      await removeFromOutbox(item.id);
      succeeded += 1;
    } catch (err) {
      // Network still flaky, or a genuine server error — stop here and
      // leave the rest queued for the next sync attempt.
      failed += 1;
      break;
    }
  }

  const remaining = await getOutboxCount();
  return { succeeded, failed, remaining };
}

/**
 * The main entry point the rest of the app should use for any mutating
 * action that should work offline. Tries the network first (if the
 * browser thinks it's online); on failure, or if already offline, it
 * queues the action instead of throwing.
 *
 * @returns {{ ok: boolean, offline: boolean, data?: any }}
 */
export async function queueOrSend(method, path, data, label) {
  if (navigator.onLine) {
    try {
      let result;
      if (method === 'POST') result = await api.post(path, data);
      else if (method === 'PUT') result = await api.put(path, data);
      else if (method === 'PATCH') result = await api.patch(path, data);
      else if (method === 'DELETE') result = await api.delete(path);
      return { ok: true, offline: false, data: result };
    } catch (err) {
      // Fell offline mid-request, or server error — queue it so nothing
      // the patient/caregiver did is lost.
      await enqueueAction(method, path, data, label);
      return { ok: true, offline: true };
    }
  } else {
    await enqueueAction(method, path, data, label);
    return { ok: true, offline: true };
  }
}

