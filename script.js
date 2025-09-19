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