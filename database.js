const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================================
//  Mongoose Schemas & Models
// ============================================

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    long_description: String,
    image_url: String,
    live_url: String,
    github_url: String,
    tech_stack: [String],
    category: { type: String, default: 'web' },
    featured: { type: Boolean, default: false },
    display_order: { type: Number, default: 0 }
}, { timestamps: true });

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    proficiency: { type: Number, default: 80 },
    icon: String,
    display_order: { type: Number, default: 0 }
});

const experienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    start_date: { type: String, required: true },
    end_date: String,
    is_current: { type: Boolean, default: false },
    description: String,
    display_order: { type: Number, default: 0 }
});

const educationSchema = new mongoose.Schema({
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    location: String,
    start_year: Number,
    end_year: Number,
    description: String,
    display_order: { type: Number, default: 0 }
});

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: String,
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false }
}, { timestamps: true });

const profileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    bio: String,
    avatar_url: String,
    resume_url: String,
    email: String,
    phone: String,
    location: String,
    github: String,
    linkedin: String,
    twitter: String,
    website: String
});

const adminUserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password_hash: { type: String, required: true }
}, { timestamps: true });

// Create models
const Project = mongoose.model('Project', projectSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Experience = mongoose.model('Experience', experienceSchema);
const Education = mongoose.model('Education', educationSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Profile = mongoose.model('Profile', profileSchema);
const AdminUser = mongoose.model('AdminUser', adminUserSchema);

// ============================================
//  Database Connection & Seeding
// ============================================

async function connectDatabase(mongoUri) {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Seed if empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
        await seedData();
    }

    // Create default admin if none exists
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
        const hash = bcrypt.hashSync('admin123', 10);
        await AdminUser.create({ username: 'admin', password_hash: hash });
        console.log('🔑 Default admin created (admin / admin123)');
    }
}

