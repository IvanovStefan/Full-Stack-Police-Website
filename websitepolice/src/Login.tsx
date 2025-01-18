import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      try {
        const response = await axios.post('http://localhost:8080/api/login', {
          username,
          password,
        });
        console.log(response.data);
        navigate('/meniu');
        alert('Login successful!');
      } catch (error) {
        console.error(error);
        alert('Invalid credentials');
      }
    };
  
    return (
      <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                <button type="button" onClick={() => navigate('/register')}>
                    Register
                </button>
            </form>
        </div>
    );
  };

export default Login;