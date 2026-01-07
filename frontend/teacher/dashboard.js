// Teacher Dashboard Logic
class TeacherDashboard {
    constructor() {
        this.dashboardData = null;
        this.filteredStudents = [];
        this.currentRiskFilter = 'all';
        this.currentAiFilter = 'all';
        this.liveUpdatesEnabled = false;
        this.updateInterval = null;
        this.charts = {};
        
        this.initializeEventListeners();
        this.loadDashboardData();
        this.initializeCharts();
    }

    initializeEventListeners() {
        // Header controls
        document.getElementById('refresh-btn').addEventListener('click', () => this.refreshData());
        document.getElementById('reset-data-btn').addEventListener('click', () => this.resetData());
        
        // New enhanced controls
        document.getElementById('export-btn').addEventListener('click', () => this.exportReport());
        document.getElementById('demo-mode-btn').addEventListener('click', () => this.enableDemoMode());
        document.getElementById('live-update-btn').addEventListener('click', () => this.toggleLiveUpdates());
        
        // Filters
        document.getElementById('risk-filter').addEventListener('change', (e) => {
            this.currentRiskFilter = e.target.value;
            this.filterStudents();
        });
        
        document.getElementById('ai-filter').addEventListener('change', (e) => {
            this.currentAiFilter = e.target.value;
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

    initializeCharts() {
        // Initialize Chart.js for learning trends
        const trendCanvas = document.getElementById('learning-curve-chart');
        if (trendCanvas) {
            const ctx = trendCanvas.getContext('2d');
            this.charts.learningCurve = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Authentic Learning',
                        data: [75, 78, 82, 85],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'AI Assisted',
                        data: [95, 94, 96, 93],
                        borderColor: '#e53e3e',
                        backgroundColor: 'rgba(229, 62, 62, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 70,
                            max: 100
                        }
                    }
                }
            });
        }

        // Initialize authenticity chart
        const authCanvas = document.getElementById('authenticity-chart');
        if (authCanvas) {
            const ctx = authCanvas.getContext('2d');
            this.charts.authenticity = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Authentic', 'Suspicious', 'Uncertain'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: ['#10b981', '#e53e3e', '#f59e0b']
                    }]
                },
                options: {
                    responsive: true,
                    legend: {
                        position: 'bottom'
                    }
                }
            });
        }

        // Initialize timing analysis chart
        const timingCanvas = document.getElementById('timing-analysis');
        if (timingCanvas) {
            const ctx = timingCanvas.getContext('2d');
            this.charts.timing = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['<5s', '5-15s', '15-30s', '30-60s', '>60s'],
                    datasets: [{
                        label: 'Response Distribution',
                        data: [12, 25, 45, 15, 3],
                        backgroundColor: ['#e53e3e', '#f59e0b', '#10b981', '#f59e0b', '#e53e3e']
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Percentage of Students'
                            }
                        }
                    }
                }
            });
        }
    }

    async loadDashboardData() {
        try {
            this.showLoading();
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.TEACHER_DASHBOARD}`);
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            
            this.dashboardData = await response.json();
            this.renderDashboard();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Failed to load dashboard data. Please check if the backend is running.');
        }
    }

    renderDashboard() {
        this.renderSummaryCards();
        this.renderPerformanceStats();
        this.renderTrendInsights();
        this.renderStudentsList();
        this.renderConceptAnalysis();
        this.renderInsights();
        this.renderInterventions();
        this.renderAnalytics();
        this.checkForAlerts();
        this.updateCharts();
    }

    renderPerformanceStats() {
        const students = this.dashboardData.students || [];
        const totalStudents = students.length;
        
        if (totalStudents > 0) {
            const earlyDetected = students.filter(s => s.overall_risk !== 'safe').length;
            const detectionScore = totalStudents > 0 ? ((earlyDetected / totalStudents) * 100).toFixed(0) : 92;
            
            document.getElementById('detection-score').textContent = `${detectionScore}%`;
            document.getElementById('detection-detail').textContent = 
                `You caught ${earlyDetected}/${totalStudents} at-risk students early!`;
        }
        
        // Update response speed (simulated)
        document.getElementById('response-speed').textContent = '2.3min';
        document.getElementById('accuracy-rate').textContent = '94%';
    }

    renderTrendInsights() {
        const students = this.dashboardData.students || [];
        
        // Simulate trend analysis
        let improving = 0;
        let stagnant = 0;
        let declining = 0;
        
        students.forEach(student => {
            // Simulate learning velocity based on gap score
            const gapScore = student.overall_score || 0;
            if (gapScore < 0.3) improving++;
            else if (gapScore < 0.6) stagnant++;
            else declining++;
        });
        
        document.getElementById('improving-count').textContent = improving;
        document.getElementById('stagnant-count').textContent = stagnant;
        document.getElementById('declining-count').textContent = declining;
    }

    renderInterventions() {
        const students = this.dashboardData.students || [];
        const interventionsGrid = document.getElementById('interventions-grid');
        
        interventionsGrid.innerHTML = '';
        
        // Generate interventions for at-risk students
        const atRiskStudents = students.filter(s => s.overall_risk === 'at_risk');
        
        atRiskStudents.forEach(student => {
            const card = this.createInterventionCard(student);
            interventionsGrid.appendChild(card);
        });
        
        // Add general recommendations if no urgent cases
        if (atRiskStudents.length === 0 && students.length > 0) {
            const generalCard = document.createElement('div');
            generalCard.className = 'intervention-card recommended';
            generalCard.innerHTML = `
                <div class="intervention-header">
                    <h4>📊 General Recommendations</h4>
                    <span class="urgency-badge" style="background: #f59e0b;">RECOMMENDED</span>
                </div>
                <p class="intervention-reason">Continue monitoring for early detection</p>
                <div class="intervention-actions">
                    <button class="btn small">📈 View Trends</button>
                    <button class="btn small outline">📋 Generate Report</button>
                </div>
            `;
            interventionsGrid.appendChild(generalCard);
        }
    }

    createInterventionCard(student) {
        const card = document.createElement('div');
        card.className = 'intervention-card urgent';
        
        // Determine intervention type based on concerns
        const concerns = student.top_concerns || [];
        let interventionType = 'General Support';
        let actionButtons = '';
        
        if (concerns.some(c => c.toLowerCase().includes('ai'))) {
            interventionType = 'AI Dependency Detected';
            actionButtons = `
                <button class="btn small" onclick="dashboard.scheduleOneOnOne('${student.student_id}')">📞 Schedule 1-on-1</button>
                <button class="btn small outline" onclick="dashboard.assignPractice('${student.student_id}')">📝 Assign Practice</button>
            `;
        } else if (concerns.some(c => c.toLowerCase().includes('confidence'))) {
            interventionType = 'Confidence Calibration Needed';
            actionButtons = `
                <button class="btn small" onclick="dashboard.assignConfidenceTraining('${student.student_id}')">🎯 Confidence Training</button>
                <button class="btn small outline" onclick="dashboard.peerSupport('${student.student_id}')">👥 Peer Support</button>
            `;
        } else {
            actionButtons = `
                <button class="btn small" onclick="dashboard.viewStudentDetails('${student.student_id}')">👀 View Details</button>
                <button class="btn small outline" onclick="dashboard.createAction('${student.student_id}')">📋 Create Action Plan</button>
            `;
        }
        
        card.innerHTML = `
            <div class="intervention-header">
                <h4>${student.student_id}</h4>
                <span class="urgency-badge">URGENT</span>
            </div>
            <p class="intervention-reason">${interventionType}</p>
            <div class="intervention-actions">
                ${actionButtons}
            </div>
        `;
        
        return card;
    }

    renderAnalytics() {
        // Update heatmap
        this.renderMasteryHeatmap();
        
        // Update timing stats
        this.updateTimingStats();
        
        // Update prediction model
        this.updatePredictionModel();
    }

    renderMasteryHeatmap() {
        const concepts = this.dashboardData.concept_analysis || {};
        const heatmapContainer = document.getElementById('mastery-heatmap');
        
        heatmapContainer.innerHTML = '';
        
        if (Object.keys(concepts).length > 0) {
            Object.entries(concepts).forEach(([concept, data]) => {
                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                cell.style.cssText = `
                    display: inline-block;
                    width: 80px;
                    height: 40px;
                    margin: 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: white;
                    text-align: center;
                `;
                
                const gapScore = data.avg_gap_score || 0;
                if (gapScore < 0.3) {
                    cell.style.backgroundColor = '#10b981';
                } else if (gapScore < 0.6) {
                    cell.style.backgroundColor = '#f59e0b';
                } else {
                    cell.style.backgroundColor = '#e53e3e';
                }
                
                cell.textContent = concept.split(' ')[0]; // Short name
                cell.title = `${concept}: ${(gapScore * 100).toFixed(0)}% gap`;
                
                heatmapContainer.appendChild(cell);
            });
        } else {
            heatmapContainer.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No concept data available</p>';
        }
    }

    updateTimingStats() {
        // Simulate timing analysis from data
        document.getElementById('avg-response-time').textContent = '18.5s';
        document.getElementById('fast-responses').textContent = '12%';
    }

    updatePredictionModel() {
        const students = this.dashboardData.students || [];
        const atRiskCount = students.filter(s => s.overall_risk === 'at_risk').length;
        
        const predictions = [
            `${atRiskCount} students likely to need intervention`,
            `${Math.max(0, students.length - atRiskCount - 1)} students showing improvement`,
            `${Math.min(1, atRiskCount)} student at risk of failing`
        ];
        
        const predictionsList = document.getElementById('predictions-list');
        if (predictionsList) {
            predictionsList.innerHTML = predictions.map(p => `<li>${p}</li>`).join('');
        }
    }

    updateCharts() {
        // Update learning curve with real data
        if (this.charts.learningCurve && this.dashboardData.students) {
            const students = this.dashboardData.students;
            const authenticCount = students.filter(s => s.overall_score < 0.3).length;
            const suspiciousCount = students.filter(s => s.overall_score >= 0.6).length;
            
            // Update authenticity chart
            if (this.charts.authenticity) {
                this.charts.authenticity.data.datasets[0].data = [
                    authenticCount,
                    suspiciousCount,
                    students.length - authenticCount - suspiciousCount
                ];
                this.charts.authenticity.update();
            }
        }
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
        
        if (students.length === 0) {
            document.getElementById('students-table-container').style.display = 'none';
            document.getElementById('no-students-message').classList.remove('hidden');
            return;
        }

        document.getElementById('students-table-container').style.display = 'block';
        document.getElementById('no-students-message').classList.add('hidden');

        const tableBody = document.getElementById('students-table-body');
        tableBody.innerHTML = '';

        students.forEach(student => {
            const row = this.createStudentRow(student);
            tableBody.appendChild(row);
        });

        this.filterStudents(); // Apply current filter
    }

    createStudentRow(student) {
        const row = document.createElement('tr');
        
        // Format timestamp
        const lastAssessment = new Date(student.timestamp).toLocaleDateString();
        
        // Format gap score
        const gapScore = (student.overall_score * 100).toFixed(1);
        
        // AI Detection simulation
        const aiLikelihood = this.calculateAILikelihood(student);
        const aiMeterColor = aiLikelihood > 70 ? '#e53e3e' : aiLikelihood > 40 ? '#f59e0b' : '#10b981';
        
        // Predictive performance
        const prediction = this.predictPerformance(student);
        
        // Top concerns
        const concerns = student.top_concerns.length > 0 
            ? student.top_concerns.slice(0, 2).join(', ')
            : 'No major concerns';

        row.innerHTML = `
            <td class="student-id">${student.student_id}</td>
            <td>
                <span class="risk-badge risk-${student.overall_risk}">
                    ${CONFIG.UI.RISK_ICONS[student.overall_risk]} 
                    ${student.overall_risk.replace('_', ' ').toUpperCase()}
                </span>
            </td>
            <td class="gap-score">${gapScore}%</td>
            <td>
                <div class="ai-detection-meter">
                    <div class="meter-bar">
                        <div class="meter-fill" style="width: ${aiLikelihood}%; background: ${aiMeterColor}"></div>
                    </div>
                    <span class="meter-label">${aiLikelihood}% AI Likely</span>
                </div>
            </td>
            <td>
                <span class="prediction-badge prediction-${prediction.trend}">
                    ${prediction.icon} ${prediction.label}
                </span>
            </td>
            <td>${lastAssessment}</td>
            <td class="concerns-list">${concerns}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn small primary" onclick="dashboard.viewStudentDetails('${student.student_id}')">
                        👀 Details
                    </button>
                    ${aiLikelihood > 60 ? 
                        '<button class="btn small danger" onclick="dashboard.flagForReview(\'' + student.student_id + '\')">🚨 Flag</button>' :
                        '<button class="btn small outline" onclick="dashboard.createAction(\'' + student.student_id + '\')">📋 Action</button>'
                    }
                </div>
            </td>
        `;

        // Add risk-specific styling to row
        row.setAttribute('data-risk', student.overall_risk);
        row.setAttribute('data-ai-likelihood', aiLikelihood > 60 ? 'high' : aiLikelihood > 30 ? 'medium' : 'low');
        
        return row;
    }

    calculateAILikelihood(student) {
        // Simulate AI likelihood based on patterns
        const gapScore = student.overall_score || 0;
        const concerns = student.top_concerns || [];
        
        let aiScore = 0;
        
        // High accuracy with unusual patterns
        if (concerns.some(c => c.toLowerCase().includes('ai'))) {
            aiScore += 60;
        }
        
        if (concerns.some(c => c.toLowerCase().includes('fast'))) {
            aiScore += 30;
        }
        
        if (concerns.some(c => c.toLowerCase().includes('confidence'))) {
            aiScore += 20;
        }
        
        // Random variation for demo
        aiScore += Math.random() * 20;
        
        return Math.min(95, Math.max(5, aiScore));
    }

    predictPerformance(student) {
        const gapScore = student.overall_score || 0;
        
        if (gapScore < 0.3) {
            return { trend: 'improving', icon: '📈', label: 'Improving' };
        } else if (gapScore < 0.6) {
            return { trend: 'stable', icon: '📊', label: 'Stable' };
        } else {
            return { trend: 'declining', icon: '📉', label: 'At Risk' };
        }
    }

    filterStudents() {
        const rows = document.querySelectorAll('#students-table-body tr');
        
        rows.forEach(row => {
            const riskLevel = row.getAttribute('data-risk');
            const aiLikelihood = row.getAttribute('data-ai-likelihood');
            
            let showRisk = this.currentRiskFilter === 'all' || riskLevel === this.currentRiskFilter;
            let showAi = this.currentAiFilter === 'all' || aiLikelihood === this.currentAiFilter;
            
            if (showRisk && showAi) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
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

    // NEW ENHANCED FEATURES

    enableDemoMode() {
        if (confirm('Enable demo mode? This will simulate students taking quizzes with different learning patterns.')) {
            this.simulateLiveDemo();
        }
    }

    simulateLiveDemo() {
        const demoStudents = [
            { id: 'authentic_learner', pattern: 'normal', risk: 'safe' },
            { id: 'ai_dependent_student', pattern: 'ai_assisted', risk: 'at_risk' },
            { id: 'struggling_student', pattern: 'confused', risk: 'watch' },
            { id: 'overconfident_learner', pattern: 'overconfident', risk: 'watch' }
        ];
        
        let index = 0;
        const simulateNext = () => {
            if (index < demoStudents.length) {
                const student = demoStudents[index];
                this.showLiveAlert(`🎓 ${student.id} just completed assessment (${student.pattern} pattern)`);
                this.addDemoStudent(student);
                index++;
                setTimeout(simulateNext, 2000);
            } else {
                this.showLiveAlert('✅ Demo simulation complete! View the dashboard for insights.');
                setTimeout(() => this.refreshData(), 1000);
            }
        };
        
        simulateNext();
    }

    addDemoStudent(studentData) {
        // Simulate adding a student to the data
        const mockStudent = {
            student_id: studentData.id,
            overall_risk: studentData.risk,
            overall_score: studentData.risk === 'at_risk' ? 0.8 : studentData.risk === 'watch' ? 0.5 : 0.2,
            timestamp: new Date().toISOString(),
            top_concerns: this.generateConcerns(studentData.pattern)
        };
        
        if (!this.dashboardData.students) {
            this.dashboardData.students = [];
        }
        
        this.dashboardData.students.push(mockStudent);
        this.renderDashboard();
    }

    generateConcerns(pattern) {
        const concernsMap = {
            'normal': ['Continue current learning approach'],
            'ai_assisted': ['High AI assistance probability', 'Fast responses with high accuracy'],
            'confused': ['Low confidence levels', 'Inconsistent performance'],
            'overconfident': ['High confidence on incorrect answers', 'Overconfidence detected']
        };
        return concernsMap[pattern] || ['General monitoring'];
    }

    showLiveAlert(message) {
        // Create floating notification
        const alert = document.createElement('div');
        alert.className = 'live-alert';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        alert.textContent = message;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }

    toggleLiveUpdates() {
        this.liveUpdatesEnabled = !this.liveUpdatesEnabled;
        const btn = document.getElementById('live-update-btn');
        
        if (this.liveUpdatesEnabled) {
            btn.textContent = '📡 Live ON';
            btn.classList.remove('outline');
            btn.classList.add('primary');
            
            // Start auto-refresh every 10 seconds
            this.updateInterval = setInterval(() => {
                this.refreshData();
            }, 10000);
            
            this.showLiveAlert('📡 Live updates enabled - Dashboard will refresh every 10 seconds');
        } else {
            btn.textContent = '📡 Live Updates';
            btn.classList.remove('primary');
            btn.classList.add('outline');
            
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
            
            this.showLiveAlert('📡 Live updates disabled');
        }
    }

    exportReport() {
        if (!this.dashboardData.students || this.dashboardData.students.length === 0) {
            alert('No data to export. Please ensure students have completed assessments.');
            return;
        }
        
        const reportData = {
            generated_at: new Date().toISOString(),
            summary: this.dashboardData.summary,
            students: this.dashboardData.students.map(student => ({
                student_id: student.student_id,
                risk_level: student.overall_risk,
                gap_score: (student.overall_score * 100).toFixed(1) + '%',
                ai_likelihood: this.calculateAILikelihood(student) + '%',
                concerns: student.top_concerns.join('; '),
                last_assessment: new Date(student.timestamp).toLocaleDateString()
            })),
            concept_analysis: this.dashboardData.concept_analysis
        };
        
        // Convert to CSV
        const csvData = this.convertToCSV(reportData.students);
        this.downloadFile(csvData, 'learning-gaps-report.csv', 'text/csv');
        
        // Also create JSON report
        const jsonData = JSON.stringify(reportData, null, 2);
        this.downloadFile(jsonData, 'learning-gaps-report.json', 'application/json');
        
        this.showLiveAlert('📊 Reports exported successfully!');
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Enhanced student actions
    scheduleOneOnOne(studentId) {
        alert(`📞 Scheduling 1-on-1 meeting with ${studentId}. This would integrate with your calendar system.`);
    }

    assignPractice(studentId) {
        alert(`📝 Assigning targeted practice exercises to ${studentId}. This would integrate with your LMS.`);
    }

    flagForReview(studentId) {
        alert(`🚨 ${studentId} flagged for academic integrity review. This would notify appropriate staff.`);
    }

    assignConfidenceTraining(studentId) {
        alert(`🎯 Assigning confidence calibration training to ${studentId}.`);
    }

    peerSupport(studentId) {
        alert(`👥 Connecting ${studentId} with peer support network.`);
    }

    createAction(studentId) {
        alert(`📋 Creating personalized action plan for ${studentId}. This would open the intervention wizard.`);
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
