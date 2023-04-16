
import './App.css';
import CryptoJS from 'crypto-js';
import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

import axios from 'axios';

function App() {
  const [hash, setHash] = useState([])
  const [numberChart, setNumberChart] = useState(true)

  var config = {
    method: 'get',
    url: '/api/crash/result/recent/',
  };

  useEffect(() => {
    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data.data));
        setHash(response.data.data[0])
      })
      .catch(function (error) {
        console.log(error);
      });

  }, [numberChart])

  const handleClick=(b,num)=>{
    setNumberChart(b)
  }

  const saltV1 = '000000000000000000030587dd9ded1fcc5d603652da58deb670319bd2e09445';
  let curHash = hash.hash;
  const issueNumber = numberChart?(+hash.gameId - 5870139):500;
  let arr = [];

  const gameResult = (seed, salt) => {
    const nBits = 52; // number of most significant bits to use

    // 1. HMAC_SHA256(message=seed, key=salt)  
    if (salt) {
      const hmac = CryptoJS.HmacSHA256(CryptoJS.enc.Hex.parse(seed), salt);
      seed = hmac.toString(CryptoJS.enc.Hex);
    }

    // 2. r = 52 most significant bits
    seed = seed.slice(0, nBits / 4);
    const r = parseInt(seed, 16);

    // 3. X = r / 2^52
    let X = r / Math.pow(2, nBits); // uniformly distributed in [0; 1)
    X = parseFloat(X.toPrecision(9));

    // 4. X = 99 / (1-X)
    X = 99 / (1 - X);

    // 5. return max(trunc(X), 100)
    const result = Math.floor(X);

    return Math.max(1, result / 100);
  };

  const genHash = (newHash) => {
    let prevHash = null;
    let Arr = []
    for (let i = 0; i < issueNumber; i++) {
      let hash = String(prevHash ? CryptoJS.SHA256(String(prevHash)) : newHash);
      let bust = gameResult(hash, saltV1);

      prevHash = hash;
      Arr.push(bust)

    }

    return Arr;

  }

  ///charjs
  arr = genHash(curHash).slice().reverse();
  let len = arr.length;

  console.log('hash:', hash)
  console.log('data:', arr)

  let total = 0;
  let totals = [];

  arr.forEach(function (item) {
    if (item >= 2) {
      total += 1;
    } else {
      total -= 1;
    }
    totals.push(total);
  });



  // Tạo mảng màu cho biểu đồ
  let colors = [];
  for (let i = 0; i < totals.length; i++) {
    if (i === 0 || totals[i] === totals[i - 1]) {
      // Nếu tổng không thay đổi thì sử dụng màu trước đó
      colors.push(colors[colors.length - 1]);
    } else if (totals[i] < totals[i - 1]) {
      // Nếu tổng giảm so với giá trị trước đó thì sử dụng màu đỏ
      colors.push('#ed6300');
    } else {
      // Nếu tổng tăng so với giá trị trước đó thì sử dụng màu xanh
      colors.push('#3BC117');
    }
  }

  // Vẽ biểu đồ
  const data = {
    labels: [...Array(len).keys()],
    datasets: [
      {
        label: 'Chart Crash',
        data: totals,
        borderColor: colors,
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false
  };




  return (
    <div className="App">
      <div className='infomation_game'>
        <div style={{ minWidth: '100px',display:'inline-block' }}>GameId: </div> from <span>5870139</span> to <span>{hash.gameId}</span> <button onClick={()=>{handleClick(true)}}>View Chart Bet(default)</button><button onClick={()=>{handleClick(false)}}>View Chart 500 Bet</button><br />
        <div style={{ minWidth: '100px',display:'inline-block' }}> Total Bet:</div> <span>{issueNumber}</span><br />
        <div style={{ minWidth: '100px',display:'inline-block' }}>Total</div> ( Green - red ): <span>{totals[totals.length - 1]}</span>
        
      </div>
      <Line data={data} options={options} />

    </div>
  );
}

export default App;
