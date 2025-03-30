import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ handleLogin }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", { userId, password });
  
      // Store username in localStorage
      localStorage.setItem("username", res.data.username);
  
      handleLogin();
      navigate("/"); // Redirect to dashboard
    } catch (error) {
      setError("Invalid credentials");
    }
  };
  

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit">Login</button>
      </form>
      <button className="signup-btn" onClick={handleSignUpClick}>Sign Up</button>
    </div>
  );
};

export default Login;
