// Admin Dashboard JavaScript
class VisitorManager {
  constructor() {
    this.visitors = this.loadVisitors();
    this.filteredVisitors = [...this.visitors];
    this.init();
  }

  init() {
    this.updateStats();
    this.renderVisitorsTable();
    this.setupEventListeners();
    this.createCharts();
    this.populateFilters();
    
    // Auto refresh every 30 seconds
    setInterval(() => {
      this.refreshData();
    }, 30000);
  }

  loadVisitors() {
    try {
      return JSON.parse(localStorage.getItem('visitorData') || '[]');
    } catch (error) {
      console.error('Error loading visitor data:', error);
      return [];
    }
  }

  saveVisitors() {
    try {
      localStorage.setItem('visitorData', JSON.stringify(this.visitors));
    } catch (error) {
      console.error('Error saving visitor data:', error);
    }
  }

  addVisitor(visitorInfo) {
    const visitor = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ip: visitorInfo.ip,
      userAgent: visitorInfo.userAgent,
      location: visitorInfo.location,
      browser: visitorInfo.browser,
      platform: visitorInfo.platform,
      screen: visitorInfo.screen,
      language: visitorInfo.language,
      fingerprint: visitorInfo.fingerprint,
      visits: 1,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString()
    };

    // Check if visitor already exists
    const existingIndex = this.visitors.findIndex(v => 
      v.fingerprint === visitor.fingerprint || v.ip === visitor.ip
    );

    if (existingIndex >= 0) {
      // Update existing visitor
      this.visitors[existingIndex].visits++;
      this.visitors[existingIndex].lastVisit = visitor.timestamp;
      this.visitors[existingIndex].userAgent = visitor.userAgent; // Update in case it changed
    } else {
      // Add new visitor
      this.visitors.push(visitor);
    }

