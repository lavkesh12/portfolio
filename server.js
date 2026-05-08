const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const { connectDatabase, Project, Skill, Experience, Education, Contact, Profile, AdminUser } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists (Use /tmp on Vercel as root is read-only)
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
} catch (err) {
    console.warn('⚠️ Could not create uploads directory:', err.message);
}
app.use('/uploads', express.static(uploadsDir));

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|svg|pdf/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only image and PDF files are allowed'));
    }
});

// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// ========================
//  PUBLIC API ROUTES
// ========================

// Get profile
app.get('/api/profile', async (req, res) => {
    try {
        const profile = await Profile.findOne();
        res.json(profile || {});
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all projects (with optional filters)
app.get('/api/projects', async (req, res) => {
    try {
        const { category, featured } = req.query;
        const filter = {};
        if (category && category !== 'all') filter.category = category;
        if (featured === 'true') filter.featured = true;

        const projects = await Project.find(filter).sort({ display_order: 1 });
        res.json(projects);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all skills grouped by category
app.get('/api/skills', async (req, res) => {
    try {
        const skills = await Skill.find().sort({ display_order: 1 });
        const grouped = {};
        skills.forEach(s => {
            if (!grouped[s.category]) grouped[s.category] = [];
            grouped[s.category].push(s);
        });
        res.json({ skills, grouped });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get experiences
app.get('/api/experiences', async (req, res) => {
    try {
        const experiences = await Experience.find().sort({ display_order: 1 });
        res.json(experiences);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get education
app.get('/api/education', async (req, res) => {
    try {
        const education = await Education.find().sort({ display_order: 1 });
        res.json(education);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        await Contact.create({ name, email, subject: subject || '', message });
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Placeholder image generator
app.get('/api/placeholder/project/:id', (req, res) => {
    const colors = [
        { bg: '667eea' }, { bg: 'f093fb' }, { bg: '4facfe' },
        { bg: '43e97b' }, { bg: 'fa709a' }, { bg: 'a18cd1' }
    ];
    const id = parseInt(req.params.id) || 1;
    const color = colors[(id - 1) % colors.length];

    const svg = `
    <svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#${color.bg};stop-opacity:1" />
                <stop offset="100%" style="stop-color:#${color.bg}88;stop-opacity:1" />
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
            </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grad)"/>
        <rect width="800" height="500" fill="url(#grid)"/>
        <circle cx="650" cy="100" r="150" fill="rgba(255,255,255,0.05)"/>
        <circle cx="150" cy="400" r="120" fill="rgba(255,255,255,0.05)"/>
        <rect x="100" y="80" width="280" height="20" rx="10" fill="rgba(255,255,255,0.2)"/>
        <rect x="100" y="120" width="400" height="14" rx="7" fill="rgba(255,255,255,0.12)"/>
        <rect x="100" y="150" width="350" height="14" rx="7" fill="rgba(255,255,255,0.12)"/>
        <rect x="100" y="200" width="600" height="220" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <circle cx="160" cy="240" r="8" fill="rgba(255,255,255,0.3)"/>
        <circle cx="190" cy="240" r="8" fill="rgba(255,255,255,0.25)"/>
        <circle cx="220" cy="240" r="8" fill="rgba(255,255,255,0.2)"/>
        <rect x="130" y="270" width="540" height="120" rx="8" fill="rgba(255,255,255,0.06)"/>
        <text x="400" y="340" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.25)" text-anchor="middle">Project Preview</text>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
});

// Get stats
app.get('/api/stats', async (req, res) => {
    try {
        const projects = await Project.countDocuments();
        const skills = await Skill.countDocuments();
        const contacts = await Contact.countDocuments();
        res.json({ projects, skills, experience_years: 3, contacts });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========================
//  AUTH ROUTES
// ========================

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = await AdminUser.findOne({ username });
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/verify', authMiddleware, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// ========================
//  ADMIN API ROUTES
// ========================

// Profile
app.put('/api/admin/profile', authMiddleware, async (req, res) => {
    try {
        const { name, title, bio, email, phone, location, github, linkedin, twitter, website } = req.body;
        await Profile.findOneAndUpdate({}, { name, title, bio, email, phone, location, github, linkedin, twitter, website }, { upsert: true });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Projects CRUD
app.post('/api/admin/projects', authMiddleware, async (req, res) => {
    try {
        const { title, description, long_description, image_url, live_url, github_url, tech_stack, category, featured } = req.body;
        const maxOrder = await Project.findOne().sort({ display_order: -1 });
        const techArray = typeof tech_stack === 'string' ? tech_stack.split(',').map(t => t.trim()) : tech_stack;
        const project = await Project.create({
            title, description, long_description, image_url, live_url, github_url,
            tech_stack: techArray, category: category || 'web',
            featured: !!featured, display_order: (maxOrder?.display_order || 0) + 1
        });
        res.json({ success: true, id: project._id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/projects/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description, long_description, image_url, live_url, github_url, tech_stack, category, featured } = req.body;
        const techArray = typeof tech_stack === 'string' ? tech_stack.split(',').map(t => t.trim()) : tech_stack;
        await Project.findByIdAndUpdate(req.params.id, {
            title, description, long_description, image_url, live_url, github_url,
            tech_stack: techArray, category: category || 'web', featured: !!featured
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/projects/:id', authMiddleware, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Skills CRUD
app.post('/api/admin/skills', authMiddleware, async (req, res) => {
    try {
        const { name, category, proficiency, icon } = req.body;
        const maxOrder = await Skill.findOne().sort({ display_order: -1 });
        const skill = await Skill.create({
            name, category, proficiency: proficiency || 80,
            icon: icon || '', display_order: (maxOrder?.display_order || 0) + 1
        });
        res.json({ success: true, id: skill._id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/skills/:id', authMiddleware, async (req, res) => {
    try {
        const { name, category, proficiency, icon } = req.body;
        await Skill.findByIdAndUpdate(req.params.id, { name, category, proficiency, icon: icon || '' });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/skills/:id', authMiddleware, async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Contacts
app.get('/api/admin/contacts', authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/contacts/:id/read', authMiddleware, async (req, res) => {
    try {
        await Contact.findByIdAndUpdate(req.params.id, { is_read: true });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/contacts/:id', authMiddleware, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// File upload
app.post('/api/admin/upload', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Experiences CRUD
app.post('/api/admin/experiences', authMiddleware, async (req, res) => {
    try {
        const { title, company, location, start_date, end_date, is_current, description } = req.body;
        const maxOrder = await Experience.findOne().sort({ display_order: -1 });
        const exp = await Experience.create({
            title, company, location, start_date, end_date: end_date || null,
            is_current: !!is_current, description,
            display_order: (maxOrder?.display_order || 0) + 1
        });
        res.json({ success: true, id: exp._id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/experiences/:id', authMiddleware, async (req, res) => {
    try {
        const { title, company, location, start_date, end_date, is_current, description } = req.body;
        await Experience.findByIdAndUpdate(req.params.id, {
            title, company, location, start_date, end_date, is_current: !!is_current, description
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/experiences/:id', authMiddleware, async (req, res) => {
    try {
        await Experience.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Education CRUD
app.post('/api/admin/education', authMiddleware, async (req, res) => {
    try {
        const { degree, institution, location, start_year, end_year, description } = req.body;
        const maxOrder = await Education.findOne().sort({ display_order: -1 });
        const edu = await Education.create({
            degree, institution, location, start_year, end_year, description,
            display_order: (maxOrder?.display_order || 0) + 1
        });
        res.json({ success: true, id: edu._id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/education/:id', authMiddleware, async (req, res) => {
    try {
        await Education.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// SPA fallback
app.get('{*path}', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// ========================
//  Start Server
// ========================

// Connect to DB on import (needed for Vercel serverless)
connectDatabase(MONGO_URI).catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
});

// Only start listening locally (Vercel handles this itself)
if (process.env.VERCEL !== '1') {
    const PORT_NUM = process.env.PORT || 3000;
    app.listen(PORT_NUM, () => {
        console.log(`\n🚀 Portfolio server running at http://localhost:${PORT_NUM}`);
        console.log(`📁 Admin panel at http://localhost:${PORT_NUM}/admin.html`);
        console.log(`🗄️  MongoDB: ${MONGO_URI}\n`);
    });
}

// Export for Vercel
module.exports = app;
