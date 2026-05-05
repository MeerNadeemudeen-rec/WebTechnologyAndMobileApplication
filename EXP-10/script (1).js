/**
 * Attention Span Tester
 * A web application to measure and analyze user focus through interactive challenges.
 * 
 * @author Claude
 * @version 1.0.0
 */

// ============================================
// Application State
// ============================================

const state = {
    // Test configuration
    difficulty: 'medium',
    durations: {
        easy: 30,
        medium: 45,
        hard: 60
    },
    
    // Test tracking
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    testDuration: 45,
    
    // Orb position and movement
    orbX: 0,
    orbY: 0,
    orbTargetX: 0,
    orbTargetY: 0,
    orbSpeed: 0.02, // Interpolation speed
    
    // Cursor tracking
    cursorX: 0,
    cursorY: 0,
    lastCursorMove: Date.now(),
    
    // Performance metrics
    totalSamples: 0,
    accurateSamples: 0,
    idleCount: 0,
    tabSwitches: 0,
    
    // Focus tracking
    currentFocus: 100,
    focusHistory: [],
    
    // Thresholds
    accuracyThreshold: 100, // Distance threshold for accurate tracking
    idleThreshold: 2000, // ms before considered idle
    
    // Animation
    animationFrame: null,
    timerInterval: null
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    // Screens
    landing: document.getElementById('landing'),
    test: document.getElementById('test'),
    results: document.getElementById('results'),
    
    // Landing page
    startBtn: document.getElementById('startBtn'),
    difficultyBtns: document.querySelectorAll('.diff-btn'),
    
    // Test screen
    gameArea: document.getElementById('gameArea'),
    targetOrb: document.getElementById('targetOrb'),
    cursorTrail: document.getElementById('cursorTrail'),
    timer: document.getElementById('timer'),
    accuracy: document.getElementById('accuracy'),
    distractions: document.getElementById('distractions'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    warningOverlay: document.getElementById('warningOverlay'),
    tabWarning: document.getElementById('tabWarning'),
    focusFill: document.getElementById('focusFill'),
    focusLevel: document.getElementById('focusLevel'),
    
    // Results screen
    scoreCircle: document.getElementById('scoreCircle'),
    scoreRing: document.getElementById('scoreRing'),
    scoreValue: document.getElementById('scoreValue'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    totalTime: document.getElementById('totalTime'),
    trackingAccuracy: document.getElementById('trackingAccuracy'),
    idleMoments: document.getElementById('idleMoments'),
    tabSwitches: document.getElementById('tabSwitches'),
    consistencyBar: document.getElementById('consistencyBar'),
    consistencyValue: document.getElementById('consistencyValue'),
    responsivenessBar: document.getElementById('responsivenessBar'),
    responsivenessValue: document.getElementById('responsivenessValue'),
    enduranceBar: document.getElementById('enduranceBar'),
    enduranceValue: document.getElementById('enduranceValue'),
    retryBtn: document.getElementById('retryBtn'),
    shareBtn: document.getElementById('shareBtn'),
    
    // Audio
    alertSound: document.getElementById('alertSound')
};

// ============================================
// Utility Functions
// ============================================

/**
 * Formats seconds into MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates distance between two points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Distance between points
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

/**
 * Generates a random position within the game area
 * @returns {Object} Object with x and y coordinates
 */
function getRandomPosition() {
    const rect = elements.gameArea.getBoundingClientRect();
    const padding = 50;
    return {
        x: padding + Math.random() * (rect.width - padding * 2),
        y: padding + Math.random() * (rect.height - padding * 2)
    };
}

/**
 * Clamps a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Plays the alert sound
 */
function playAlertSound() {
    try {
        elements.alertSound.currentTime = 0;
        elements.alertSound.play().catch(() => {
            // Ignore autoplay restrictions
        });
    } catch (e) {
        // Audio not supported
    }
}

// ============================================
// Screen Management
// ============================================

/**
 * Switches between application screens
 * @param {string} screenId - ID of the screen to show
 */
function showScreen(screenId) {
    // Hide all screens
    elements.landing.classList.remove('active');
    elements.test.classList.remove('active');
    elements.results.classList.remove('active');
    
    // Show requested screen
    document.getElementById(screenId).classList.add('active');
}

// ============================================
// Test Initialization
// ============================================

/**
 * Initializes and starts the attention test
 */
function startTest() {
    // Reset state
    state.isRunning = true;
    state.startTime = Date.now();
    state.elapsedTime = 0;
    state.testDuration = state.durations[state.difficulty];
    state.totalSamples = 0;
    state.accurateSamples = 0;
    state.idleCount = 0;
    state.tabSwitches = 0;
    state.currentFocus = 100;
    state.focusHistory = [];
    state.lastCursorMove = Date.now();
    
    // Initialize orb position
    const initialPos = getRandomPosition();
    state.orbX = initialPos.x;
    state.orbY = initialPos.y;
    state.orbTargetX = initialPos.x;
    state.orbTargetY = initialPos.y;
    
    // Position the orb
    updateOrbPosition();
    
    // Set new target after a delay
    scheduleNewTarget();
    
    // Show test screen
    showScreen('test');
    
    // Start game loop
    state.animationFrame = requestAnimationFrame(gameLoop);
    
    // Start timer
    state.timerInterval = setInterval(updateTimer, 100);
}

/**
 * Updates the orb visual position
 */
function updateOrbPosition() {
    elements.targetOrb.style.left = `${state.orbX}px`;
    elements.targetOrb.style.top = `${state.orbY}px`;
}

/**
 * Schedules a new random target position for the orb
 */
function scheduleNewTarget() {
    if (!state.isRunning) return;
    
    const newTarget = getRandomPosition();
    state.orbTargetX = newTarget.x;
    state.orbTargetY = newTarget.y;
    
    // Adjust speed based on difficulty
    const speedMultipliers = {
        easy: 0.015,
        medium: 0.025,
        hard: 0.04
    };
    state.orbSpeed = speedMultipliers[state.difficulty];
    
    // Schedule next target change
    const intervals = {
        easy: 4000,
        medium: 3000,
        hard: 2000
    };
    
    setTimeout(scheduleNewTarget, intervals[state.difficulty] + Math.random() * 1000);
}

// ============================================
// Game Loop
// ============================================

/**
 * Main game loop - updates orb position and tracks performance
 */
function gameLoop() {
    if (!state.isRunning) return;
    
    // Smoothly move orb towards target
    state.orbX = lerp(state.orbX, state.orbTargetX, state.orbSpeed);
    state.orbY = lerp(state.orbY, state.orbTargetY, state.orbSpeed);
    updateOrbPosition();
    
    // Track accuracy
    trackAccuracy();
    
    // Check for idle state
    checkIdleState();
    
    // Update focus meter
    updateFocusMeter();
    
    // Continue loop
    state.animationFrame = requestAnimationFrame(gameLoop);
}

/**
 * Tracks how accurately the user is following the orb
 */
function trackAccuracy() {
    const rect = elements.gameArea.getBoundingClientRect();
    const relativeX = state.cursorX - rect.left;
    const relativeY = state.cursorY - rect.top;
    
    const dist = distance(relativeX, relativeY, state.orbX, state.orbY);
    
    state.totalSamples++;
    
    if (dist <= state.accuracyThreshold) {
        state.accurateSamples++;
    }
    
    // Update accuracy display
    const accuracyPercent = state.totalSamples > 0 
        ? Math.round((state.accurateSamples / state.totalSamples) * 100) 
        : 100;
    elements.accuracy.textContent = `${accuracyPercent}%`;
    
    // Update current focus based on recent accuracy
    const recentWeight = 0.1;
    const isAccurate = dist <= state.accuracyThreshold;
    state.currentFocus = lerp(
        state.currentFocus, 
        isAccurate ? 100 : Math.max(0, state.currentFocus - 20), 
        recentWeight
    );
}

/**
 * Checks if the user has been idle
 */
function checkIdleState() {
    const idleTime = Date.now() - state.lastCursorMove;
    
    if (idleTime > state.idleThreshold) {
        // Show warning
        if (!elements.warningOverlay.classList.contains('active')) {
            elements.warningOverlay.classList.add('active');
            state.idleCount++;
            state.currentFocus = Math.max(0, state.currentFocus - 15);
            elements.distractions.textContent = state.idleCount + state.tabSwitches;
            playAlertSound();
        }
    } else {
        elements.warningOverlay.classList.remove('active');
    }
}

/**
 * Updates the focus meter display
 */
function updateFocusMeter() {
    elements.focusFill.style.width = `${state.currentFocus}%`;
    
    // Update focus level text and color
    let level, color;
    if (state.currentFocus >= 80) {
        level = 'Excellent';
        color = 'var(--success)';
    } else if (state.currentFocus >= 60) {
        level = 'Good';
        color = 'var(--accent-primary)';
    } else if (state.currentFocus >= 40) {
        level = 'Fair';
        color = 'var(--warning)';
    } else {
        level = 'Poor';
        color = 'var(--danger)';
    }
    
    elements.focusLevel.textContent = level;
    elements.focusLevel.style.color = color;
    
    // Track focus history for endurance calculation
    state.focusHistory.push(state.currentFocus);
}

/**
 * Updates the timer display
 */
function updateTimer() {
    if (!state.isRunning) return;
    
    state.elapsedTime = (Date.now() - state.startTime) / 1000;
    
    // Update timer display
    elements.timer.textContent = formatTime(state.elapsedTime);
    
    // Update progress bar
    const progress = (state.elapsedTime / state.testDuration) * 100;
    elements.progressFill.style.width = `${Math.min(progress, 100)}%`;
    elements.progressText.textContent = `${Math.round(Math.min(progress, 100))}%`;
    
    // Check if test is complete
    if (state.elapsedTime >= state.testDuration) {
        endTest();
    }
}

/**
 * Ends the test and shows results
 */
function endTest() {
    state.isRunning = false;
    
    // Stop animation and timer
    cancelAnimationFrame(state.animationFrame);
    clearInterval(state.timerInterval);
    
    // Calculate and display results
    calculateResults();
    showScreen('results');
}

// ============================================
// Results Calculation
// ============================================

/**
 * Calculates and displays the test results
 */
function calculateResults() {
    // Calculate base accuracy score
    const accuracyScore = state.totalSamples > 0 
        ? (state.accurateSamples / state.totalSamples) * 100 
        : 0;
    
    // Calculate distraction penalty
    const totalDistractions = state.idleCount + state.tabSwitches;
    const distractionPenalty = Math.min(totalDistractions * 5, 30);
    
    // Calculate consistency (how stable was focus throughout)
    let consistency = 100;
    if (state.focusHistory.length > 1) {
        let variance = 0;
        const avg = state.focusHistory.reduce((a, b) => a + b, 0) / state.focusHistory.length;
        state.focusHistory.forEach(val => {
            variance += Math.pow(val - avg, 2);
        });
        variance /= state.focusHistory.length;
        consistency = Math.max(0, 100 - Math.sqrt(variance));
    }
    
    // Calculate endurance (did focus remain high throughout?)
    let endurance = 100;
    if (state.focusHistory.length > 10) {
        const firstHalf = state.focusHistory.slice(0, Math.floor(state.focusHistory.length / 2));
        const secondHalf = state.focusHistory.slice(Math.floor(state.focusHistory.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        endurance = Math.max(0, 100 - Math.abs(firstAvg - secondAvg));
    }
    
    // Calculate responsiveness (inverse of idle moments)
    const responsiveness = Math.max(0, 100 - (state.idleCount * 15));
    
    // Calculate final score
    const finalScore = Math.round(
        (accuracyScore * 0.4) + 
        (consistency * 0.2) + 
        (endurance * 0.2) + 
        (responsiveness * 0.2) - 
        distractionPenalty
    );
    const clampedScore = clamp(finalScore, 0, 100);
    
    // Determine focus category
    let category, message, titleClass;
    if (clampedScore >= 80) {
        category = 'High Focus';
        message = 'Excellent! You have exceptional concentration abilities. Your focus remained consistent throughout the test with minimal distractions.';
        titleClass = 'high-focus';
        elements.scoreCircle.className = 'score-circle high';
    } else if (clampedScore >= 50) {
        category = 'Moderate Focus';
        message = 'Good job! Your attention span is average. With practice, you can improve your ability to maintain focus for longer periods.';
        titleClass = 'moderate-focus';
        elements.scoreCircle.className = 'score-circle moderate';
    } else {
        category = 'Easily Distracted';
        message = 'You tend to get distracted easily. Try minimizing distractions and practicing mindfulness to improve your focus.';
        titleClass = 'low-focus';
        elements.scoreCircle.className = 'score-circle low';
    }
    
    // Animate score display
    animateScore(clampedScore);
    
    // Update result text
    elements.resultTitle.textContent = category;
    elements.resultTitle.className = `result-title ${titleClass}`;
    elements.resultMessage.textContent = message;
    
    // Update details
    elements.totalTime.textContent = formatTime(state.elapsedTime);
    elements.trackingAccuracy.textContent = `${Math.round(accuracyScore)}%`;
    elements.idleMoments.textContent = state.idleCount.toString();
    elements.tabSwitches.textContent = state.tabSwitches.toString();
    
    // Animate breakdown bars
    setTimeout(() => {
        elements.consistencyBar.style.width = `${consistency}%`;
        elements.consistencyValue.textContent = `${Math.round(consistency)}%`;
        
        elements.responsivenessBar.style.width = `${responsiveness}%`;
        elements.responsivenessValue.textContent = `${Math.round(responsiveness)}%`;
        
        elements.enduranceBar.style.width = `${endurance}%`;
        elements.enduranceValue.textContent = `${Math.round(endurance)}%`;
    }, 500);
}

/**
 * Animates the score circle and value
 * @param {number} targetScore - Final score to animate to
 */
function animateScore(targetScore) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (targetScore / 100) * circumference;
    
    // Animate the ring
    elements.scoreRing.style.strokeDasharray = circumference;
    setTimeout(() => {
        elements.scoreRing.style.strokeDashoffset = offset;
    }, 100);
    
    // Animate the number
    let currentScore = 0;
    const increment = targetScore / 50;
    const interval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(interval);
        }
        elements.scoreValue.textContent = Math.round(currentScore);
    }, 30);
}

