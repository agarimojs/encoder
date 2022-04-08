// eslint-disable-next-line import/no-extraneous-dependencies
const { Bench } = require('@agarimo/bench');
const corpus = require('../test/corpus-en.json');
const Encoder = require('../src/encoder');

let totalPerCorpus = 0;
for (let i = 0; i < corpus.data.length; i += 1) {
  totalPerCorpus += corpus.data[i].utterances
    ? corpus.data[i].utterances.length
    : 0;
  totalPerCorpus += corpus.data[i].tests ? corpus.data[i].tests.length : 0;
}

(async () => {
  const bench = new Bench({ transactionsPerRun: totalPerCorpus });
  const encoderWithCache = new Encoder();
  const encoderWithoutCache = new Encoder({ useCache: false });
  bench.add('With Cache', () => encoderWithCache.encodeCorpus(corpus.data));
  bench.add('Without Cache', () =>
    encoderWithoutCache.encodeCorpus(corpus.data)
  );
  const result = await bench.run();
  console.log(result);
})();
