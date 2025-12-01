/**
 * ShoreSquad - Beach Cleanup Community App
 * Main JavaScript Application
 * Features: Geolocation, Weather API, Maps Integration, Crew Management, Event Scheduling
 */

// ==========================================
// STATE MANAGEMENT
// ==========================================
const state = {
    userLocation: null,
    crews: [],
    events: [],
    currentUser: {
        name: 'Beach Warrior',
        location: null
    }
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const elements = {
    // Navigation
    navToggle: document.querySelector('.nav-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    navLinks: document.querySelectorAll('.nav-link'),

    // Buttons
    startBtn: document.getElementById('startBtn'),
    weatherBtn: document.getElementById('weatherBtn'),
    createCrewBtn: document.getElementById('createCrewBtn'),
    scheduleEventBtn: document.getElementById('scheduleEventBtn'),

    // Containers
    weatherCard: document.getElementById('weatherCard'),
    crewList: document.getElementById('crewList'),
    eventsContainer: document.getElementById('eventsContainer'),
    mapContainer: document.getElementById('mapContainer'),

    // Modal
    modal: document.getElementById('modal'),
    closeBtn: document.getElementById('closeModal'),
    crewForm: document.getElementById('crewForm')
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadLocalData();
    attachEventListeners();
});

function initializeApp() {
    console.log('🌊 ShoreSquad initialized');
    requestUserLocation();
    renderEmptyStates();
}

// ==========================================
// GEOLOCATION & LOCATION SERVICES
// ==========================================
function requestUserLocation() {
    if (!navigator.geolocation) {
        console.warn('Geolocation not supported');
        showNotification('Your browser does not support location services', 'warning');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            state.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            console.log('📍 User location:', state.userLocation);
            updateMapCenter();
        },
        (error) => {
            console.warn('Location error:', error.message);
            showNotification('Please enable location services for better experience', 'info');
        }
    );
}

// ==========================================
// WEATHER FUNCTIONALITY
// ==========================================
function getWeather() {
    if (!state.userLocation) {
        showNotification('Enable location to fetch weather', 'warning');
        return;
    }

    const { lat, lng } = state.userLocation;
    const apiKey = 'demo'; // Replace with actual API key (OpenWeatherMap, WeatherAPI, etc.)

    // Demo weather data for illustration
    const demoWeather = {
        temp: 28,
        condition: 'Sunny',
        humidity: 65,
        windSpeed: 12,
        uvIndex: 7,
        icon: '☀️'
    };

    renderWeatherCard(demoWeather);
    showNotification('Weather fetched! ☀️', 'success');

    // Uncomment for production API integration:
    // fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`)
    //     .then(response => response.json())
    //     .then(data => renderWeatherCard(data))
    //     .catch(error => console.error('Weather API error:', error));
}

function renderWeatherCard(weather) {
    const weatherHTML = `
        <div class="weather-content">
            <div class="weather-item">
                <p class="weather-item-label">Temperature</p>
                <p class="weather-item-value">${weather.temp || weather.main?.temp || 28}°C</p>
            </div>
            <div class="weather-item">
                <p class="weather-item-label">Condition</p>
                <p class="weather-item-value">${weather.condition || weather.weather?.[0]?.main || 'Sunny'}</p>
            </div>
            <div class="weather-item">
                <p class="weather-item-label">Humidity</p>
                <p class="weather-item-value">${weather.humidity || weather.main?.humidity || 65}%</p>
            </div>
            <div class="weather-item">
                <p class="weather-item-label">Wind Speed</p>
                <p class="weather-item-value">${weather.windSpeed || weather.wind?.speed || 12} km/h</p>
            </div>
        </div>
    `;
    elements.weatherCard.innerHTML = weatherHTML;
}

