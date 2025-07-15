import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

//   useEffect(() => {
//     if (token) {
//       api.defaults.headers.common['Authorization'] = `Token ${token}`;
//     } else {
//       delete api.defaults.headers.common['Authorization'];
//     }
//   }, [token]);


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
  const token = res.data.token;
  setToken(token);
  api.defaults.headers.common['Authorization'] = `Token ${token}`;
  setUser({ username: res.data.username, id: res.data.user_id });
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ username: res.data.username, id: res.data.user_id }));
};


  const register = async (username, email, password) => {
  const res = await api.post('register/', { username, email, password });
  const token = res.data.token;
  setToken(token);
  api.defaults.headers.common['Authorization'] = `Token ${token}`;
  setUser({ username: res.data.username, id: res.data.user_id });
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ username: res.data.username, id: res.data.user_id }));
};


  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
