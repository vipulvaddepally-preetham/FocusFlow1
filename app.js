/**
 * FocusFlow - Student Productivity App
 * A minimal, distraction-free productivity tool
 * 
 * Core Functions:
 * - saveData(): Persist all app data to localStorage
 * - loadData(): Load saved data from localStorage
 * - updateUI(): Refresh all UI components
 */

// ============================================================
// DATA STRUCTURE & STATE
// ============================================================

/**
 * Default data structure for new users
 */
const DEFAULT_DATA = {
    tasks: [],
    timetable: {},
    settings: {
        darkMode: false,
        userName: 'Student'
    },
    timer: {
        seconds: 25 * 60,
        isRunning: false
    }
};

// Application state
let appData = {};
let currentFilter = 'all';
let timerInterval = null;

// ============================================================
// CORE DATA FUNCTIONS
// ============================================================

/**
 * Save all application data to localStorage
 * Called after any data modification
 */
function saveData() {
    try {
        localStorage.setItem('focusflow_data', JSON.stringify(appData));
    } catch (error) {
        console.error('Failed to save data:', error);
    }
}

/**
 * Load application data from localStorage
 * Initializes with defaults if no saved data exists
 */
function loadData() {
    try {
        const saved = localStorage.getItem('focusflow_data');
        if (saved) {
            appData = JSON.parse(saved);
            // Ensure all required properties exist (for backwards compatibility)
            appData.tasks = appData.tasks || [];
            appData.timetable = appData.timetable || {};
            appData.settings = appData.settings || DEFAULT_DATA.settings;
            appData.timer = appData.timer || DEFAULT_DATA.timer;
        } else {
            appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
}

/**
 * Update all UI components to reflect current data state
 * Called after data changes or on initial load
 */
function updateUI() {
    updateGreeting();
    updateTodaysTasks();
    updateDailyProgress();
    updateFullTaskList();
    updateTimetable();
    updateWeeklyView();
    updateTimerDisplay();
    applyTheme();
    updateSettingsUI();
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Generate a unique ID for new items
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get today's date as YYYY-MM-DD string
 */
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Format date string for display (e.g., "Jan 31")
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get full date string for display (e.g., "Friday, January 31, 2026")
 */
function getFullDateString() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}

/**
 * Get appropriate greeting based on time of day
 */
function getGreetingTime() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================
// DASHBOARD FUNCTIONS
// ============================================================

/**
 * Update the greeting section with user name and date
 */
function updateGreeting() {
    const greetingEl = document.getElementById('greeting');
    const dateEl = document.getElementById('currentDate');
    const userName = appData.settings?.userName || 'Student';

    greetingEl.textContent = `${getGreetingTime()}, ${userName}`;
    dateEl.textContent = getFullDateString();
}

/**
 * Get all tasks due today
 */
function getTodaysTasks() {
    const today = getTodayDateString();
    return appData.tasks.filter(task => task.dueDate === today);
}

/**
 * Render today's tasks in the dashboard card
 */
function updateTodaysTasks() {
    const container = document.getElementById('todayTasksList');
    const todayTasks = getTodaysTasks();

    if (todayTasks.length === 0) {
        container.innerHTML = '<div class="empty-state">No tasks for today. Add one below!</div>';
        return;
    }

    // Sort: active tasks first, completed at bottom
    const sortedTasks = [...todayTasks].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    container.innerHTML = sortedTasks.map(task => createTaskItemHTML(task, true)).join('');
}

/**
 * Update the daily progress bar
 */
function updateDailyProgress() {
    const todayTasks = getTodaysTasks();
    const total = todayTasks.length;
    const completed = todayTasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const fillEl = document.getElementById('progressFill');
    const textEl = document.getElementById('progressText');

    fillEl.style.width = `${percentage}%`;
    textEl.textContent = total > 0
        ? `${percentage}% completed (${completed}/${total} tasks)`
        : 'No tasks for today';
}

// ============================================================
// TASK MANAGEMENT FUNCTIONS
// ============================================================

/**
 * Create HTML for a task item
 * @param {Object} task - The task object
 * @param {boolean} isDashboard - Whether this is for dashboard (simplified view)
 */
function createTaskItemHTML(task, isDashboard = false) {
    const priorityClass = task.priority || 'medium';
    const priorityLabel = priorityClass.charAt(0).toUpperCase() + priorityClass.slice(1);
    const completedClass = task.completed ? 'completed' : '';
    const dueDateDisplay = task.dueDate ? formatDate(task.dueDate) : '';

    return `
        <div class="task-item ${completedClass}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask('${task.id}')">
            <span class="task-title">${escapeHtml(task.title)}</span>
            ${!isDashboard ? `<span class="task-priority ${priorityClass}">${priorityLabel}</span>` : ''}
            ${dueDateDisplay && !isDashboard ? `<span class="task-due">${dueDateDisplay}</span>` : ''}
            ${!isDashboard ? `<button class="task-delete" onclick="deleteTask('${task.id}')" aria-label="Delete task">&times;</button>` : ''}
        </div>
    `;
}

/**
 * Add a new task
 * @param {string} title - Task title
 * @param {string} priority - Priority level (high/medium/low)
 * @param {string|null} dueDate - Due date in YYYY-MM-DD format
 */
function addTask(title, priority = 'medium', dueDate = null) {
    if (!title.trim()) return;

    const task = {
        id: generateId(),
        title: title.trim(),
        priority: priority,
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString()
    };

    appData.tasks.push(task);
    saveData();
    updateUI();
}

/**
 * Toggle task completion status
 * @param {string} taskId - The task ID to toggle
 */
function toggleTask(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveData();
        updateUI();
    }
}

/**
 * Delete a task
 * @param {string} taskId - The task ID to delete
 */
function deleteTask(taskId) {
    appData.tasks = appData.tasks.filter(t => t.id !== taskId);
    saveData();
    updateUI();
}

/**
 * Update the full task list on Tasks page with current filter
 */
function updateFullTaskList() {
    const container = document.getElementById('fullTaskList');
    let filteredTasks = [...appData.tasks];

    // Apply current filter
    if (currentFilter === 'active') {
        filteredTasks = filteredTasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(t => t.completed);
    }

    // Sort: active first, then by due date
    filteredTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
    });

    if (filteredTasks.length === 0) {
        const messages = {
            all: 'No tasks yet. Add your first task above!',
            active: 'No active tasks. Great job!',
            completed: 'No completed tasks yet.'
        };
        container.innerHTML = `<div class="empty-state">${messages[currentFilter]}</div>`;
        return;
    }

    container.innerHTML = filteredTasks.map(task => createTaskItemHTML(task, false)).join('');
}

