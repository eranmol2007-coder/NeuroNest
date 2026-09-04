import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import as from '../i18n/as.json';
import bn from '../i18n/bn.json';
import hi from '../i18n/hi.json';
import kha from '../i18n/kha.json';
import mzo from '../i18n/mzo.json';
import nagamese from '../i18n/nagamese.json';
import mni from '../i18n/mni.json';
import ne from '../i18n/ne.json';
import { usePatient } from './PatientContext.jsx';
import { decayDetector, SIMPLIFIED_DIALECTS } from '../services/linguisticDecay';

const LANG_MAP = { English: en, Assamese: as, Bengali: bn, Hindi: hi, Khasi: kha, Mizo: mzo, Nagamese: nagamese, Manipuri: mni, Nepali: ne };

function getVal(obj, path) {
  return path.split('.').reduce((cur, k) => (cur && cur[k] !== undefined ? cur[k] : null), obj);
}

function interpolate(str, params) {
  if (!str || !params) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{{${k}}}`));
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { patient } = usePatient();
  const langName = patient?.language || 'English';

  const [decayLevel, setDecayLevel] = useState(0);
  const [isAutoTranslated, setIsAutoTranslated] = useState(false);

  // Set original language in decay detector when language changes
  useEffect(() => {
    decayDetector.setOriginalLanguage(langName);
  }, [langName]);

  // Listen for decay level changes
  useEffect(() => {
    const unsub = decayDetector.onDecayChange((level) => {
      setDecayLevel(level);
      setIsAutoTranslated(level > 0);
    });
    return unsub;
  }, []);

  const t = useCallback(
    (key, params) => {
      const currentDict = LANG_MAP[langName] || LANG_MAP.English;
      let val = getVal(currentDict, key);

      // If decay detected, try simplified text first
      if (decayLevel > 0 && typeof val === 'string') {
        const simplified = decayDetector.getSimplifiedText(val);
        if (simplified !== val) {
          return interpolate(String(simplified), params);
        }
      }

      if (val !== null && val !== undefined) return interpolate(String(val), params);
      const fallback = getVal(LANG_MAP.English, key);
      if (fallback !== null && fallback !== undefined) return interpolate(String(fallback), params);
      return key;
    },
    [langName, decayLevel]
  );

  const dict = LANG_MAP[langName] || LANG_MAP.English;
  const value = useMemo(() => ({
    t,
    lang: langName,
    dict,
    langKey: langName,
    decayLevel,
    isAutoTranslated,
    decayStatus: decayDetector.getStatus(),
  }), [t, langName, dict, decayLevel, isAutoTranslated]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { t: (k) => k, lang: 'English', decayLevel: 0, isAutoTranslated: false };
  return ctx;
}
