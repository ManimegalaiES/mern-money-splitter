import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* UPDATE UPI ID */

router.put("/upi", auth, async (req,res)=>{

  try{

    const { upiId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { upiId },
      { new:true }
    );

    res.json(user);

  }catch(err){

    console.error(err);
    res.status(500).json({message:"Failed to update UPI"});

  }

});

export default router;