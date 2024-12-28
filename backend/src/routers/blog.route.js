const express = require('express');
const Blog = require('../model/blog.model');
const Comment = require('../model/comment.model');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// create a blog post
router.post('/create-post',verifyToken,isAdmin, async (req, res) => {
    try {
        // console.log(req.body)
        const newPost = new Blog({...req.body, author: req.userId});  // TODO: use author: req.userId when token is verified
        await newPost.save();
        res.status(201).send({
            message: 'Post created successfully',
            post: newPost
        })
    } catch (error) {
        console.error('Error creating post', error);
        res.status(500).send({ message: 'Error creating post' });
    }
})

// get all blogs
router.get('/', async (req, res) => {
    try {
        const {search} = req.query;
        const {category} = req.query;
        // console.log(search);
        let query = {};
        if(search){
            query ={
                ...query,
                $or: [
                    {title: {$regex: search, $options: "i"}},
                    {description: {$regex: search, $options: "i"}},
                ]
            }
        }
        if(category){
            query ={...query, category}
        }
        const posts = await Blog.find(query).populate('author', 'email').sort({createdAt: -1});
        res.status(200).send(posts);
    } catch (error) {
        console.error('Error getting blogs', error);
        res.status(500).send({ message: 'Error getting blogs' });
    }
})

// get single blog by id
router.get('/:id', async(req, res)=>{
    try {
        // console.log(req.params.id);
        const postId = req.params.id;
        const post = await Blog.findById(postId);
        if(!post) {
            return res.status(404).send({ message: 'Post not found' });
        }

        // fetching comment related to the post
        const comments = await Comment.find({postId: post.id}).populate('user', 'username email');
        res.status(200).send({
            post, comments
        })
    } catch (error) {
        console.error('Error fetching single post', error);
        res.status(500).send({ message: 'Error fetching single post' });    
    }
})

// update a blog post
router.patch('/update-post/:id',verifyToken,isAdmin, async (req, res) => {
    try {
        const postId = req.params.id;
        const updatedPost = await Blog.findByIdAndUpdate(postId, {
            ...req.body
        }, {new: true});

        if(!updatedPost){
            return res.status(404).send({message: 'Post not found'})
        }
        res.status(200).send({
            message: 'Post Updated successfully',
            post: updatedPost
        })
    } catch (error) {
        console.error('Error updating blog post', error);
        res.status(500).send({message: 'Error updating blog post'})
    }
})

// delete a blog post
router.delete('/:id',verifyToken,isAdmin, async (req, res)=>{
    try {
        const postId = req.params.id;
        const post = await Blog.findByIdAndDelete(postId);
        if(!post){
            return res.status(404).send({message: 'Blog post not found', post: post});
        }

        // delete related comments
        await Comment.deleteMany({postId: postId});
        res.status(200).send({message: 'Blog Post deleted successfully'})
    } catch (error) {
        console.error('Error deleting blog post', error);
        res.status(500).send({message: 'Error deleting blog post'});
    }
})

// related blogs
router.get('/related/:id', async(req, res)=>{
    try {
        const {id} = req.params;
        if(!id){
            return res.status(400).send({message: 'Post id is required'});
        }
        const blog = await Blog.findById(id);
        if(!blog){
            return res.status(404).send({message: 'Post is not found!'})
        }
        const titleRegex = new RegExp(blog.title.split(' ').join('|'), 'i');

        const relatedQuerry = {
            _id: {$ne: id},  //exclude the current blog by id
            title: {$regex: titleRegex}
        }
        const relatedPosts = await Blog.find(relatedQuerry).limit(3);
        res.status(200).send(relatedPosts)
    } catch (error) {
        console.error('Error getting related blog', error);
        res.status(500).send({message: 'Error getting related blog'});
    }
})




module.exports = router;