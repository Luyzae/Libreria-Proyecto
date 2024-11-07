// src/app/features/Auth/Register.tsx
"use client"; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useRegister from '../../hooks/useRegister';

const Register = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleRegister, message } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister(name, email, password, () => router.push('/auth/verify')); // Redirige a la página de verificación
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit">Registrar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