/**
 * Set the current task filter
 * @param {string} filter - Filter type (all/active/completed)
 */
function setFilter(filter) {
    currentFilter = filter;

    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    updateFullTaskList();
}

// ============================================================
// TIMETABLE FUNCTIONS
// ============================================================

/**
 * Render the timetable with hourly blocks
 */
function updateTimetable() {
    const container = document.getElementById('timetableContainer');
    const currentHour = new Date().getHours();
    let html = '';

    // Generate blocks for 6 AM to 10 PM
    for (let hour = 6; hour <= 22; hour++) {
        const timeLabel = formatTimeLabel(hour);
        const isCurrent = hour === currentHour;
        const savedValue = appData.timetable[hour] || '';

        html += `
            <div class="time-block ${isCurrent ? 'current' : ''}">
                <div class="time-label">${timeLabel}</div>
                <input type="text" class="time-input" 
                       placeholder="What's planned for this hour?"
                       value="${escapeHtml(savedValue)}"
                       data-hour="${hour}"
                       onchange="saveTimetableEntry(${hour}, this.value)"
                       oninput="saveTimetableEntry(${hour}, this.value)">
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Format hour number to readable time label
 */
function formatTimeLabel(hour) {
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
}

/**
 * Save a timetable entry
 * @param {number} hour - The hour (6-22)
 * @param {string} value - The activity text
 */
function saveTimetableEntry(hour, value) {
    appData.timetable[hour] = value;
    saveData();
}

// ============================================================
// WEEKLY VIEW FUNCTIONS
// ============================================================

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Get dates for the current week (Monday to Sunday)
 */
function getWeekDates() {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday

    // Calculate Monday of current week
    const monday = new Date(today);
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    monday.setDate(today.getDate() - daysFromMonday);

    // Generate dates for the week
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date.toISOString().split('T')[0]);
    }

    return weekDates;
}

/**
 * Get tasks for a specific date
 */
function getTasksForDate(dateString) {
    return appData.tasks.filter(task => task.dueDate === dateString);
}

/**
 * Render the weekly view with 7 day columns
 */
function updateWeeklyView() {
    const container = document.getElementById('weeklyBoard');
    const weekDates = getWeekDates();
    const today = getTodayDateString();

    let html = weekDates.map((dateString, index) => {
        const dayTasks = getTasksForDate(dateString);
        const isToday = dateString === today;

        // Sort: active first, then completed
        const sortedTasks = [...dayTasks].sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });

        const tasksHtml = sortedTasks.map(task => `
            <div class="day-task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" 
                       ${task.completed ? 'checked' : ''}
                       onchange="toggleTask('${task.id}')">
                <span>${escapeHtml(task.title)}</span>
                <button class="day-task-delete" onclick="deleteTask('${task.id}')" aria-label="Delete">&times;</button>
            </div>
        `).join('');

        return `
            <div class="day-column ${isToday ? 'today' : ''}" data-date="${dateString}">
                <div class="day-header">
                    <span class="day-name">${DAY_NAMES[index]}</span>
                    <span class="day-date">${formatDate(dateString)}</span>
                </div>
                <div class="day-tasks">${tasksHtml || '<div class="empty-state small">No tasks</div>'}</div>
                <div class="add-day-task">
                    <input type="text" class="input" placeholder="Add task..." 
                           id="weeklyInput-${dateString}"
                           onkeypress="handleWeeklyKeypress(event, '${dateString}')">
                    <button class="btn btn-primary" onclick="addWeeklyTask('${dateString}')" aria-label="Add task">+</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Add a task from weekly view
 */
function addWeeklyTask(dateString) {
    const input = document.getElementById(`weeklyInput-${dateString}`);
    const title = input.value.trim();

    if (!title) return;

    addTask(title, 'medium', dateString);
    input.value = '';
}

/**
 * Handle Enter key in weekly view input
 */
function handleWeeklyKeypress(event, dateString) {
    if (event.key === 'Enter') {
        addWeeklyTask(dateString);
    }
}

// ============================================================
// POMODORO TIMER FUNCTIONS
// ============================================================

/**
 * Update the timer display
 */
function updateTimerDisplay() {
    const seconds = appData.timer?.seconds ?? 25 * 60;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    document.getElementById('timerDisplay').textContent = display;

    // Update button states
    const startBtn = document.getElementById('timerStart');
    const pauseBtn = document.getElementById('timerPause');

    if (appData.timer?.isRunning) {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    } else {
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

/**
 * Start the Pomodoro timer
 */
function startTimer() {
    if (appData.timer.isRunning) return;

    appData.timer.isRunning = true;
    saveData();
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (appData.timer.seconds > 0) {
            appData.timer.seconds--;
            saveData();
            updateTimerDisplay();
        } else {
            // Timer complete
            pauseTimer();
            showTimerComplete();
            resetTimer();
        }
    }, 1000);
}

/**
 * Pause the Pomodoro timer
 */
function pauseTimer() {
    appData.timer.isRunning = false;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    saveData();
    updateTimerDisplay();
}

/**
 * Reset the Pomodoro timer to 25 minutes
 */
function resetTimer() {
    pauseTimer();
    appData.timer.seconds = 25 * 60;
    appData.timer.isRunning = false;
    saveData();
    updateTimerDisplay();
}

/**
 * Show timer completion alert
 */
function showTimerComplete() {
    // Try to play a sound or vibrate
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }

    // Show alert
    alert('🎉 Session Complete!\n\nGreat work! Take a 5-minute break.');
}

/**
 * Resume timer if it was running before page refresh
 */
function resumeTimerIfNeeded() {
    if (appData.timer?.isRunning) {
        appData.timer.isRunning = false; // Reset flag
        startTimer(); // Restart the interval
    }
}

// ============================================================
// THEME & SETTINGS FUNCTIONS
// ============================================================

/**
 * Apply the current theme (light/dark)
 */
function applyTheme() {
    if (appData.settings?.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    appData.settings.darkMode = !appData.settings.darkMode;
    saveData();
    applyTheme();
    updateSettingsUI();
}

/**
 * Update settings UI to reflect current values
 */
function updateSettingsUI() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const userNameInput = document.getElementById('userName');

    darkModeToggle.checked = appData.settings?.darkMode || false;
    userNameInput.value = appData.settings?.userName || 'Student';
}

/**
 * Save user name
 */
function saveUserName(name) {
    appData.settings.userName = name.trim() || 'Student';
    saveData();
    updateGreeting();
}

// ============================================================
// NAVIGATION FUNCTIONS
// ============================================================

/**
 * Navigate to a page
 * @param {string} pageName - The page to navigate to
 */
function navigateTo(pageName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Close mobile menu
    closeMobileMenu();
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('open');
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    document.getElementById('sidebar').classList.remove('open');
}

// ============================================================
// EVENT LISTENERS
// ============================================================

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });

    // Mobile menu toggle
    document.getElementById('menuToggle').addEventListener('click', toggleMobileMenu);

    // Dashboard quick add
    const quickAddBtn = document.getElementById('quickAddBtn');
    const quickAddInput = document.getElementById('quickAddInput');

    quickAddBtn.addEventListener('click', () => {
        const today = getTodayDateString();
        addTask(quickAddInput.value, 'medium', today);
        quickAddInput.value = '';
    });

    quickAddInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const today = getTodayDateString();
            addTask(quickAddInput.value, 'medium', today);
            quickAddInput.value = '';
        }
    });

    // Tasks page - Add task
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskTitleInput = document.getElementById('taskTitle');

    addTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;

        addTask(title, priority, dueDate);
        taskTitleInput.value = '';
    });

    taskTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });

    // Timer controls
    document.getElementById('timerStart').addEventListener('click', startTimer);
    document.getElementById('timerPause').addEventListener('click', pauseTimer);
    document.getElementById('timerReset').addEventListener('click', resetTimer);

    // Settings
    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
    document.getElementById('userName').addEventListener('change', (e) => {
        saveUserName(e.target.value);
    });

    // Set default date to today
    document.getElementById('taskDueDate').value = getTodayDateString();

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');

        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize the application
 */
function init() {
    loadData();
    applyTheme(); // Apply theme immediately to prevent flash
    updateUI();
    initEventListeners();
    resumeTimerIfNeeded();
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
