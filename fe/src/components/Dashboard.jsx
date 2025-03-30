import React, { useState, useEffect } from 'react';
import XMLParser from 'react-xml-parser';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get logged-in username from localStorage/sessionStorage (modify if needed)
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setLoggedInUser(storedUser);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      console.log(`Fetching user data for ID: ${userId}`);
      const res = await axios.get(`http://localhost:5000/get-user/${userId}`, {
        headers: { Accept: 'application/xml' },
      });

      const xml = new XMLParser().parseFromString(res.data);
      setUserData(xml.children);
      console.log('User data fetched successfully:', xml.children);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser'); // Clear stored user
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="username">Welcome, {loggedInUser || 'User'}!</div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <h1>Smart Diet Planner</h1>

      <input
        className="input-field"
        placeholder="Enter User ID"
        onChange={(e) => setUserId(e.target.value)}
      />
      <button className="fetch-btn" onClick={fetchUserData}>Fetch User Data</button>

      {userData && (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Diet Type</th>
              <th>Calorie Target</th>
              <th>Food Preferences</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((item, index) => (
              <tr key={index}>
                <td>{item.name === 'userId' ? item.value : ''}</td>
                <td>{item.name === 'name' ? item.value : ''}</td>
                <td>{item.name === 'age' ? item.value : ''}</td>
                <td>{item.name === 'dietType' ? item.value : ''}</td>
                <td>{item.name === 'calorieTarget' ? item.value : ''}</td>
                <td>{item.name === 'foodPreferences' ? item.value : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
