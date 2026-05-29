const express = require("express");
const cors = require("cors");
require("dotenv").config()

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require('./routes/subjectRoutes');
const documentRoutes = require('./routes/documentRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const quizRoutes      = require('./routes/quizRoutes'); 

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());

db.query('SELECT 1')
    .then(()=>console.log('MYSQL runs succesfully'))
    .catch((err)=>console.error('MYSQL connection failed :',err));


app.use('/api/auth',authRoutes);
app.use('/api/subjects',subjectRoutes);
app.use('/api/documents',documentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quiz',       quizRoutes);  

app.get('/',(req,res)=>{
    res.json({message : 'AI study budy API is running'});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});
