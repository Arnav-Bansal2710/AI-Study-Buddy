const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async(req,res)=>{
    const {name,email,password} = req.body;
    try{
    const [existing] = await db.query(
        'SELECT * FROM users WHERE email = ?',[email]
    );

    if(existing.length > 0){
        return res.status(400).json({message:'Email already registered'});
    }

    const hashPassword = await bcrypt.hash(password,10);

    await db.query(
        'INSERT INTO users (name,email,password) VALUES (?,?,?)',[name,email,hashPassword]
    );

    res.status(201).json({message:'User registered successfully'});
    }catch(err){
        console.error(err);
        res.status(500).json({message:'server error'});
    }
}

const login = async(req,res)=>{
    const {email,password} = req.body;

    try{
        const [users] = await db.query(
            'SELECT * FROM users where email=?',[email]
        );
        if(users.length === 0){
            return res.status(400).json({message:'Invalid email or password'});
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:'Invalid email or password'});
        }

        const token = jwt.sign(
            {id:user.id,email:user.email},
            process.env.JWT_SECRET,
            {expiresIn:'7d'}
        );

        res.json({
            message:'Login successful',
            token,
            user:{id:user.id,email:user.email}
        });
    }catch(err){
        console.error(err);
        res.status(500).json({message:'server error'});
    }
};

module.exports = {register,login};