// ============================================
// Event Handlers
// ============================================

/**
 * Handles cursor movement in the game area
 * @param {MouseEvent} e - Mouse event
 */
function handleMouseMove(e) {
    state.cursorX = e.clientX;
    state.cursorY = e.clientY;
    state.lastCursorMove = Date.now();
    
    // Update cursor trail position
    const rect = elements.gameArea.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    
    // Clamp to game area bounds
    const clampedX = clamp(relativeX, 0, rect.width);
    const clampedY = clamp(relativeY, 0, rect.height);
    
    elements.cursorTrail.style.left = `${clampedX}px`;
    elements.cursorTrail.style.top = `${clampedY}px`;
}

/**
 * Handles touch movement for mobile devices
 * @param {TouchEvent} e - Touch event
 */
function handleTouchMove(e) {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        state.cursorX = touch.clientX;
        state.cursorY = touch.clientY;
        state.lastCursorMove = Date.now();
        
        // Update cursor trail position
        const rect = elements.gameArea.getBoundingClientRect();
        const relativeX = touch.clientX - rect.left;
        const relativeY = touch.clientY - rect.top;
        
        elements.cursorTrail.style.left = `${clamp(relativeX, 0, rect.width)}px`;
        elements.cursorTrail.style.top = `${clamp(relativeY, 0, rect.height)}px`;
        
        e.preventDefault();
    }
}

