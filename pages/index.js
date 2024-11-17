import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [currentTime, setCurrentTime] = useState('Calculating...');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [endLevel, setEndLevel] = useState(20);
  const [dropRate, setDropRate] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState('Calculating...');
  const [endTime, setEndTime] = useState('');
  const [alert, setAlert] = useState('');
  const [pageAlert, setPageAlert] = useState(false);

  // get current level from api route, then setInterval to poll for changes
  function fetchCurrentLevel() {
    console.log("asking server for currentLevel");
    axios.get('/api/currentlevel')
      .then(response => {
        const { currentLevel: updatedLevel } = response.data;
        console.log("server says level is: ", updatedLevel);
        setCurrentLevel(updatedLevel);
      })
      .catch(error => {
        console.error('Error fetching current level:', error);
      });
  }
  useEffect(() => {
    fetchCurrentLevel();
    const interval = setInterval(fetchCurrentLevel, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, []);

  
  function calculateTimeRemaining() {
    const currentTime = new Date();
    setCurrentTime(currentTime);

    if (!isNaN(currentLevel) && !isNaN(endLevel) && !isNaN(dropRate) && dropRate > 0) {
      const deltaLevel = currentLevel - endLevel;
      const daysRemaining = deltaLevel / dropRate;
      const endTimeDate = new Date(currentTime.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
      setEndTime(endTimeDate); // Store as Date object instead of formatted string

      const hoursRemaining = daysRemaining * 24;
      const timeRemainingText = Math.floor(hoursRemaining) + ' hrs ' + Math.floor((hoursRemaining % 1) * 60) + ' mins';
      setTimeRemaining(timeRemainingText);

      console.log(hoursRemaining);
      if (hoursRemaining < 24) {
        setAlert('red-alert');
      } else if (hoursRemaining >= 24 && hoursRemaining <= 48) {
        setAlert('orange-alert');
      } else {
        setAlert('green');
      }
    } else {
      setTimeRemaining('Invalid input');
      setAlert('invalid-alert');
    }
  }
  useEffect(() => {
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 2000);
    return () => clearInterval(interval);
  }, [currentLevel, dropRate]);

  useEffect(() => {
    console.log('alert useeffect. state: ', alert)
    setPageAlert( alert === 'red-alert' ? true : false)
  }, [alert]);
  
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--background', pageAlert ? '#ff9595' : '#f9f6ef');
  }, [pageAlert]);

  return (
    <div className={`container ${alert}`} style={{ fontFamily: 'Arial, sans-serif', transition: 'background-color 0.3s', padding: '20px', minHeight: '100vh', width: '100%', backgroundColor: pageAlert ? '#ff9595' : '#f9f6ef' }}>
      <div className="headerthing"> 
        <img src="/ssrl-logo.png" alt="SSRL Logo" style={{ margin: '0 20px', height: '50px' }}/>
        <h1 style={{ textAlign: 'center', fontSize: '2em', fontWeight: 'bold', marginBottom: '20px'}}>Cryostat Helium Dewar Level Forecaster</h1>
      </div>
      <div className="table-container" style={{ width: '80%', margin: '50px auto', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Current Date/Time</th>
              <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Current Level (L)</th>
              <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>End Level (L)</th>
              <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Delta Level (L)</th>
              <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Drop Rate (L/day)</th>
              <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>End Date/Time</th>
              <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Time Remaining</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>{new Date(currentTime).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
              <td style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>{currentLevel.toFixed(2)}</td>
              <td style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>{endLevel}</td>
              <td style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>{(currentLevel - endLevel).toFixed(2)}</td>
              <td style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>
                <input type="number" value={dropRate} onChange={(e) => setDropRate(parseFloat(e.target.value))} style={{ border: '1px solid #ccc' }} />
              </td>
              <td style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }} className="end-time">{new Date(endTime).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</td>
              <td style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd', backgroundColor: alert === 'red-alert' ? '#ff6464' : alert === 'orange-alert' ? '#ffcc80' : alert === 'green' ? '#dfffd8' : alert === 'invalid-alert' ? '#ff6464' : 'white', fontWeight: 'bold' }} className="time-remaining">{timeRemaining}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
