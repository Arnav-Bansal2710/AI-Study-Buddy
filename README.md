# 🧠 AI Study Buddy

An AI-powered study assistant that helps students transform PDF notes into concise summaries, flashcards, quizzes, and progress insights.

## 🚀 Features

### 📄 Smart PDF Upload

* Upload study notes in PDF format
* Automatic text extraction
* AI-generated summaries

### 🃏 Flashcards Generator

* Generate flashcards from uploaded notes
* Interactive flip-card interface
* Quick revision before exams

### 📝 Quiz Generator

* AI-generated MCQs from study material
* Instant scoring and feedback
* Quiz attempt history

### 📚 Subject Management

* Organize notes by subject
* Store multiple documents per subject
* Easy access to study materials

### 📊 Progress Tracking

* View quiz performance
* Track study streaks
* Monitor learning progress

---

## 🛠️ Tech Stack

### Frontend

* React
* React Router
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer

### Database

* MySQL

### AI Integration

* Groq API (Llama 3.3 70B)

---

## 📂 Project Structure

```text
AI-Study-Buddy
│
├── client
│   ├── pages
│   ├── components
│   ├── services
│   └── context
│
├── server
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── config
│   └── uploads
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Arnav-Bansal2710/AI-Study-Buddy.git
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=5000

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=ai_study_buddy

JWT_SECRET=your_secret

GROQ_API_KEY=your_api_key
```

---

## 🎯 Future Improvements

* AI chat with notes
* Study planner
* Spaced repetition flashcards
* Dark mode
* PDF annotations
* OCR for scanned notes

---

## 👨‍💻 Author

**Arnav Bansal**

Computer Science Student | Full Stack Developer

GitHub: https://github.com/Arnav-Bansal2710

