const express = require('express');
const Comment = require('../model/comment.model');

const router = express.Router();

// create a new comment
router.post('/post-comment', async (req, res) => {
    try {
        // console.log(req.body);
    const newComment = new Comment(req.body);
    await newComment.save();
    res.status(200).send({message: 'Comment created successfully', Comment: newComment});
    } catch (error) {
    console.error(error, 'An error occure while posting new comment');
    res.status(500).send({message: 'An error occure while posting new comment'});    
    }
})

// get all comments count

router.get('/total-comments', async (req, res)=>{
    try {
        const totalComment = await Comment.countDocuments({});
        res.status(200).send({message: 'Total comments count successfully', totalComment});
    } catch (error) {
        console.error(error, 'An error occure while getting comments count');
        res.status(500).send({message: 'An error occure while getting comments count'})
    }
})
module.exports = router;