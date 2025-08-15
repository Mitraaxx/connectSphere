const express=require("express")
const router=express.Router()
const {Register,Login,getUser}=require("../Controllers/userController");

router.post("/Register",Register)
router.post("/Login",Login)
router.get("/user/:id",getUser)

module.exports=router