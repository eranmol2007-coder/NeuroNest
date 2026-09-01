const crypto = require('crypto');

function genId() {
  return crypto.randomBytes(12).toString('hex');
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
      }
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
    const proxy = {
      ...doc,
      save() { doc.updatedAt = new Date(); return Promise.resolve(doc); },
      deleteOne() {
        const idx = this.docs.findIndex((d) => d._id === id);
        if (idx >= 0) this.docs.splice(idx, 1);
        return Promise.resolve();
      },
    };
    return proxy;
  }

  findByIdAndUpdate(id, update, opts) {
    const doc = this.docs.find((d) => d._id === id);
    if (!doc) return Promise.resolve(null);
    const set = update.$set || update;
    Object.assign(doc, set);
    doc.updatedAt = new Date();
    return Promise.resolve({
      ...doc,
      save() { doc.updatedAt = new Date(); return Promise.resolve(doc); },
    });
  }

  countDocuments(query = {}) {
    return Promise.resolve(this.docs.filter((d) => matchQuery(d, query)).length);
  }
}

const collections = {};
function getCollection(name) {
  if (!collections[name]) collections[name] = new MemoryCollection(name);
  return collections[name];
}

function makeModel(name, staticMethods = {}, defaults = {}) {
  const col = getCollection(name);
  return {
    create: (data) => col.create({ ...defaults, ...data }),
    find: (q) => col.find(q),
    findById: (id) => col.findById(id),
    findByIdAndUpdate: (id, update, opts) => col.findByIdAndUpdate(id, update, opts),
    countDocuments: (q) => col.countDocuments(q),
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
};
