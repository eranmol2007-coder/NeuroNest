import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { patientsApi } from '../services/api';
import { cacheGet, cacheSet } from '../services/offlineSync';

const PatientContext = createContext(null);

const ACTIVE_PATIENT_KEY = 'neuronest_active_patient_id';

export function PatientProvider({ children }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPatient = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await patientsApi.getById(id);
      setPatient(res.data);
      await cacheSet('activePatient', res.data);
      localStorage.setItem(ACTIVE_PATIENT_KEY, id);
    } catch (err) {
      // Offline or server down — fall back to last cached profile if it
      // matches the requested id, so the app is still usable offline.
      const cached = await cacheGet('activePatient');
      if (cached && cached._id === id) {
        setPatient(cached);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPatient = useCallback(() => {
    setPatient(null);
    localStorage.removeItem(ACTIVE_PATIENT_KEY);
  }, []);

  // Apply font-size preference to <html> so it affects the whole app,
  // including modals/toasts rendered outside the main layout.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-extra-large');
    const pref = patient?.fontSizePreference || 'large';
    root.classList.add(`font-${pref}`);
  }, [patient?.fontSizePreference]);

  useEffect(() => {
    const savedId = localStorage.getItem(ACTIVE_PATIENT_KEY);
    if (savedId) {
      loadPatient(savedId);
    } else {
      setLoading(false);
    }
  }, [loadPatient]);

  const updateLocalPatient = useCallback((updates) => {
    setPatient((prev) => {
      const next = { ...prev, ...updates };
      cacheSet('activePatient', next);
      return next;
    });
  }, []);

  return (
    <PatientContext.Provider
      value={{ patient, loading, loadPatient, clearPatient, updateLocalPatient }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used within a PatientProvider');
  return ctx;
}


