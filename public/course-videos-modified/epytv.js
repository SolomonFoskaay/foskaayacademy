/**
 * Version: 2.0.4 - Basic
 */

// Configuration
const config = {
    API_BASE_URL: 'https://api.embedprivatevideo.com/embed.php',
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
    // YouTube API is ready
    console.log('YouTube API Ready');
}

// Handle play button click
function clickToPlay(videoId) {
    const container = document.querySelector('.epyv-video-container');
    const playButton = document.querySelector(`#playButton\\[${videoId}\\]`);
    const playerDiv = document.getElementById(videoId);
    
    // Check authorization
    fetch(`${config.API_BASE_URL}?v=${config.API_VERSION}&videos=${videoId}&client=${window.location.hostname}`)
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
    // Handle player state changes if needed
}

function onPlayerError(event) {
    showError('Video playback error');
}

// Utility functions
function showError(message) {
    const container = document.querySelector('.epyv-video-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
}

// Define error messages
const errorMessages = {
    0: "Service unavailable",
    1: "Unregistered video",  
    2: "Unregistered client",  
    3: "No client ID",  
    4: "Video unavailable",
    5: "OK",
    6: "Processing video"
};

// Initialize YouTube API
function init() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

init();

// Handle play button click
document.addEventListener('DOMContentLoaded', function() {
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoId = button.getAttribute('data-video-id');
            clickToPlay(videoId);
        });
    });
});
