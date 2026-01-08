// Teacher Dashboard Logic v2
class TeacherDashboard {
    constructor() {
        console.log('TeacherDashboard constructor called');
        this.dashboardData = null;
        this.filteredStudents = [];
        this.currentRiskFilter = 'all';
        
        this.initializeEventListeners();
        this.loadDashboardData();
    }

    initializeEventListeners() {
        // Header controls
        document.getElementById('refresh-btn').addEventListener('click', () => this.refreshData());
        document.getElementById('reset-data-btn').addEventListener('click', () => this.resetData());
        
        // Filters
        document.getElementById('risk-filter').addEventListener('change', (e) => {
            this.currentRiskFilter = e.target.value;
            this.filterStudents();
        });
        
        // Modal controls
        document.getElementById('close-modal-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('student-modal').addEventListener('click', (e) => {
            if (e.target.id === 'student-modal') {
                this.closeModal();
            }
        });
        
        // Error retry
        document.getElementById('retry-btn').addEventListener('click', () => this.refreshData());
    }

    async loadDashboardData() {
        try {
            console.log('Loading dashboard data...');
            console.log('CONFIG:', CONFIG);
            console.log('API URL:', `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.TEACHER_DASHBOARD}`);
            
            this.showLoading();
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.TEACHER_DASHBOARD}`);
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            
            this.dashboardData = await response.json();
            console.log('Dashboard data loaded:', this.dashboardData);
            this.renderDashboard();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Failed to load dashboard data. Please check if the backend is running.');
        }
    }

    renderDashboard() {
        console.log('Rendering dashboard with data:', this.dashboardData);
        this.renderSummaryCards();
        this.renderStudentsList();
        // Skip concept analysis and insights for now - can be added later
        // this.renderConceptAnalysis();
        // this.renderInsights();
        this.checkForAlerts();
    }

    renderSummaryCards() {
        const summary = this.dashboardData.summary;
        
        document.getElementById('total-students').textContent = summary.total_students;
        document.getElementById('at-risk-students').textContent = summary.at_risk_students;
        document.getElementById('watch-students').textContent = summary.watch_students;
        document.getElementById('safe-students').textContent = summary.safe_students;
    }

    renderStudentsList() {
        const students = this.dashboardData.students;
        this.filteredStudents = students;
        
        const studentsList = document.getElementById('students-list');
        
        if (!studentsList) {
            console.error('students-list element not found');
            return;
        }
        
        if (students.length === 0) {
            studentsList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b6b6b;">No student data available yet. Students will appear here after completing quizzes.</p>';
            return;
        }

        studentsList.innerHTML = '';

        students.forEach(student => {
            const card = this.createStudentCard(student);
            studentsList.appendChild(card);
        });

        this.filterStudents(); // Apply current filter
    }

    createStudentCard(student) {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.setAttribute('data-risk', student.overall_risk);
        
        // Format timestamp
        const lastAssessment = new Date(student.timestamp).toLocaleDateString();
        
        // Format gap score
        const gapScore = ((student.overall_score || 0) * 100).toFixed(1);
        
        // Top concerns
        const concerns = student.top_concerns && student.top_concerns.length > 0 
            ? student.top_concerns.slice(0, 2).join('<br>')
            : 'No major concerns';

        const riskIcon = CONFIG.UI.RISK_ICONS[student.overall_risk] || '📊';
        const riskLabel = (student.overall_risk || 'safe').replace('_', ' ').toUpperCase();

        card.innerHTML = `
            <div class="student-card-header">
                <h3>${student.student_id}</h3>
                <span class="risk-badge risk-${student.overall_risk}">
                    ${riskIcon} ${riskLabel}
                </span>
            </div>
            <div class="student-card-body">
                <div class="stat">
                    <span class="label">Gap Score:</span>
                    <span class="value">${gapScore}%</span>
                </div>
                <div class="stat">
                    <span class="label">Last Assessment:</span>
                    <span class="value">${lastAssessment}</span>
                </div>
                <div class="concerns">
                    <span class="label">Key Concerns:</span>
                    <p class="concerns-text">${concerns}</p>
                </div>
            </div>
            <div class="student-card-footer">
                <button class="btn btn-primary" onclick="dashboard.viewStudentDetails('${student.student_id}')">
                    View Details
                </button>
            </div>
        `;
        
        return card;
    }

    filterStudents() {
        const cards = document.querySelectorAll('.student-card');
        
        cards.forEach(card => {
            const riskLevel = card.getAttribute('data-risk');
            
            if (this.currentRiskFilter === 'all' || riskLevel === this.currentRiskFilter) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    renderConceptAnalysis() {
        const concepts = this.dashboardData.concept_analysis;
        const conceptGrid = document.getElementById('concept-heatmap');
        
        if (Object.keys(concepts).length === 0) {
            conceptGrid.style.display = 'none';
            document.getElementById('no-concepts-message').classList.remove('hidden');
            return;
        }

        conceptGrid.style.display = 'grid';
        document.getElementById('no-concepts-message').classList.add('hidden');
        conceptGrid.innerHTML = '';

        Object.entries(concepts).forEach(([conceptName, data]) => {
            const card = this.createConceptCard(conceptName, data);
            conceptGrid.appendChild(card);
        });
    }

    createConceptCard(conceptName, data) {
        const card = document.createElement('div');
        card.className = 'concept-card';
        
        // Determine risk level based on average gap score and at-risk count
        const riskPercentage = data.at_risk_count / data.total_students;
        let riskClass = 'low-risk';
        
        if (riskPercentage > 0.3 || data.avg_gap_score > 0.6) {
            riskClass = 'high-risk';
        } else if (riskPercentage > 0.1 || data.avg_gap_score > 0.3) {
            riskClass = 'medium-risk';
        }
        
        card.classList.add(riskClass);

        card.innerHTML = `
            <div class="concept-header">
                <div class="concept-name">${conceptName}</div>
                <div class="risk-indicator">
                    ${riskClass === 'high-risk' ? '🔴' : riskClass === 'medium-risk' ? '🟡' : '🟢'}
                </div>
            </div>
            <div class="concept-stats">
                <div class="stat-item">
                    <div class="stat-value">${data.total_students}</div>
                    <div class="stat-label">Students</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${(data.avg_gap_score * 100).toFixed(1)}%</div>
                    <div class="stat-label">Avg Gap</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.at_risk_count}</div>
                    <div class="stat-label">At Risk</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${((data.at_risk_count / data.total_students) * 100).toFixed(0)}%</div>
                    <div class="stat-label">Risk Rate</div>
                </div>
            </div>
        `;

        return card;
    }

    renderInsights() {
        const insights = this.generateInsights();
        const insightsGrid = document.getElementById('insights-content');
        insightsGrid.innerHTML = '';

        insights.forEach(insight => {
            const card = this.createInsightCard(insight);
            insightsGrid.appendChild(card);
        });
    }

    generateInsights() {
        const insights = [];
        const summary = this.dashboardData.summary;
        const students = this.dashboardData.students;
        const concepts = this.dashboardData.concept_analysis;

        // Risk distribution insight
        if (summary.total_students > 0) {
            const atRiskRate = (summary.at_risk_students / summary.total_students) * 100;
            
            if (atRiskRate > 30) {
                insights.push({
                    icon: '⚠️',
                    title: 'High Risk Alert',
                    content: `${atRiskRate.toFixed(0)}% of students are at risk. Consider class-wide intervention strategies.`
                });
            } else if (atRiskRate > 15) {
                insights.push({
                    icon: '📊',
                    title: 'Moderate Risk Levels',
                    content: `${atRiskRate.toFixed(0)}% of students need attention. Focus on targeted support.`
                });
            } else {
                insights.push({
                    icon: '✅',
                    title: 'Good Overall Performance',
                    content: `Only ${atRiskRate.toFixed(0)}% of students at risk. Class is performing well overall.`
                });
            }
        }

        // Concept-specific insights
        const conceptEntries = Object.entries(concepts);
        if (conceptEntries.length > 0) {
            // Find most challenging concept
            const mostChallenging = conceptEntries.reduce((max, [name, data]) => 
                data.avg_gap_score > max.score ? {name, score: data.avg_gap_score} : max, 
                {name: '', score: 0}
            );

            if (mostChallenging.score > 0.4) {
                insights.push({
                    icon: '🧩',
                    title: 'Challenging Concept Identified',
                    content: `"${mostChallenging.name}" shows the highest learning gaps (${(mostChallenging.score * 100).toFixed(1)}% avg). Consider additional teaching time.`
                });
            }
        }

        // AI usage patterns
        const aiSuspiciousStudents = students.filter(s => 
            s.top_concerns.some(concern => 
                concern.toLowerCase().includes('ai') || 
                concern.toLowerCase().includes('assistance')
            )
        );

        if (aiSuspiciousStudents.length > 0) {
            insights.push({
                icon: '🤖',
                title: 'Potential AI Usage Detected',
                content: `${aiSuspiciousStudents.length} student(s) show patterns suggesting possible AI assistance. Review individual analyses.`
            });
        }

        // Speed patterns
        const speedConcerns = students.filter(s => 
            s.top_concerns.some(concern => 
                concern.toLowerCase().includes('fast') || 
                concern.toLowerCase().includes('speed')
            )
        );

        if (speedConcerns.length > 2) {
            insights.push({
                icon: '⏱️',
                title: 'Response Speed Concerns',
                content: `Multiple students showing unusual response speed patterns. Consider implementing time-based learning strategies.`
            });
        }

        return insights;
    }

    createInsightCard(insight) {
        const card = document.createElement('div');
        card.className = 'insight-card';
        
        card.innerHTML = `
            <div class="insight-header">
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-title">${insight.title}</span>
            </div>
            <div class="insight-content">${insight.content}</div>
        `;

        return card;
    }

    checkForAlerts() {
        const atRiskStudents = this.dashboardData.students.filter(s => s.overall_risk === 'at_risk');
        
        if (atRiskStudents.length > 0) {
            const alertsSection = document.getElementById('alerts-section');
            const alertsContent = document.getElementById('alerts-content');
            
            alertsContent.innerHTML = '';
            
            atRiskStudents.forEach(student => {
                const alertItem = document.createElement('div');
                alertItem.className = 'alert-item';
                alertItem.innerHTML = `
                    <strong>${student.student_id}</strong> requires immediate attention 
                    (Gap Score: ${(student.overall_score * 100).toFixed(1)}%)
                    <br>
                    <small>Key issues: ${student.top_concerns.join(', ')}</small>
                `;
                alertsContent.appendChild(alertItem);
            });
            
            alertsSection.classList.remove('hidden');
        }
    }

    async viewStudentDetails(studentId) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.STUDENT_DETAIL}/${studentId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch student details');
            }
            
            const studentData = await response.json();
            this.showStudentModal(studentData);
            
        } catch (error) {
            console.error('Error loading student details:', error);
            alert('Failed to load student details. Please try again.');
        }
    }

    showStudentModal(studentData) {
        const modal = document.getElementById('student-modal');
        const modalTitle = document.getElementById('modal-student-id');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = `${studentData.student_id} - Detailed Analysis`;
        
        const analysis = studentData.latest_analysis;
        
        modalBody.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h4>Overall Assessment</h4>
                <div style="background: #f8f9ff; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                    <strong>Risk Level:</strong> 
                    <span class="risk-badge risk-${analysis.overall_risk}">
                        ${CONFIG.UI.RISK_ICONS[analysis.overall_risk]} ${analysis.overall_risk.replace('_', ' ').toUpperCase()}
                    </span>
                    <br><br>
                    <strong>Gap Score:</strong> ${(analysis.overall_score * 100).toFixed(1)}%<br>
                    <strong>Assessment Date:</strong> ${new Date(analysis.timestamp).toLocaleString()}
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h4>Concept-Level Analysis</h4>
                <div style="display: grid; gap: 1rem; margin: 1rem 0;">
                    ${analysis.concept_gaps.map(concept => `
                        <div style="border: 1px solid #e2e8f0; padding: 1rem; border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <strong>${concept.concept}</strong>
                                <span class="risk-badge risk-${concept.risk_level}">
                                    ${CONFIG.UI.RISK_ICONS[concept.risk_level]} ${concept.risk_level}
                                </span>
                            </div>
                            <div style="font-size: 0.9rem; color: #718096;">
                                Gap Score: ${(concept.gap_score * 100).toFixed(1)}%
                            </div>
                            <div style="margin-top: 0.5rem;">
                                <strong>Indicators:</strong>
                                <ul style="margin: 0.25rem 0 0 1rem; font-size: 0.85rem; color: #4a5568;">
                                    ${concept.indicators.map(indicator => `<li>${indicator}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h4>Recommendations</h4>
                <ul style="margin: 1rem 0 0 1rem; line-height: 1.8;">
                    ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <div>
                <h4>Assessment History</h4>
                <div style="background: #f8f9ff; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
                    ${studentData.history.length > 1 
                        ? `Student has taken ${studentData.history.length} assessments. Performance trend: ${this.analyzeTrend(studentData.history)}`
                        : 'First assessment completed.'
                    }
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    analyzeTrend(history) {
        if (history.length < 2) return 'Insufficient data';
        
        const scores = history.map(h => h.overall_score).slice(-3); // Last 3 scores
        
        if (scores.length < 2) return 'Stable';
        
        const latest = scores[scores.length - 1];
        const previous = scores[scores.length - 2];
        
        if (latest > previous + 0.1) return 'Improving 📈';
        if (latest < previous - 0.1) return 'Declining 📉';
        return 'Stable ➡️';
    }

    closeModal() {
        document.getElementById('student-modal').classList.add('hidden');
    }

    async refreshData() {
        await this.loadDashboardData();
    }

    async resetData() {
        if (!confirm('Are you sure you want to reset all demo data? This will delete all student responses and analyses.')) {
            return;
        }
        
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.RESET_DATA}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to reset data');
            }
            
            alert('Demo data has been reset successfully!');
            await this.refreshData();
            
        } catch (error) {
            console.error('Error resetting data:', error);
            alert('Failed to reset data. Please try again.');
        }
    }

    showLoading() {
        document.getElementById('loading-section').classList.remove('hidden');
        document.getElementById('dashboard-content').classList.add('hidden');
        document.getElementById('error-section').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading-section').classList.add('hidden');
        document.getElementById('dashboard-content').classList.remove('hidden');
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('loading-section').classList.add('hidden');
        document.getElementById('dashboard-content').classList.add('hidden');
        document.getElementById('error-section').classList.remove('hidden');
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new TeacherDashboard();
});

// Add auto-refresh every 30 seconds
setInterval(() => {
    if (dashboard && !document.getElementById('student-modal').classList.contains('hidden') === false) {
        dashboard.refreshData();
    }
}, 30000);
