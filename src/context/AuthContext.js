import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // On mount, hydrate axios header if token exists
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Token ${storedToken}`;
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('login/', { username, password });
    const t = res.data.token;
    setToken(t);
    api.defaults.headers.common['Authorization'] = `Token ${t}`;
    const userObj = { username: res.data.username, id: res.data.user_id };
    setUser(userObj);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const register = async (username, email, password) => {
    const res = await api.post('register/', { username, email, password });
    const t = res.data.token;
    setToken(t);
    api.defaults.headers.common['Authorization'] = `Token ${t}`;
    const userObj = { username: res.data.username, id: res.data.user_id };
    setUser(userObj);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
