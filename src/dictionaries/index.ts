import 'server-only'

const dictionaries = {
  en: () => import('./en.json').then((module) => module.default),
  vi: () => import('./vi.json').then((module) => module.default),
}

export type Locale = 'en' | 'vi'

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]()
}
