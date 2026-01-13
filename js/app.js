// Resilience by Design - Main JavaScript

// ===================================
// Navigation Toggle (Mobile)
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // ===================================
    // Rules Page - Accordion
    // ===================================
    const accordions = document.querySelectorAll('.accordion');

    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');

        if (header) {
            header.addEventListener('click', function() {
                // Close all other accordions
                accordions.forEach(otherAccordion => {
                    if (otherAccordion !== accordion) {
                        otherAccordion.classList.remove('active');
                    }
                });

                // Toggle current accordion
                accordion.classList.toggle('active');
            });
        }
    });

    // ===================================
    // Rules Page - Search Functionality
    // ===================================
    const rulesSearch = document.getElementById('rulesSearch');
    const searchClear = document.getElementById('searchClear');
    const searchResultsCount = document.getElementById('searchResultsCount');

    if (rulesSearch) {
        rulesSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let matchCount = 0;

            if (searchTerm) {
                searchClear.style.display = 'block';
            } else {
                searchClear.style.display = 'none';
            }

            accordions.forEach(accordion => {
                const content = accordion.querySelector('.accordion-content');
                const text = content ? content.textContent.toLowerCase() : '';

                if (text.includes(searchTerm) || !searchTerm) {
                    accordion.style.display = 'block';
                    if (searchTerm) {
                        accordion.classList.add('active');
                        matchCount++;
                    }
                } else {
                    accordion.style.display = 'none';
                    accordion.classList.remove('active');
                }
            });

            if (searchTerm) {
                searchResultsCount.textContent = `Found ${matchCount} section${matchCount !== 1 ? 's' : ''} matching "${searchTerm}"`;
            } else {
                searchResultsCount.textContent = '';
            }
        });

        if (searchClear) {
            searchClear.addEventListener('click', function() {
                rulesSearch.value = '';
                rulesSearch.dispatchEvent(new Event('input'));
                rulesSearch.focus();
            });
        }
    }

    // ===================================
    // Score Page - Tabs
    // ===================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            // Load leaderboard data if switching to leaderboard tab
            if (targetTab === 'leaderboard') {
                loadLeaderboards();
            }
        });
    });

    // ===================================
    // Score Page - Target Calculation
    // ===================================
    const baseTarget = document.getElementById('baseTarget');
    const minorHazards = document.getElementById('minorHazards');
    const majorHazards = document.getElementById('majorHazards');
    const finalTarget = document.getElementById('finalTarget');

    function calculateTarget() {
        if (baseTarget && minorHazards && majorHazards && finalTarget) {
            const base = parseInt(baseTarget.value) || 50;
            const minor = parseInt(minorHazards.value) || 0;
            const major = parseInt(majorHazards.value) || 0;
            const total = base + (minor * 2) + (major * 5);
            finalTarget.value = total;
        }
    }

    if (minorHazards) minorHazards.addEventListener('input', calculateTarget);
    if (majorHazards) majorHazards.addEventListener('input', calculateTarget);

    // ===================================
    // Score Page - Player Scoring
    // ===================================
    const scoringInputs = document.querySelectorAll('.level1-pts, .level2-pts, .level3-pts, .goals-pts');

    function calculateRowTotal(row) {
        const level1 = parseInt(document.querySelector(`.level1-pts[data-row="${row}"]`).value) || 0;
        const level2 = parseInt(document.querySelector(`.level2-pts[data-row="${row}"]`).value) || 0;
        const level3 = parseInt(document.querySelector(`.level3-pts[data-row="${row}"]`).value) || 0;
        const goals = parseInt(document.querySelector(`.goals-pts[data-row="${row}"]`).value) || 0;
        const total = level1 + level2 + level3 + goals;

        const totalSpan = document.querySelector(`.row-total[data-row="${row}"]`);
        if (totalSpan) {
            totalSpan.textContent = total;
        }

        return total;
    }

    function calculateTeamTotal() {
        let teamTotal = 0;
        for (let i = 1; i <= 4; i++) {
            teamTotal += calculateRowTotal(i);
        }

        const teamTotalSpan = document.getElementById('teamTotal');
        if (teamTotalSpan) {
            teamTotalSpan.textContent = teamTotal;
        }
    }

    scoringInputs.forEach(input => {
        input.addEventListener('input', calculateTeamTotal);
    });

    // ===================================
    // Score Page - Win/Loss Toggle
    // ===================================
    const winBtn = document.getElementById('winBtn');
    const lossBtn = document.getElementById('lossBtn');
    const gameResult = document.getElementById('gameResult');

    if (winBtn) {
        winBtn.addEventListener('click', function() {
            winBtn.classList.add('active');
            lossBtn.classList.remove('active');
            gameResult.value = 'win';
        });
    }

    if (lossBtn) {
        lossBtn.addEventListener('click', function() {
            lossBtn.classList.add('active');
            winBtn.classList.remove('active');
            gameResult.value = 'loss';
        });
    }

    // ===================================
    // Score Page - Opt-in Leaderboard
    // ===================================
    const optInCheckbox = document.getElementById('optInLeaderboard');
    const displayNameSection = document.getElementById('displayNameSection');

    if (optInCheckbox) {
        optInCheckbox.addEventListener('change', function() {
            if (this.checked) {
                displayNameSection.classList.add('active');
            } else {
                displayNameSection.classList.remove('active');
            }
        });
    }

    // ===================================
    // Score Page - Debrief Toggle
    // ===================================
    const debriefToggle = document.getElementById('debriefToggle');
    const debriefContent = document.getElementById('debriefContent');

    if (debriefToggle) {
        debriefToggle.addEventListener('click', function() {
            debriefContent.classList.toggle('active');
            const icon = this.querySelector('.accordion-icon');
            if (icon) {
                icon.style.transform = debriefContent.classList.contains('active')
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)';
            }
        });
    }

    // ===================================
    // Score Page - Form Reset
    // ===================================
    const resetForm = document.getElementById('resetForm');
    const scoreForm = document.getElementById('scoreForm');

    if (resetForm && scoreForm) {
        resetForm.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
                scoreForm.reset();
                calculateTeamTotal();

                // Reset win/loss buttons
                if (winBtn) winBtn.classList.remove('active');
                if (lossBtn) lossBtn.classList.remove('active');
                if (gameResult) gameResult.value = '';

                // Reset display name section
                if (displayNameSection) displayNameSection.classList.remove('active');
            }
        });
    }

    // ===================================
    // Score Page - Form Submission
    // ===================================
    if (scoreForm) {
        scoreForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate form
            const result = gameResult ? gameResult.value : '';
            if (!result) {
                alert('Please select Win or Loss');
                return;
            }

            // Collect form data
            const formData = {
                target: parseInt(finalTarget.value),
                minorHazards: parseInt(minorHazards.value),
                majorHazards: parseInt(majorHazards.value),
                teamTotal: parseInt(document.getElementById('teamTotal').textContent),
                result: result,
                players: [],
                goals: [],
                timestamp: new Date().toISOString()
            };

            // Collect player data
            for (let i = 1; i <= 4; i++) {
                const role = document.querySelector(`.player-role[data-row="${i}"]`).value;
                if (role) {
                    formData.players.push({
                        role: role,
                        level1: parseInt(document.querySelector(`.level1-pts[data-row="${i}"]`).value) || 0,
                        level2: parseInt(document.querySelector(`.level2-pts[data-row="${i}"]`).value) || 0,
                        level3: parseInt(document.querySelector(`.level3-pts[data-row="${i}"]`).value) || 0,
                        goals: parseInt(document.querySelector(`.goals-pts[data-row="${i}"]`).value) || 0
                    });
                }
            }

            // Collect goals data
            const goalCheckboxes = document.querySelectorAll('.goal-checkbox:checked');
            goalCheckboxes.forEach(checkbox => {
                const goalCard = checkbox.closest('.score-goal-card');
                const goalTitle = goalCard.querySelector('.score-goal-title-input').value;
                formData.goals.push({
                    goal: checkbox.dataset.goal,
                    title: goalTitle
                });
            });

            // Check if opt-in to leaderboard
            const optIn = optInCheckbox ? optInCheckbox.checked : false;
            if (optIn) {
                const displayName = document.getElementById('displayName').value.trim();
                if (!displayName) {
                    alert('Please enter a team display name for the leaderboard');
                    return;
                }
                formData.displayName = displayName;
                formData.public = true;
            }

            // Save to localStorage
            const savedGames = JSON.parse(localStorage.getItem('rbdGames') || '[]');
            savedGames.push(formData);
            localStorage.setItem('rbdGames', JSON.stringify(savedGames));

            // Show success message
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.classList.add('active');
                setTimeout(() => {
                    successMessage.classList.remove('active');
                }, 5000);
            }

            // Reset form
            scoreForm.reset();
            calculateTeamTotal();
            if (winBtn) winBtn.classList.remove('active');
            if (lossBtn) lossBtn.classList.remove('active');
            if (gameResult) gameResult.value = '';
            if (displayNameSection) displayNameSection.classList.remove('active');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===================================
    // Leaderboard Functions
    // ===================================
    function loadLeaderboards() {
        const savedGames = JSON.parse(localStorage.getItem('rbdGames') || '[]');
        const publicGames = savedGames.filter(game => game.public);

        if (publicGames.length === 0) {
            document.getElementById('noWinsData').style.display = 'block';
            document.getElementById('noScoresData').style.display = 'block';
            document.getElementById('winsLeaderboard').querySelector('tbody').innerHTML = '';
            document.getElementById('scoresLeaderboard').querySelector('tbody').innerHTML = '';
            return;
        }

        // Process wins leaderboard
        const teamStats = {};
        publicGames.forEach(game => {
            const name = game.displayName;
            if (!teamStats[name]) {
                teamStats[name] = { wins: 0, games: 0 };
            }
            teamStats[name].games++;
            if (game.result === 'win') {
                teamStats[name].wins++;
            }
        });

        const winsData = Object.entries(teamStats)
            .map(([name, stats]) => ({
                name,
                wins: stats.wins,
                games: stats.games,
                winRate: ((stats.wins / stats.games) * 100).toFixed(1)
            }))
            .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);

        const winsTable = document.getElementById('winsLeaderboard').querySelector('tbody');
        winsTable.innerHTML = winsData.map((team, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.wins}</td>
                <td>${team.games}</td>
                <td>${team.winRate}%</td>
            </tr>
        `).join('');

        document.getElementById('noWinsData').style.display = 'none';

        // Process high scores leaderboard
        const scoresData = publicGames
            .sort((a, b) => b.teamTotal - a.teamTotal)
            .slice(0, 20)
            .map(game => ({
                name: game.displayName,
                score: game.teamTotal,
                target: game.target,
                date: new Date(game.timestamp).toLocaleDateString()
            }));

        const scoresTable = document.getElementById('scoresLeaderboard').querySelector('tbody');
        scoresTable.innerHTML = scoresData.map((game, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${game.name}</td>
                <td>${game.score}</td>
                <td>${game.target}</td>
                <td>${game.date}</td>
            </tr>
        `).join('');

        document.getElementById('noScoresData').style.display = 'none';
    }
});
