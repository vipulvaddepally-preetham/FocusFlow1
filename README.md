# FocusFlow 🎯

A minimal, distraction-free student productivity web app designed for calm, focused work sessions.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## ✨ Features

### 📊 Dashboard
- **Smart Greeting** — Time-aware welcome message (Good Morning/Afternoon/Evening)
- **Today's Tasks** — Quick add and manage tasks due today
- **Pomodoro Timer** — 25-minute focus sessions with Start/Pause/Reset
- **Daily Progress** — Visual progress bar showing task completion

### ⏰ Timetable
- **Time Blocking** — Plan your day from 6 AM to 10 PM
- **Current Hour Highlight** — Easily spot the current time block
- **Auto-Save** — Changes save automatically as you type

### ✅ Task Manager
- **Full CRUD** — Create, complete, and delete tasks
- **Priority Tags** — High, Medium, Low priority levels
- **Due Dates** — Optional date assignment for tasks
- **Smart Filters** — View All, Active, or Completed tasks

### 📅 Weekly View
- **7-Day Board** — Monday through Sunday columns
- **Real Dates** — Shows actual dates for the current week
- **Integrated Tasks** — Tasks sync across all views
- **Today Highlight** — Current day column stands out

### ⚙️ Settings
- **Dark Mode** — Easy on the eyes for late-night sessions
- **Personalization** — Customize your greeting name

---

## 🚀 Getting Started

1. **Download** the project files
2. **Open** `index.html` in any modern browser
3. **Start** adding tasks and planning your day!

No build tools, no dependencies, no setup required.

---

## 🎨 Design Philosophy

- **Clean & Calm** — White backgrounds, soft shadows, no clutter
- **Card-Based Layout** — Organized, scannable information
- **Large Typography** — Easy to read at 6 AM
- **No Distractions** — No bright colors or animations

---

## 💾 Data Persistence

All data is saved to your browser's **localStorage**:

- ✅ Tasks (title, priority, due date, completion status)
- ✅ Timetable entries
- ✅ Pomodoro timer state
- ✅ Dark mode preference
- ✅ User name

Data persists across browser refreshes and sessions.

---

## 📱 Responsive Design

| Screen Size | Layout |
|-------------|--------|
| Desktop (> 1024px) | Full sidebar + 7-column weekly view |
| Tablet (768-1024px) | Full sidebar + 4-column weekly view |
| Mobile (< 768px) | Slide-out menu + stacked cards |

---

## 🗂️ Project Structure

```
dailytasks/
├── index.html    # Main HTML structure (semantic, accessible)
├── styles.css    # Complete styling with CSS variables
├── app.js        # All functionality (well-commented)
└── README.md     # This file
```

---

## 🛠️ Technical Details

### Built With
- **HTML5** — Semantic elements, ARIA accessibility
- **CSS3** — Custom properties, Flexbox, Grid, Media queries
- **Vanilla JavaScript** — ES6+, no frameworks or libraries

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Key Functions

```javascript
saveData()    // Persist to localStorage
loadData()    // Load on startup
updateUI()    // Refresh all components
```

---

## 📄 License

This project is open source and available for personal and educational use.

---

## 🙏 Acknowledgments

Designed with love for students who need a simple, focused productivity tool.

---

<p align="center">
  Made with ☕ for early morning study sessions
</p>
