import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './image/NUSBB.png';
import logotext from './image/NUSBathroomBuddyText.png';
import report from './image/report.png';
import leaderboard from './image/leaderboard.png';
import home from './image/home.png';
import pin from './image/user.png';
import accountImg from './image/accountimage.png';
import axios from 'axios';
import './Leaderboard.css';
import './Profile.css'; 
import { useContext } from 'react';
import UserContext from './UserContext';

function Profile() {
  const [user, setUser] = useState({ name: null, email: null });
  const [reports, setReports] = useState([]);
  const { userId } = useContext(UserContext);

  useEffect(() => {
    if (userId !== undefined) {
    const apiEndpoint = `https://testnusbb-git-main-jurongs-projects.vercel.app/users/${userId}`;
    console.log('API endpoint:', apiEndpoint);
    console.log('User ID:', userId);
    axios.get(apiEndpoint)
      .then(response => {
        console.log(response.data);
        setUser(response.data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
    }
  }, [userId]);

  useEffect(() => {
    if (user.email !== null) {
      axios.get(`https://testnusbb-git-main-jurongs-projects.vercel.app/reports/user?useremail=${user.email}`)
        .then(res => setReports(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  return (
    <div className="home-container">
    <img src={logo} alt="Logo" className="logo" />
    <img src={logotext} alt="Logo Text" className="logo-text" />
      <div className="button-container">
      </div>
    <div className="main-content">
      <div className="content">
      <div className="navigation-panel">
      <Link to="/home" className="navi-button custom-link">
          <img src={home} alt="Home" />
          <p>Home</p>
        </Link>
        <Link to={`/profile/${userId}`} className="bookmark-button custom-link">
            <img src={pin} alt="Bookmarks" />
            <p>Profile</p>
          </Link>
      <Link to="/leaderboard" className="leader-button custom-link">
          <img src={leaderboard} alt="Leaderboard" />
          <p>Leaderboard</p>
        </Link>
      <Link to="/reports" className="navi-button custom-link">
          <img src={report} alt="Report" />
          <p>Reports</p>
        </Link>
      {/* Other navigation items go here */}
    </div>
    <div className="profile-container">
  <img src={accountImg} alt="Account" className="account-image" />
  {user && (
    <>
      <div className="user-info">
        <strong>Username: </strong>
        <p>{user.name}</p>
      </div>
      <div className="user-info">
        <strong>User Email: </strong>
        <p>{user.email}</p>
      </div>
    </>
  )}
  
  <table className="reports-table">
    <thead>
    <h2 className="table-heading" style={{ color: 'white' }}>Reports Made</h2>
      <tr>
        <th>Reported Toilet</th>
        <th>Details</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
    {reports.length > 0 ? (
        reports.map(report => (
          <tr key={report.id}>
            <td>{report.toiletname}</td>
            <td>{report.details}</td>
            <td>{report.status}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="3">No reports made</td>
        </tr>
      )}
    </tbody>
  </table>
</div>
    </div>
    </div>
    </div>
  )
}

export default Profile