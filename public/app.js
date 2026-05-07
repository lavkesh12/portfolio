// ============================================
//  Portfolio App — Frontend Logic
// ============================================

const API = '';

// ---- State ----
let allProjects = [];
let currentFilter = 'all';

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadProjects();
    loadSkills();
    loadExperience();
    loadEducation();
    loadStats();
    initNavigation();
    initContactForm();
    initScrollReveal();
});

// ============================================
//  Data Fetching
// ============================================

async function loadProfile() {
    try {
        const res = await fetch(`${API}/api/profile`);
        const profile = await res.json();
        if (!profile || !profile.name) return;

        document.getElementById('hero-name').textContent = profile.name;
        document.getElementById('hero-bio').textContent = profile.bio || '';
        document.getElementById('nav-logo').textContent = getInitials(profile.name) + '.';
        document.getElementById('footer-name').textContent = profile.name;

        if (profile.email) {
            document.getElementById('contact-email').textContent = profile.email;
        }
        if (profile.location) {
            document.getElementById('contact-location').textContent = profile.location;
        }
        if (profile.github) {
            document.getElementById('github-link').href = profile.github;
            document.getElementById('footer-github').href = profile.github;
        }
        if (profile.linkedin) {
            document.getElementById('linkedin-link').href = profile.linkedin;
            document.getElementById('footer-linkedin').href = profile.linkedin;
        }
        if (profile.twitter) {
            document.getElementById('footer-twitter').href = profile.twitter;
        }
    } catch (e) { console.error('Profile load error:', e); }
}

async function loadProjects() {
    try {
        const res = await fetch(`${API}/api/projects`);
        allProjects = await res.json();
        renderProjects(allProjects);
    } catch (e) { console.error('Projects load error:', e); }
}

async function loadSkills() {
    try {
        const res = await fetch(`${API}/api/skills`);
        const data = await res.json();
        renderSkills(data.grouped);
    } catch (e) { console.error('Skills load error:', e); }
}

async function loadExperience() {
    try {
        const res = await fetch(`${API}/api/experiences`);
        const experiences = await res.json();
        renderTimeline(experiences);
    } catch (e) { console.error('Experience load error:', e); }
}

async function loadEducation() {
    try {
        const res = await fetch(`${API}/api/education`);
        const education = await res.json();
        renderEducation(education);
    } catch (e) { console.error('Education load error:', e); }
}

async function loadStats() {
    try {
        const res = await fetch(`${API}/api/stats`);
        const stats = await res.json();
        const statEls = document.querySelectorAll('.hero-stat-value');
        if (statEls[0]) statEls[0].setAttribute('data-count', stats.projects);
        if (statEls[1]) statEls[1].setAttribute('data-count', stats.experience_years);
        if (statEls[2]) statEls[2].setAttribute('data-count', stats.skills);
        animateCounters();
    } catch (e) { console.error('Stats load error:', e); }
}

