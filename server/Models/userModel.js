const mongoose=require("mongoose")

const userSchema=mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    // --- NEW ---
    creditPoints: {
        type: Number,
        default: 2,
        min: 0,
        max: 2
    },
    // --- NEW ---
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
},{timestamps:true})

module.exports=mongoose.model("User",userSchema)