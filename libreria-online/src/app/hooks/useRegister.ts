// src/app/hooks/useRegister.ts
"use client"; 

import { useState } from 'react';
import apiClient from '../services/apiClient';

const useRegister = () => {
  const [message, setMessage] = useState('');

  const handleRegister = async (name: string, email: string, password: string, redirect: () => void) => {
    try {
      const response = await apiClient.post('/auth/register', {
        nombre: name,
        email,
        password,
      });
      setMessage(response.data.message);
      redirect();
    } catch (error) {
      setMessage('Error al registrar el usuario.');
      console.error('Error:', error);
    }
  };

  return { handleRegister, message };
};

export default useRegister;
