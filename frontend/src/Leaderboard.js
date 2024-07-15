import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './image/NUSBB.png';
import logotext from './image/NUSBathroomBuddyText.png';
import report from './image/report.png';
import leaderboard from './image/leaderboard.png';
import home from './image/home.png';
import pin from './image/bookmark.png';
import axios from 'axios';
import StarRatings from 'react-star-ratings';
import './Leaderboard.css';

function Leaderboard() {

  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    axios.get('https://testnusbb-git-main-jurongs-projects.vercel.app/toiletdata')
      .then(response => {
        const data = response.data;
  
        // Filter out toilets with a null rating
        const filteredData = data.filter(toilet => toilet.rating !== null);
  
        // Sort the data by rating in descending order and take the first 10 items
        const sortedData = filteredData.sort((a, b) => b.rating - a.rating).slice(0, 10);
  
        setLeaderboardData(sortedData);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  }, []);

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
      <Link to="/leaderboard" className="leader-button custom-link">
          <img src={leaderboard} alt="Leaderboard" />
          <p>Leaderboard</p>
        </Link>
      <Link to="/reports" className="navi-button custom-link">
          <img src={report} alt="Report" />
          <p>Reports</p>
        </Link>
        <Link to="/bookmarks" className="bookmark-button custom-link">
          <img src={pin} alt="Bookmarks" />
          <p>Bookmarks</p>
        </Link>
      {/* Other navigation items go here */}
    </div>
    <h1 className="leaderboard-header">LEADERBOARD</h1>
    <div className="leaderboard-table">
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>Toilet Name</th>
        <th>Rating</th>
      </tr>
    </thead>
    <tbody>
      {leaderboardData.map((toilet, index) => (
        <tr key={toilet.id}>
          <td>{index + 1}</td>
          <td>{toilet.toiletname}</td>
          <td>{toilet.rating}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
    </div>
    </div>
    
  )
}

export default Leaderboard