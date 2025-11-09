const User = require("../Models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const Register = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password is required" })
    }
    let user = await User.findOne({ username })
    if (user) {
        return res.status(400).json({ error: "Username is already exist" })
    }
    const hashPwd = await bcrypt.hash(password, 10)
    const newUser = await User.create({
        username, password: hashPwd
    })

    // --- MODIFIED: Create user response object (no password) ---
    const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        creditPoints: newUser.creditPoints,
        role: newUser.role
    }
    
    let token = jwt.sign({ username: userResponse.username, id: userResponse._id }, process.env.SECRET_KEY)
    return res.status(200).json({ token, user: userResponse })

}

const Login = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password is required" })
    }
    
    // Find user and keep password field
    let user = await User.findOne({ username }) 
    
    if (user && await bcrypt.compare(password, user.password)) {
        let token = jwt.sign({ username: user.username, id: user._id }, process.env.SECRET_KEY)
        
        // --- MODIFIED: Create user response object (no password) ---
        const userResponse = {
            _id: user._id,
            username: user.username,
            creditPoints: user.creditPoints,
            role: user.role
        }
        
        return res.status(200).json({ token, user: userResponse })
    }
    else {
        return res.status(400).json({ error: "Invaild credientials" })
    }
}

const getUser = async (req, res) => {
    const user = await User.findById(req.params.id)
    res.json({username:user.username})
}

module.exports = { Register, Login, getUser }