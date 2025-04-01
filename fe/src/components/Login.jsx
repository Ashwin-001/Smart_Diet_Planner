import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  // Animation Variants
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      className="login-container"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <motion.div className="form-control" variants={formVariants}>
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </motion.div>
        <motion.div className="form-control" variants={formVariants}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </motion.div>
        {error && <div className="error-msg">{error}</div>}
        <motion.button
          type="submit"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Login
        </motion.button>
      </form>
      <motion.button
        className="signup-btn"
        onClick={handleSignUpClick}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        Sign Up
      </motion.button>
    </motion.div>
  );
};

export default Login;
