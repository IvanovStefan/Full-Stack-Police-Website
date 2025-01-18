import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      try {
        const response = await axios.post('http://localhost:8080/api/register', {
          username,
          password,
        });
        console.log(response.data);
        alert('User registered successfully!');
        navigate('/login');

      } catch (error) {
        console.error(error);
        alert('Error registering user');
      }
    };
  
    return (
      <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2>Register</h2>
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
                <button type="submit">Register</button>
                <button type="button" onClick={() => navigate('/login')}>
                    Login
                </button>
            </form>
        </div>
    );
  };
  
  export default Register;