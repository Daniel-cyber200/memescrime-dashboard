// Solana Wallet Connection
const solanaWallets = {
  phantom: window.phantom?.solana,
  backpack: window.backpack?.solana,
  solflare: window.solflare
};

async function connectWallet() {
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const wallet = window.phantom?.solana || window.backpack?.solana || window.solflare;

  if (!wallet) {
    const message = isMobile
      ? 'Wallet not found. Please open this dashboard inside the Phantom or Backpack app browser on your phone.'
      : 'No Solana wallet found. Please install Phantom or Backpack extension on your desktop browser.';
    
    addAlert(message, 'warning');
    return;
  }

  try {
    const response = await wallet.connect();
    const publicKey = response.publicKey.toString();

    document.getElementById('walletText').textContent = 'Connected';
    document.getElementById('walletStatus').style.display = 'flex';
    document.getElementById('walletAddress').textContent =
      `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;

    localStorage.setItem('walletConnected', 'true');
    initWalletFeatures(publicKey);
    addAlert(`Wallet connected: ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`, 'info');

  } catch (error) {
    console.error('Connection error:', error);
    addAlert('Wallet connection failed!', 'danger');
  }
}

function disconnectWallet() {
  localStorage.removeItem('walletConnected');
  document.getElementById('walletText').textContent = 'Connect Wallet';
  document.getElementById('walletStatus').style.display = 'none';
  addAlert('Wallet disconnected', 'info');
}

// Tab System
function opentab(tabname, event) {
  const tablinks = document.getElementsByClassName('tab-links');
  const tabcontents = document.getElementsByClassName('tab-contents');
  
  for (let tablink of tablinks) {
    tablink.classList.remove('active-link');
  }
  
  for (let tabcontent of tabcontents) {
    tabcontent.classList.remove('active-tab');
  }
  
  event.currentTarget.classList.add('active-link');
  document.getElementById(tabname).classList.add('active-tab');
}

// Alert System
function addAlert(message, type) {
  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type}`;
  alertEl.innerHTML = `
    <span class="material-icons">${
      type === 'danger' ? 'error' : 
      type === 'warning' ? 'warning' : 'info'
    }</span>
    ${message}
  `;
  document.getElementById('alertsContainer').prepend(alertEl);
  
  setTimeout(() => {
    alertEl.remove();
  }, 5000);
}

// Initialize Charts
function initCharts() {
  // Risk Chart
  new Chart(
    document.getElementById('riskChart').getContext('2d'),
    {
      type: 'line',
      data: {
        labels: Array.from({length: 24}, (_, i) => `${i}:00`),
        datasets: [{
          label: 'High Risk Tokens',
          data: Array.from({length: 24}, () => Math.floor(Math.random() * 20)),
          borderColor: '#ff4567',
          backgroundColor: 'rgba(255, 69, 103, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Risk Alerts Over Time' }
        }
      }
    }
  );

  // Holder Chart
  new Chart(
    document.getElementById('holderChart').getContext('2d'),
    {
      type: 'doughnut',
      data: {
        labels: ['Top Holder', 'Other Holders'],
        datasets: [{
          data: [85, 15],
          backgroundColor: ['#ff4567', '#9945ff'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Token Distribution' }
        }
      }
    }
  );

  // Rug Frequency Chart
  new Chart(
    document.getElementById('rugFrequencyChart').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels: ['Raydium', 'Orca', 'Saber', 'Mercurial'],
        datasets: [{
          label: 'Rug-Pulls',
          data: [65, 59, 30, 12],
          backgroundColor: '#ff4567'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Rug-Pulls by Launchpad' }
        }
      }
    }
  );

  // Launchpad Chart
  new Chart(
    document.getElementById('launchpadChart').getContext('2d'),
    {
      type: 'pie',
      data: {
        labels: ['Raydium', 'Orca', 'Saber', 'Other'],
        datasets: [{
          data: [45, 30, 15, 10],
          backgroundColor: ['#9945ff', '#14f195', '#ffc145', '#ff4567'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Token Launch Distribution' }
        }
      }
    }
  );

  // Heatmap Chart
  new Chart(
    document.getElementById('concentrationHeatmap').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels: ['SCAM', 'RUG', 'PUMP', 'DUMP', 'MEME'],
        datasets: [{
          label: 'Top Holder %',
          data: [92, 87, 65, 78, 45],
          backgroundColor: [
            'rgba(255, 69, 103, 0.7)',
            'rgba(255, 69, 103, 0.6)',
            'rgba(255, 193, 69, 0.6)',
            'rgba(255, 69, 103, 0.5)',
            'rgba(255, 193, 69, 0.4)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          y: { max: 100 }
        }
      }
    }
  );
}

// Initialize Network Graph
function initNetworkGraph() {
  const nodes = new vis.DataSet([
    { id: 1, label: "Deployer\n(7xK...4dF)", color: "#ff4567", shape: "diamond", font: { size: 14 } },
    { id: 2, label: "CEX Deposit\n(5yT...8gH)", color: "#14f195" },
    { id: 3, label: "LP Pool\n(Raydium)", color: "#9945ff" },
    { id: 4, label: "Burn Wallet", color: "#666666" }
  ]);

  const edges = new vis.DataSet([
    { from: 1, to: 2, label: "50K $SCAM", color: "#ff4567", arrows: "to", width: 3 },
    { from: 1, to: 3, label: "Add LP", color: "#14f195", arrows: "to" },
    { from: 3, to: 1, label: "Remove LP", color: "#ff4567", arrows: "to" }
  ]);

  new vis.Network(
    document.getElementById('networkGraph'),
    { nodes, edges },
    { 
      nodes: { 
        font: { color: "#ffffff", size: 12 },
        borderWidth: 0
      },
      edges: {
        font: { size: 11, color: "#ffffff", strokeWidth: 0 },
        smooth: { type: "continuous" }
      },
      physics: {
        stabilization: { iterations: 100 }
      }
    }
  );
}

// Token Scanner Functions
async function quickScanToken() {
  const address = document.getElementById('quickScanInput').value.trim();
  if (!address) {
    addAlert('Please enter a token address', 'warning');
    return;
  }
  
  document.getElementById('quickScanResult').innerHTML = `
    <div class="loading">Scanning token ${address.slice(0, 6)}...${address.slice(-4)}</div>
  `;
  
  // Simulate API call
  setTimeout(() => {
    const riskScore = Math.floor(Math.random() * 100);
    const riskLevel = riskScore > 85 ? 'HIGH RISK' : riskScore > 60 ? 'MEDIUM RISK' : 'LOW RISK';
    const riskColor = riskScore > 85 ? '#ff4567' : riskScore > 60 ? '#ffc145' : '#14f195';
    
    document.getElementById('quickScanResult').innerHTML = `
      <div class="scan-result">
        <h4>${address.slice(0, 6)}...${address.slice(-4)}</h4>
        <div class="risk-metric">
          <div class="risk-bar" style="--score: ${riskScore}; --color: ${riskColor}"></div>
          <div class="risk-text">
            <strong>${riskLevel}</strong> (${riskScore}/100)
          </div>
        </div>
        <button onclick="scanToken('${address}')">Full Analysis</button>
      </div>
    `;
  }, 1500);
}

async function scanToken(address = null) {
  const tokenAddress = address || document.getElementById('tokenAddressInput').value.trim();
  if (!tokenAddress) {
    addAlert('Please enter a token address', 'warning');
    return;
  }
  
  if (!address) {
    document.querySelector('.tab-links[onclick*="scanner"]').click();
  }
  
  document.getElementById('tokenInfo').innerHTML = `
    <div class="loading">Loading token info...</div>
  `;
  document.getElementById('riskAssessment').innerHTML = `
    <div class="loading">Analyzing risks...</div>
  `;
  
  // Simulate API call
  setTimeout(() => {
    const tokenInfo = {
      name: 'SOLSCAM',
      symbol: 'SCAM',
      address: tokenAddress,
      supply: '1,000,000,000',
      decimals: 9,
      launchTime: new Date().toLocaleString(),
      creator: '7xK...4dF',
      launchpad: 'Raydium'
    };
    
    const risks = [
      { name: 'High Ownership Concentration', score: 95, description: 'Top 5 holders control 92% of supply' },
      { name: 'Rapid Liquidity Removal', score: 88, description: '80% of LP removed within 1 hour of launch' },
      { name: 'Suspicious Creator Activity', score: 76, description: 'Creator has launched 3 tokens in the past week' }
    ];
    
    const totalRiskScore = Math.floor(risks.reduce((sum, risk) => sum + risk.score, 0) / risks.length);
    
    // Render token info
    document.getElementById('tokenInfo').innerHTML = `
      <div class="token-info">
        <div class="token-header">
          <h4>${tokenInfo.name} (${tokenInfo.symbol})</h4>
          <span class="token-address">${tokenInfo.address}</span>
        </div>
        <div class="token-details">
          <p><span>Total Supply:</span> ${tokenInfo.supply} ${tokenInfo.symbol}</p>
          <p><span>Decimals:</span> ${tokenInfo.decimals}</p>
          <p><span>Launched:</span> ${tokenInfo.launchTime} on ${tokenInfo.launchpad}</p>
          <p><span>Creator:</span> ${tokenInfo.creator}</p>
        </div>
      </div>
    `;
    
    // Render risk assessment
    document.getElementById('riskAssessment').innerHTML = `
      <div class="risk-summary">
        <div class="overall-risk" style="--score: ${totalRiskScore}">
          <div class="risk-score">${totalRiskScore}</div>
          <div class="risk-label">
            ${totalRiskScore > 85 ? 'HIGH RISK' : totalRiskScore > 60 ? 'MEDIUM RISK' : 'LOW RISK'}
          </div>
        </div>
        <div class="risk-breakdown">
          <h5>Risk Breakdown</h5>
          <ul>
            ${risks.map(risk => `
              <li>
                <div class="risk-item">
                  <div class="risk-name">${risk.name}</div>
                  <div class="risk-bar" style="--score: ${risk.score}"></div>
                  <div class="risk-desc">${risk.description}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
    
    // Update holder chart
    new Chart(
      document.getElementById('holderChart').getContext('2d'),
      {
        type: 'doughnut',
        data: {
          labels: ['Top Holder (72%)', 'Other Holders (28%)'],
          datasets: [{
            data: [72, 28],
            backgroundColor: ['#ff4567', '#9945ff'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Token Distribution' }
          }
        }
      }
    );
    
    addAlert(`Scan completed for ${tokenInfo.name} (${tokenInfo.symbol})`, 'info');
  }, 2000);
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Initialize wallet connection
  document.getElementById('connectWallet').addEventListener('click', connectWallet);
  document.getElementById('walletDisconnect').addEventListener('click', disconnectWallet);
  
  if (localStorage.getItem('walletConnected')) {
    connectWallet();
  }
  
  // Initialize charts and visualizations
  initCharts();
  initNetworkGraph();
  
  // Add sample alerts
  addAlert('New high-risk token detected: RUGPULL (9aM...7hJ)', 'danger');
  addAlert('Suspicious activity detected on Raydium launchpad', 'warning');
  
  // Simulate live data updates
  setInterval(() => {
    document.getElementById('highRiskCount').textContent = 
      Math.floor(Math.random() * 10) + 5;
    document.getElementById('newLaunches').textContent = 
      Math.floor(Math.random() * 20) + 3;
    document.getElementById('rugPulls').textContent = 
      Math.floor(Math.random() * 5) + 1;
  }, 10000);
});

// Utility functions
function shortenAddress(address, chars = 4) {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

function initWalletFeatures(publicKey) {
  // Enable wallet-specific features
  document.querySelectorAll('.scan-button').forEach(btn => {
    btn.disabled = false;
  });
  
  // Add personalized alert
  setTimeout(() => {
    addAlert(`Wallet connected: ${shortenAddress(publicKey)}`, 'info');
  }, 1000);
}

function handleResize() {
  // Adjust network graph size
  const networkGraph = document.getElementById('networkGraph');
  if (window.innerWidth < 768) {
    networkGraph.style.height = '40vh';
  } else {
    networkGraph.style.height = '60vh';
  }
  
  // Toggle table layout
  const tables = document.querySelectorAll('.token-table');
  tables.forEach(table => {
    if (window.innerWidth < 600) {
      table.classList.add('mobile-table');
    } else {
      table.classList.remove('mobile-table');
    }
  });
}

// Initialize and listen for resize
window.addEventListener('DOMContentLoaded', () => {
  handleResize();
  window.addEventListener('resize', debounce(handleResize, 100));
});

function debounce(func, wait) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}
