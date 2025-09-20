const express = require('express');
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create comment
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { articleId, content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Comment content is required' 
            });
        }

        if (content.length > 1000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Comment is too long (max 1000 characters)' 
            });
        }

        // Check if article exists
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ 
                success: false, 
                message: 'Article not found' 
            });
        }

        // Create comment
        const comment = new Comment({
            content: content.trim(),
            author: req.user._id,
            authorName: req.user.username,
            article: articleId
        });

        await comment.save();

        // Add comment to article
        article.comments.push(comment._id);
        await article.save();

        res.json({ 
            success: true, 
            message: 'Comment added successfully',
            comment: {
                _id: comment._id,
                content: comment.content,
                authorName: comment.authorName,
                createdAt: comment.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create comment' 
        });
    }
});

// Delete comment
router.post('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Comment not found' 
            });
        }

        // Check if user owns the comment or is admin
        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only delete your own comments' 
            });
        }

        // Remove comment from article
        await Article.findByIdAndUpdate(comment.article, {
            $pull: { comments: comment._id }
        });

        // Delete comment
        await Comment.findByIdAndDelete(req.params.id);

        res.json({ 
            success: true, 
            message: 'Comment deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete comment' 
        });
    }
});

module.exports = router;
