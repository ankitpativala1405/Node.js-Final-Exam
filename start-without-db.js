require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Simple in-memory storage for demo
let users = [];
let articles = [];
let comments = [];

// Mock user for demo
const demoUser = {
    _id: 'demo-user-1',
    username: 'demo',
    email: 'demo@example.com',
    role: 'user',
    articles: []
};

// Mock articles for demo
const demoArticles = [
    {
        _id: 'article-1',
        title: 'Welcome to BlogHub!',
        content: 'This is a demo article to show how the blog works. You can create, edit, and manage articles with full authentication and role-based access control.',
        author: 'demo-user-1',
        authorName: 'Demo User',
        tags: ['welcome', 'demo', 'blog'],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true
    },
    {
        _id: 'article-2',
        title: 'Getting Started with Node.js',
        content: 'Node.js is a powerful JavaScript runtime that allows you to build scalable web applications. In this article, we\'ll explore the basics of Node.js development.',
        author: 'demo-user-1',
        authorName: 'Demo User',
        tags: ['nodejs', 'javascript', 'tutorial'],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true
    }
];

// Initialize demo data
users = [demoUser];
articles = demoArticles;

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/articles');
});

// Articles routes
app.get('/articles', (req, res) => {
    res.render('articleList', {
        title: 'All Articles',
        articles: articles.filter(article => article.isPublished),
        currentPage: 1,
        totalPages: 1,
        user: null
    });
});

app.get('/articles/my-articles', (req, res) => {
    res.render('myArticles', {
        title: 'My Articles',
        articles: articles.filter(article => article.author === 'demo-user-1'),
        currentPage: 1,
        totalPages: 1,
        user: demoUser
    });
});

app.get('/articles/:id', (req, res) => {
    const article = articles.find(a => a._id === req.params.id);
    if (!article) {
        return res.status(404).render('error', {
            title: 'Not Found',
            message: 'Article not found'
        });
    }
    
    res.render('articleItem', {
        title: article.title,
        article: article,
        user: demoUser
    });
});

app.get('/articles/create/new', (req, res) => {
    res.render('articleForm', {
        title: 'Create New Article',
        article: null,
        user: demoUser
    });
});

app.get('/articles/edit/:id', (req, res) => {
    const article = articles.find(a => a._id === req.params.id);
    if (!article) {
        return res.status(404).render('error', {
            title: 'Not Found',
            message: 'Article not found'
        });
    }
    
    res.render('articleForm', {
        title: 'Edit Article',
        article: article,
        user: demoUser
    });
});

// Auth routes
app.get('/auth/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/auth/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// Demo login
app.post('/auth/login', (req, res) => {
    res.cookie('token', 'demo-token', { httpOnly: true });
    res.redirect('/articles');
});

// Demo register
app.post('/auth/register', (req, res) => {
    res.cookie('token', 'demo-token', { httpOnly: true });
    res.redirect('/articles');
});

// Demo logout
app.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Blog Project Demo Server Started!');
    console.log(`📱 Open your browser and go to: http://localhost:${PORT}`);
    console.log('🔧 This is a demo version without database connection');
    console.log('📋 To use with MongoDB, fix your database connection and run: npm start');
    console.log('\n✨ Features available in demo:');
    console.log('   - View articles');
    console.log('   - Navigation');
    console.log('   - Responsive design');
    console.log('   - All UI components');
    console.log('\n⚠️  Note: Data will not persist (no database)');
});
