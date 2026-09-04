import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, patientsApi } from '../services/api';
import { cacheGet, cacheSet } from '../services/offlineSync';

const AuthContext = createContext(null);

const TOKEN_KEY = 'neuronest_token';
const USER_KEY = 'neuronest_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      setUser(res.data.user);
      setPatient(res.data.patient);
      setCaregiver(res.data.caregiver || null);
      await cacheSet('activeUser', res.data.user);
      if (res.data.patient) {
        await cacheSet('activePatient', res.data.patient);
        localStorage.setItem('neuronest_active_patient_id', res.data.patient._id);
      }
      if (res.data.caregiver) {
        await cacheSet('activeCaregiver', res.data.caregiver);
      }
    } catch {
      const cachedUser = await cacheGet('activeUser');
      const cachedPatient = await cacheGet('activePatient');
      const cachedCaregiver = await cacheGet('activeCaregiver');
      if (cachedUser) {
        setUser(cachedUser);
        if (cachedPatient) setPatient(cachedPatient);
        if (cachedCaregiver) setCaregiver(cachedCaregiver);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (token, userData, patientData, caregiverData) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    setPatient(patientData);
    setCaregiver(caregiverData || null);
    await cacheSet('activeUser', userData);
    if (patientData) {
      await cacheSet('activePatient', patientData);
      localStorage.setItem('neuronest_active_patient_id', patientData._id);
    }
    if (caregiverData) {
      await cacheSet('activeCaregiver', caregiverData);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('neuronest_active_patient_id');
    setUser(null);
    setPatient(null);
    setCaregiver(null);
  }, []);

  const updatePatient = useCallback((updates) => {
    setPatient((prev) => {
      const next = { ...prev, ...updates };
      cacheSet('activePatient', next);
      return next;
    });
  }, []);

  const updateCaregiver = useCallback((updates) => {
    setCaregiver((prev) => {
      const next = prev ? { ...prev, ...updates } : updates;
      cacheSet('activeCaregiver', next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, patient, caregiver, loading, login, logout, updatePatient, updateCaregiver }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
