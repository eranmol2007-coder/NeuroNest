import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { patientsApi } from '../services/api';
import { cacheGet, cacheSet } from '../services/offlineSync';
import { useAuth } from './AuthContext.jsx';

const PatientContext = createContext(null);

const ACTIVE_PATIENT_KEY = 'neuronest_active_patient_id';

export function PatientProvider({ children }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { patient: authPatient, user } = useAuth();

  const loadPatient = useCallback(async (id) => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await patientsApi.getById(id);
      setPatient(res.data);
      await cacheSet('activePatient', res.data);
      localStorage.setItem(ACTIVE_PATIENT_KEY, id);
    } catch (err) {
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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-extra-large');
    const pref = patient?.fontSizePreference || 'large';
    root.classList.add(`font-${pref}`);
  }, [patient?.fontSizePreference]);

  useEffect(() => {
    if (authPatient && user) {
      setPatient(authPatient);
      localStorage.setItem(ACTIVE_PATIENT_KEY, authPatient._id);
      setLoading(false);
    } else if (user && user.patientId && !authPatient) {
      loadPatient(user.patientId);
    } else if (user && !user.patientId) {
      setLoading(false);
    } else if (!user) {
      const savedId = localStorage.getItem(ACTIVE_PATIENT_KEY);
      if (savedId) {
        loadPatient(savedId);
      } else {
        setLoading(false);
      }
    }
  }, [authPatient, user, loadPatient]);

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
