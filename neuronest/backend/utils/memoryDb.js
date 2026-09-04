const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'memory-db.json');

function genId() {
  return crypto.randomBytes(12).toString('hex');
}

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.log('  Could not load saved data, starting fresh');
  }
  return {};
}

function saveDb() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data = {};
    for (const [name, col] of Object.entries(collections)) {
      data[name] = col.docs;
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('  Failed to save data:', e.message);
  }
}

function matchQuery(doc, query) {
  for (const [key, val] of Object.entries(query)) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      for (const [op, opVal] of Object.entries(val)) {
        if (op === '$gt' && !(doc[key] > opVal)) return false;
        if (op === '$gte' && !(doc[key] >= opVal)) return false;
        if (op === '$lt' && !(doc[key] < opVal)) return false;
        if (op === '$lte' && !(doc[key] <= opVal)) return false;
        if (op === '$ne' && doc[key] === opVal) return false;
        if (op === '$in' && !opVal.includes(doc[key])) return false;
        if (op === '$or' && !Array.isArray(opVal)) return false;
        if (op === '$or') {
          const matchAny = opVal.some((subQuery) => matchQuery(doc, subQuery));
          if (!matchAny) return false;
        }
      }
    } else if (key === '$or') {
      if (!Array.isArray(val)) return false;
      const matchAny = val.some((subQuery) => matchQuery(doc, subQuery));
      if (!matchAny) return false;
    } else {
      if (doc[key] !== val) return false;
    }
  }
  return true;
}

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }

  async create(data) {
    const doc = { _id: genId(), ...data, createdAt: new Date(), updatedAt: new Date() };
    this.docs.push(doc);
    saveDb();
    return doc;
  }

  find(query = {}) {
    let results = this.docs.filter((d) => matchQuery(d, query));

    const chain = {
      _results: results,
      sort(opts) {
        const key = Object.keys(opts)[0];
        const dir = opts[key];
        chain._results.sort((a, b) => {
          const av = a[key] instanceof Date ? a[key].getTime() : (a[key] || 0);
          const bv = b[key] instanceof Date ? b[key].getTime() : (b[key] || 0);
          return dir === -1 ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
        });
        return chain;
      },
      limit(n) {
        chain._results = chain._results.slice(0, n);
        return chain;
      },
      populate() {
        return chain;
      },
      then(resolve, reject) {
        try { resolve(chain._results); }
        catch (e) { if (reject) reject(e); }
      },
    };

    return chain;
  }

  findById(id) {
    const doc = this.docs.find((d) => d._id === id);
    if (!doc) return null;
    const self = this;
    const proxy = new Proxy(doc, {
      get(target, prop) {
        if (prop === 'save') return () => { target.updatedAt = new Date(); saveDb(); return Promise.resolve(target); };
        if (prop === 'deleteOne') {
          return () => {
            const idx = self.docs.findIndex((d) => d._id === id);
            if (idx >= 0) self.docs.splice(idx, 1);
            saveDb();
            return Promise.resolve();
          };
        }
        if (prop === 'select') {
          return (fields) => {
            const result = { ...target };
            if (fields.startsWith('-')) {
              fields.slice(1).split(' ').forEach(f => delete result[f]);
            }
            return result;
          };
        }
        return target[prop];
      },
    });
    return proxy;
  }

  findByIdAndUpdate(id, update, opts) {
    const doc = this.docs.find((d) => d._id === id);
    if (!doc) return Promise.resolve(null);
    const set = update.$set || update;
    Object.assign(doc, set);
    doc.updatedAt = new Date();
    saveDb();
    return Promise.resolve({
      ...doc,
      save() { doc.updatedAt = new Date(); saveDb(); return Promise.resolve(doc); },
    });
  }

  countDocuments(query = {}) {
    return Promise.resolve(this.docs.filter((d) => matchQuery(d, query)).length);
  }

  async deleteMany(query = {}) {
    const before = this.docs.length;
    this.docs = this.docs.filter((d) => !matchQuery(d, query));
    saveDb();
    return { deletedCount: before - this.docs.length };
  }

  findOne(query = {}) {
    const self = this;
    function makeDocProxy(doc) {
      if (!doc) return null;
      return new Proxy(doc, {
        get(target, prop) {
          if (prop === 'save') return () => { target.updatedAt = new Date(); saveDb(); return Promise.resolve(target); };
          if (prop === 'deleteOne') {
            return () => {
              const idx = self.docs.findIndex((d) => d._id === target._id);
              if (idx >= 0) self.docs.splice(idx, 1);
              saveDb();
              return Promise.resolve();
            };
          }
          if (prop === 'toJSON') return () => ({ ...target });
          return target[prop];
        },
      });
    }

    const q = {
      _results: self.docs.filter((d) => matchQuery(d, query)),
      _sort: null,
      sort(opts) { q._sort = opts; return q; },
      select(fields) {
        const doc = q._resolve();
        if (!doc) return null;
        const result = { ...doc };
        if (fields.startsWith('-')) {
          fields.slice(1).split(' ').forEach(f => delete result[f]);
        }
        return result;
      },
      _resolve() {
        let results = q._results;
        if (q._sort) {
          const key = Object.keys(q._sort)[0];
          const dir = q._sort[key];
          results = [...results].sort((a, b) => {
            const av = a[key] instanceof Date ? a[key].getTime() : (a[key] || 0);
            const bv = b[key] instanceof Date ? b[key].getTime() : (b[key] || 0);
            return dir === -1 ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
          });
        }
        return makeDocProxy(results[0] || null);
      },
      then(resolve, reject) {
        try { resolve(q._resolve()); }
        catch (e) { if (reject) reject(e); }
      },
    };
    return q;
  }
}