// ============================================
//  Rendering
// ============================================

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = projects.map((p, i) => `
        <div class="project-card" style="animation-delay: ${i * 0.1}s" data-category="${p.category}">
            ${p.featured ? '<span class="project-featured-badge">Featured</span>' : ''}
            <img src="${p.image_url || '/api/placeholder/project/' + (i+1)}" alt="${p.title}" class="project-card-image" loading="lazy">
            <div class="project-card-body">
                <h3 class="project-card-title">${p.title}</h3>
                <p class="project-card-desc">${p.description}</p>
                <div class="project-tags">
                    ${(p.tech_stack || []).map(t => `<span class="project-tag">${t.trim()}</span>`).join('')}
                </div>
                <div class="project-card-actions">
                    ${p.live_url ? `<a href="${p.live_url}" target="_blank" class="btn btn-primary btn-sm"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                    ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="btn btn-secondary btn-sm"><i class="fab fa-github"></i> Code</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderSkills(grouped) {
    const container = document.getElementById('skills-grid');
    const categoryIcons = {
        'Frontend': 'fas fa-palette',
        'Backend': 'fas fa-server',
        'Languages': 'fas fa-code',
        'Tools': 'fas fa-wrench',
        'DevOps': 'fas fa-cloud',
        'Design': 'fas fa-pen-nib'
    };

    container.innerHTML = Object.entries(grouped).map(([cat, skills]) => `
        <div class="skill-category-card">
            <div class="skill-category-title">
                <div class="skill-category-icon">
                    <i class="${categoryIcons[cat] || 'fas fa-code'}"></i>
                </div>
                ${cat}
            </div>
            ${skills.map(s => `
                <div class="skill-item">
                    <div class="skill-info">
                        <span class="skill-name">${s.name}</span>
                        <span class="skill-percent">${s.proficiency}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-bar-fill" style="--target-width: ${s.proficiency}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');

    // Trigger skill bar animations after a delay
    setTimeout(() => {
        document.querySelectorAll('.skill-bar-fill').forEach(bar => {
            bar.classList.add('animated');
        });
    }, 500);
}

function renderTimeline(experiences) {
    const container = document.getElementById('timeline');
    container.innerHTML = experiences.map(e => {
        const startDate = formatDate(e.start_date);
        const endDate = e.is_current ? 'Present' : formatDate(e.end_date);
        return `
            <div class="timeline-item ${e.is_current ? 'timeline-item--current' : ''}">
                <div class="timeline-dot"></div>
                <div class="timeline-card">
                    <div class="timeline-date">${startDate} — ${endDate}</div>
                    <h3 class="timeline-title">${e.title}</h3>
                    <p class="timeline-company">${e.company} · ${e.location || ''}</p>
                    <p class="timeline-desc">${e.description || ''}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderEducation(education) {
    const container = document.getElementById('education-grid');
    container.innerHTML = education.map(e => `
        <div class="education-card">
            <div class="education-icon"><i class="fas fa-graduation-cap"></i></div>
            <div class="education-degree">${e.degree}</div>
            <div class="education-school">${e.institution}</div>
            <div class="education-year">${e.start_year}${e.end_year && e.end_year !== e.start_year ? ' — ' + e.end_year : ''}</div>
        </div>
    `).join('');
}

// ============================================
//  Navigation
// ============================================

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');

    // Scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
    });

    // Active link tracking
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            if (window.scrollY >= top) current = section.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => links.classList.remove('open'));
    });

    // Project filter
    document.getElementById('projects-filter').addEventListener('click', e => {
        if (!e.target.classList.contains('filter-btn')) return;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;

        const filtered = currentFilter === 'all'
            ? allProjects
            : allProjects.filter(p => p.category === currentFilter);
        renderProjects(filtered);
    });
}

// ============================================
//  Contact Form
// ============================================

function initContactForm() {
    const form = document.getElementById('contact-form');
    const msg = document.getElementById('form-message');

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim()
        };

        if (!data.name || !data.email || !data.message) {
            showFormMessage('Please fill in all required fields.', 'error');
            return;
        }

        try {
            const res = await fetch(`${API}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                showFormMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
                form.reset();
            } else {
                showFormMessage(result.error || 'Something went wrong.', 'error');
            }
        } catch {
            showFormMessage('Network error. Please try again.', 'error');
        }
    });

    function showFormMessage(text, type) {
        msg.textContent = text;
        msg.className = `form-message ${type}`;
        setTimeout(() => { msg.className = 'form-message'; }, 5000);
    }
}

// ============================================
//  Scroll Reveal & Counters
// ============================================

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Animate skill bars when skills section is visible
                if (entry.target.id === 'skills-grid') {
                    entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
                        bar.classList.add('animated');
                    });
                }
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function animateCounters() {
    const counters = document.querySelectorAll('.hero-stat-value');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count')) || 0;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.textContent = target + '+';
                clearInterval(timer);
            } else {
                counter.textContent = current;
            }
        }, 40);
    });
}

// ============================================
//  Helpers
// ============================================

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1] || ''} ${year}`;
}
