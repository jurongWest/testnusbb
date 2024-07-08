import React, { useState, useEffect } from 'react'
import './ViewReports.css'
import axios from 'axios'

function ViewReports() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('http://localhost:8081/reports')
      .then(res => {
        if (!res.ok) { // res.ok is false if the status code is 4xx or 5xx
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Data from server: ', data);
        setReports(data);
      })
      .catch(err => console.error('Error fetching reports: ', err));
  }, []);

  const filteredReports = reports.filter(report => statusFilter === 'all' || report.status === statusFilter);

  function updateStatus(idcolumn, newStatus) {
    // Send a request to your server to update the status
    axios.put(`http://localhost:8081/reports/${idcolumn}`, {
      newStatus
    })
    .then(response => {
      console.log('Server response: ', response.data);
      // Update the state of your component to reflect the new status
      setReports(reports.map(report => report.idcolumn === idcolumn ? { ...report, status: newStatus } : report));
    })
    .catch(error => {
      console.error('Error updating status: ', error);
    });
  }

  return (
    <div>
      <h1>View Reports</h1>
      <div className="filter-container">
        <p>Filter by:</p>
      <select className="filter-margin" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="solved">Solved</option>
        <option value="unsolved">Unsolved</option>
      </select>
      </div>
      <table className="full-width-table table-margin">
        <thead>
          <tr>
            <th>ID</th>
            <th>Toilet Name</th>
            <th>Details</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
        {filteredReports.map(report => {
  console.log('Report: ', report);
  return (
    <tr>
      <td>{report.idcolumn}</td>
      <td>{report.toiletname}</td>
      <td className="details-column">{report.details}</td>
      <td className="status-column">
        <select value={report.status} onChange={e => updateStatus(report.idcolumn, e.target.value)}>
          <option value="solved">Solved</option>
          <option value="unsolved">Unsolved</option>
        </select>
      </td>
    </tr>
  );
})}
        </tbody>
      </table>
    </div>
  )
}

export default ViewReports