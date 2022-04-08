const Encoder = require('../src/encoder');
const { normalize, tokenize } = require('../src/helpers');
const corpus = require('./corpus-en.json');
const encodedCorpus = require('./encoded-en.json');
const encoderSerialized = require('./encoded-en-serialized.json');

const processor = (text) =>
  tokenize(
    normalize(text)
      .map((x) => x.slice(0, -1))
      .filter((x) => x)
  );

describe('Encoder', () => {
  describe('constructor', () => {
    it('Should create a new instance', () => {
      const encoder = new Encoder();
      expect(encoder).toBeInstanceOf(Encoder);
    });
    it('A processor can be provided', () => {
      const encoder = new Encoder({ processor });
      expect(encoder.processor).toBe(processor);
    });
  });

  describe('addFeature', () => {
    it('Should add a new feature', () => {
      const encoder = new Encoder();
      encoder.addFeature('a');
      expect(encoder.featureMap.has('a')).toBe(true);
      expect(encoder.features).toHaveLength(1);
    });
    it('Should not add an already existing feature', () => {
      const encoder = new Encoder();
      encoder.addFeature('a');
      encoder.addFeature('a');
      expect(encoder.featureMap.has('a')).toBe(true);
      expect(encoder.features).toHaveLength(1);
    });
    it('Should add several features', () => {
      const encoder = new Encoder();
      encoder.addFeature('a');
      encoder.addFeature('b');
      encoder.addFeature('c');
      expect(encoder.featureMap.has('a')).toBe(true);
      expect(encoder.featureMap.has('b')).toBe(true);
      expect(encoder.featureMap.has('c')).toBe(true);
      expect(encoder.features).toHaveLength(3);
    });
  });

  describe('addIntent', () => {
    it('Should add a new intent', () => {
      const encoder = new Encoder();
      encoder.addIntent('a');
      expect(encoder.intentMap.has('a')).toBe(true);
      expect(encoder.intents).toHaveLength(1);
    });
    it('Should not add an already existing intent', () => {
      const encoder = new Encoder();
      encoder.addIntent('a');
      encoder.addIntent('a');
      expect(encoder.intentMap.has('a')).toBe(true);
      expect(encoder.intents).toHaveLength(1);
    });
    it('Should add several intents', () => {
      const encoder = new Encoder();
      encoder.addIntent('a');
      encoder.addIntent('b');
      encoder.addIntent('c');
      expect(encoder.intentMap.has('a')).toBe(true);
      expect(encoder.intentMap.has('b')).toBe(true);
      expect(encoder.intentMap.has('c')).toBe(true);
      expect(encoder.intents).toHaveLength(3);
    });
  });

  describe('addFeatureIntent', () => {
    it('Should add a new feature and intent', () => {
      const encoder = new Encoder();
      encoder.addFeatureIntent('feat-a', 'intent-a');
      expect(encoder.featureMap.has('feat-a')).toBe(true);
      expect(encoder.features).toHaveLength(1);
      expect(encoder.intentMap.has('intent-a')).toBe(true);
      expect(encoder.intents).toHaveLength(1);
    });
  });

  describe('getFeatureIndex', () => {
    it('Should return the index of a given feature', () => {
      const encoder = new Encoder();
      encoder.addFeature('a');
      encoder.addFeature('b');
      encoder.addFeature('c');
      expect(encoder.getFeatureIndex('a')).toEqual(0);
      expect(encoder.getFeatureIndex('b')).toEqual(1);
      expect(encoder.getFeatureIndex('c')).toEqual(2);
    });
    it('Should return undefined if the feature does not exists', () => {
      const encoder = new Encoder();
      encoder.addFeature('b');
      encoder.addFeature('c');
      expect(encoder.getFeatureIndex('a')).toBeUndefined();
    });
    it('Should return unknownIndex value (when defined) if the feature does not exists', () => {
      const encoder = new Encoder({ unknownIndex: -1 });
      encoder.addFeature('b');
      encoder.addFeature('c');
      expect(encoder.getFeatureIndex('a')).toEqual(-1);
    });
  });

  describe('getFeature', () => {
    it('Should return the feature at given index', () => {
      const encoder = new Encoder();
      encoder.addFeature('a');
      encoder.addFeature('b');
      encoder.addFeature('c');
      expect(encoder.getFeature(0)).toEqual('a');
      expect(encoder.getFeature(1)).toEqual('b');
      expect(encoder.getFeature(2)).toEqual('c');
    });
  });

  describe('getIntentIndex', () => {
    it('Should return the index of a given intent', () => {
      const encoder = new Encoder();
      encoder.addIntent('a');
      encoder.addIntent('b');
      encoder.addIntent('c');
      expect(encoder.getIntentIndex('a')).toEqual(0);
      expect(encoder.getIntentIndex('b')).toEqual(1);
      expect(encoder.getIntentIndex('c')).toEqual(2);
    });
    it('Should return undefined if the intent does not exists', () => {
      const encoder = new Encoder();
      encoder.addIntent('b');
      encoder.addIntent('c');
      expect(encoder.getIntentIndex('a')).toBeUndefined();
    });
    it('Should return undefined if the intent does not exists even if unknownIndex is defined', () => {
      const encoder = new Encoder({ unknownIndex: -1 });
      encoder.addIntent('b');
      encoder.addIntent('c');
      expect(encoder.getIntentIndex('a')).toBeUndefined();
    });
  });

  describe('getIntent', () => {
    it('Should return the intent at given index', () => {
      const encoder = new Encoder();
      encoder.addIntent('a');
      encoder.addIntent('b');
      encoder.addIntent('c');
      expect(encoder.getIntent(0)).toEqual('a');
      expect(encoder.getIntent(1)).toEqual('b');
      expect(encoder.getIntent(2)).toEqual('c');
    });
  });

  describe('processText', () => {
    it('Should return an empty data and keys if the text is empty', () => {
      const encoder = new Encoder();
      expect(encoder.processText('')).toEqual({ data: {}, keys: [] });
    });
    it('Should train the features to an intent if train mode is on', () => {
      const encoder = new Encoder();
      const actual = encoder.processText('This is a test', 'intent-test', true);
      expect(actual).toEqual({
        data: { 0: 1, 1: 1, 2: 1, 3: 1 },
        keys: [0, 1, 2, 3],
      });
    });
    it('Should return features index of existing features', () => {
      const encoder = new Encoder();
      encoder.processText('This is a test', 'intent-test', true);
      const actual = encoder.processText('test is a this');
      expect(actual).toEqual({
        data: { 0: 1, 1: 1, 2: 1, 3: 1 },
        keys: [3, 1, 2, 0],
      });
    });
    it('Should not return indexes for non existing features', () => {
      const encoder = new Encoder();
      encoder.processText('This is a test', 'intent-test', true);
      const actual = encoder.processText('test is a something');
      expect(actual).toEqual({
        data: { 1: 1, 2: 1, 3: 1 },
        keys: [3, 1, 2],
      });
    });
    it('If unknownIndex is defined, should be the index for non existing features', () => {
      const encoder = new Encoder({ unknownIndex: -1 });
      encoder.processText('This is a test', 'intent-test', true);
      const actual = encoder.processText('test is a something');
      expect(actual).toEqual({
        data: { 1: 1, 2: 1, 3: 1, '-1': 1 },
        keys: [3, 1, 2, -1],
      });
    });
    it('Should return features index of existing features without repetitions', () => {
      const encoder = new Encoder();
      encoder.processText('This is a test', 'intent-test', true);
      const actual = encoder.processText(
        'test is a this test is a this test is a this'
      );
      expect(actual).toEqual({
        data: { 0: 1, 1: 1, 2: 1, 3: 1 },
        keys: [3, 1, 2, 0],
      });
    });
    it('Should return features index of existing features with repetitions if full is true', () => {
      const encoder = new Encoder();
      encoder.processText('This is a test', 'intent-test', true);
      const actual = encoder.processText(
        'test is a this test is a this test is a this',
        undefined,
        undefined,
        true
      );
      expect(actual).toEqual({
        data: { 0: 1, 1: 1, 2: 1, 3: 1 },
        keys: [3, 1, 2, 0, 3, 1, 2, 0, 3, 1, 2, 0],
      });
    });
  });

  describe('processIntent', () => {
    it('Should return a data and keys object for an intent', () => {
      const encoder = new Encoder();
      encoder.processText('This is a test', 'intent-test', true);
      const actual = encoder.processIntent('intent-test');
      expect(actual).toEqual({
        data: { 0: 1 },
        keys: [0],
      });
    });
    it('Should return a data and keys object for an intent when several intents exists', () => {
      const encoder = new Encoder();
      encoder.processText('This is a test', 'intent-test', true);
      encoder.processText(
        'This is another different test',
        'intent-other-test',
        true
      );
      let actual = encoder.processIntent('intent-test');
      expect(actual).toEqual({
        data: { 0: 1 },
        keys: [0],
      });
      actual = encoder.processIntent('intent-other-test');
      expect(actual).toEqual({
        data: { 1: 1 },
        keys: [1],
      });
    });
  });

  describe('encode', () => {
    test('It can encode embeddings of a sentence and intent', () => {
      const encoder = new Encoder();
      encoder.processText('This is a test', 'intent-test', true);
      const actual = encoder.encode('This is a test', 'intent-test');
      expect(actual).toEqual({
        input: {
          data: { 0: 1, 1: 1, 2: 1, 3: 1 },
          keys: [0, 1, 2, 3],
        },
        output: {
          data: { 0: 1 },
          keys: [0],
        },
      });
    });
  });

  describe('encodeCorpus', () => {
    it('Can encode a corpus', () => {
      const encoder = new Encoder();
      const actual = encoder.encodeCorpus(corpus.data);
      expect(actual).toEqual(encodedCorpus);
    });
    it('Can encode a corpus without cache', () => {
      const encoder = new Encoder({ useCache: false });
      const actual = encoder.encodeCorpus(corpus.data);
      expect(actual).toEqual(encodedCorpus);
    });
    it('Can encode a corpus without small cache', () => {
      const encoder = new Encoder({ cacheSize: 5 });
      const actual = encoder.encodeCorpus(corpus.data);
      expect(actual).toEqual(encodedCorpus);
    });
    it('Can encode a intents without tests', () => {
      const encoder = new Encoder();
      const smallCorpus = [
        {
          intent: 'intent',
          utterances: ['This is a utterance'],
        },
      ];
      const expected = {
        train: [
          {
            input: {
              data: { 0: 1, 1: 1, 2: 1, 3: 1 },
              keys: [0, 1, 2, 3],
            },
            output: {
              data: { 0: 1 },
              keys: [0],
            },
          },
        ],
        validation: [],
      };
      const actual = encoder.encodeCorpus(smallCorpus);
      expect(actual).toEqual(expected);
    });
    it('Can hook onTrainUtterance', () => {
      const encoder = new Encoder();
      const smallCorpus = [
        {
          intent: 'intent',
          utterances: ['This is a utterance'],
          tests: ['This is a test'],
        },
      ];
      const trained = [];
      encoder.onTrainUtterance = (utterance, intent, processed) => {
        trained.push({ utterance, intent, processed });
      };
      encoder.encodeCorpus(smallCorpus);
      expect(trained).toEqual([
        {
          utterance: 'This is a utterance',
          intent: 'intent',
          processed: {
            input: {
              data: { 0: 1, 1: 1, 2: 1, 3: 1 },
              keys: [0, 1, 2, 3],
            },
            output: {
              data: { 0: 1 },
              keys: [0],
            },
          },
        },
      ]);
    });
  });

  describe('toJSON', () => {
    it('Should serialize the encoder data into a JSON', () => {
      const encoder = new Encoder();
      encoder.encodeCorpus(corpus.data);
      const actual = encoder.toJSON();
      expect(actual).toEqual(encoderSerialized);
    });
  });

  describe('fromJSON', () => {
    it('Should load an encoder from a JSON', () => {
      const encoder = new Encoder();
      encoder.fromJSON(encoderSerialized);
      const actual = encoder.encodeCorpus(corpus.data);
      expect(actual).toEqual(encodedCorpus);
    });
    it('Should load an encodder from a JSON with no cache', () => {
      const encoder = new Encoder();
      encoder.fromJSON({ ...encoderSerialized, useCache: false });
      const actual = encoder.encodeCorpus(corpus.data);
      expect(actual).toEqual(encodedCorpus);
    });
  });
});
