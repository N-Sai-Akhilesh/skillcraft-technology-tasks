// Stopwatch functionality
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let lapCount = 0;

// Get DOM elements
const timeDisplay = document.getElementById('timeDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const lapList = document.getElementById('lapList');

// Format time to MM:SS:MS
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
}

// Update time display
function updateDisplay() {
    const currentTime = elapsedTime + (isRunning ? Date.now() - startTime : 0);
    timeDisplay.textContent = formatTime(currentTime);
}

// Start stopwatch
function start() {
    if (!isRunning) {
        startTime = Date.now();
        isRunning = true;
        timerInterval = setInterval(updateDisplay, 10);
        
        // Update button states
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        lapBtn.disabled = false;
    }
}

// Pause stopwatch
function pause() {
    if (isRunning) {
        elapsedTime += Date.now() - startTime;
        isRunning = false;
        clearInterval(timerInterval);
        
        // Update button states
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        lapBtn.disabled = true;
    }
}

// Reset stopwatch
function reset() {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedTime = 0;
    lapCount = 0;
    
    // Update display
    timeDisplay.textContent = '00:00:00';
    
    // Clear lap times
    lapList.innerHTML = '<p class="no-laps">No lap times recorded</p>';
    
    // Reset button states
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    lapBtn.disabled = true;
}

// Record lap time
function recordLap() {
    if (isRunning) {
        lapCount++;
        const currentTime = elapsedTime + (Date.now() - startTime);
        const lapTime = formatTime(currentTime);
        
        // Remove "no laps" message if it exists
        if (lapCount === 1) {
            lapList.innerHTML = '';
        }
        
        // Create lap item
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <span class="lap-number">Lap ${lapCount}</span>
            <span class="lap-time">${lapTime}</span>
        `;
        
        // Add to top of list
        lapList.insertBefore(lapItem, lapList.firstChild);
    }
}

// Event listeners
startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', recordLap);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            if (isRunning) {
                pause();
            } else {
                start();
            }
            break;
        case 'KeyR':
            if (e.ctrlKey) {
                e.preventDefault();
                reset();
            }
            break;
        case 'KeyL':
            if (e.ctrlKey && isRunning) {
                e.preventDefault();
                recordLap();
            }
            break;
    }
});

// Initialize display
updateDisplay();