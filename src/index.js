const Encoder = require('./encoder');
const { normalize, tokenize, stem, processor } = require('./helpers');

module.exports = {
  Encoder,
  normalize,
  tokenize,
  stem,
  processor,
};
