document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Glitch Intro Screen ---
    const introScreen = document.getElementById('intro-screen');
    if (introScreen) {
        setTimeout(() => {
            introScreen.style.opacity = '0';
            setTimeout(() => {
                introScreen.style.display = 'none';
            }, 800);
        }, 3000); // 3-second glitch animation before redirect
    }

    // --- 2. Theme Toggling ---
    window.toggleTheme = function () {
        document.body.classList.toggle('light-mode');
        // Update Chart colors if needed, but for now CSS variables handle mostly everything
    };

    // --- 3. Navigation Logic ---
    const navButtons = document.querySelectorAll('.nav-btn[data-target]');
    const sections = document.querySelectorAll('.page-section');
    let isAuthenticated = false;

    window.navigateTo = function (targetId) {
        // Simple auth guard
        if (['data-entry', 'dashboard', 'scenarios', 'reports', 'anomalies', 'goals'].includes(targetId) && !isAuthenticated) {
            targetId = 'signin';
        }

        // Update Page Title
        const pageTitle = document.getElementById('page-title');
        if (targetId === 'home') pageTitle.innerText = 'CarbonDecode';
        else if (targetId === 'data-entry') pageTitle.innerText = 'Telemetry Input';
        else if (targetId === 'dashboard') pageTitle.innerText = 'Telemetry Nexus';
        else if (targetId === 'anomalies') pageTitle.innerText = 'Anomaly Detection';
        else if (targetId === 'goals') pageTitle.innerText = 'Sustainability Targets';
        else if (targetId === 'scenarios') pageTitle.innerText = 'Simulation Engine';
        else if (targetId === 'reports') pageTitle.innerText = 'Compliance Export';
        else pageTitle.innerText = 'Authentication';

        // Update Buttons
        navButtons.forEach(btn => {
            if (btn.dataset.target === targetId) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Update Sections
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
                section.classList.remove('hidden');

                // Trigger view-specific logic
                if (targetId === 'dashboard') {
                    initDashboard();
                } else if (targetId === 'scenarios') {
                    initScenarios();
                }
            } else {
                section.classList.remove('active');
                section.classList.add('hidden');
            }
        });
    };

    // --- 4. Authentication Logic ---
    window.handleAuth = function (event) {
        event.preventDefault(); // Prevent form submission
        isAuthenticated = true;

        // Swap Nav UI
        document.getElementById('nav-auth-buttons').classList.add('hidden');
        document.getElementById('nav-user-menu').classList.remove('hidden');

        // Show protected sidebar links (opacity styling)
        document.querySelector('.sidebar').classList.remove('hidden-auth');

        // Redirect to Data Entry
        navigateTo('data-entry');
    };

    window.signOut = function () {
        isAuthenticated = false;
        document.getElementById('nav-auth-buttons').classList.remove('hidden');
        document.getElementById('nav-user-menu').classList.add('hidden');
        navigateTo('home');
    };

    // --- 5. Calculation Engine ---
    // Conversion factors (kg CO2)
    const FACTOR_ELEC = 0.85; // per kWh
    const FACTOR_FUEL = 2.68; // per Liter
    const FACTOR_TRAVEL = 0.12; // per km
    const FACTOR_WASTE = 2.5; // per kg
    const FACTOR_WATER = 0.001; // per Liter

    let totalEmissions = 0;
    let emissionBreakdown = { elec: 0, fuel: 0, travel: 0, waste: 0, water: 0 };

    window.liveCalculate = function () {
        const elec = parseFloat(document.getElementById('inp-elec').value) || 0;
        const fuel = parseFloat(document.getElementById('inp-fuel').value) || 0;
        const travel = parseFloat(document.getElementById('inp-travel').value) || 0;
        const waste = parseFloat(document.getElementById('inp-waste').value) || 0;
        const water = parseFloat(document.getElementById('inp-water').value) || 0;

        emissionBreakdown.elec = elec * FACTOR_ELEC;
        emissionBreakdown.fuel = fuel * FACTOR_FUEL;
        emissionBreakdown.travel = travel * FACTOR_TRAVEL;
        emissionBreakdown.waste = waste * FACTOR_WASTE;
        emissionBreakdown.water = water * FACTOR_WATER;

        totalEmissions = Object.values(emissionBreakdown).reduce((a, b) => a + b, 0);

        updateDashboardUI();
    };

    function updateDashboardUI() {
        // Animate counter
        animateValue("dash-total", 0, Math.round(totalEmissions), 1000);

        // Grade calculation (Mock logic)
        const gradeEl = document.getElementById('dash-grade');
        const scoreEl = document.getElementById('dash-score');
        let score = 100 - (totalEmissions / 500); // Inverse relationship mockup
        if (score > 100) score = 100;
        if (score < 0) score = 0;

        animateValue("dash-score", 0, Math.round(score), 1000);

        if (score >= 90) gradeEl.innerText = 'A';
        else if (score >= 75) gradeEl.innerText = 'B';
        else if (score >= 50) gradeEl.innerText = 'C';
        else gradeEl.innerText = 'D';

        // Impact Widgets
        document.getElementById('eq-trees').innerText = Math.round(totalEmissions / 21); // ~21kg per tree
        document.getElementById('eq-cars').innerText = (totalEmissions / 4600).toFixed(2); // ~4600kg per car yr
        document.getElementById('eq-flights').innerText = (totalEmissions / 250).toFixed(1); // short haul
        document.getElementById('offset-cost').innerText = (totalEmissions * 0.015).toFixed(2); // $15 per ton

        updateCharts();
    }

    // --- 6. Chart.js & Capsule UI ---
    let trendChartObj = null;
    let pieChartObj = null;
    let simChartObj = null;

    Chart.defaults.color = "#a1a1aa";
    Chart.defaults.font.family = "'Inter', sans-serif";

    function updateCharts() {
        // Capsule Bars (Neo-Brutalist CSS approach)
        const container = document.getElementById('capsule-container');
        if (container) {
            container.innerHTML = '';
            const labels = [
                { name: 'Power', val: emissionBreakdown.elec, color: 'var(--color-lime)' },
                { name: 'Fuel', val: emissionBreakdown.fuel, color: 'var(--color-orange)' },
                { name: 'Travel', val: emissionBreakdown.travel, color: '#ffffff' },
                { name: 'Waste', val: emissionBreakdown.waste, color: '#555555' }
            ];

            labels.sort((a, b) => b.val - a.val); // Sort descending

            labels.forEach(lb => {
                const pct = totalEmissions > 0 ? ((lb.val / totalEmissions) * 100).toFixed(1) : 0;
                container.innerHTML += `
                    <div class="capsule-bar-group">
                        <div class="capsule-label">${lb.name}</div>
                        <div class="capsule-track"><div class="capsule-fill" style="background: ${lb.color}; width: ${pct}%;"></div></div>
                        <div class="capsule-value">${pct}%</div>
                    </div>
                `;
            });
        }

        // Pie Chart
        const ctxPie = document.getElementById('pieChart');
        if (ctxPie) {
            if (pieChartObj) pieChartObj.destroy();
            pieChartObj = new Chart(ctxPie.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Electricity', 'Fuel', 'Travel', 'Waste', 'Water'],
                    datasets: [{
                        data: [emissionBreakdown.elec, emissionBreakdown.fuel, emissionBreakdown.travel, emissionBreakdown.waste, emissionBreakdown.water],
                        backgroundColor: ['#ccff00', '#ff5f1f', '#ffffff', '#555555', '#00f2fe'],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }
            });
        }
    }

    function initDashboard() {
        liveCalculate(); // run once to populat metrics

        // Historical Trend Bar Chart (Dummy regression data)
        const ctxTrend = document.getElementById('trendChart');
        if (ctxTrend) {
            if (trendChartObj) trendChartObj.destroy();
            trendChartObj = new Chart(ctxTrend.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun (AI Est)'],
                    datasets: [{
                        label: 'Total kg CO₂',
                        data: [4200, 4100, 4500, 3900, parseInt(totalEmissions), parseInt(totalEmissions) * 0.95],
                        backgroundColor: ['#333', '#333', '#333', '#333', '#ccff00', '#ff5f1f'],
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: '#2e2e2e' } }, x: { grid: { display: false } } }
                }
            });
        }
    }

    // --- 7. What-If Scenario Sim ---
    window.updateSimulation = function () {
        const solarReduction = parseInt(document.getElementById('sim-solar').value);
        const travelReduction = parseInt(document.getElementById('sim-travel').value);
        const wasteReduction = parseInt(document.getElementById('sim-waste').value);

        document.getElementById('val-solar').innerText = solarReduction + '%';
        document.getElementById('val-travel').innerText = travelReduction + '%';
        document.getElementById('val-waste').innerText = wasteReduction + '%';

        // Recalculate based on baseline totalEmissions
        const baseline = totalEmissions || 5000;

        let newElec = emissionBreakdown.elec * (1 - (solarReduction / 100));
        let newTravel = emissionBreakdown.travel * (1 - (travelReduction / 100));
        let newWaste = emissionBreakdown.waste * (1 - (wasteReduction / 100));

        const projected = newElec + newTravel + newWaste + emissionBreakdown.fuel + emissionBreakdown.water;
        const savings = baseline - projected;

        document.getElementById('sim-current').innerText = Math.round(baseline);
        document.getElementById('sim-projected').innerText = Math.round(projected);
        document.getElementById('sim-savings').innerText = Math.round(savings);

        // Update Sim Chart
        if (simChartObj) {
            simChartObj.data.datasets[0].data = [baseline, projected];
            simChartObj.update();
        }
    };

    function initScenarios() {
        if (!totalEmissions) liveCalculate(); // ensure baseline exists

        const ctxSim = document.getElementById('simChart');
        if (ctxSim) {
            if (simChartObj) simChartObj.destroy();
            simChartObj = new Chart(ctxSim.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Current Baseline', 'Projected Path (5 Yrs)'],
                    datasets: [{
                        label: 'Emissions Trajectory',
                        data: [totalEmissions, totalEmissions],
                        borderColor: '#ff5f1f',
                        backgroundColor: 'rgba(255, 95, 31, 0.2)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: '#ccff00',
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: '#2e2e2e' } } }
                }
            });
        }
        updateSimulation(); // initial load
    }

    // --- Utility: Animated Counter ---
    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

});
