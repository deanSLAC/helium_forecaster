// pages/api/currentlevel.js
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import axios from 'axios';

let currentLevel = 0;
let isInitialized = false;

// Function to fetch the current level from an external data source
async function fetchLevel() {
  try {
    // console.log(`[${new Date().toLocaleString()}] getting level from source`)
    const response = await axios.get('https://www-ssrl.slac.stanford.edu/spear_status/getpvs.php?pvs=beamline_temp');
    const data = response.data;
    if (data && data.data) {
      const mainTankLevel = data.data.find(item => item.name === 'LN:MainTankLevel');
      if (mainTankLevel && mainTankLevel.value) {
        currentLevel = parseFloat(mainTankLevel.value);
        console.log("currentLevel: ", currentLevel);
      }
    }
    isInitialized = true;
  } catch (error) {
    console.error('Error updating current level:', error);
  }
}
setInterval(fetchLevel, 600000); // get a new value every ten mins

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (!isInitialized) {
      await fetchLevel();
    }
    // console.log('sending back currentlevel of: ', currentLevel)
    res.status(200).json({ currentLevel });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
