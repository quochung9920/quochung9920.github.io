// Advanced Device Fingerprinting System
function generateDeviceFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint test', 2, 2);
  
  const fingerprint = {
    // Screen information
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    availScreen: `${screen.availWidth}x${screen.availHeight}`,
    
    // Browser information
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages ? navigator.languages.join(',') : '',
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    
    // System information
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    
    // Rendering information
    canvas: canvas.toDataURL(),
    webgl: getWebGLFingerprint(),
    
    // Hardware information
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    deviceMemory: navigator.deviceMemory || 'unknown',
    
    // Connection information
    connection: getConnectionInfo(),
    
    // Installed plugins and features
    plugins: getPluginsList(),
    features: getSupportedFeatures()
  };
  
  return btoa(JSON.stringify(fingerprint)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}

// Get WebGL fingerprint
function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';
    
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    return `${vendor}_${renderer}`;
  } catch (e) {
    return 'webgl-error';
  }
}

// Get connection information
function getConnectionInfo() {
  if ('connection' in navigator) {
    const conn = navigator.connection;
    return {
      effectiveType: conn.effectiveType || 'unknown',
      downlink: conn.downlink || 'unknown',
      rtt: conn.rtt || 'unknown'
    };
  }
  return 'no-connection-api';
}

// Get plugins list
function getPluginsList() {
  const plugins = [];
  for (let i = 0; i < navigator.plugins.length; i++) {
    plugins.push(navigator.plugins[i].name);
  }
  return plugins.join(',').substring(0, 100);
}

// Get supported features
function getSupportedFeatures() {
  const features = {
    localStorage: typeof(Storage) !== 'undefined',
    sessionStorage: typeof(sessionStorage) !== 'undefined',
    indexedDB: typeof(indexedDB) !== 'undefined',
    webWorker: typeof(Worker) !== 'undefined',
    webSocket: typeof(WebSocket) !== 'undefined',
    geolocation: 'geolocation' in navigator,
    notification: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator
  };
  
  return Object.keys(features).filter(key => features[key]).join(',');
}

// Get IP Address using external API
async function getIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.log('Could not fetch IP address:', error);
    return 'ip-unavailable';
  }
}

