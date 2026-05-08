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
        name: 'Lavkesh Sharma',
        title: 'B.Tech CSE-AI Student | AI/ML & Full-Stack Enthusiast',
        bio: 'Innovative and results-driven B.Tech CSE-AI student at ABES Institute of Technology with a passion for artificial intelligence and machine learning. Strong foundation in programming, data structures, and problem-solving. Seeking an internship opportunity to apply technical skills and contribute to real-world AI/ML projects.',
        email: 'lavkesh246@gmail.com',
        phone: '9266832149',
        location: 'Uttar Pradesh, India',
        github: 'https://github.com/lavkesh12',
        linkedin: 'https://www.linkedin.com/in/lavkesh-sharma-a17624358'
    });

    // Seed projects
    await Project.insertMany([
        {
            title: 'Milaap — Connecting NGOs to Organizations',
            description: 'A full-stack platform bridging the gap between NGOs and organizations, enabling collaboration, resource sharing, and impactful partnerships.',
            long_description: 'Milaap is a social impact platform designed to connect non-governmental organizations with corporate and institutional partners. It enables NGOs to list their missions and resource needs, while organizations can discover causes to support, volunteer, or fund. Features include organization profiles, collaboration requests, and a discovery feed.',
            image_url: '/api/placeholder/project/1',
            live_url: '',
            github_url: 'https://github.com/lavkesh12',
            tech_stack: ['React.js', 'Node.js', 'Express', 'MongoDB', 'CSS'],
            category: 'fullstack', featured: true, display_order: 1
        },
        {
            title: 'Indiride — Connecting Us to Our Culture',
            description: 'A full-stack cultural platform that connects people to Indian traditions, heritage, and communities. Features an interactive explore map, learning modules, and social community posts.',
            long_description: 'Indiride is a passion project born out of a desire to bridge the gap between modern youth and Indian cultural heritage. The platform features a rich community feed, interactive culture exploration map, learning resources on traditions, and a full authentication system with user profiles.',
            image_url: '/api/placeholder/project/2',
            live_url: '',
            github_url: 'https://github.com/lavkesh12/indiride',
            tech_stack: ['React.js', 'Node.js', 'Express', 'MongoDB', 'CSS'],
            category: 'fullstack', featured: true, display_order: 2
        },
        {
            title: 'E-Commerce Web Application',
            description: 'A full-stack e-commerce app using React.js (frontend) with user authentication, a product catalog, and cart functionality.',
            long_description: 'Built a complete e-commerce solution featuring user registration and login (authentication), a browsable product catalog, add-to-cart functionality, and order management. The frontend is powered by React.js for a dynamic, component-driven UI.',
            image_url: '/api/placeholder/project/3',
            live_url: '',
            github_url: 'https://github.com/lavkesh12/E-commerce_website',
            tech_stack: ['React.js', 'HTML', 'CSS', 'JavaScript', 'Node.js'],
            category: 'fullstack', featured: true, display_order: 3
        },
        {
            title: 'Personal Portfolio Website',
            description: 'A full-stack portfolio website built with Node.js, Express, and MongoDB with an admin CMS dashboard for content management.',
            long_description: 'My personal portfolio built as a college project. Features a contact form, admin panel for content management, skill progress bars, and data stored in MongoDB Atlas.',
            image_url: '/api/placeholder/project/4',
            live_url: '',
            github_url: 'https://github.com/lavkesh12/portfolio',
            tech_stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
            category: 'fullstack', featured: true, display_order: 4
        }
    ]);

    // Seed skills
    await Skill.insertMany([
        { name: 'Python', category: 'Languages', proficiency: 80, icon: 'fab fa-python', display_order: 1 },
        { name: 'OOP with Java', category: 'Languages', proficiency: 80, icon: 'fab fa-java', display_order: 2 },
        { name: 'HTML', category: 'Frontend', proficiency: 89, icon: 'fab fa-html5', display_order: 3 },
        { name: 'CSS', category: 'Frontend', proficiency: 85, icon: 'fab fa-css3-alt', display_order: 4 },
        { name: 'React.js', category: 'Frontend', proficiency: 82, icon: 'fab fa-react', display_order: 5 },
        { name: 'JavaScript', category: 'Frontend', proficiency: 75, icon: 'fab fa-js-square', display_order: 6 },
        { name: 'MySQL Basics', category: 'Backend', proficiency: 85, icon: 'fas fa-database', display_order: 7 },
        { name: 'Node.js', category: 'Backend', proficiency: 75, icon: 'fab fa-node-js', display_order: 8 },
        { name: 'Express.js', category: 'Backend', proficiency: 70, icon: 'fas fa-server', display_order: 9 },
        { name: 'MongoDB', category: 'Backend', proficiency: 70, icon: 'fas fa-database', display_order: 10 },
        { name: 'Communication Skills', category: 'Soft Skills', proficiency: 90, icon: 'fas fa-comments', display_order: 11 },
        { name: 'Team Leadership', category: 'Soft Skills', proficiency: 88, icon: 'fas fa-users', display_order: 12 },
        { name: 'Basic Design Skill', category: 'Soft Skills', proficiency: 75, icon: 'fas fa-pen-nib', display_order: 13 },
        { name: 'Git/GitHub', category: 'Tools', proficiency: 78, icon: 'fab fa-git-alt', display_order: 14 },
        { name: 'Data Structures', category: 'CS Fundamentals', proficiency: 82, icon: 'fas fa-sitemap', display_order: 15 },
        { name: 'Problem Solving', category: 'CS Fundamentals', proficiency: 80, icon: 'fas fa-brain', display_order: 16 }
    ]);

    // Seed experiences
    await Experience.insertMany([
        {
            title: 'Hackathon Team Leader',
            company: 'Multiple College Hackathons',
            location: 'ABES Institute of Technology, Uttar Pradesh',
            start_date: '2024-09', end_date: null, is_current: true,
            description: 'Appointed as Team Leader in multiple hackathon projects due to strong communication and presentation skills. Led teams in designing and pitching innovative AI/ML and web-based solutions under time constraints.',
            display_order: 1
        },
        {
            title: 'Python Programming Certificate',
            company: 'Infosys Springboard',
            location: 'Online',
            start_date: '2024-10', end_date: '2024-12', is_current: false,
            description: 'Completed a comprehensive Python programming course on Infosys Springboard. Covered core Python concepts including data types, functions, file handling, and OOP principles.',
            display_order: 2
        },
        {
            title: 'Data Structures Certificate',
            company: 'CodeChef',
            location: 'Online',
            start_date: '2025-01', end_date: '2025-03', is_current: false,
            description: 'Achieved a certificate of completion for the Data Structures course from CodeChef. Topics covered included arrays, linked lists, stacks, queues, trees, and graph algorithms.',
            display_order: 3
        }
    ]);

    // Seed education
    await Education.insertMany([
        {
            degree: 'B.Tech — Computer Science & Engineering (AI)',
            institution: 'ABES Institute of Technology',
            location: 'Uttar Pradesh, India',
            start_year: 2024, end_year: 2028,
            description: 'Currently in Semester 3. GPA: 8.6/10. Coursework includes Data Structures & Algorithms, OOP with Java, DBMS, AI/ML fundamentals, and Web Development. Expected Graduation: 2028.',
            display_order: 1
        },
        {
            degree: 'Higher Secondary (12th Grade)',
            institution: 'Senior Secondary School',
            location: 'India',
            start_year: 2022, end_year: 2024,
            description: 'Completed 12th grade with a focus on Science and Mathematics, building a strong analytical foundation for engineering studies.',
            display_order: 2
        }
    ]);

    console.log('✅ Database seeded with sample data');
}

module.exports = { connectDatabase, Project, Skill, Experience, Education, Contact, Profile, AdminUser };

