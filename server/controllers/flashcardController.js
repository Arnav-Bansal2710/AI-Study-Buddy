const db = require('../config/db.js');
const { generateFlashcards } = require('../config/ai.js');

const createFlashcards = async (req,res)=>{
    const {documentId} = req.params;
    const userId = req.user.id;

    try{
        const [doc] = await db.query(
            'SELECT raw_text FROM documents WHERE id = ? AND user_id = ?',
            [documentId,userId]
        );

        if(doc.length == 0){
            return res.status(404).json({message : 'Document not found'});
        }

        const rawText = doc[0].raw_text;

        const [existing] = await db.query(
            'SELECT id FROM flashcards WHERE id=? AND user_id = ?',
            [documentId,userId]
        );

        if(existing.length > 0){
            const [cards] = await db.query(
                'SELECT * FROM flashcards WHERE id=? AND user_id=?',
                [documentId,userid]
            );
            return res.json({message:'Flashcards already generated',flashcards:cards});
        }

        const flashcards = await generateFlashcards(rawText);

        const insertPromises = flashcards.map(card =>
        db.query(
            'INSERT INTO flashcards (document_id, user_id, question, answer) VALUES (?, ?, ?, ?)',
            [documentId, userId, card.question, card.answer]
        )
        );
        await Promise.all(insertPromises);

        const [saved] = await db.query(
        'SELECT * FROM flashcards WHERE document_id = ? AND user_id = ?',
        [documentId, userId]
        );

        res.status(201).json({
        message: `${saved.length} flashcards generated!`,
        flashcards: saved
        });

    } catch (err) {
        console.error('Flashcard error:', err.message);
        res.status(500).json({ message: err.message || 'Failed to generate flashcards' });
    }
};

const getFlashcards = async(req,res)=>{
    const {documentId} = req.params;
    const userId = req.user.id;

    try{
        const [flashcards] = await db.query(
            'SELECT * FROM flashcards WHERE id=? AND user_id=?',
            [documentId,userId]
        );

        return res.json({flashcards});
    }catch(err){
        console.error(err);
        res.status(500).json({message:'Server error'});
    }
};

module.exports = {createFlashcards,getFlashcards};