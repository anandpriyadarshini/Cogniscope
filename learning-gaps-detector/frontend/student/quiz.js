// Student Quiz Interface Logic
class QuizApp {
    constructor() {
        this.currentQuestion = 0;
        this.questions = [];
        this.attempts = [];
        this.startTime = null;
        this.questionStartTime = null;
        this.studentId = '';
        this.selectedAnswer = null;
        this.authToken = null;
        this.userName = null;

        this.checkAuthentication();
        this.initializeEventListeners();
    }

    /**
     * Check if user is authenticated
     */
    checkAuthentication() {
        this.authToken = localStorage.getItem('auth_token');
        this.userName = localStorage.getItem('user_name');
        const userRole = localStorage.getItem('user_role');

        if (!this.authToken || userRole !== 'student') {
            // Redirect to login if not authenticated
            window.location.href = '../login.html';
            return;
        }

        // Update greeting with user name
        const greeting = document.getElementById('user-greeting');
        if (greeting && this.userName) {
            greeting.textContent = `Welcome, ${this.userName}! 👋`;
        }

        // Always use studentId from localStorage (set at login)
        const studentId = localStorage.getItem('studentId');
        if (studentId) {
            this.studentId = studentId;
        } else {
            // If not set, force logout
            window.location.href = '../login.html';
        }
    }

    initializeEventListeners() {
        // Quiz navigation
        document.getElementById('submit-answer-btn').addEventListener('click', () => this.submitAnswer());

        // Confidence slider
        document.getElementById('confidence-slider').addEventListener('input', (e) => {
            document.getElementById('confidence-value').textContent = `Confidence: ${e.target.value}/5`;
        });

        // Completion actions
        document.getElementById('retake-quiz-btn').addEventListener('click', () => this.resetQuiz());
        document.getElementById('retry-btn').addEventListener('click', () => this.resetQuiz());
        document.getElementById('view-detailed-results-btn').addEventListener('click', () => this.viewDetailedResults());
    }

    async startQuiz() {
        // No need to get studentId from input, always use authenticated session
        try {
            this.showSection('quiz-section');
            await this.loadQuestions();
            this.startQuizTimer();
            this.displayQuestion();
        } catch (error) {
            this.showError('Failed to load quiz questions. Please try again.');
        }
    }