/**
 * Handles page visibility changes (tab switching)
 */
function handleVisibilityChange() {
    if (document.hidden && state.isRunning) {
        state.tabSwitches++;
        state.currentFocus = Math.max(0, state.currentFocus - 20);
        elements.distractions.textContent = state.idleCount + state.tabSwitches;
        elements.tabWarning.classList.add('active');
        playAlertSound();
    } else {
        elements.tabWarning.classList.remove('active');
    }
}

/**
 * Handles difficulty button clicks
 * @param {MouseEvent} e - Click event
 */
function handleDifficultyClick(e) {
    const btn = e.target.closest('.diff-btn');
    if (!btn) return;
    
    // Update active state
    elements.difficultyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update state
    state.difficulty = btn.dataset.difficulty;
}

/**
 * Handles share button click
 */
function handleShare() {
    const score = elements.scoreValue.textContent;
    const category = elements.resultTitle.textContent;
    
    const shareText = `I scored ${score}% on the Attention Span Tester! My result: ${category}. Can you beat my score? 🎯`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Attention Span Tester Results',
            text: shareText,
            url: window.location.href
        }).catch(() => {
            // User cancelled or share failed
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

/**
 * Copies text to clipboard and shows feedback
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = elements.shareBtn.querySelector('span').textContent;
        elements.shareBtn.querySelector('span').textContent = 'Copied!';
        setTimeout(() => {
            elements.shareBtn.querySelector('span').textContent = originalText;
        }, 2000);
    }).catch(() => {
        alert('Could not copy to clipboard. Your score: ' + elements.scoreValue.textContent + '%');
    });
}

/**
 * Resets the application to the landing page
 */
function resetToLanding() {
    state.isRunning = false;
    cancelAnimationFrame(state.animationFrame);
    clearInterval(state.timerInterval);
    
    // Reset UI elements
    elements.timer.textContent = '00:00';
    elements.accuracy.textContent = '100%';
    elements.distractions.textContent = '0';
    elements.progressFill.style.width = '0%';
    elements.progressText.textContent = '0%';
    elements.focusFill.style.width = '100%';
    elements.focusLevel.textContent = 'Excellent';
    elements.warningOverlay.classList.remove('active');
    elements.tabWarning.classList.remove('active');
    
    // Reset score ring
    elements.scoreRing.style.strokeDashoffset = '283';
    
    // Reset breakdown bars
    elements.consistencyBar.style.width = '0%';
    elements.responsivenessBar.style.width = '0%';
    elements.enduranceBar.style.width = '0%';
    
    showScreen('landing');
}

// ============================================
// Event Listeners
// ============================================

// Landing page
elements.startBtn.addEventListener('click', startTest);
elements.difficultyBtns.forEach(btn => {
    btn.addEventListener('click', handleDifficultyClick);
});

// Game area
elements.gameArea.addEventListener('mousemove', handleMouseMove);
elements.gameArea.addEventListener('touchmove', handleTouchMove, { passive: false });

// Page visibility
document.addEventListener('visibilitychange', handleVisibilityChange);

// Results page
elements.retryBtn.addEventListener('click', resetToLanding);
elements.shareBtn.addEventListener('click', handleShare);

// Prevent context menu in game area
elements.gameArea.addEventListener('contextmenu', e => e.preventDefault());

// ============================================
// Initialization
// ============================================

// Add SVG gradient definition for score ring
const svgNS = '[w3.org](http://www.w3.org/2000/svg)';
const scoreCircleSvg = elements.scoreCircle.querySelector('svg');
const defs = document.createElementNS(svgNS, 'defs');
const gradient = document.createElementNS(svgNS, 'linearGradient');
gradient.setAttribute('id', 'scoreGradient');
gradient.setAttribute('x1', '0%');
gradient.setAttribute('y1', '0%');
gradient.setAttribute('x2', '100%');
gradient.setAttribute('y2', '100%');

const stop1 = document.createElementNS(svgNS, 'stop');
stop1.setAttribute('offset', '0%');
stop1.setAttribute('stop-color', '#6366f1');

const stop2 = document.createElementNS(svgNS, 'stop');
stop2.setAttribute('offset', '100%');
stop2.setAttribute('stop-color', '#a855f7');

gradient.appendChild(stop1);
gradient.appendChild(stop2);
defs.appendChild(gradient);
scoreCircleSvg.insertBefore(defs, scoreCircleSvg.firstChild);

// Log initialization
console.log('🎯 Attention Span Tester initialized');
console.log('Select difficulty and click "Begin Test" to start');
