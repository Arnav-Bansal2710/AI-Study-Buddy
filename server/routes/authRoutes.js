const express = require("express");
const router = express.Router();
const {register,login} = require("../controllers/authController");
const protect = require('../middleware/authMiddleware');

router.get('/me',protect,async(req,res)=>{
    res.json({message:'Token is valid!',userId:req.user.id});
});
router.post('/register',register);
router.post('/login',login);

module.exports = router;