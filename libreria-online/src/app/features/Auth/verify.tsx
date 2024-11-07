// src/app/features/Auth/Verify.tsx
"use client"; 

import { useState } from 'react';
import useVerify from '../../hooks/useVerify';

const Verify = () => {
  const [code, setCode] = useState('');
  const { handleVerify, message } = useVerify();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(code);
  };

  return (
    <div>
      <h2>Verificación de Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <input
        />
        <input
          type="text"
          placeholder="Código de verificación"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Verificar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Verify;
