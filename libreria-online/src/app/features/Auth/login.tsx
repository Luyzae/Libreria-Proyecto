// src/app/features/Auth/Login.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useLogin from '../../hooks/useLogin';
import Cookies from 'js-cookie';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, message } = useLogin();

  // Redirección si el usuario ya está logueado (tiene un token JWT)
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      console.log("Token encontrado, redirigiendo a la página principal");
      router.push('/'); // Redirige a la página principal si el token existe
    } else {
      console.log("Token no encontrado");
    }
  }, [router]);
   

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password, () => router.push('/')); // Redirige a la página de inicio después de iniciar sesión
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