// Generate unique visitor hash
async function generateVisitorHash() {
  const deviceFingerprint = generateDeviceFingerprint();
  const ipAddress = await getIPAddress();
  
  // Combine device fingerprint with IP for more accurate identification
  const combinedString = `${deviceFingerprint}_${ipAddress}`;
  
  // Create a simple hash function
  let hash = 0;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Initialize AOS
AOS.init({
  duration: 1000,
  once: true
});

// Visitor tracking system with advanced fingerprinting
async function initVisitorTracking() {
  // Generate unique visitor hash
  const visitorHash = await generateVisitorHash();
  
  // Get all visitors data
  let allVisitorsData = JSON.parse(localStorage.getItem('portfolioAllVisitors')) || {};
  
  // Get current visitor data
  let visitorData = allVisitorsData[visitorHash] || {
    visitorHash: visitorHash,
    totalVisits: 0,
    firstVisit: null,
    lastVisit: null,
    isReturningVisitor: false,
    deviceInfo: {
      fingerprint: generateDeviceFingerprint(),
      userAgent: navigator.userAgent.substring(0, 100),
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };

  const now = new Date().toISOString();
  
  // Check if it's a new unique visitor
  if (!visitorData.firstVisit) {
    visitorData.firstVisit = now;
    visitorData.totalVisits = 1;
    visitorData.isReturningVisitor = false;
  } else {
    // Returning visitor
    visitorData.totalVisits++;
    visitorData.isReturningVisitor = true;
  }
  
  visitorData.lastVisit = now;
  
  // Save this visitor's data
  allVisitorsData[visitorHash] = visitorData;
  localStorage.setItem('portfolioAllVisitors', JSON.stringify(allVisitorsData));
  
  // Calculate overall statistics
  const overallStats = calculateOverallStats(allVisitorsData);
  
  // Update display
  updateVisitorDisplay(overallStats, visitorData);
  
  return { visitorData, overallStats };
}

// Calculate overall statistics from all visitors
function calculateOverallStats(allVisitorsData) {
  const visitors = Object.values(allVisitorsData);
  const totalVisitors = visitors.length;
  const totalVisits = visitors.reduce((sum, visitor) => sum + visitor.totalVisits, 0);
  const returningVisitors = visitors.filter(visitor => visitor.isReturningVisitor).length;
  const newVisitors = totalVisitors - returningVisitors;
  
  // Calculate average visits per visitor
  const avgVisitsPerVisitor = totalVisitors > 0 ? (totalVisits / totalVisitors).toFixed(1) : 0;
  
  // Find most recent visit
  const mostRecentVisit = visitors.reduce((latest, visitor) => {
    return new Date(visitor.lastVisit) > new Date(latest) ? visitor.lastVisit : latest;
  }, visitors[0]?.lastVisit || new Date().toISOString());
  
  return {
    totalVisitors,
    totalVisits,
    newVisitors,
    returningVisitors,
    avgVisitsPerVisitor,
    mostRecentVisit
  };
}

// Update visitor counter display with enhanced analytics
function updateVisitorDisplay(overallStats, currentVisitor) {
  const visitorDisplay = document.getElementById('visitor-counter');
  if (visitorDisplay) {
    const visitorStatus = currentVisitor.isReturningVisitor ? 
      `Welcome back! (Visit #${currentVisitor.totalVisits})` : 
      'Welcome, new visitor!';
      
    visitorDisplay.innerHTML = `
      <div class="visitor-stats">
        <span class="stat-item">
          <i class="fas fa-users"></i>
          <span class="stat-number">${overallStats.totalVisitors}</span>
          <span class="stat-label">Unique Visitors</span>
        </span>
        <span class="stat-item">
          <i class="fas fa-eye"></i>
          <span class="stat-number">${overallStats.totalVisits}</span>
          <span class="stat-label">Total Views</span>
        </span>
        <span class="stat-item">
          <i class="fas fa-user-plus"></i>
          <span class="stat-number">${overallStats.newVisitors}</span>
          <span class="stat-label">New Visitors</span>
        </span>
        <span class="stat-item">
          <i class="fas fa-redo"></i>
          <span class="stat-number">${overallStats.returningVisitors}</span>
          <span class="stat-label">Returning</span>
        </span>
      </div>
      <div class="visitor-welcome">
        <i class="fas fa-heart" style="color: #f093fb; margin-right: 8px;"></i>
        <span>${visitorStatus}</span>
      </div>
      <div class="visitor-details">
        <small>
          <i class="fas fa-chart-line"></i>
          Avg: ${overallStats.avgVisitsPerVisitor} visits/visitor | 
          <i class="fas fa-fingerprint"></i>
          Tracked by device fingerprint + IP
        </small>
      </div>
      <div class="mt-2">
        <small class="text-muted">
          <i class="bi bi-info-circle me-1"></i>
          Click for detailed visitor information
        </small>
      </div>
    `;
  }
}

// Get visitor analytics for display
function getVisitorAnalytics() {
  const data = JSON.parse(localStorage.getItem('portfolioVisitorData'));
  if (data) {
    const firstVisit = new Date(data.firstVisit);
    const lastVisit = new Date(data.lastVisit);
    const daysSinceFirst = Math.floor((new Date() - firstVisit) / (1000 * 60 * 60 * 24));
    
    return {
      ...data,
      daysSinceFirstVisit: daysSinceFirst,
      averageVisitsPerDay: daysSinceFirst > 0 ? (data.totalVisits / daysSinceFirst).toFixed(1) : data.totalVisits,
      lastVisitFormatted: lastVisit.toLocaleDateString(),
      firstVisitFormatted: firstVisit.toLocaleDateString()
    };
  }
  return null;
}

// Track page engagement
function trackPageEngagement() {
  let startTime = Date.now();
  let isActive = true;
  
  // Track when user becomes inactive
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      isActive = false;
      const engagementTime = Date.now() - startTime;
      updateEngagementStats(engagementTime);
    } else {
      isActive = true;
      startTime = Date.now();
    }
  });
  
  // Track when user leaves page
  window.addEventListener('beforeunload', function() {
    if (isActive) {
      const engagementTime = Date.now() - startTime;
      updateEngagementStats(engagementTime);
    }
  });
}

