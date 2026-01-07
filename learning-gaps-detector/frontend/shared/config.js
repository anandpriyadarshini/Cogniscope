// Configuration for the Learning Gaps Detector
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000/api',
    
    // API Endpoints
    ENDPOINTS: {
        QUESTIONS: '/questions',
        SUBMIT_QUIZ: '/submit-quiz',
        STUDENT_RESULTS: '/student-results',
        TEACHER_DASHBOARD: '/teacher-dashboard',
        STUDENT_DETAIL: '/student-detail',
        RESET_DATA: '/reset-data'
    },
    
    // UI Configuration
    UI: {
        RISK_COLORS: {
            'safe': '#10B981',      // Green
            'watch': '#F59E0B',     // Orange
            'at_risk': '#EF4444'    // Red
        },
        RISK_ICONS: {
            'safe': '✅',
            'watch': '⚠️',
            'at_risk': '🚨'
        }
    },
    
    // Quiz Configuration
    QUIZ: {
        MIN_CONFIDENCE: 1,
        MAX_CONFIDENCE: 5,
        WARNING_FAST_TIME: 5,  // seconds
        WARNING_SLOW_TIME: 60  // seconds
    }
};
