const express = require('express');
const Article = require('../models/Article');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all articles (public)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const articles = await Article.find({ isPublished: true })
            .populate('author', 'username')
            .populate('comments')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalArticles = await Article.countDocuments({ isPublished: true });
        const totalPages = Math.ceil(totalArticles / limit);

        res.render('articleList', {
            title: 'All Articles',
            articles,
            currentPage: page,
            totalPages,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to fetch articles' 
        });
    }
});

// Get user's own articles
router.get('/my-articles', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const articles = await Article.find({ author: req.user._id })
            .populate('comments')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalArticles = await Article.countDocuments({ author: req.user._id });
        const totalPages = Math.ceil(totalArticles / limit);

        res.render('myArticles', {
            title: 'My Articles',
            articles,
            currentPage: page,
            totalPages,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching user articles:', error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to fetch your articles' 
        });
    }
});

// Get single article
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'username')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            });

        if (!article) {
            return res.status(404).render('error', { 
                title: 'Not Found',
                message: 'Article not found' 
            });
        }

        res.render('articleItem', {
            title: article.title,
            article,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to fetch article' 
        });
    }
});

// Create article form
router.get('/create/new', authenticateToken, (req, res) => {
    res.render('articleForm', {
        title: 'Create New Article',
        article: null,
        user: req.user
    });
});

// Edit article form
router.get('/edit/:id', authenticateToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).render('error', { 
                title: 'Not Found',
                message: 'Article not found' 
            });
        }

        // Check if user owns the article or is admin
        if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).render('error', { 
                title: 'Access Denied',
                message: 'You can only edit your own articles' 
            });
        }

        res.render('articleForm', {
            title: 'Edit Article',
            article,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching article for edit:', error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to fetch article' 
        });
    }
});

// Create article
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        if (!title || !content) {
            return res.render('articleForm', {
                title: 'Create New Article',
                article: null,
                error: 'Title and content are required',
                formData: req.body,
                user: req.user
            });
        }

        const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const article = new Article({
            title,
            content,
            author: req.user._id,
            authorName: req.user.username,
            tags: tagArray
        });

        await article.save();

        // Add article to user's articles array
        await User.findByIdAndUpdate(req.user._id, {
            $push: { articles: article._id }
        });

        res.redirect(`/articles/${article._id}`);
    } catch (error) {
        console.error('Error creating article:', error);
        res.render('articleForm', {
            title: 'Create New Article',
            article: null,
            error: 'Failed to create article',
            formData: req.body,
            user: req.user
        });
    }
});

// Update article
router.post('/update/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).render('error', { 
                title: 'Not Found',
                message: 'Article not found' 
            });
        }

        // Check if user owns the article or is admin
        if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).render('error', { 
                title: 'Access Denied',
                message: 'You can only edit your own articles' 
            });
        }

        if (!title || !content) {
            return res.render('articleForm', {
                title: 'Edit Article',
                article,
                error: 'Title and content are required',
                formData: req.body,
                user: req.user
            });
        }

        const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        article.title = title;
        article.content = content;
        article.tags = tagArray;
        article.updatedAt = Date.now();

        await article.save();

        res.redirect(`/articles/${article._id}`);
    } catch (error) {
        console.error('Error updating article:', error);
        res.render('articleForm', {
            title: 'Edit Article',
            article,
            error: 'Failed to update article',
            formData: req.body,
            user: req.user
        });
    }
});

// Delete article
router.post('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).render('error', { 
                title: 'Not Found',
                message: 'Article not found' 
            });
        }

        // Check if user owns the article or is admin
        if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).render('error', { 
                title: 'Access Denied',
                message: 'You can only delete your own articles' 
            });
        }

        // Delete associated comments
        await Comment.deleteMany({ article: article._id });

        // Remove article from user's articles array
        await User.findByIdAndUpdate(article.author, {
            $pull: { articles: article._id }
        });

        // Delete article
        await Article.findByIdAndDelete(req.params.id);

        res.redirect('/articles/my-articles');
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).render('error', { 
            title: 'Error',
            message: 'Failed to delete article' 
        });
    }
});

module.exports = router;
