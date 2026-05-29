const db = require('../config/db');

const createSubject = async (req,res)=>{
    const {title} = req.body;
    const userId = req.user.id;

    if(!title){
        return res.status(400).json({message:"you have to provide title first"});
    }

    try{
        const [result] = await db.query(
            "INSERT INTO subjects (user_id,title) VALUES(?,?)",[userId,title]
        );

        res.status(201).json({
            message:'subject created',
            subject:{id:result.insertId,title,userId},
        });
    }catch(err){
        console.error(err);
        res.status(500).json({message:"server error"});
    }
};

const getSubjects = async (req,res)=>{
    const userId = req.user.id;
    try{
        const [subjects] = await db.query(
            "SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at DESC",[userId]
        );

        res.json({subjects});
    }catch(err){
        console.error(err);
        res.status(500).json({message:'server error'});
    }
};

const deleteSubject = async (req,res)=>{
    const id = req.params.id;
    const userId = req.user.id;
    try{
        await db.query(
            "DELETE FROM subjects WHERE id = ? and user_id = ?",[id,userId]
        );

        res.json({message:"subject deleted"});
    }catch(err){
        console.error(err);
        res.status(500).json({message:"server error"});
    }
};

module.exports = {createSubject,getSubjects,deleteSubject};

