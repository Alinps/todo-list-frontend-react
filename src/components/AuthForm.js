//AuthForm.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthForm = () => {
  const {login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="d-flex justify-content-center">
    <div className="card p-4 shadow w-50 d-flex justify-content-center">
      <h4>{isLogin ? 'Login' : 'Register'}</h4>
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        {!isLogin && (
          <input className="form-control mb-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        )}
        <input className="form-control mb-3" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary w-100 mb-2" type="submit">{isLogin ? 'Login' : 'Register'}</button>
        <button className="btn btn-link text-center" type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </form>
    </div>
    </div>
    
  );
};

export default AuthForm;
