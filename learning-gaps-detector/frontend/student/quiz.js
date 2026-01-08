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
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Login
        document.getElementById('start-quiz-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('student-id').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startQuiz();
        });

        // Quiz navigation
        document.getElementById('submit-answer-btn').addEventListener('click', () => this.submitAnswer());
        
        // Confidence slider
        document.getElementById('confidence-slider').addEventListener('input', (e) => {
            document.getElementById('confidence-value').textContent = `Confidence: ${e.target.value}/5`;
        });

        // Completion actions
        document.getElementById('restart-btn').addEventListener('click', () => this.resetQuiz());
        document.getElementById('view-detailed-results-btn')?.addEventListener('click', () => this.viewDetailedResults());
    }

    async startQuiz() {
        const studentIdInput = document.getElementById('student-id');
        const studentId = studentIdInput.value.trim();

        if (!studentId) {
            alert('Please enter your Student ID');
            return;
        }

        this.studentId = studentId;
        
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
        console.log('Displaying results:', analysis);
        
        // Hide loading spinner
        const loadingEl = document.getElementById('analysis-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        
        // Show results preview
        const resultsPreview = document.getElementById('results-preview');
        const resultsContent = document.getElementById('results-content');
        
        if (!resultsPreview || !resultsContent) {
            console.error('Results elements not found');
            return;
        }
        
        resultsPreview.style.display = 'block';
        
        // Generate results HTML
        const riskClass = `risk-${analysis.overall_risk || 'medium'}`;
        const riskIcon = CONFIG.UI.RISK_ICONS[analysis.overall_risk] || '📊';
        
        // Calculate score
        const correctAnswers = this.attempts.filter(a => a.is_correct).length;
        const totalQuestions = this.attempts.length;
        const scorePercentage = (correctAnswers / totalQuestions * 100).toFixed(1);
        
        resultsContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div class="score-display">${correctAnswers}/${totalQuestions}</div>
                <p style="color: #6b6b6b; font-size: 1.1rem;">Score: ${scorePercentage}%</p>
            </div>
            
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f5f5f5; border-radius: 10px;">
                <strong style="font-size: 1.1rem;">📊 Overall Assessment:</strong>
                <div style="margin-top: 0.5rem;">
                    <span class="risk-indicator ${riskClass}">
                        ${riskIcon} ${(analysis.overall_risk || 'medium').replace('_', ' ').toUpperCase()}
                    </span>
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <strong style="font-size: 1.1rem;">📈 Gap Score:</strong>
                <div style="font-size: 1.5rem; font-weight: 600; color: #1CB0F6; margin-top: 0.5rem;">
                    ${((analysis.overall_score || 0) * 100).toFixed(1)}%
                </div>
            </div>
            
            ${analysis.recommendations && analysis.recommendations.length > 0 ? `
            <div style="margin-bottom: 1.5rem;">
                <strong style="font-size: 1.1rem;">💡 Key Recommendations:</strong>
                <ul style="margin-left: 1rem; margin-top: 0.5rem; color: #4a4a4a;">
                    ${analysis.recommendations.slice(0, 3).map(rec => `<li style="margin: 0.5rem 0;">${rec}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${analysis.concept_gaps && analysis.concept_gaps.length > 0 ? `
            <div style="margin-bottom: 1rem;">
                <strong style="font-size: 1.1rem;">🎯 Concept Performance:</strong>
                <div style="margin-top: 0.75rem;">
                    ${analysis.concept_gaps.map(concept => `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding: 0.5rem; background: #fafafa; border-radius: 8px;">
                            <span style="font-weight: 500;">${concept.concept}:</span>
                            <span class="risk-indicator risk-${concept.risk_level}">
                                ${CONFIG.UI.RISK_ICONS[concept.risk_level] || '📊'} ${concept.risk_level.toUpperCase()}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #e3f2fd; border-radius: 10px; border-left: 4px solid #1CB0F6;">
                <p style="margin: 0; color: #1976d2;">
                    <strong>✨ Great job!</strong> Your teacher will review these results and provide personalized feedback to help you improve.
                </p>
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
