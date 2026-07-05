export { LANGUAGES, DEFAULT_LOCALE, RTL_LOCALES, isRtlLocale, getLanguageByCode, PROTECTED_NAMES } from './languages';
export type { LocaleCode } from './languages';

import en from '../messages/en.json';
import tr from '../messages/tr.json';
import de from '../messages/de.json';
import fr from '../messages/fr.json';
import es from '../messages/es.json';
import it from '../messages/it.json';
import pt from '../messages/pt.json';
import nl from '../messages/nl.json';
import ar from '../messages/ar.json';
import ru from '../messages/ru.json';
import zh from '../messages/zh.json';
import ja from '../messages/ja.json';
import ko from '../messages/ko.json';
import hi from '../messages/hi.json';
import ur from '../messages/ur.json';
import id from '../messages/id.json';
import ms from '../messages/ms.json';
import fa from '../messages/fa.json';
import el from '../messages/el.json';
import bg from '../messages/bg.json';
import ro from '../messages/ro.json';
import pl from '../messages/pl.json';
import uk from '../messages/uk.json';
import az from '../messages/az.json';
import ka from '../messages/ka.json';
import type { LocaleCode } from './languages';

export type Messages = typeof en;

const messages: Record<LocaleCode, Messages> = {
  en, tr, de, fr, es, it, pt, nl, ar, ru, zh, ja, ko, hi, ur, id, ms, fa, el, bg, ro, pl, uk, az, ka,
};

export function getMessages(locale: string): Messages {
  return messages[locale as LocaleCode] ?? messages.en;
}

export function t(messages: Messages, key: string): string {
  const parts = key.split('.');
  let current: unknown = messages;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof current === 'string' ? current : key;
}

export { messages };
