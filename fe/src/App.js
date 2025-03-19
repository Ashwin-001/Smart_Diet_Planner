import React, { useState } from "react";
import axios from "axios";
import XMLParser from "react-xml-parser";

const App = () => {
    const [userId, setUserId] = useState("");
    const [userData, setUserData] = useState(null);

    const fetchUserData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/get-user/${userId}`, {
                headers: { "Accept": "application/xml" }
            });

            const xml = new XMLParser().parseFromString(res.data);
            setUserData(xml.children);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Smart Diet Planner</h1>
            <input placeholder="Enter User ID" onChange={(e) => setUserId(e.target.value)} />
            <button onClick={fetchUserData}>Fetch User Data</button>

            {userData && (
                <table border="1">
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
                        <tr>
                            <td>{userData.find((item) => item.name === "userId")?.value}</td>
                            <td>{userData.find((item) => item.name === "name")?.value}</td>
                            <td>{userData.find((item) => item.name === "age")?.value}</td>
                            <td>{userData.find((item) => item.name === "dietType")?.value}</td>
                            <td>{userData.find((item) => item.name === "calorieTarget")?.value}</td>
                            <td>{userData.find((item) => item.name === "foodPreferences")?.value}</td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default App;
