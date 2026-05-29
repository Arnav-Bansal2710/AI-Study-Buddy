const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer")){
        res.status(401).json({message:'No token found'});
    }
    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({message:'Token is invalid'})
    }
};

module.exports = protect;