// ==========================================
// MAP FUNCTIONALITY
// ==========================================
function updateMapCenter() {
    if (!state.userLocation) return;

    const mapElement = document.getElementById('map');
    const { lat, lng } = state.userLocation;

    // Update placeholder with user coordinates
    // In production, integrate Leaflet.js or Google Maps API
    mapElement.innerHTML = `
        <div style="text-align: center;">
            <p style="font-size: 1.1rem; margin: 0.5rem 0;">📍 Your Location</p>
            <p style="font-size: 0.9rem; color: #666;">Lat: ${lat.toFixed(4)}° | Lng: ${lng.toFixed(4)}°</p>
            <button class="btn btn-secondary" onclick="findNearbyBeaches()" style="margin-top: 1rem;">Find Nearby Beaches</button>
        </div>
    `;
}

function findNearbyBeaches() {
    showNotification('Searching for nearby beaches... 🏖️', 'info');
    // In production: Use Google Places API or custom beach database
    setTimeout(() => {
        showNotification('Found 5 beaches nearby! 🎉', 'success');
    }, 1500);
}

// ==========================================
// CREW MANAGEMENT
// ==========================================
function openCrewModal() {
    elements.modal.classList.add('active');
    document.getElementById('modalTitle').textContent = 'Create New Crew';
}

function closeModal() {
    elements.modal.classList.remove('active');
    elements.crewForm.reset();
}

function createCrew(e) {
    e.preventDefault();

    const crewName = document.getElementById('crewName').value.trim();
    const crewLocation = document.getElementById('crewLocation').value.trim();

    if (!crewName || !crewLocation) {
        showNotification('Please fill all fields', 'warning');
        return;
    }

    const newCrew = {
        id: Date.now(),
        name: crewName,
        location: crewLocation,
        members: [state.currentUser.name],
        created: new Date().toLocaleDateString(),
        memberCount: 1
    };

    state.crews.push(newCrew);
    saveLocalData();
    renderCrews();
    closeModal();
    showNotification(`Crew "${crewName}" created! 🎉`, 'success');
}

function renderCrews() {
    if (state.crews.length === 0) {
        elements.crewList.innerHTML = '<p class="empty-state">No crews yet. Create one to get started!</p>';
        return;
    }

    const crewsHTML = state.crews.map(crew => `
        <div class="crew-item">
            <p class="crew-item-name">👥 ${crew.name}</p>
            <p class="crew-item-location">📍 ${crew.location}</p>
            <p class="crew-item-members">${crew.memberCount} member${crew.memberCount > 1 ? 's' : ''}</p>
            <small style="color: #999;">Created: ${crew.created}</small>
        </div>
    `).join('');

    elements.crewList.innerHTML = crewsHTML;
}

// ==========================================
// EVENT MANAGEMENT
// ==========================================
function openEventModal() {
    elements.modal.classList.add('active');
    document.getElementById('modalTitle').textContent = 'Schedule Cleanup Event';

    elements.crewForm.innerHTML = `
        <div class="form-group">
            <label for="eventTitle">Event Title:</label>
            <input type="text" id="eventTitle" placeholder="e.g., Sunset Beach Cleanup" required>
        </div>
        <div class="form-group">
            <label for="eventDate">Date:</label>
            <input type="date" id="eventDate" required>
        </div>
        <div class="form-group">
            <label for="eventCrew">Select Crew:</label>
            <select id="eventCrew" required>
                <option value="">-- Choose a crew --</option>
                ${state.crews.map(crew => `<option value="${crew.id}">${crew.name}</option>`).join('')}
            </select>
        </div>
        <button type="submit" class="btn btn-primary">Schedule Event</button>
    `;

    elements.crewForm.onsubmit = createEvent;
}

function createEvent(e) {
    e.preventDefault();

    const eventTitle = document.getElementById('eventTitle').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const crewId = document.getElementById('eventCrew').value;

    if (!eventTitle || !eventDate || !crewId) {
        showNotification('Please fill all fields', 'warning');
        return;
    }

    const crew = state.crews.find(c => c.id == crewId);

    const newEvent = {
        id: Date.now(),
        title: eventTitle,
        date: eventDate,
        crew: crew.name,
        location: crew.location,
        participants: [state.currentUser.name],
        participantCount: 1,
        status: 'upcoming'
    };

    state.events.push(newEvent);
    saveLocalData();
    renderEvents();
    closeModal();
    showNotification(`Event "${eventTitle}" scheduled! 📅`, 'success');
}

