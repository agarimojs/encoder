const normalize = (str) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
const tokenize = (text) => text.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);

module.exports = {
  normalize,
  tokenize,
  stem: (x) => x,
  processor: (text) => tokenize(normalize(text)),
};
