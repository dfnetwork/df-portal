import React, { useState, useEffect } from 'react';
import { useRegister } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const Register: React.FC = () => {
  const register = useRegister();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgCode, setOrgCode] = useState('');

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-lg">
        <h1 className="text-xl font-semibold mb-4 text-white">Crear cuenta</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            register.mutate({
              email,
              password,
              name,
              organizationCode: orgCode || undefined,
            });
          }}
        >
          <div>
            <label className="text-sm text-slate-300">Nombre</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Contraseña</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Código de organización (opcional)</label>
            <input
              className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              value={orgCode}
              onChange={(e) => setOrgCode(e.target.value)}
              placeholder="p.ej. ABC123"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg py-2 font-medium"
            disabled={register.isPending}
          >
            {register.isPending ? 'Creando...' : 'Crear cuenta'}
          </button>
          {register.error && (
            <div className="text-sm text-red-400">
              {(register.error as any)?.response?.data?.message || 'Error al registrar'}
            </div>
          )}
        </form>
        <div className="mt-4 text-sm text-slate-400">
          ¿Ya tienes cuenta? <Link to="/login" className="text-indigo-400">Entrar</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
