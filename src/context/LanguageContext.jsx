import { createContext, useContext, useState, useCallback } from 'react'
import { HI } from '../lib/translations'

const LanguageContext = createContext(undefined)

const STORAGE_KEY = 'medilink_lang'

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // private browsing / storage blocked -- language choice just won't persist
    }
  }, [])

  // t() looks up the exact English string in the Hindi dictionary. Any
  // string with no entry -- or when lang is 'en' -- simply passes through
  // unchanged, so untranslated pages/strings never break, they just stay
  // in English until translated.
  const t = useCallback((str) => (lang === 'hi' ? HI[str] || str : str), [lang])

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