// Update engagement statistics
function updateEngagementStats(sessionTime) {
  let engagementData = JSON.parse(localStorage.getItem('portfolioEngagement')) || {
    totalTimeSpent: 0,
    averageSessionTime: 0,
    sessionCount: 0
  };
  
  engagementData.totalTimeSpent += sessionTime;
  engagementData.sessionCount++;
  engagementData.averageSessionTime = engagementData.totalTimeSpent / engagementData.sessionCount;
  
  localStorage.setItem('portfolioEngagement', JSON.stringify(engagementData));
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Typing animation
const typingText = document.querySelector('.typing-text');
const texts = ['Nguyen Quoc Hung', 'Web Developer', 'UI/UX Designer', 'Full-stack Developer'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
  const currentText = texts[textIndex];
  
  if (isDeleting) {
    typingText.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingText.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 50 : 100;

  if (!isDeleting && charIndex === currentText.length) {
    typeSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % texts.length;
    typeSpeed = 500;
  }

  setTimeout(typeWriter, typeSpeed);
}

// Start typing animation after page load
window.addEventListener('load', async function() {
  setTimeout(typeWriter, 1000);
  
  // Initialize visitor tracking when page loads (async)
  try {
    await initVisitorTracking();
  } catch (error) {
    console.log('Visitor tracking initialization failed:', error);
    // Fallback to simple tracking without IP
    simpleVisitorTracking();
  }
  
  // Start tracking page engagement
  trackPageEngagement();
});

// Fallback simple visitor tracking (without IP)
function simpleVisitorTracking() {
  const deviceFingerprint = generateDeviceFingerprint();
  let visitorData = JSON.parse(localStorage.getItem('portfolioSimpleTracking')) || {
    fingerprint: deviceFingerprint,
    visits: 0,
    firstVisit: new Date().toISOString()
  };
  
  if (visitorData.fingerprint === deviceFingerprint) {
    visitorData.visits++;
  } else {
    visitorData = {
      fingerprint: deviceFingerprint,
      visits: 1,
      firstVisit: new Date().toISOString()
    };
  }
  
  localStorage.setItem('portfolioSimpleTracking', JSON.stringify(visitorData));
  
  // Simple display
  const visitorDisplay = document.getElementById('visitor-counter');
  if (visitorDisplay) {
    visitorDisplay.innerHTML = `
      <div class="visitor-stats">
        <span class="stat-item">
          <i class="fas fa-eye"></i>
          <span class="stat-number">${visitorData.visits}</span>
          <span class="stat-label">Your Visits</span>
        </span>
        <span class="stat-item">
          <i class="fas fa-fingerprint"></i>
          <span class="stat-label">Device Tracked</span>
        </span>
      </div>
    `;
  }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Form submission
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Simple form validation and submission simulation
  const formData = new FormData(this);
  
  // Show success message (you can implement actual form submission here)
  alert('Thank you for contacting me! I will respond as soon as possible.');
  
  // Reset form
  this.reset();
});

// Add some interactive effects
document.querySelectorAll('.skill-card, .project-card, .contact-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-10px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector('.hero::before');
  const speed = scrolled * 0.5;
  
  if (parallax) {
    document.querySelector('.hero').style.transform = `translateY(${speed}px)`;
  }
});

// Visitor Information Functions
async function fetchVisitorInfo() {
  try {
    const [ipResponse, locationResponse] = await Promise.allSettled([
      fetch('https://api.ipify.org?format=json'),
      fetch('https://ipapi.co/json/')
    ]);

    let visitorInfo = {
      ip: 'Unknown',
      userAgent: navigator.userAgent,
      location: {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'Unknown',
        isp: 'Unknown'
      },
      browser: getBrowserInfo(),
      screen: `${screen.width}x${screen.height}`,
      language: navigator.language,
      platform: navigator.platform,
      timestamp: new Date().toLocaleString(),
      fingerprint: generateDeviceFingerprint()
    };

    // Handle IP response
    if (ipResponse.status === 'fulfilled' && ipResponse.value.ok) {
      const ipData = await ipResponse.value.json();
      visitorInfo.ip = ipData.ip;
    }

    // Handle location response
    if (locationResponse.status === 'fulfilled' && locationResponse.value.ok) {
      const locationData = await locationResponse.value.json();
      if (locationData && !locationData.error) {
        visitorInfo.location = {
          country: locationData.country_name || 'Unknown',
          region: locationData.region || 'Unknown',
          city: locationData.city || 'Unknown',
          timezone: locationData.timezone || 'Unknown',
          isp: locationData.org || 'Unknown',
          latitude: locationData.latitude || 'Unknown',
          longitude: locationData.longitude || 'Unknown'
        };
      }
    }

    return visitorInfo;
  } catch (error) {
    console.error('Error fetching visitor info:', error);
    return {
      ip: 'Error fetching IP',
      userAgent: navigator.userAgent,
      location: {
        country: 'Error',
        region: 'Error',
        city: 'Error',
        timezone: 'Error',
        isp: 'Error'
      },
      browser: getBrowserInfo(),
      screen: `${screen.width}x${screen.height}`,
      language: navigator.language,
      platform: navigator.platform,
      timestamp: new Date().toLocaleString(),
      fingerprint: generateDeviceFingerprint()
    };
  }
}

function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Google Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Mozilla Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Microsoft Edge';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }
  
  return browser;
}

