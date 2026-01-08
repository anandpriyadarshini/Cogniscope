// Quiz Setup JavaScript
const API_BASE_URL = 'http://127.0.0.1:8000';

let questions = [];
let nextQuestionId = 1;

// Load existing questions on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadExistingQuestions();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('question-form').addEventListener('submit', handleAddQuestion);
    document.getElementById('clear-form-btn').addEventListener('click', clearForm);
    document.getElementById('save-quiz-btn').addEventListener('click', saveQuizToServer);
}

async function loadExistingQuestions() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/questions`);
        const data = await response.json();
        
        if (data.questions && data.questions.length > 0) {
            questions = data.questions;
            nextQuestionId = Math.max(...questions.map(q => q.id)) + 1;
            renderQuestions();
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        showAlert('Failed to load existing questions', 'error');
    }
}

function handleAddQuestion(e) {
    e.preventDefault();
    
    const questionText = document.getElementById('question-text').value.trim();
    const concept = document.getElementById('concept').value.trim();
    
    const options = [
        document.getElementById('option-0').value.trim(),
        document.getElementById('option-1').value.trim(),
        document.getElementById('option-2').value.trim(),
        document.getElementById('option-3').value.trim()
    ];
    
    const correctAnswerRadio = document.querySelector('input[name="correct-answer"]:checked');
    
    if (!correctAnswerRadio) {
        showAlert('Please select the correct answer', 'error');
        return;
    }
    
    const correctAnswer = parseInt(correctAnswerRadio.value);
    
    // Validate all options are filled
    if (options.some(opt => !opt)) {
        showAlert('Please fill in all answer options', 'error');
        return;
    }
    
    const newQuestion = {
        id: nextQuestionId++,
        text: questionText,
        options: options,
        correct_answer: correctAnswer,
        concept: concept
    };
    
    questions.push(newQuestion);
    renderQuestions();
    clearForm();
    showAlert('Question added successfully! Don\'t forget to save the quiz.', 'success');
}

function clearForm() {
    document.getElementById('question-form').reset();
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    const countElement = document.getElementById('question-count');
    
    countElement.textContent = questions.length;
    
    if (questions.length === 0) {
        container.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">No questions added yet. Add your first question above!</p>';
        return;
    }
    
    container.innerHTML = questions.map((q, index) => `
        <div class="question-item" data-question-id="${q.id}">
            <div class="question-header">
                <div class="question-text">${index + 1}. ${q.text}</div>
                <div class="question-actions">
                    <button class="icon-btn" onclick="editQuestion(${q.id})" title="Edit">✏️</button>
                    <button class="icon-btn" onclick="deleteQuestion(${q.id})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="question-details">
                <strong>Concept:</strong> ${q.concept}
            </div>
            <div class="question-options">
                ${q.options.map((opt, i) => `
                    <div class="question-option ${i === q.correct_answer ? 'correct-answer' : ''}">
                        ${String.fromCharCode(65 + i)}. ${opt} ${i === q.correct_answer ? '✓' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions = questions.filter(q => q.id !== questionId);
        renderQuestions();
        showAlert('Question deleted successfully', 'success');
    }
}

function editQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    // Populate form with question data
    document.getElementById('question-text').value = question.text;
    document.getElementById('concept').value = question.concept;
    
    question.options.forEach((opt, i) => {
        document.getElementById(`option-${i}`).value = opt;
    });
    
    const correctRadio = document.querySelector(`input[name="correct-answer"][value="${question.correct_answer}"]`);
    if (correctRadio) correctRadio.checked = true;
    
    // Remove the question (will be re-added when form is submitted)
    questions = questions.filter(q => q.id !== questionId);
    renderQuestions();
    
    // Scroll to form
    document.getElementById('question-form').scrollIntoView({ behavior: 'smooth' });
    showAlert('Question loaded for editing', 'success');
}

async function saveQuizToServer() {
    if (questions.length === 0) {
        showAlert('Please add at least one question before saving', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('save-quiz-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/save-questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questions: questions })
        });
        
        if (response.ok) {
            const data = await response.json();
            showAlert(`Quiz saved successfully! ${questions.length} questions are now available for students.`, 'success');
        } else {
            throw new Error('Failed to save quiz');
        }
    } catch (error) {
        console.error('Error saving quiz:', error);
        showAlert('Failed to save quiz. Please try again.', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save Quiz';
    }
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    
    const alertHtml = `
        <div class="alert ${alertClass}">
            ${message}
        </div>
    `;
    
    alertContainer.innerHTML = alertHtml;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
    
    // Scroll to alert
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
