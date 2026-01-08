// Configuration for the Learning Gaps Detector v2
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
            'low': '#10B981',         // Green
            'medium': '#F59E0B',      // Orange
            'high': '#EF4444',        // Red
            'critical': '#DC2626',    // Dark Red
            'safe': '#10B981',        // Green (legacy)
            'watch': '#F59E0B',       // Orange (legacy)
            'at_risk': '#EF4444'      // Red (legacy)
        },
        RISK_ICONS: {
            'low': '✅',
            'medium': '⚠️',
            'high': '🚨',
            'critical': '🔴',
            'safe': '✅',              // legacy
            'watch': '⚠️',             // legacy
            'at_risk': '🚨'            // legacy
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