async function seedData() {
    // Seed profile
    await Profile.create({
        name: 'Lavkesh',
        title: 'B.Tech CSE Student | Aspiring Web Developer',
        bio: 'Second year B.Tech Computer Science student passionate about web development and building cool projects. Currently learning full-stack development with JavaScript, Node.js, and MongoDB. Always eager to learn new technologies and contribute to open-source.',
        email: 'lavkesh12@gmail.com',
        location: 'India',
        github: 'https://github.com/lavkesh12',
        linkedin: 'https://linkedin.com/in/lavkesh12'
    });

    // Seed projects
    await Project.insertMany([
        {
            title: 'Personal Portfolio Website',
            description: 'A full-stack portfolio website built with Node.js, Express, and MongoDB to showcase my projects and skills.',
            long_description: 'My personal portfolio built as a college project. Features a contact form, admin panel for content management, and data stored in MongoDB Atlas.',
            image_url: '/api/placeholder/project/1',
            live_url: '',
            github_url: 'https://github.com/lavkesh12/portfolio',
            tech_stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
            category: 'fullstack', featured: true, display_order: 1
        },
        {
            title: 'Weather App',
            description: 'A weather application that fetches real-time weather data using OpenWeatherMap API with search by city name.',
            long_description: 'Built a responsive weather app using vanilla JavaScript and REST APIs. Displays temperature, humidity, wind speed, and weather conditions.',
            image_url: '/api/placeholder/project/2',
            live_url: '',
            github_url: 'https://github.com/lavkesh12/weather-app',
            tech_stack: ['HTML', 'CSS', 'JavaScript', 'REST API'],
            category: 'frontend', featured: true, display_order: 2
        },
        {
            title: 'To-Do List App',
            description: 'A task management app with CRUD operations, local storage persistence, and filter/sort functionality.',
            long_description: 'A clean to-do list application where users can add, edit, delete, and mark tasks as complete. Data persists using localStorage.',
            image_url: '/api/placeholder/project/3',
            live_url: '',
            github_url: 'https://github.com/lavkesh12/todo-app',
            tech_stack: ['HTML', 'CSS', 'JavaScript'],
            category: 'frontend', featured: true, display_order: 3
        },
        {
            title: 'Student Management System',
            description: 'A backend CRUD API for managing student records with Express.js and MongoDB.',
            long_description: 'REST API built with Express.js for a student management system. Supports adding, updating, deleting, and searching student records.',
            image_url: '/api/placeholder/project/4',
            live_url: '',
            github_url: 'https://github.com/lavkesh12/student-management',
            tech_stack: ['Node.js', 'Express', 'MongoDB', 'Postman'],
            category: 'backend', featured: false, display_order: 4
        },
        {
            title: 'Calculator',
            description: 'A scientific calculator web app with keyboard support, history feature, and dark/light theme toggle.',
            long_description: 'Built a fully functional calculator with standard and scientific modes. Includes calculation history and theme switching.',
            image_url: '/api/placeholder/project/5',
            live_url: '',
            github_url: 'https://github.com/lavkesh12/calculator',
            tech_stack: ['HTML', 'CSS', 'JavaScript'],
            category: 'frontend', featured: false, display_order: 5
        }
    ]);

    // Seed skills
    await Skill.insertMany([
        { name: 'HTML/CSS', category: 'Frontend', proficiency: 80, icon: 'fab fa-html5', display_order: 1 },
        { name: 'JavaScript', category: 'Frontend', proficiency: 65, icon: 'fab fa-js-square', display_order: 2 },
        { name: 'Bootstrap', category: 'Frontend', proficiency: 60, icon: 'fab fa-bootstrap', display_order: 3 },
        { name: 'C/C++', category: 'Languages', proficiency: 70, icon: 'fas fa-code', display_order: 4 },
        { name: 'Python', category: 'Languages', proficiency: 60, icon: 'fab fa-python', display_order: 5 },
        { name: 'Java', category: 'Languages', proficiency: 55, icon: 'fab fa-java', display_order: 6 },
        { name: 'Node.js', category: 'Backend', proficiency: 55, icon: 'fab fa-node-js', display_order: 7 },
        { name: 'Express.js', category: 'Backend', proficiency: 50, icon: 'fas fa-server', display_order: 8 },
        { name: 'MongoDB', category: 'Backend', proficiency: 50, icon: 'fas fa-database', display_order: 9 },
        { name: 'MySQL', category: 'Backend', proficiency: 45, icon: 'fas fa-database', display_order: 10 },
        { name: 'Git/GitHub', category: 'Tools', proficiency: 65, icon: 'fab fa-git-alt', display_order: 11 },
        { name: 'VS Code', category: 'Tools', proficiency: 75, icon: 'fas fa-laptop-code', display_order: 12 },
        { name: 'Postman', category: 'Tools', proficiency: 55, icon: 'fas fa-paper-plane', display_order: 13 }
    ]);

    // Seed experiences
    await Experience.insertMany([
        {
            title: 'Web Development Intern', company: 'College Tech Club', location: 'College Campus',
            start_date: '2025-06', end_date: '2025-08', is_current: false,
            description: 'Built the club website using HTML, CSS, and JavaScript. Learned basics of responsive design and Git version control.',
            display_order: 1
        },
        {
            title: 'Volunteer — Hackathon Organizer', company: 'CodeFest 2025', location: 'College Campus',
            start_date: '2025-01', end_date: '2025-02', is_current: false,
            description: 'Helped organize the annual college hackathon. Managed participant registrations and coordinated with mentors.',
            display_order: 2
        },
        {
            title: 'Freelance Web Developer', company: 'Self-employed', location: 'Remote',
            start_date: '2025-09', end_date: null, is_current: true,
            description: 'Building small websites for local businesses and college events. Learning client communication and project delivery.',
            display_order: 3
        }
    ]);

    // Seed education
    await Education.insertMany([
        { degree: 'B.Tech — Computer Science & Engineering', institution: 'University', location: 'India', start_year: 2024, end_year: 2028, description: 'Currently in 2nd year. Coursework includes DSA, DBMS, OOP, and Web Development.', display_order: 1 },
        { degree: 'Higher Secondary (12th)', institution: 'Senior Secondary School', location: 'India', start_year: 2022, end_year: 2024, description: 'PCM stream with Computer Science. Scored 85%.', display_order: 2 }
    ]);

    console.log('✅ Database seeded with sample data');
}

module.exports = { connectDatabase, Project, Skill, Experience, Education, Contact, Profile, AdminUser };

