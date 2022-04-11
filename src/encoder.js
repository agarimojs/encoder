const { LRUCache } = require('@agarimo/lru-cache');
const { processor } = require('./helpers');

function findStemmer(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i += 1) {
    if (keys[i].startsWith('Stemmer')) {
      return obj[keys[i]];
    }
  }
  return undefined;
}

class Encoder {
  constructor(settings = {}) {
    this.processor = settings.processor || processor;
    if (typeof this.processor === 'object') {
      const Stemmer = findStemmer(this.processor);
      if (Stemmer) {
        this.stemmer = new Stemmer();
      }
      this.processor = this.stemmer.tokenizeAndStem.bind(this.stemmer);
    }
    this.unknownIndex = settings.unknownIndex;
    this.useCache = settings.useCache === undefined ? true : settings.useCache;
    this.cacheSize = settings.cacheSize || 1000;
    if (this.useCache) {
      this.cache = new LRUCache(1000);
    }
    this.featureMap = new Map();
    this.features = [];
    this.intentMap = new Map();
    this.intents = [];
  }

  addFeature(feature) {
    if (!this.featureMap.has(feature)) {
      if (this.useCache) {
        this.cache.clear();
      }
      this.featureMap.set(feature, this.features.length);
      this.features.push(feature);
    }
  }

  addIntent(intent) {
    if (!this.intentMap.has(intent)) {
      this.intentMap.set(intent, this.intents.length);
      this.intents.push(intent);
    }
  }

  addFeatureIntent(feature, intent) {
    this.addFeature(feature);
    this.addIntent(intent);
  }

  getFeatureIndex(feature) {
    const result = this.featureMap.get(feature);
    return result === undefined ? this.unknownIndex : result;
  }

  getFeature(index) {
    return this.features[index];
  }

  getIntentIndex(intent) {
    return this.intentMap.get(intent);
  }

  getIntent(index) {
    return this.intents[index];
  }

  processText(text, intent, learn = false, full = false) {
    if (this.useCache) {
      const cached = this.cache.get(text);
      if (cached) {
        return cached;
      }
    }
    const result = { data: {}, keys: [] };
    const features = this.processor(text);
    for (let i = 0; i < features.length; i += 1) {
      const feature = features[i];
      if (learn) {
        this.addFeatureIntent(feature, intent);
      }
      const index = this.getFeatureIndex(feature);
      if (index !== undefined && (full || result.data[index] === undefined)) {
        result.data[index] = 1;
        result.keys.push(index);
      }
    }
    if (this.useCache) {
      this.cache.put(text, result);
    }
    return result;
  }

  processTextFull(text) {
    const result = { data: {}, keys: [] };
    const feats = this.processor ? this.processor(text) : text;
    for (let i = 0; i < feats.length; i += 1) {
      const feature = feats[i];
      let index = this.getFeatureIndex(feature);
      if (index === undefined) {
        index = this.unknownIndex;
      }
      if (index !== undefined) {
        result.data[index] = 1;
        result.keys.push(index);
      }
    }
    return result;
  }

  processIntent(intent) {
    const index = this.getIntentIndex(intent);
    if (index === undefined) {
      return {
        data: {},
        keys: [],
      };
    }
    return {
      data: { [index]: 1 },
      keys: [index],
    };
  }

  encode(text, intent, learn = false, full = false) {
    return {
      input: this.processText(text, intent, learn, full),
      output: this.processIntent(intent),
    };
  }

  encodeCorpus(corpus) {
    const result = { train: [], validation: [] };
    for (let i = 0; i < corpus.length; i += 1) {
      const { utterances, intent } = corpus[i];
      if (utterances) {
        for (let j = 0; j < utterances.length; j += 1) {
          const utterance = utterances[j];
          const processed = this.encode(utterance, intent, true);
          result.train.push(processed);
          if (this.onTrainUtterance) {
            this.onTrainUtterance(utterance, intent, processed);
          }
        }
      }
    }
    for (let i = 0; i < corpus.length; i += 1) {
      const { tests, intent } = corpus[i];
      if (tests) {
        for (let j = 0; j < tests.length; j += 1) {
          result.validation.push(this.encode(tests[j], intent));
        }
      }
    }
    return result;
  }

  toJSON() {
    return {
      features: [...this.features],
      intents: [...this.intents],
      unknownIndex: this.unknownIndex,
      useCache: this.useCache,
      cacheSize: this.cacheSize,
    };
  }

  fromJSON(json) {
    this.useCache = json.useCache;
    this.cacheSize = json.cacheSize;
    if (this.useCache) {
      this.cache = new LRUCache(this.cacheSize);
    }
    this.featureMap = new Map();
    this.features = [];
    this.unknownIndex = json.unknownIndex;
    this.intentMap = new Map();
    this.intents = [];
    json.features.forEach((feature) => this.addFeature(feature));
    json.intents.forEach((intent) => this.addIntent(intent));
  }
}

module.exports = Encoder;
