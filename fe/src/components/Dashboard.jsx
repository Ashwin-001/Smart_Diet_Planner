import React, { useState, useEffect } from 'react';
import XMLParser from 'react-xml-parser';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    console.log("Stored user in localStorage:", storedUser); // Debugging
    if (storedUser) {
        setLoggedInUser(storedUser);
    }
}, []);




  const fetchUserData = async () => {
    try {
        const res = await axios.get(`http://localhost:5000/get-user/${userId}`, {
            headers: { Accept: 'application/xml' },
        });

        const xml = new XMLParser().parseFromString(res.data);
        console.log('Parsed XML Data:', xml.children); // Debugging

        const structuredData = xml.children.reduce((acc, item) => {
            if (item.name === 'foodPreferences') {
                acc[item.name] = [...new Set(item.children.map(food => food.value))]; // Remove duplicates
            } else {
                acc[item.name] = item.value;
            }
            return acc;
        }, {});

        setUserData(structuredData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

  

const handleLogout = () => {
  localStorage.removeItem("loggedInUser"); 
  setLoggedInUser(""); 
  navigate("/login"); 
};



  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="username">Welcome, {loggedInUser || 'DemoUser'}!</div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <h1>Diet Details Fetcher</h1>

      <input
        className="input-field"
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button className="fetch-btn" onClick={fetchUserData}>Fetch User Data</button>

      {loading && <p>Loading user data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {userData && (
        <table>
          <thead>
            <tr>
              <th>User ID (MongoDB)</th>
              <th>Name (MongoDB)</th>
              <th>Age (MongoDB)</th>
              <th>Diet Type (MongoDB)</th>
              <th>Calorie Target (MongoDB)</th>
              <th>Food Preferences (Neo4J)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{userData.userId}</td>
              <td>{userData.name}</td>
              <td>{userData.age}</td>
              <td>{userData.dietType}</td>
              <td>{userData.calorieTarget}</td>
              <td>{userData.foodPreferences ? userData.foodPreferences.join(', ') : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