    this.saveVisitors();
    this.refreshData();
  }

  updateStats() {
    const totalVisitors = this.visitors.length;
    const totalVisits = this.visitors.reduce((sum, v) => sum + v.visits, 0);
    const newVisitors = this.visitors.filter(v => v.visits === 1).length;
    const returningVisitors = totalVisitors - newVisitors;

    document.getElementById('total-visitors').textContent = totalVisitors;
    document.getElementById('total-visits').textContent = totalVisits;
    document.getElementById('new-visitors').textContent = newVisitors;
    document.getElementById('returning-visitors').textContent = returningVisitors;
  }

  renderVisitorsTable() {
    const tbody = document.getElementById('visitorsTableBody');
    const countBadge = document.getElementById('visitor-count');
    
    if (this.filteredVisitors.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
            <p class="text-muted mt-2">No visitors found</p>
          </td>
        </tr>
      `;
      countBadge.textContent = '0 visitors';
      return;
    }

    tbody.innerHTML = this.filteredVisitors
      .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
      .map(visitor => {
        const lastVisit = new Date(visitor.lastVisit);
        const timeAgo = this.getTimeAgo(lastVisit);
        const isOnline = Date.now() - lastVisit.getTime() < 5 * 60 * 1000; // 5 minutes

        return `
          <tr>
            <td>
              <div class="d-flex align-items-center">
                <span class="status-dot ${isOnline ? 'online' : 'offline'}" title="${isOnline ? 'Online' : 'Offline'}"></span>
                <div class="ms-2">
                  <div class="fw-bold">${timeAgo}</div>
                  <small class="text-muted">${lastVisit.toLocaleDateString()}</small>
                </div>
              </div>
            </td>
            <td>
              <code class="bg-light px-2 py-1 rounded">${visitor.ip}</code>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <span class="flag-icon me-1">${this.getCountryFlag(visitor.location.country)}</span>
                <div>
                  <div>${visitor.location.city}, ${visitor.location.country}</div>
                  <small class="text-muted">${visitor.location.region}</small>
                </div>
              </div>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <i class="browser-icon ${this.getBrowserIcon(visitor.browser)} me-2"></i>
                ${visitor.browser}
              </div>
            </td>
            <td>
              <div>
                <div>${visitor.platform}</div>
                <small class="text-muted">${visitor.screen}</small>
              </div>
            </td>
            <td>
              <span class="badge ${visitor.visits === 1 ? 'bg-success' : 'bg-primary'}">${visitor.visits}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="visitorManager.showVisitorDetail('${visitor.id}')">
                <i class="bi bi-eye"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

    countBadge.textContent = `${this.filteredVisitors.length} visitors`;
  }

  getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getCountryFlag(country) {
    const flags = {
      'Vietnam': '🇻🇳',
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦'
    };
    return flags[country] || '🌍';
  }

  getBrowserIcon(browser) {
    const icons = {
      'Google Chrome': 'bi-browser-chrome',
      'Mozilla Firefox': 'bi-browser-firefox',
      'Safari': 'bi-browser-safari',
      'Microsoft Edge': 'bi-browser-edge',
      'Opera': 'bi-browser-opera'
    };
    return icons[browser] || 'bi-browser-chrome';
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
      this.filterVisitors();
    });

    // Country filter
    const countryFilter = document.getElementById('countryFilter');
    countryFilter.addEventListener('change', () => {
      this.filterVisitors();
    });
  }

  filterVisitors() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const countryFilter = document.getElementById('countryFilter').value;

    this.filteredVisitors = this.visitors.filter(visitor => {
      const matchesSearch = !searchTerm || 
        visitor.ip.toLowerCase().includes(searchTerm) ||
        visitor.location.country.toLowerCase().includes(searchTerm) ||
        visitor.location.city.toLowerCase().includes(searchTerm) ||
        visitor.browser.toLowerCase().includes(searchTerm) ||
        visitor.platform.toLowerCase().includes(searchTerm);

      const matchesCountry = !countryFilter || visitor.location.country === countryFilter;

      return matchesSearch && matchesCountry;
    });

    this.renderVisitorsTable();
  }

  populateFilters() {
    const countries = [...new Set(this.visitors.map(v => v.location.country))].sort();
    const countryFilter = document.getElementById('countryFilter');
    
    countryFilter.innerHTML = '<option value="">All Countries</option>' +
      countries.map(country => `<option value="${country}">${country}</option>`).join('');
  }

  createCharts() {
    this.createCountryChart();
    this.createBrowserChart();
  }

  createCountryChart() {
    const ctx = document.getElementById('countryChart').getContext('2d');
    const countryData = this.visitors.reduce((acc, visitor) => {
      const country = visitor.location.country;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const sortedCountries = Object.entries(countryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedCountries.map(([country]) => country),
        datasets: [{
          label: 'Visitors',
          data: sortedCountries.map(([, count]) => count),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  createBrowserChart() {
    const ctx = document.getElementById('browserChart').getContext('2d');
    const browserData = this.visitors.reduce((acc, visitor) => {
      const browser = visitor.browser;
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
    ];

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(browserData),
        datasets: [{
          data: Object.values(browserData),
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  showVisitorDetail(visitorId) {
    const visitor = this.visitors.find(v => v.id == visitorId);
    if (!visitor) return;

    const modal = new bootstrap.Modal(document.getElementById('visitorDetailModal'));
    const content = document.getElementById('visitorDetailContent');

    content.innerHTML = `
      <div class="row g-4">
        <div class="col-md-6">
          <h6><i class="bi bi-globe me-2"></i>Network Information</h6>
          <ul class="list-unstyled">
            <li><strong>IP Address:</strong> ${visitor.ip}</li>
            <li><strong>ISP:</strong> ${visitor.location.isp || 'Unknown'}</li>
            <li><strong>Browser:</strong> ${visitor.browser}</li>
            <li><strong>Platform:</strong> ${visitor.platform}</li>
          </ul>
        </div>
        
        <div class="col-md-6">
          <h6><i class="bi bi-geo-alt me-2"></i>Location Information</h6>
          <ul class="list-unstyled">
            <li><strong>Country:</strong> ${visitor.location.country}</li>
            <li><strong>Region:</strong> ${visitor.location.region}</li>
            <li><strong>City:</strong> ${visitor.location.city}</li>
            <li><strong>Timezone:</strong> ${visitor.location.timezone}</li>
          </ul>
        </div>
        
        <div class="col-md-6">
          <h6><i class="bi bi-display me-2"></i>Device Information</h6>
          <ul class="list-unstyled">
            <li><strong>Screen:</strong> ${visitor.screen}</li>
            <li><strong>Language:</strong> ${visitor.language}</li>
            <li><strong>Visits:</strong> ${visitor.visits}</li>
            <li><strong>Fingerprint:</strong> ${visitor.fingerprint}</li>
          </ul>
        </div>
        
        <div class="col-md-6">
          <h6><i class="bi bi-clock me-2"></i>Visit History</h6>
          <ul class="list-unstyled">
            <li><strong>First Visit:</strong> ${new Date(visitor.firstVisit).toLocaleString()}</li>
            <li><strong>Last Visit:</strong> ${new Date(visitor.lastVisit).toLocaleString()}</li>
            <li><strong>Total Visits:</strong> ${visitor.visits}</li>
          </ul>
        </div>
        
        <div class="col-12">
          <h6><i class="bi bi-code me-2"></i>User Agent</h6>
          <p class="text-wrap small bg-light p-2 rounded">${visitor.userAgent}</p>
        </div>
      </div>
    `;

    modal.show();
  }

  refreshData() {
    this.visitors = this.loadVisitors();
    this.filterVisitors();
    this.updateStats();
    this.populateFilters();
  }

  exportData() {
    const csv = this.convertToCSV(this.filteredVisitors);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(data) {
    const headers = ['Timestamp', 'IP', 'Country', 'Region', 'City', 'Browser', 'Platform', 'Screen', 'Language', 'Visits', 'First Visit', 'Last Visit'];
    const rows = data.map(visitor => [
      visitor.timestamp,
      visitor.ip,
      visitor.location.country,
      visitor.location.region,
      visitor.location.city,
      visitor.browser,
      visitor.platform,
      visitor.screen,
      visitor.language,
      visitor.visits,
      visitor.firstVisit,
      visitor.lastVisit
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  clearData() {
    if (confirm('Are you sure you want to clear all visitor data? This action cannot be undone.')) {
      this.visitors = [];
      this.filteredVisitors = [];
      this.saveVisitors();
      this.refreshData();
      
      // Recreate charts with empty data
      setTimeout(() => {
        this.createCharts();
      }, 100);
    }
  }
}

// Global functions
function exportData() {
  visitorManager.exportData();
}

function clearData() {
  visitorManager.clearData();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.visitorManager = new VisitorManager();
});

// Function to be called from main website
function addVisitorToAdmin(visitorInfo) {
  if (window.visitorManager) {
    window.visitorManager.addVisitor(visitorInfo);
  } else {
    // Store in localStorage if admin dashboard is not open
    const visitors = JSON.parse(localStorage.getItem('visitorData') || '[]');
    
    const visitor = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ip: visitorInfo.ip,
      userAgent: visitorInfo.userAgent,
      location: visitorInfo.location,
      browser: visitorInfo.browser,
      platform: visitorInfo.platform,
      screen: visitorInfo.screen,
      language: visitorInfo.language,
      fingerprint: visitorInfo.fingerprint,
      visits: 1,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString()
    };

    const existingIndex = visitors.findIndex(v => 
      v.fingerprint === visitor.fingerprint || v.ip === visitor.ip
    );

    if (existingIndex >= 0) {
      visitors[existingIndex].visits++;
      visitors[existingIndex].lastVisit = visitor.timestamp;
      visitors[existingIndex].userAgent = visitor.userAgent;
    } else {
      visitors.push(visitor);
    }

    localStorage.setItem('visitorData', JSON.stringify(visitors));
  }
}