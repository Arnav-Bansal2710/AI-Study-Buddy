const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware.js');

const { createFlashcards , getFlashcards } = require('../controllers/flashcardController.js');

router.post('/generate/:documentId',protect,createFlashcards);

router.get('/:documentId',protect,getFlashcards);

module.exports = router;