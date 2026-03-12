import React, { useEffect, useState } from 'react';
import { useLogin } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const Login: React.FC = () => {
  const login = useLogin();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-lg">
        <h1 className="text-xl font-semibold mb-4 text-white">Sign in</h1>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate({ email, password });
          }}
        >
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg py-2 font-medium"
            disabled={login.isPending}
          >
            {login.isPending ? 'Signing in...' : 'Sign in'}
          </button>
      {login.error && (
        <div className="text-sm text-red-400">
          {(login.error as any)?.response?.data?.message || 'Login failed'}
        </div>
      )}
    </form>
    <div className="mt-4 text-sm text-slate-400">
      ¿No tienes cuenta? <Link to="/register" className="text-indigo-400">Crear cuenta</Link>
    </div>
  </div>
</div>
  );
};

export default Login;
