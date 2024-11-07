// src/app/hooks/useVerify.ts
"use client"; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../services/apiClient';

const useVerify = () => {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleVerify = async (code: string) => {
    try {
      const response = await apiClient.post('/auth/verify', { code });
      setMessage(response.data.message);
      router.push('/login'); // Redirigir al login después de la verificación exitosa
    } catch (error) {
      setMessage('Error al verificar el usuario.');
      console.error('Error:', error);
    }
  };

  return { handleVerify, message };
};

export default useVerify;
