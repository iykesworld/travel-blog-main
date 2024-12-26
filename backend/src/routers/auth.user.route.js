const express = require('express');
const User = require('../model/user.model');
const generateToken = require('../middleware/generateToken');
const mongoose = require('mongoose');

const router = express.Router();

// register a new user
router.post('/register', async(req, res)=>{
    try {
        const {email, password, username} = req.body;
        const user = new User({email, password, username});
        await user.save();
        res.status(200).send({message: 'User registration successful', user: user});
    } catch (error) {
      console.error(error, 'Failed to resgiter');
      res.status(500).json({message: 'Registration failed'});  
    }
})

// login a user
router.post('/login', async(req, res)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).send({message: 'User not found'});
        }
        const isMatch = await user.comparePassword(password);

        if(!isMatch){
            return res.status(401).send({message: 'Invalid password'});
        }

        // generate token here
        const token = await generateToken(user._id);
        // set token to browser cookies
        res.cookie('token', token, {
            httpOnly: true,  //enable this only when you have https://
            secure: true,
            sameSite: true
        });
        res.status(200).send({message: 'User login successful',token, user: {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        }});
    } catch (error) {
        console.error(error, 'Failed to login');
        res.status(500).json({message: 'Login failed! Try again'});
    }
})

// logout a user
router.post('/logout', async(req, res)=>{
    try {
        // Clear the token from cookies
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: true
        });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error, 'Failed to log out');
        res.status(500).json({message: 'Logout failed! Try again'});
    }
})

// get all users
router.get('/users', async(req, res)=>{
    try {
        const users = await User.find({}, 'id email role');
        res.status(200).send({message: 'Users found successfully', users});
    } catch (error) {
        console.error(error, 'Errow fetching user');
        res.status(500).json({message: 'Failed to get users'});
    }
})

// delete a user
router.delete('/users/:id', async(req, res)=>{
    try {
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).send({message: 'User not found'});
        }
        res.status(200).send({message: 'User deleted successfully'});
    } catch (error) {
        console.error('Error deleting user', error);
        console.status(500).json({message: 'Error deleting user'});
    }
})

// update user role
router.put('/users/:id', async(req, res)=>{
    try {
        const {id} = req.params; 
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const {role} = req.body;  // assuming role is sent in request body
        const user = await User.findByIdAndUpdate(id, {role}, {new: true});
        if(!user){
            return res.status(404).send({message: 'User not found'});
        }
        res.status(200).send({message: 'User role updated successfully', user});
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({message: 'Error updating user role'});
    }
})

module.exports = router;