function displayVisitorInfo(info) {
  const content = document.getElementById('visitor-info-content');
  
  content.innerHTML = `
    <div class="row g-4">
      <div class="col-md-6">
        <div class="info-card">
          <h6><i class="bi bi-globe me-2"></i>Network Information</h6>
          <ul class="list-unstyled">
            <li><strong>IP Address:</strong> ${info.ip}</li>
            <li><strong>ISP:</strong> ${info.location.isp}</li>
            <li><strong>Browser:</strong> ${info.browser}</li>
            <li><strong>Platform:</strong> ${info.platform}</li>
          </ul>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="info-card">
          <h6><i class="bi bi-geo-alt me-2"></i>Location Information</h6>
          <ul class="list-unstyled">
            <li><strong>Country:</strong> ${info.location.country}</li>
            <li><strong>Region:</strong> ${info.location.region}</li>
            <li><strong>City:</strong> ${info.location.city}</li>
            <li><strong>Timezone:</strong> ${info.location.timezone}</li>
          </ul>
        </div>
      </div>
      
      <div class="col-12">
        <div class="info-card">
          <h6><i class="bi bi-display me-2"></i>Device Information</h6>
          <ul class="list-unstyled">
            <li><strong>Screen Resolution:</strong> ${info.screen}</li>
            <li><strong>Language:</strong> ${info.language}</li>
            <li><strong>Visit Time:</strong> ${info.timestamp}</li>
            <li><strong>Device Fingerprint:</strong> ${info.fingerprint}</li>
          </ul>
        </div>
      </div>
      
      <div class="col-12">
        <div class="info-card">
          <h6><i class="bi bi-code me-2"></i>User Agent</h6>
          <p class="text-wrap small">${info.userAgent}</p>
        </div>
      </div>
    </div>
  `;
}

// Add click event to visitor counter
document.addEventListener('DOMContentLoaded', function() {
  const visitorCounter = document.getElementById('visitor-counter');
  if (visitorCounter) {
    visitorCounter.style.cursor = 'pointer';
    visitorCounter.title = 'Click to view visitor information';
    
    visitorCounter.addEventListener('click', async function() {
      // Show modal
      const modal = new bootstrap.Modal(document.getElementById('visitorInfoModal'));
      modal.show();
      
      // Reset content to loading state
      const content = document.getElementById('visitor-info-content');
      content.innerHTML = `
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading visitor information...</p>
        </div>
      `;
      
      // Fetch and display visitor info
      const visitorInfo = await fetchVisitorInfo();
      displayVisitorInfo(visitorInfo);
      
      // Save visitor info to admin database
      saveVisitorToAdmin(visitorInfo);
    });
  }
});

// Function to save visitor data for admin dashboard
async function saveVisitorToAdmin(visitorInfo) {
  try {
    // Try to send to server API first
    if (typeof apiClient !== 'undefined' && API_CONFIG.BASE_URL !== 'https://your-server.com/api') {
      try {
        await apiClient.post(API_CONFIG.ENDPOINTS.VISITORS, {
          ip: visitorInfo.ip,
          userAgent: visitorInfo.userAgent,
          location: visitorInfo.location,
          browser: visitorInfo.browser,
          platform: visitorInfo.platform,
          screen: visitorInfo.screen,
          language: visitorInfo.language,
          fingerprint: visitorInfo.fingerprint,
          timestamp: new Date().toISOString()
        });
        
        console.log('Visitor data sent to server successfully');
        return; // Success, no need for fallback
      } catch (serverError) {
        console.warn('Server unavailable, using fallback:', serverError.message);
        
        // If server fails and fallback is enabled, continue to localStorage
        if (!API_CONFIG.USE_FALLBACK) {
          throw serverError;
        }
      }
    }
    
    // Fallback to localStorage
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

    // Check if visitor already exists
    const existingIndex = visitors.findIndex(v => 
      v.fingerprint === visitor.fingerprint || v.ip === visitor.ip
    );

    if (existingIndex >= 0) {
      // Update existing visitor
      visitors[existingIndex].visits++;
      visitors[existingIndex].lastVisit = visitor.timestamp;
      visitors[existingIndex].userAgent = visitor.userAgent;
    } else {
      // Add new visitor
      visitors.push(visitor);
    }

    localStorage.setItem('visitorData', JSON.stringify(visitors));
    console.log('Visitor data saved to localStorage as fallback');
    
  } catch (error) {
    console.error('Error saving visitor data:', error);
  }
}

// Auto-save visitor info when page loads
document.addEventListener('DOMContentLoaded', async function() {
  // Auto-save visitor information for admin tracking
  try {
    const visitorInfo = await fetchVisitorInfo();
    saveVisitorToAdmin(visitorInfo);
  } catch (error) {
    console.error('Error auto-saving visitor info:', error);
  }
});