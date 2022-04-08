const { normalize, tokenize, stem, processor } = require('../src/helpers');

describe('helpers', () => {
  describe('normalize', () => {
    it('should normalize text', () => {
      expect(normalize('áéíóú')).toBe('aeiou');
      expect(normalize('ÁÉÍÓÚ')).toBe('aeiou');
      expect(normalize('ÁÉÍÓÚÑ')).toBe('aeioun');
    });
  });
  describe('tokenize', () => {
    it('should tokenize text', () => {
      expect(tokenize('Qué es el café')).toEqual(['Qué', 'es', 'el', 'café']);
    });
  });
  describe('stem', () => {
    it('should return the source array or object', () => {
      const input = ['Qué', 'es', 'el', 'café'];
      expect(stem(input)).toEqual(input);
    });
  });
  describe('processor', () => {
    it('Should normalize and tokenize a text', () => {
      expect(processor('Qué es el café')).toEqual(['que', 'es', 'el', 'cafe']);
    });
  });
});
