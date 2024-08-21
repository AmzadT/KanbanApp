const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const userRouter = express.Router()


// Register
userRouter.post('/register', async (req, res) => {
    const { name, age, email, password, gender, role } = req.body;
    try {
        // user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        // Hash the password using bcrypt
        bcrypt.hash(password, 5, async (error, hash) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to hash password' })
            }
            const user = new userModel({
                name,
                age,
                email,
                password: hash,
                gender,
                role
            })
            await user.save()
            res.status(201).json({ message: 'User Registered Successfully' })
        })
    } catch (error) {
        console.log(`Error Occurred while Registering: ${error}`);
        res.status(500).json({ message: 'Server error occurred during registration' });
    }
})



// Login
userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Incorrect Email' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect Password' });
        }
        const token = jwt.sign({ email: user.email, _id: user._id }, process.env.SECRET_KEY);
        return res.json({ message: 'User Logged In Successfully', token });

    } catch (error) {
        console.error(`Error Occurred during Login: ${error.message}`);
        res.status(500).json({ message: `An error occurred while logging in ${error}` });
    }
});


module.exports = userRouter;
