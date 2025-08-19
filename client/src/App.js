
import './App.css';
import CryptoJS from 'crypto-js';
import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import 'chartjs-plugin-zoom';

const btns = [30000, 10000, 5000, 2500, 1500, 1000, 500, 300, 100];

function App() {
  const [hash, setHash] = useState('');
  const [numberChart, setNumberChart] = useState(true);
  const [bet, setBet] = useState(500);
  const [predictionCount, setPredictionCount] = useState(300); // Số bet dự đoán
  const [showPrediction, setShowPrediction] = useState(false);
  const [trendAnalysis, setTrendAnalysis] = useState({});

  const handleClick = (b, num) => {
    setNumberChart(b);
    !numberChart && setBet(num);
  };

  const renderBtn = () => {
    return btns.map((btn, index) => {
      return (
        <button 
          key={index}
          style={{
            marginBottom: '5px',
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: bet === btn ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => { handleClick(false, btn); }}
        >
          View Chart {btn} Bet
        </button>
      );
    });
  };

  useEffect(() => {
    if (hash) {
      console.log('useEffect called with bet:', bet);
      // Không cần gọi API nếu đã có hash từ input
    }
  }, [bet, hash]);

  const saltV1 = '0000000000000000000301e2801a9a9598bfb114e574a91a887f2132f33047e6';

  const gameResult = (seed, salt) => {
    const nBits = 52;
    if (salt) {
      const hmac = CryptoJS.HmacSHA256(CryptoJS.enc.Hex.parse(seed), salt);
      seed = hmac.toString(CryptoJS.enc.Hex);
    }
    seed = seed.slice(0, nBits / 4);
    const r = parseInt(seed, 16);
    let X = r / Math.pow(2, nBits);
    X = parseFloat(X.toPrecision(9));
    X = 99 / (1 - X);
    const result = Math.floor(X);
    return Math.max(1, result / 100);
  };

  const genHash = (newHash, count) => {
    let prevHash = null;
    let Arr = [];
    for (let i = 0; i < count; i++) {
      let hash = String(prevHash ? CryptoJS.SHA256(String(prevHash)) : newHash);
      let bust = gameResult(hash, saltV1);
      prevHash = hash;
      Arr.push(bust);
    }
    return Arr;
  };

  // Tạo dữ liệu cho biểu đồ hiện tại
  const currentData = hash ? genHash(hash, numberChart ? 500 : bet) : [];
  const currentArr = currentData.slice().reverse();

  // Tạo dữ liệu dự đoán
  const predictionData = hash ? genHash(hash, predictionCount) : [];
  const predictionArr = predictionData.slice().reverse();

  // Tính toán tổng cho dữ liệu hiện tại
  let currentTotal = 0;
  let currentTotals = [];
  currentArr.forEach(function (item) {
    if (item >= 2) {
      currentTotal += 1;
    } else {
      currentTotal -= 1;
    }
    currentTotals.push(currentTotal);
  });

  // Tính toán tổng cho dữ liệu dự đoán
  let predictionTotal = 0;
  let predictionTotals = [];
  predictionArr.forEach(function (item) {
    if (item >= 2) {
      predictionTotal += 1;
    } else {
      predictionTotal -= 1;
    }
    predictionTotals.push(predictionTotal);
  });

  // Phân tích xu hướng
  const analyzeTrend = (data) => {
    if (data.length < 10) return {};

    const recent = data.slice(-10);
    const trend = recent[recent.length - 1] - recent[0];
    const volatility = Math.sqrt(recent.reduce((acc, val, i) => {
      if (i === 0) return 0;
      return acc + Math.pow(val - recent[i - 1], 2);
    }, 0) / (recent.length - 1));

    let prediction = 'Unknown';
    if (trend > 2) prediction = 'Strong Upward';
    else if (trend > 0) prediction = 'Upward';
    else if (trend < -2) prediction = 'Strong Downward';
    else if (trend < 0) prediction = 'Downward';
    else prediction = 'Sideways';

    return {
      trend: trend,
      volatility: volatility.toFixed(2),
      prediction: prediction,
      confidence: Math.min(Math.abs(trend) / 5 * 100, 100).toFixed(1)
    };
  };

  useEffect(() => {
    if (currentTotals.length > 0) {
      setTrendAnalysis(analyzeTrend(currentTotals));
    }
  }, [currentTotals]);

  // Tạo mảng màu cho biểu đồ hiện tại
  let currentColors = [];
  for (let i = 0; i < currentTotals.length; i++) {
    if (i === 0) {
      currentColors.push('#3BC117');
    } else if (currentTotals[i] < currentTotals[i - 1]) {
      currentColors.push('#ed6300');
    } else {
      currentColors.push('#3BC117');
    }
  }

  // Tạo mảng màu cho biểu đồ dự đoán
  let predictionColors = [];
  for (let i = 0; i < predictionTotals.length; i++) {
    if (i === 0) {
      predictionColors.push('#3BC117');
    } else if (predictionTotals[i] < predictionTotals[i - 1]) {
      predictionColors.push('#ed6300');
    } else {
      predictionColors.push('#3BC117');
    }
  }

  // Dữ liệu cho biểu đồ hiện tại
  const currentChartData = {
    labels: [...Array(currentTotals.length).keys()],
    datasets: [
      {
        label: `Current Chart (${numberChart ? 500 : bet} bets)`,
        data: currentTotals,
        borderColor: currentColors,
        borderWidth: 2,
        backgroundColor: 'rgba(59, 193, 23, 0.1)',
        fill: false,
        tension: 0.1
      }
    ]
  };

  // Dữ liệu cho biểu đồ dự đoán
  const predictionChartData = {
    labels: [...Array(predictionTotals.length).keys()],
    datasets: [
      {
        label: `Prediction Chart (${predictionCount} bets)`,
        data: predictionTotals,
        borderColor: predictionColors,
        borderWidth: 2,
        backgroundColor: 'rgba(237, 99, 0, 0.1)',
        fill: false,
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Crash Game Trend Analysis',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Bet Number',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Cumulative Score',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)'
        }
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4
      },
      line: {
        tension: 0.1
      }
    }
  };

  return (
    <div className="App">
      <div className='information_game' style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Enter Hash:</label>
          <input 
            placeholder='Enter hash value here...' 
            value={hash}
            onChange={(e) => { setHash(e.target.value); }}
            style={{
              border: '2px solid #007bff',
              borderRadius: '4px',
              padding: '8px 12px',
              width: '600px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Total Bets:</label>
          <span style={{ fontSize: '18px', color: '#007bff' }}>{numberChart ? 500 : bet}</span>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Current Score:</label>
          <span style={{ 
            fontSize: '18px', 
            color: currentTotals[currentTotals.length - 1] >= 0 ? '#28a745' : '#dc3545',
            fontWeight: 'bold'
          }}>
            {currentTotals[currentTotals.length - 1] || 0}
          </span>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Prediction Bets:</label>
          <input 
            type="number"
            value={predictionCount}
            onChange={(e) => setPredictionCount(parseInt(e.target.value) || 1000)}
            style={{
              border: '1px solid #ced4da',
              borderRadius: '4px',
              padding: '4px 8px',
              width: '100px',
              marginRight: '10px'
            }}
          />
          <button 
            onClick={() => setShowPrediction(!showPrediction)}
            style={{
              backgroundColor: showPrediction ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer'
            }}
          >
            {showPrediction ? 'Hide Prediction' : 'Show Prediction'}
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => { handleClick(true); }}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            View Chart Bet (Default)
          </button>
          {renderBtn()}
        </div>

        {/* Trend Analysis */}
        {Object.keys(trendAnalysis).length > 0 && (
          <div className="trend-analysis">
            <h4>Trend Analysis:</h4>
            <div className="trend-grid">
              <div className="trend-item">
                <strong>Trend:</strong> <span style={{ color: trendAnalysis.trend > 0 ? '#28a745' : '#dc3545' }}>{trendAnalysis.prediction}</span>
              </div>
              <div className="trend-item">
                <strong>Change:</strong> <span style={{ color: trendAnalysis.trend > 0 ? '#28a745' : '#dc3545' }}>{trendAnalysis.trend > 0 ? '+' : ''}{trendAnalysis.trend}</span>
              </div>
              <div className="trend-item">
                <strong>Volatility:</strong> {trendAnalysis.volatility}
              </div>
              <div className="trend-item">
                <strong>Confidence:</strong> {trendAnalysis.confidence}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Chart */}
      <div className="chart-container">
        <h3>Current Game Trend</h3>
        <div style={{ height: '400px', width: '100%', position: 'relative' }}>
          <Line data={currentChartData} options={chartOptions} />
        </div>
      </div>

      {/* Prediction Chart */}
      {showPrediction && (
        <div className="chart-container">
          <h3>Prediction for Next {predictionCount} Bets</h3>
          <div style={{ height: '400px', width: '100%', position: 'relative' }}>
            <Line data={predictionChartData} options={chartOptions} />
          </div>
          <div className="prediction-summary">
            <h4>Prediction Summary:</h4>
            <p>
              Based on the current hash and game algorithm, this chart shows the predicted trend for the next {predictionCount} bets. 
              Use this information to make informed decisions about your betting strategy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
