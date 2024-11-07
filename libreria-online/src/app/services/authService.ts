// src/app/services/authService.ts
import apiClient from './apiClient';

export const registerUser = async (name: string, email: string, password: string) => {
  return apiClient.post('/auth/register', { nombre: name, email, password });
};

export const verifyUser = async (code: number) => {
  return apiClient.post('/auth/verify', { code });
};
