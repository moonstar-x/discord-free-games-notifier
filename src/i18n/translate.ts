import IntlMessageFormat, { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import localeStrings from './strings';
import { TranslatorError } from './error';
import { BaseInteraction } from 'discord.js';

export type Locale = keyof typeof localeStrings | string;
export type MessageKey = keyof typeof localeStrings['en-US'];

export type LocaleMessageMap = Partial<Record<Locale, Partial<Record<MessageKey, string>>>>;

export type TranslateFunctionValues = Record<string, PrimitiveType | FormatXMLElementFn<string, string | string[]>>;
export type TranslateFunction = (locale: Locale, key: MessageKey, values?: TranslateFunctionValues) => string;
export type LocalizedTranslateFunction = (key: MessageKey, values?: TranslateFunctionValues) => string;
export type TranslateAllFunction = (key: MessageKey, values?: TranslateFunctionValues) => Partial<Record<Locale, string>>

export const DEFAULT_LOCALE: Locale = 'en-US';
const castLocaleStrings = localeStrings as LocaleMessageMap;

const getMessage = (locale: Locale, key: MessageKey, useDefault: boolean = true): IntlMessageFormat => {
  const messagesForLocale = castLocaleStrings[locale];
  if (!messagesForLocale) {
    throw new TranslatorError(`No messages for locale ${locale} exist.`);
  }

  const message = messagesForLocale[key];
  const defaultMessage = castLocaleStrings[DEFAULT_LOCALE]?.[key];
  const messageToReturn = useDefault ? message ?? defaultMessage : message;

  if (!messageToReturn) {
    if (useDefault) {
      throw new TranslatorError(`No message with key ${key} for locale ${locale} or ${DEFAULT_LOCALE} exists.`);
    }

    throw new TranslatorError(`No message with key ${key} for locale ${locale} exists.`);
  }

  return new IntlMessageFormat(messageToReturn);
};

export const translate: TranslateFunction = (locale, key, values) => {
  return getMessage(locale, key, true).format(values as TranslateFunctionValues) as string;
};

export const getInteractionTranslator = (interaction: BaseInteraction): LocalizedTranslateFunction => (key, values) => {
  return getMessage(interaction.locale, key, true).format(values as TranslateFunctionValues) as string;
};

export const translateAll: TranslateAllFunction = (key, values) => {
  const locales = Object.keys(castLocaleStrings);

  return locales.reduce((obj, locale) => {
    try {
      obj[locale] = getMessage(locale, key, false).format(values as TranslateFunctionValues) as string;
      return obj;
    } catch (e) {
      return obj;
    }
  }, {} as Partial<Record<Locale, string>>);
};

