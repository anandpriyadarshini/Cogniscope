// Enhanced Student Quiz Logic
class StudentQuiz {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.startTime = null;
        this.questionStartTime = null;
        this.attempts = [];
        this.studentId = '';
        this.quizId = '';
        this.behaviorPatterns = {
            avgResponseTime: 0,
            fastResponses: 0,
            slowResponses: 0,
            confidencePattern: []
        };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Login section
        document.getElementById('start-quiz-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('student-id').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startQuiz();
        });
        
        // Quiz section
        document.getElementById('submit-answer-btn').addEventListener('click', () => this.submitAnswer());
        
        // Confidence slider
        const confidenceSlider = document.getElementById('confidence-slider');
        confidenceSlider.addEventListener('input', (e) => {
            document.getElementById('confidence-value').textContent = `Confidence: ${e.target.value}/5`;
        });
        
        // Completion section
        document.getElementById('view-detailed-results-btn').addEventListener('click', () => this.viewDetailedResults());
        document.getElementById('retake-quiz-btn').addEventListener('click', () => this.retakeQuiz());
        document.getElementById('retry-btn').addEventListener('click', () => this.retryAfterError());
    }

    async startQuiz() {
        const studentIdInput = document.getElementById('student-id');
        this.studentId = studentIdInput.value.trim();
        
        if (!this.studentId) {
            alert('Please enter your Student ID to continue.');
            studentIdInput.focus();
            return;
        }
        
        // Generate quiz ID
        this.quizId = `quiz_${Date.now()}`;
        this.startTime = new Date();
        
        try {
            // Load questions from backend
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.QUESTIONS}`);
            if (!response.ok) {
                throw new Error('Failed to load quiz questions');
            }
            
            const data = await response.json();
            this.questions = data.questions;
            
            // Hide login section, show quiz
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('quiz-section').classList.remove('hidden');
            
            // Start first question
            this.showQuestion(0);
            
            // Add subtle behavioral tracking
            this.startBehaviorTracking();
            
        } catch (error) {
            console.error('Error starting quiz:', error);
            this.showError('Failed to load quiz questions. Please check your connection and try again.');
        }
    }

    showQuestion(index) {
        this.currentQuestionIndex = index;
        this.questionStartTime = new Date();
        
        const question = this.questions[index];
        const totalQuestions = this.questions.length;
        
        // Update progress
        const progress = ((index + 1) / totalQuestions) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('question-counter').textContent = `Question ${index + 1} of ${totalQuestions}`;
        
        // Display question
        document.getElementById('question-text').textContent = question.text;
        
        // Create options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, optionIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.textContent = option;
            optionDiv.addEventListener('click', () => this.selectOption(optionIndex, optionDiv));
            optionsContainer.appendChild(optionDiv);
        });
        
        // Reset confidence slider
        const confidenceSlider = document.getElementById('confidence-slider');
        confidenceSlider.value = 3;
        document.getElementById('confidence-value').textContent = 'Confidence: 3/5';
        
        // Disable submit button until option is selected
        document.getElementById('submit-answer-btn').disabled = true;
        
        // Start question timer
        this.startQuestionTimer();
        
        // Add subtle learning analytics
        this.trackQuestionBehavior(question);
    }

    selectOption(optionIndex, optionElement) {
        // Remove previous selection
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        optionElement.classList.add('selected');
        
        // Enable submit button
        document.getElementById('submit-answer-btn').disabled = false;
        
        // Store selection temporarily
        this.selectedAnswer = optionIndex;
    }

    startQuestionTimer() {
        const timerElement = document.getElementById('question-timer');
        let seconds = 0;
        
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        this.questionTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            if (minutes > 0) {
                timerElement.textContent = `⏱️ ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            } else {
                timerElement.textContent = `⏱️ ${seconds}s`;
            }
            
            // Subtle UI feedback for timing
            if (seconds > 60) {
                timerElement.style.color = '#f59e0b'; // Orange for slow
            } else if (seconds < 5) {
                timerElement.style.color = '#10b981'; // Green for quick
            } else {
                timerElement.style.color = '#4a5568'; // Default
            }
        }, 1000);
    }

    submitAnswer() {
        if (this.selectedAnswer === undefined) {
            alert('Please select an answer before submitting.');
            return;
        }
        
        // Calculate time taken
        const timeTaken = (new Date() - this.questionStartTime) / 1000;
        const confidence = parseInt(document.getElementById('confidence-slider').value);
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correct_answer;
        
        // Store attempt
        const attempt = {
            question_id: question.id,
            selected_answer: this.selectedAnswer,
            time_taken: timeTaken,
            confidence: confidence,
            is_correct: isCorrect
        };
        
        this.attempts.push(attempt);
        
        // Update behavior patterns
        this.updateBehaviorPatterns(attempt);
        
        // Clear timer
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        // Move to next question or complete quiz
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);
        } else {
            this.completeQuiz();
        }
    }

    updateBehaviorPatterns(attempt) {
        // Track response timing patterns
        if (attempt.time_taken < 5) {
            this.behaviorPatterns.fastResponses++;
        } else if (attempt.time_taken > 45) {
            this.behaviorPatterns.slowResponses++;
        }
        
        // Track confidence patterns
        this.behaviorPatterns.confidencePattern.push({
            confidence: attempt.confidence,
            correct: attempt.is_correct,
            time: attempt.time_taken
        });
        
        // Calculate running average
        const totalTime = this.attempts.reduce((sum, att) => sum + att.time_taken, 0);
        this.behaviorPatterns.avgResponseTime = totalTime / this.attempts.length;
    }

    startBehaviorTracking() {
        // Subtle behavioral tracking for learning analytics
        // Track window focus/blur (might indicate external assistance)
        let focusEvents = 0;
        
        window.addEventListener('blur', () => {
            focusEvents++;
            // Don't intrude, just note for analytics
        });
        
        // Track copy/paste events (might indicate AI assistance)
        let pasteEvents = 0;
        document.addEventListener('paste', (e) => {
            pasteEvents++;
            // Note: We're not preventing paste, just tracking
        });
        
        this.behaviorPatterns.focusEvents = focusEvents;
        this.behaviorPatterns.pasteEvents = pasteEvents;
    }

    trackQuestionBehavior(question) {
        // Track engagement patterns
        let mouseMovements = 0;
        let clickCount = 0;
        
        const trackMovement = () => mouseMovements++;
        const trackClicks = () => clickCount++;
        
        document.addEventListener('mousemove', trackMovement);
        document.addEventListener('click', trackClicks);
        
        // Store engagement data
        setTimeout(() => {
            document.removeEventListener('mousemove', trackMovement);
            document.removeEventListener('click', trackClicks);
            
            this.behaviorPatterns[`question_${question.id}_engagement`] = {
                mouseMovements,
                clickCount
            };
        }, 1000); // Track for first second of question
    }

    async completeQuiz() {
        // Hide quiz section, show completion
        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('completion-section').classList.remove('hidden');
        
        // Show loading animation
        document.getElementById('analysis-loading').classList.remove('hidden');
        
        try {
            // Prepare submission data
            const submission = {
                student_id: this.studentId,
                quiz_id: this.quizId,
                attempts: this.attempts,
                timestamp: new Date().toISOString()
            };
            
            // Submit to backend for analysis
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
            this.analysisResult = result.analysis;
            
            // Hide loading, show results preview
            setTimeout(() => {
                document.getElementById('analysis-loading').classList.add('hidden');
                this.showResultsPreview();
                document.getElementById('results-preview').classList.remove('hidden');
            }, 2000); // Give time for "analysis" effect
            
        } catch (error) {
            console.error('Error submitting quiz:', error);
            document.getElementById('analysis-loading').classList.add('hidden');
            this.showError('Failed to submit quiz. Please try again.');
        }
    }

    showResultsPreview() {
        const analysis = this.analysisResult;
        const resultsContent = document.getElementById('results-content');
        
        const accuracy = this.attempts.filter(a => a.is_correct).length / this.attempts.length;
        const avgTime = this.attempts.reduce((sum, a) => sum + a.time_taken, 0) / this.attempts.length;
        const avgConfidence = this.attempts.reduce((sum, a) => sum + a.confidence, 0) / this.attempts.length;
        
        resultsContent.innerHTML = `
            <div class="results-summary">
                <div class="result-card">
                    <h4>📊 Performance</h4>
                    <p><strong>Accuracy:</strong> ${(accuracy * 100).toFixed(0)}%</p>
                    <p><strong>Risk Level:</strong> 
                        <span class="risk-indicator risk-${analysis.overall_risk}">
                            ${CONFIG.UI.RISK_ICONS[analysis.overall_risk]} ${analysis.overall_risk.replace('_', ' ').toUpperCase()}
                        </span>
                    </p>
                </div>
                
                <div class="result-card">
                    <h4>⏱️ Timing</h4>
                    <p><strong>Average Time:</strong> ${avgTime.toFixed(1)}s</p>
                    <p><strong>Learning Pattern:</strong> ${this.interpretPattern()}</p>
                </div>
                
                <div class="result-card">
                    <h4>🎯 Confidence</h4>
                    <p><strong>Avg Confidence:</strong> ${avgConfidence.toFixed(1)}/5</p>
                    <p><strong>Calibration:</strong> ${this.interpretConfidence(avgConfidence, accuracy)}</p>
                </div>
            </div>
            
            <div class="learning-insights">
                <h4>💡 Learning Insights</h4>
                <ul>
                    ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    interpretPattern() {
        const avgTime = this.behaviorPatterns.avgResponseTime;
        const fastRate = this.behaviorPatterns.fastResponses / this.attempts.length;
        
        if (avgTime < 10 && fastRate > 0.6) {
            return 'Quick & Efficient';
        } else if (avgTime > 30) {
            return 'Thoughtful & Careful';
        } else {
            return 'Balanced Approach';
        }
    }

    interpretConfidence(avgConfidence, accuracy) {
        const diff = Math.abs(avgConfidence / 5 - accuracy);
        
        if (diff < 0.1) {
            return 'Well Calibrated';
        } else if (avgConfidence / 5 > accuracy + 0.2) {
            return 'Overconfident';
        } else {
            return 'Underconfident';
        }
    }

    viewDetailedResults() {
        // This would open teacher dashboard or detailed analysis
        const teacherDashboard = '../teacher/dashboard.html';
        window.open(teacherDashboard, '_blank');
    }

    retakeQuiz() {
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.attempts = [];
        this.selectedAnswer = undefined;
        this.behaviorPatterns = {
            avgResponseTime: 0,
            fastResponses: 0,
            slowResponses: 0,
            confidencePattern: []
        };
        
        // Show login section
        document.getElementById('completion-section').classList.add('hidden');
        document.getElementById('login-section').classList.remove('hidden');
        
        // Clear student ID for new attempt
        document.getElementById('student-id').value = '';
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        
        // Hide other sections, show error
        ['login-section', 'quiz-section', 'completion-section'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
        
        document.getElementById('error-section').classList.remove('hidden');
    }

    retryAfterError() {
        // Hide error, show login
        document.getElementById('error-section').classList.add('hidden');
        document.getElementById('login-section').classList.remove('hidden');
    }
}

// Initialize quiz when page loads
let quiz;
document.addEventListener('DOMContentLoaded', () => {
    quiz = new StudentQuiz();
    
    // Add some visual flair
    document.body.style.animation = 'fadeIn 0.5s ease-out';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .results-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .result-card {
            background: #f8f9ff;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .result-card h4 {
            color: #4a5568;
            margin-bottom: 0.5rem;
        }
        
        .learning-insights {
            background: #f0fff4;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }
        
        .learning-insights ul {
            margin-left: 1rem;
        }
        
        .learning-insights li {
            margin-bottom: 0.5rem;
            color: #2d3748;
        }
    `;
    document.head.appendChild(style);
});

// Add smooth transitions for better UX
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const element = mutation.target;
                if (element.classList.contains('hidden')) {
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(-10px)';
                } else {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            }
        });
    });
    
    document.querySelectorAll('.section').forEach(section => {
        section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    });
});
