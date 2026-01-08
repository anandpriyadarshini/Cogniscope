/* ============================================
   Cogniscope Authentication - JavaScript
   Handles form switching, validation, and API calls
   ============================================ */

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Global state
let currentRole = 'student';
let currentTab = 'login';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    displayCorrectForm();
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Role selector buttons
    const roleBtns = document.querySelectorAll('.role-btn');
    roleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            switchRole(this.dataset.role);
        });
    });

    // Tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });

    // Tab switcher links
    const switchTabLinks = document.querySelectorAll('.switch-tab');
    switchTabLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            switchTab(this.dataset.tab);
        });
    });

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') {
                e.preventDefault();
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Form submission with real API calls
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    });
}

/**
 * Switch between Student and Teacher roles
 * @param {string} role - 'student' or 'teacher'
 */
function switchRole(role) {
    currentRole = role;

    // Update active button
    const roleBtns = document.querySelectorAll('.role-btn');
    roleBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.role === role) {
            btn.classList.add('active');
        }
    });

    // Reset to login tab when switching roles
    currentTab = 'login';
    updateTabButtons();
    displayCorrectForm();
}

/**
 * Switch between Login and Signup tabs
 * @param {string} tab - 'login' or 'signup'
 */
function switchTab(tab) {
    currentTab = tab;
    updateTabButtons();
    displayCorrectForm();
}

/**
 * Update visual state of tab buttons
 */
function updateTabButtons() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === currentTab) {
            btn.classList.add('active');
        }
    });
}

/**
 * Display the correct form based on current role and tab
 */
function displayCorrectForm() {
    // Hide all forms
    const allForms = document.querySelectorAll('.form-container');
    allForms.forEach(form => {
        form.classList.remove('active');
    });

    // Show the correct form
    const formId = `${currentRole}-${currentTab}`;
    const activeForm = document.querySelector(`[data-form="${formId}"]`);
    if (activeForm) {
        activeForm.classList.add('active');
    }
}

/**
 * Handle form submission and API calls
 * @param {string} role - 'student' or 'teacher'
 */
function redirectTo(role) {
    // Get the active form
    const form = document.querySelector(`.form-container.active .auth-form`);
    
    if (!validateForm(form)) {
        showError("Please fill in all required fields.");
        return;
    }

    // Collect form data
    const formData = getFormData(form);
    
    // Get submit button
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Processing...';

    // Determine if it's login or signup
    const isLogin = currentTab === 'login';
    const endpoint = isLogin ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/auth/signup`;

    // Make API call
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            // Handle error response
            return response.json().then(data => {
                throw {
                    status: response.status,
                    message: data.detail || 'Authentication failed'
                };
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Save token to localStorage
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_role', data.user.role);
                localStorage.setItem('user_name', data.user.name);
                localStorage.setItem('user_email', data.user.email);
            }

            // Show success message
            submitBtn.textContent = '✓ ' + (isLogin ? 'Logged in!' : 'Account created!');
            
            // Redirect based on role
            setTimeout(() => {
                if (role === 'student') {
                    window.location.href = './student/index.html';
                } else if (role === 'teacher') {
                    window.location.href = './teacher/index.html';
                }
            }, 1000);
        } else {
            throw new Error(data.detail || 'Authentication failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        let errorMessage = error.message || 'An error occurred. Please try again.';
        
        // Special handling for role mismatch errors
        if (error.status === 401 && error.message) {
            if (error.message.includes('registered as')) {
                errorMessage = error.message;
            }
        }
        
        showError(errorMessage);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

/**
 * Get form data as object
 * @param {HTMLElement} form - The form element
 * @returns {object} Form data
 */
function getFormData(form) {
    const data = {
        role: currentRole
    };

    const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
        const name = input.name || input.id;
        if (name) {
            data[name] = input.value;
        }
    });

    return data;
}

/**
 * Show error message to user
 * @param {string} message - Error message
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = '❌ ' + message;
    errorDiv.style.cssText = `
        background-color: #fee2e2;
        color: #991b1b;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border-left: 4px solid #dc2626;
        animation: slideDown 0.3s ease-out;
    `;

    const form = document.querySelector(`.form-container.active`);
    if (form) {
        form.insertBefore(errorDiv, form.firstChild);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

/**
 * Show success message to user
 * @param {string} message - Success message
 */
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = '✓ ' + message;
    successDiv.style.cssText = `
        background-color: #dcfce7;
        color: #166534;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border-left: 4px solid #16a34a;
        animation: slideDown 0.3s ease-out;
    `;

    const form = document.querySelector(`.form-container.active`);
    if (form) {
        form.insertBefore(successDiv, form.firstChild);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

/**
 * Validate form fields
 * @param {HTMLElement} form - The form element to validate
 * @returns {boolean} - True if all required fields are filled
 */
function validateForm(form) {
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            // Visual feedback for empty fields
            input.style.borderColor = '#ef4444';
            input.focus();
            setTimeout(() => {
                input.style.borderColor = '#e5e7eb';
            }, 1500);
        }
    });

    return isValid;
}

/**
 * Add keyboard shortcuts
 * Tab key to switch roles (Alt + S for Student, Alt + T for Teacher)
 * Tab key to switch between Login/Signup
 */
document.addEventListener('keydown', function (e) {
    // Alt + S: Switch to Student
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        switchRole('student');
    }
    // Alt + T: Switch to Teacher
    if (e.altKey && e.key === 't') {
        e.preventDefault();
        switchRole('teacher');
    }
    // Alt + L: Switch to Login
    if (e.altKey && e.key === 'l') {
        e.preventDefault();
        switchTab('login');
    }
    // Alt + U: Switch to Signup
    if (e.altKey && e.key === 'u') {
        e.preventDefault();
        switchTab('signup');
    }
});

/**
 * Add smooth scroll to top on page load
 */
window.addEventListener('load', function () {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
});

/**
 * Add focus trap for accessibility
 * Keeps focus within the modal when it's the active section
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}

// Apply focus trap to auth card
const authCard = document.querySelector('.auth-card');
if (authCard) {
    trapFocus(authCard);
}

/**
 * Email validation helper (optional)
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Password strength validator (optional)
 */
function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    
    return strength; // 0-4
}

/**
 * Log analytics or user interactions (placeholder)
 */
function trackEvent(eventName, eventData = {}) {
    console.log(`Event: ${eventName}`, eventData);
    // This is where you'd send data to analytics service
    // Example: sendToAnalytics({ event: eventName, ...eventData });
}

// Track page views
document.addEventListener('scroll', function () {
    const authSection = document.querySelector('#auth');
    const aboutSection = document.querySelector('#about');
    
    if (isInViewport(authSection)) {
        trackEvent('viewed_auth_section');
    }
    if (isInViewport(aboutSection)) {
        trackEvent('viewed_about_section');
    }
});

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
        rect.top < window.innerHeight &&
        rect.bottom > 0
    );
}
