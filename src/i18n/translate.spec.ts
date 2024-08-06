import { getInteractionTranslator, MessageKey, translate, translateAll } from './translate';
import { TranslatorError } from './error';
import { BaseInteraction } from 'discord.js';

jest.mock('./strings/en', () => {
  return {
    hi: 'Hello',
    bye: 'Goodbye {name}',
    please: 'Please'
  };
});

jest.mock('./strings/es', () => {
  return {
    hi: 'Hola',
    bye: 'Adios {name}',
    please: 'Por favor'
  };
});

jest.mock('./strings/fr', () => {
  return {
    hi: 'Bonjour',
    bye: 'Au revoir {name}'
  };
});

describe('i18n > Translate', () => {
  describe('translate()', () => {
    it('should be defined.', () => {
      expect(translate).toBeDefined();
    });

    it('should throw TranslatorError if locale does not exist.', () => {
      const expectedError = new TranslatorError('No messages for locale ko exist.');

      expect(() => {
        translate('ko', 'hi' as MessageKey);
      }).toThrow(expectedError);
    });

    it('should throw TranslatorError if message does not exist in given and default locale.', () => {
      const expectedError = new TranslatorError('No message with key what for locale es-ES or en-US exists.');

      expect(() => {
        translate('es-ES', 'what' as MessageKey);
      }).toThrow(expectedError);
    });

    it('should return expected message.', () => {
      const result = translate('en-US', 'hi' as MessageKey);
      expect(result).toBe('Hello');
    });

    it('should return default message if it does not exist for given locale.', () => {
      const result = translate('fr', 'please' as MessageKey);
      expect(result).toBe('Please');
    });

    it('should return expected message with values inserted.', () => {
      const result = translate('en-US', 'bye' as MessageKey, { name: 'John' });
      expect(result).toBe('Goodbye John');
    });
  });

  describe('getInteractionTranslator()', () => {
    const interaction = {
      locale: 'es-ES'
    } as unknown as BaseInteraction;

    it('should be defined.', () => {
      expect(getInteractionTranslator).toBeDefined();
    });

    it('should throw TranslatorError if locale does not exist.', () => {
      const expectedError = new TranslatorError('No messages for locale ko exist.');

      expect(() => {
        const t = getInteractionTranslator({ ...interaction, locale: 'ko' } as unknown as BaseInteraction);
        t('hi' as MessageKey);
      }).toThrow(expectedError);
    });

    it('should throw TranslatorError if message does not exist in given and default locale.', () => {
      const expectedError = new TranslatorError('No message with key what for locale es-ES or en-US exists.');

      expect(() => {
        const t = getInteractionTranslator(interaction);
        t('what' as MessageKey);
      }).toThrow(expectedError);
    });

    it('should return expected message.', () => {
      const t = getInteractionTranslator(interaction);
      const result = t('hi' as MessageKey);
      expect(result).toBe('Hola');
    });

    it('should return default message if it does not exist for given locale.', () => {
      const t = getInteractionTranslator({ ...interaction, locale: 'fr' } as unknown as BaseInteraction);
      const result = t('please' as MessageKey);
      expect(result).toBe('Please');
    });

    it('should return expected message with values inserted.', () => {
      const t = getInteractionTranslator(interaction);
      const result = t('bye' as MessageKey, { name: 'John' });
      expect(result).toBe('Adios John');
    });
  });

  describe('translateAll()', () => {
    it('should be defined.', () => {
      expect(translateAll).toBeDefined();
    });

    it('should return an object with all messages for given key by locale.', () => {
      const result = translateAll('hi' as MessageKey);
      const expected = {
        'en-US': 'Hello',
        'en-GB': 'Hello',
        'es-ES': 'Hola',
        'es-419': 'Hola',
        fr: 'Bonjour'
      };

      expect(result).toStrictEqual(expected);
    });

    it('should return an object with partial messages for given key by locale if exists.', () => {
      const result = translateAll('please' as MessageKey);
      const expected = {
        'en-US': 'Please',
        'en-GB': 'Please',
        'es-ES': 'Por favor',
        'es-419': 'Por favor'
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
