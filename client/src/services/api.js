import axios from "axios";

const API = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config)=>{
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginUser = (data) => API.post('/auth/login',data);
export const registerUser = (data) => API.post('/auth/register',data);
export const getMe = () => API.post('/auth/me');

export const createSubject = (data)  => API.post('/subjects', data);
export const getSubjects   = ()      => API.get('/subjects');
export const deleteSubject = (id)    => API.delete(`/subjects/${id}`);

export const uploadDocument  = (formData) => API.post('/documents/upload', formData);
export const getDocuments    = (subjectId) => API.get(`/documents/subject/${subjectId}`);
export const getDocument     = (id)        => API.get(`/documents/${id}`);
export const deleteDocument  = (id)        => API.delete(`/documents/${id}`);

// ─── Flashcards ────────────────────────────────────────
export const generateFlashcards = (documentId) => API.post(`/flashcards/generate/${documentId}`);
export const getFlashcards      = (documentId) => API.get(`/flashcards/${documentId}`);

// ─── Quiz ──────────────────────────────────────────────
export const generateQuiz  = (documentId)          => API.post(`/quiz/generate/${documentId}`);
export const getQuiz       = (documentId)          => API.get(`/quiz/${documentId}`);
export const submitQuiz    = (documentId, answers) => API.post(`/quiz/submit/${documentId}`, { answers });
export const getAttempts   = (documentId)          => API.get(`/quiz/attempts/${documentId}`);

export const getSummaryStats    = ()           => API.get('/progress/stats');
export const getOverallProgress = ()           => API.get('/progress/overall');
export const getSubjectProgress = (subjectId) => API.get(`/progress/subject/${subjectId}`);
export const getWeakTopics      = ()           => API.get('/progress/weak-topics');
export const getStreak          = ()           => API.get('/progress/streak');