/**
 * Version: 2.0.4 - Basic
 */

// Configuration
const config = {
    API_BASE_URL: 'https://api.embedprivatevideo.com/v2/embed.php',  // Updated API endpoint
    API_VERSION: '6',
    DEFAULT_PARAMS: {
        controls: 1,
        rel: 1,
        modestbranding: 1,
        showinfo: 1,
        fs: 1
    }
};

// Player state
let player = null;
let isCountingDown = false;

// Initialize YouTube API
function onYouTubeIframeAPIReady() {
    console.log('YouTube API Ready');
}

// Handle play button click
function clickToPlay(videoId) {
    const container = document.querySelector('.epyv-video-container');
    const playButton = document.querySelector(`#playButton\\[${videoId}\\]`);
    const playerDiv = document.getElementById(videoId);
    
    // Enhanced API call with additional headers
    fetch(`${config.API_BASE_URL}?v=${config.API_VERSION}&videos=${videoId}&client=${window.location.hostname}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin
        },
        credentials: 'include'  // Include cookies for authentication
    })
    .then(response => response.json())
    .then(data => {
        if (data.responseCode === 5) { // Success code from API
            initializePlayer(videoId, playerDiv);
            if (playButton) playButton.style.display = 'none';
        } else {
            showError(data.responseCode || 'Unauthorized video');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Service unavailable');
    });
}

// Initialize YouTube player
function initializePlayer(videoId, playerDiv) {
    if (!player) {
        player = new YT.Player(videoId, {
            videoId: videoId,
            playerVars: config.DEFAULT_PARAMS,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    }
}

// Player event handlers
function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    // Handle player state changes
}

function onPlayerError(event) {
    showError('Video playback error');
}

// Utility functions
function showError(message) {
    const container = document.querySelector('.epyv-video-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = typeof errorMessages[message] !== 'undefined' ? 
        errorMessages[message] : message;
    container.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Define error messages
const errorMessages = {
    0: "Service unavailable",
    1: "Unregistered video",
    2: "Invalid domain",
    3: "Domain not authorized",
    4: "Invalid video ID",
    5: "Success",
    6: "API version not supported"
};

// Initialize
function init() {
    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

init();

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.play-button');
    buttons.forEach(button => {
        const videoId = button.getAttribute('data-video-id');
        if (videoId) {
            button.addEventListener('click', () => clickToPlay(videoId));
        }
    });
});