function renderEvents() {
    if (state.events.length === 0) {
        elements.eventsContainer.innerHTML = '<p class="empty-state">No events scheduled yet. Create one!</p>';
        return;
    }

    const eventsHTML = state.events.map(event => `
        <div class="event-card">
            <span class="event-date">${formatDate(event.date)}</span>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-location">📍 ${event.location}</p>
            <p style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">👥 ${event.crew}</p>
            <p class="event-participants">${event.participantCount} participant${event.participantCount > 1 ? 's' : ''}</p>
            <button class="btn btn-secondary" onclick="joinEvent(${event.id})" style="width: 100%; margin-top: 1rem;">Join Event</button>
        </div>
    `).join('');

    elements.eventsContainer.innerHTML = eventsHTML;
}

function joinEvent(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (event && !event.participants.includes(state.currentUser.name)) {
        event.participants.push(state.currentUser.name);
        event.participantCount++;
        saveLocalData();
        renderEvents();
        showNotification(`You joined "${event.title}"! 🌊`, 'success');
    }
}

// ==========================================
// LOCAL STORAGE
// ==========================================
function saveLocalData() {
    localStorage.setItem('shoresquad_crews', JSON.stringify(state.crews));
    localStorage.setItem('shoresquad_events', JSON.stringify(state.events));
}

function loadLocalData() {
    const savedCrews = localStorage.getItem('shoresquad_crews');
    const savedEvents = localStorage.getItem('shoresquad_events');

    if (savedCrews) state.crews = JSON.parse(savedCrews);
    if (savedEvents) state.events = JSON.parse(savedEvents);

    renderCrews();
    renderEvents();
}

// ==========================================
// NAVIGATION
// ==========================================
function toggleNavMenu() {
    elements.navMenu.classList.toggle('active');
}

function closeNavMenu() {
    elements.navMenu.classList.remove('active');
}

// Close mobile menu when a link is clicked
elements.navLinks.forEach(link => {
    link.addEventListener('click', closeNavMenu);
});

// ==========================================
// PERFORMANCE OPTIMIZATION
// ==========================================
// Debounce function for resize events
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==========================================
// UTILITIES
// ==========================================
function renderEmptyStates() {
    if (state.crews.length === 0) {
        elements.crewList.innerHTML = '<p class="empty-state">No crews yet. Create one to get started!</p>';
    }
    if (state.events.length === 0) {
        elements.eventsContainer.innerHTML = '<p class="empty-state">No events scheduled yet. Create one!</p>';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    // Set type-specific styles
    const typeStyles = {
        success: {
            background: '#2ECC71',
            color: '#fff'
        },
        error: {
            background: '#E74C3C',
            color: '#fff'
        },
        warning: {
            background: '#F39C12',
            color: '#fff'
        },
        info: {
            background: '#00A8E8',
            color: '#fff'
        }
    };

    const style = typeStyles[type] || typeStyles.info;
    Object.assign(notification.style, style);

    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// EVENT LISTENERS
// ==========================================
function attachEventListeners() {
    // Navigation
    elements.navToggle?.addEventListener('click', toggleNavMenu);

    // Buttons
    elements.startBtn?.addEventListener('click', () => {
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    });

    elements.weatherBtn?.addEventListener('click', getWeather);
    elements.createCrewBtn?.addEventListener('click', openCrewModal);
    elements.scheduleEventBtn?.addEventListener('click', openEventModal);

    // Modal
    elements.closeBtn?.addEventListener('click', closeModal);
    elements.modal?.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });

    elements.crewForm?.addEventListener('submit', createCrew);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ==========================================
// EXPORTS FOR TESTING
// ==========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        state,
        getWeather,
        createCrew,
        createEvent,
        joinEvent
    };
}
