import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = ({ handleSignUp }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dietType, setDietType] = useState('');
  const [calorieTarget, setCalorieTarget] = useState('');
  const [password, setPassword] = useState('');
  const [foodPreferences, setFoodPreferences] = useState([]); // New state
  const [error, setError] = useState(null);

  // Handle food preferences selection
  const handleFoodPreferenceChange = (e) => {
    const { value, checked } = e.target;
    setFoodPreferences((prev) =>
      checked ? [...prev, value] : prev.filter((pref) => pref !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !name || !age || !dietType || !calorieTarget || !password || foodPreferences.length === 0) {
      setError('All fields are required, including food preferences');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/register', {
        userId,
        name,
        age: parseInt(age), // Ensure it's a number
        dietType,
        calorieTarget: parseInt(calorieTarget), // Ensure it's a number
        password,
        foodPreferences, // Send food preferences
      });

      console.log(response.data);
      handleSignUp();
      navigate('/login');
    } catch (error) {
      console.error(error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleBackClick = () => {
    navigate('/login');
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <button className="back-btn" onClick={handleBackClick}>Back to Login</button>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label>User ID:</label>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>
        <div className="form-control">
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-control">
          <label>Age:</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="form-control">
          <label>Diet Type:</label>
          <input type="text" value={dietType} onChange={(e) => setDietType(e.target.value)} />
        </div>
        <div className="form-control">
          <label>Calorie Target:</label>
          <input type="number" value={calorieTarget} onChange={(e) => setCalorieTarget(e.target.value)} />
        </div>
        <div className="form-control">
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="form-control">
          <label>Food Preferences:</label>
          <div className="checkbox-group">
            <label>
              <input type="checkbox" value="Spicy" onChange={handleFoodPreferenceChange} />
              Spicy
            </label>
            <label>
              <input type="checkbox" value="Sweet" onChange={handleFoodPreferenceChange} />
              Sweet
            </label>
            <label>
              <input type="checkbox" value="Vegetarian" onChange={handleFoodPreferenceChange} />
              Vegetarian
            </label>
            <label>
              <input type="checkbox" value="Non-Vegetarian" onChange={handleFoodPreferenceChange} />
              Non-Vegetarian
            </label>
          </div>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