const collections = {};
function getCollection(name) {
  if (!collections[name]) collections[name] = new MemoryCollection(name);
  return collections[name];
}

// Load saved data on startup
const saved = loadDb();
for (const [name, docs] of Object.entries(saved)) {
  const col = getCollection(name);
  col.docs = docs.map(d => {
    const doc = {
      ...d,
      createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
      updatedAt: d.updatedAt ? new Date(d.updatedAt) : new Date(),
    };
    if (doc.date) doc.date = new Date(doc.date);
    if (doc.timestamp) doc.timestamp = new Date(doc.timestamp);
    if (doc.lastTriggeredAt) doc.lastTriggeredAt = new Date(doc.lastTriggeredAt);
    return doc;
  });
}
if (Object.keys(saved).length > 0) {
  const counts = Object.entries(saved).map(([n, d]) => `${n}:${d.length}`).join(' ');
  console.log(`  Loaded saved data: ${counts}`);
}

function makeModel(name, staticMethods = {}, defaults = {}) {
  const col = getCollection(name);
  return {
    create: (data) => col.create({ ...defaults, ...data }),
    find: (q) => col.find(q),
    findOne: (q) => col.findOne(q),
    findById: (id) => col.findById(id),
    findByIdAndUpdate: (id, update, opts) => col.findByIdAndUpdate(id, update, opts),
    countDocuments: (q) => col.countDocuments(q),
    deleteMany: (q) => col.deleteMany(q),
    ...staticMethods,
  };
}

const MoodCheckin = makeModel('moodcheckins', {
  scoreForMood(mood) {
    return { great: 5, good: 4, okay: 3, low: 2, bad: 1 }[mood] ?? 3;
  },
});

module.exports = {
  Patient: makeModel('patients', {}, { isActive: true, currentDifficulty: 'easy' }),
  Caregiver: makeModel('caregivers'),
  GameScore: makeModel('gamescores'),
  Reminder: makeModel('reminders'),
  Alert: makeModel('alerts'),
  MoodCheckin,
  User: makeModel('users'),
  Otp: makeModel('otps', {}, { used: false }),
};