    async loadQuestions() {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.QUESTIONS}`);
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        this.questions = data.questions;
    }

    startQuizTimer() {
        this.startTime = Date.now();
    }

    displayQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.completeQuiz();
            return;
        }

        const question = this.questions[this.currentQuestion];
        this.questionStartTime = Date.now();
        this.selectedAnswer = null;

        // Update progress
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('question-counter').textContent = 
            `Question ${this.currentQuestion + 1} of ${this.questions.length}`;

        // Display question
        document.getElementById('question-text').textContent = question.text;
        
        // Display options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.textContent = option;
            optionDiv.addEventListener('click', () => this.selectOption(index, optionDiv));
            optionsContainer.appendChild(optionDiv);
        });

        // Reset confidence
        document.getElementById('confidence-slider').value = 3;
        document.getElementById('confidence-value').textContent = 'Confidence: 3/5';

        // Start question timer
        this.updateQuestionTimer();
        
        // Disable submit button until answer is selected
        document.getElementById('submit-answer-btn').disabled = true;
    }

    selectOption(index, optionElement) {
        // Remove previous selection
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        optionElement.classList.add('selected');
        this.selectedAnswer = index;
        
        // Enable submit button
        document.getElementById('submit-answer-btn').disabled = false;
    }

    updateQuestionTimer() {
        if (!this.questionStartTime) return;
        
        const timer = setInterval(() => {
            if (this.currentQuestion >= this.questions.length) {
                clearInterval(timer);
                return;
            }
            
            const elapsed = Math.floor((Date.now() - this.questionStartTime) / 1000);
            const timerElement = document.getElementById('question-timer');
            
            if (elapsed < CONFIG.QUIZ.WARNING_FAST_TIME) {
                timerElement.textContent = `⏱️ ${elapsed}s`;
                timerElement.style.color = '#f59e0b'; // Orange for very fast
            } else if (elapsed > CONFIG.QUIZ.WARNING_SLOW_TIME) {
                timerElement.textContent = `⏱️ ${elapsed}s (taking your time?)`;
                timerElement.style.color = '#ef4444'; // Red for very slow
            } else {
                timerElement.textContent = `⏱️ ${elapsed}s`;
                timerElement.style.color = '#4a5568'; // Normal color
            }
        }, 1000);
        
        // Store timer reference for cleanup
        this.currentTimer = timer;
    }

    submitAnswer() {
        if (this.selectedAnswer === null) return;

        const question = this.questions[this.currentQuestion];
        const timeTaken = (Date.now() - this.questionStartTime) / 1000;
        const confidence = parseInt(document.getElementById('confidence-slider').value);

        // Record attempt
        const attempt = {
            question_id: question.id,
            selected_answer: this.selectedAnswer,
            time_taken: timeTaken,
            confidence: confidence,
            is_correct: this.selectedAnswer === question.correct_answer
        };

        this.attempts.push(attempt);

        // Clear current timer
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
        }

        // Move to next question
        this.currentQuestion++;
        this.displayQuestion();
    }

    async completeQuiz() {
        this.showSection('completion-section');
        
        try {
            // Prepare submission
            const submission = {
                student_id: this.studentId,
                quiz_id: `quiz_${Date.now()}`,
                attempts: this.attempts,
                timestamp: new Date().toISOString()
            };

            // Submit to backend
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.SUBMIT_QUIZ}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submission)
            });

            if (!response.ok) {
                throw new Error('Failed to submit quiz');
            }

            const result = await response.json();
            this.displayResults(result.analysis);
            
        } catch (error) {
            console.error('Error submitting quiz:', error);
            this.showError('Failed to submit quiz. Please try again.');
        }
    }

    displayResults(analysis) {
        // Hide loading spinner
        document.getElementById('analysis-loading').style.display = 'none';
        
        // Show results preview
        const resultsPreview = document.getElementById('results-preview');
        const resultsContent = document.getElementById('results-content');
        
        // Generate results HTML
        const riskClass = `risk-${analysis.overall_risk}`;
        const riskIcon = CONFIG.UI.RISK_ICONS[analysis.overall_risk] || '📊';
        
        resultsContent.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <strong>Overall Assessment:</strong>
                <span class="risk-indicator ${riskClass}">
                    ${riskIcon} ${analysis.overall_risk.replace('_', ' ').toUpperCase()}
                </span>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Gap Score:</strong> ${(analysis.overall_score * 100).toFixed(1)}%
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Key Findings:</strong>
                <ul style="margin-left: 1rem; margin-top: 0.5rem;">
                    ${analysis.recommendations.slice(0, 3).map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Concept Performance:</strong>
                <div style="margin-top: 0.5rem;">
                    ${analysis.concept_gaps.map(concept => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>${concept.concept}:</span>
                            <span class="risk-indicator risk-${concept.risk_level}">
                                ${CONFIG.UI.RISK_ICONS[concept.risk_level]} ${concept.risk_level}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        resultsPreview.classList.remove('hidden');
    }

    viewDetailedResults() {
        // This would typically open a detailed results page or modal
        alert('Detailed results would open here. For the demo, check the teacher dashboard to see your results!');
    }

    resetQuiz() {
        this.currentQuestion = 0;
        this.attempts = [];
        this.questions = [];
        this.selectedAnswer = null;
        
        // Clear any running timers
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
        }
        
        // Reset form
        document.getElementById('student-id').value = '';
        
        // Show login section
        this.showSection('login-section');
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show target section
        document.getElementById(sectionId).classList.remove('hidden');
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        this.showSection('error-section');
    }
}

// Initialize the quiz app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});

// Add some helpful animations and UX improvements
document.addEventListener('DOMContentLoaded', () => {
    // Add subtle animations to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Auto-focus student ID input
    document.getElementById('student-id').focus();
});

/**
 * Logout function (accessible globally)
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        
        // Redirect to login
        window.location.href = '../login.html';
    }
}
