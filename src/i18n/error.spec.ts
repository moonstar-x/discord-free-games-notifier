import { TranslatorError } from './error';

describe('i18n > Error', () => {
  describe('class TranslatorError', () => {
    it('should be defined.', () => {
      expect(TranslatorError).toBeDefined();
    });

    it('should return an instance of Error.', () => {
      expect(new TranslatorError()).toBeInstanceOf(Error);
    });
  });
});
