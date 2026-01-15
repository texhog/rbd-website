/* =====================================================
   RESILIENCE BY DESIGN - MAIN JAVASCRIPT
   ===================================================== */

// =====================================================
// SUPABASE CONFIGURATION
// =====================================================
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let supabase = null;

// Initialize Supabase client if credentials are set
function initSupabase() {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return false;
        }
    }
    console.log('Supabase not configured - using local storage fallback');
    return false;
}

// =====================================================
// NAVIGATION
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Initialize page-specific functionality
    if (document.querySelector('.rules-content')) {
        initRulesPage();
    }
    
    if (document.querySelector('.score-page')) {
        initScorePage();
    }
});

// =====================================================
// RULES PAGE - ACCORDION & SEARCH
// =====================================================
function initRulesPage() {
    const accordions = document.querySelectorAll('.accordion');
    const searchInput = document.getElementById('rulesSearch');
    const searchClear = document.getElementById('searchClear');
    const resultsCount = document.getElementById('searchResultsCount');
    
    // Accordion toggle
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            accordion.classList.toggle('active');
        });
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            // Show/hide clear button
            if (searchClear) {
                searchClear.classList.toggle('visible', query.length > 0);
            }
            
            if (query.length === 0) {
                // Show all accordions, remove highlights
                accordions.forEach(accordion => {
                    accordion.classList.remove('hidden');
                    removeHighlights(accordion);
                });
                if (resultsCount) resultsCount.textContent = '';
                return;
            }
            
            let matchCount = 0;
            
            accordions.forEach(accordion => {
                const content = accordion.textContent.toLowerCase();
                const matches = content.includes(query);
                
                accordion.classList.toggle('hidden', !matches);
                
                if (matches) {
                    matchCount++;
                    accordion.classList.add('active');
                    highlightMatches(accordion, query);
                } else {
                    removeHighlights(accordion);
                }
            });
            
            if (resultsCount) {
                resultsCount.textContent = `${matchCount} section${matchCount !== 1 ? 's' : ''} found`;
            }
        });
        
        // Clear search
        if (searchClear) {
            searchClear.addEventListener('click', function() {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.focus();
            });
        }
    }
}

function highlightMatches(element, query) {
    removeHighlights(element);
    
    const content = element.querySelector('.accordion-content');
    if (!content) return;
    
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }
    
    textNodes.forEach(node => {
        const text = node.textContent;
        const lowerText = text.toLowerCase();
        const index = lowerText.indexOf(query);
        
        if (index !== -1) {
            const before = text.substring(0, index);
            const match = text.substring(index, index + query.length);
            const after = text.substring(index + query.length);
            
            const span = document.createElement('span');
            span.innerHTML = before + '<mark class="highlight">' + match + '</mark>' + after;
            
            node.parentNode.replaceChild(span, node);
        }
    });
}

function removeHighlights(element) {
    const highlights = element.querySelectorAll('.highlight');
    highlights.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
    
    // Clean up wrapper spans
    const spans = element.querySelectorAll('.accordion-content span:not([class])');
    spans.forEach(span => {
        if (span.childNodes.length === 1 && span.childNodes[0].nodeType === Node.TEXT_NODE) {
            span.parentNode.replaceChild(span.childNodes[0], span);
        }
    });
}

// =====================================================
// SCORE PAGE
// =====================================================
function initScorePage() {
    initSupabase();
    initTabs();
    initInstructionsAccordion();
    initTargetCalculation();
    initScoringTable();
    initGoalCards();
    initWinLossToggle();
    initOptIn();
    initDebrief();
    initFormSubmission();
    loadLeaderboards();
}

// Tab switching
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');

            if (tabId === 'leaderboard') {
                loadLeaderboards();
            }
        });
    });
}

// Instructions accordion
function initInstructionsAccordion() {
    // Select all .debrief-header buttons in the instructions section
    const instructionsSection = document.querySelector('.instructions-section');
    if (!instructionsSection) return;

    const accordionBtns = instructionsSection.querySelectorAll('.debrief-header');

    accordionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon');

            // Toggle active state
            const isActive = content.classList.contains('active');
            content.classList.toggle('active');

            // Rotate icon
            if (icon) {
                icon.style.transform = isActive ? 'rotate(0)' : 'rotate(180deg)';
            }
        });
    });
}

// =====================================================
// PURE CALCULATION FUNCTIONS (No DOM side effects)
// =====================================================

/**
 * Calculate target score from hazards
 * @param {Array} hazards - Array of hazard modifier values
 * @returns {Object} { base, hazardTotal, target, breakdown }
 */
function calculateTarget(hazards) {
    const base = 56;
    const hazardTotal = hazards.reduce((sum, value) => sum + (parseInt(value) || 0), 0);
    const target = base + hazardTotal;
    const breakdown = `${base} + ${hazardTotal} =`;

    return { base, hazardTotal, target, breakdown };
}

/**
 * Check win condition
 * @param {number} teamTotal - Total team score
 * @param {number} target - Target score to beat
 * @returns {Object} { isWin, teamTotal, target, margin, message }
 */
function checkWinCondition(teamTotal, target) {
    const isWin = teamTotal >= target;
    const margin = teamTotal - target;

    let message;
    if (isWin) {
        message = `<p><strong>✓ Success!</strong></p>
                   <p>Your community has built sufficient resilience to withstand the selected hazards. You scored ${teamTotal} points and needed ${target} to succeed.</p>`;
    } else {
        const shortfall = target - teamTotal;
        message = `<p><strong>Close!</strong></p>
                   <p>Your community came close but did not build sufficient resilience to fully withstand the selected hazards. You scored ${teamTotal} points but needed ${target}. You were ${shortfall} points short.</p>`;
    }

    return { isWin, teamTotal, target, margin, message };
}

/**
 * Build complete game score object
 * @param {Array} players - Player data with roles and points
 * @param {Object} targetData - Target calculation result
 * @param {number} goalsCount - Number of goals achieved
 * @param {string} displayName - Optional team name
 * @returns {Object} Complete game score
 */
function buildGameScore(players, targetData, goalsCount, displayName = null) {
    const projectTotal = players.reduce((sum, p) => sum + p.total, 0);
    const goalsTotal = goalsCount * 6;
    const teamTotal = projectTotal + goalsTotal;
    const winResult = checkWinCondition(teamTotal, targetData.target);

    return {
        display_name: displayName,
        team_score: teamTotal,
        target_score: targetData.target,
        is_win: winResult.isWin,
        goals_achieved: goalsCount,
        players: players,
        hazards: targetData,
        created_at: new Date().toISOString()
    };
}

// =====================================================
// DOM INTERACTION FUNCTIONS
// =====================================================

// Target calculation with DOM
function initTargetCalculation() {
    const finalTarget = document.getElementById('finalTarget');
    const targetBreakdown = document.getElementById('targetBreakdown');
    const hazardSelects = document.querySelectorAll('.hazard-select');

    console.log('[initTargetCalculation] Initialized with', hazardSelects.length, 'hazard selects');
    console.log('[initTargetCalculation] finalTarget element:', finalTarget);
    console.log('[initTargetCalculation] targetBreakdown element:', targetBreakdown);

    function updateTargetDisplay() {
        // Gather hazard values
        const hazards = Array.from(hazardSelects).map(select => select.value);

        // Calculate (pure function)
        const result = calculateTarget(hazards);

        console.log(`Target calculation: Base(${result.base}) + Hazards(${result.hazardTotal}) = ${result.target}`);

        // Render to DOM
        if (finalTarget) {
            finalTarget.textContent = result.target;
            finalTarget.style.transform = 'scale(1.1)';
            setTimeout(() => {
                finalTarget.style.transform = 'scale(1)';
            }, 300);
        }

        if (targetBreakdown) {
            targetBreakdown.textContent = result.breakdown;
            targetBreakdown.style.transform = 'scale(1.1)';
            setTimeout(() => {
                targetBreakdown.style.transform = 'scale(1)';
            }, 300);
        }

        updateWinLossDisplay();
    }

    // Add event listeners
    hazardSelects.forEach(select => {
        select.addEventListener('change', updateTargetDisplay);
    });

    // Initial calculation
    updateTargetDisplay();
}

// Scoring table calculations
function initScoringTable() {
    const table = document.querySelector('.player-table');
    console.log('[initScoringTable] Table found:', table);

    if (!table) {
        console.error('[initScoringTable] NO TABLE FOUND!');
        return;
    }

    const inputs = table.querySelectorAll('input[type="number"]');
    console.log('[initScoringTable] Found', inputs.length, 'number inputs');

    inputs.forEach(input => {
        input.addEventListener('input', updateAllTotals);
    });

    updateAllTotals();
}

function updateAllTotals() {
    // Gather player data
    const players = [];
    for (let row = 1; row <= 4; row++) {
        const level1 = parseInt(document.querySelector(`.level1-pts[data-row="${row}"]`)?.value) || 0;
        const level2 = parseInt(document.querySelector(`.level2-pts[data-row="${row}"]`)?.value) || 0;
        const level3 = parseInt(document.querySelector(`.level3-pts[data-row="${row}"]`)?.value) || 0;
        const role = document.querySelector(`.player-role[data-row="${row}"]`)?.value || '';

        const rowTotal = level1 + level2 + level3;
        console.log(`Row ${row} (${role || 'No role'}): L1(${level1}) + L2(${level2}) + L3(${level3}) = ${rowTotal}`);

        // Update row total display
        const rowTotalEl = document.querySelector(`.row-total[data-row="${row}"]`);
        if (rowTotalEl) rowTotalEl.textContent = rowTotal;

        players.push({
            row,
            role,
            level1,
            level2,
            level3,
            total: rowTotal
        });
    }

    // Calculate project total
    const projectTotal = players.reduce((sum, p) => sum + p.total, 0);

    // Calculate goals total
    const checkedGoals = document.querySelectorAll('input.goal-checkbox[type="checkbox"]:checked');
    const goalsCount = checkedGoals.length;
    const goalsTotal = goalsCount * 6;
    console.log(`Goals: ${goalsCount} goals × 6 = ${goalsTotal} points`);

    // Calculate team total
    const teamTotal = projectTotal + goalsTotal;
    console.log(`Team Total: Projects(${projectTotal}) + Goals(${goalsTotal}) = ${teamTotal}`);

    // Update team total display
    const teamTotalEl = document.getElementById('teamTotal');
    if (teamTotalEl) teamTotalEl.textContent = teamTotal;

    // Update win/loss display
    updateWinLossDisplay();
}

// Update win/loss outcome display
function updateWinLossDisplay() {
    const teamTotal = parseInt(document.getElementById('teamTotal')?.textContent) || 0;
    const finalTarget = parseInt(document.getElementById('finalTarget')?.textContent) || 56;

    const gameResult = document.getElementById('gameResult');
    const outcomeTarget = document.getElementById('outcomeTarget');
    const outcomeScore = document.getElementById('outcomeScore');
    const outcomeDifference = document.getElementById('outcomeDifference');
    const outcomeResult = document.getElementById('outcomeResult');

    // Use pure function to check win condition
    const result = checkWinCondition(teamTotal, finalTarget);

    console.log(`Win Check: Team(${teamTotal}) vs Target(${finalTarget}) = ${result.isWin ? 'WIN' : 'LOSS'} (margin: ${result.margin})`);

    // Update outcome display
    if (outcomeTarget) outcomeTarget.textContent = finalTarget;
    if (outcomeScore) outcomeScore.textContent = teamTotal;
    if (outcomeDifference) {
        outcomeDifference.textContent = (result.margin >= 0 ? '+' : '') + result.margin;
    }

    // Update result message
    if (outcomeResult) {
        if (teamTotal > 0) {
            outcomeResult.classList.remove('win', 'loss');
            outcomeResult.classList.add(result.isWin ? 'win' : 'loss');
            outcomeResult.innerHTML = result.message;

            if (gameResult) gameResult.value = result.isWin ? 'win' : 'loss';
        } else {
            outcomeResult.classList.remove('win', 'loss');
            outcomeResult.innerHTML = '<p>Enter your scores above to see the result.</p>';
        }
    }
}

// Goal card checkboxes
function initGoalCards() {
    const checkboxes = document.querySelectorAll('input.goal-checkbox[type="checkbox"]');
    console.log('[initGoalCards] Found', checkboxes.length, 'goal checkboxes');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            console.log('[initGoalCards] Checkbox changed:', this.checked);
            const card = this.closest('.score-goal-card');
            card.classList.toggle('achieved', this.checked);
            // Recalculate totals when goals are checked/unchecked
            updateAllTotals();
        });
    });
}

// Win/Loss toggle
function initWinLossToggle() {
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
}

// Opt-in toggle
function initOptIn() {
    const optIn = document.getElementById('optInLeaderboard');
    const displayNameSection = document.getElementById('displayNameSection');
    
    if (optIn && displayNameSection) {
        optIn.addEventListener('change', function() {
            displayNameSection.classList.toggle('visible', this.checked);
        });
    }
}

// Debrief accordion
function initDebrief() {
    const toggle = document.getElementById('debriefToggle');
    const content = document.getElementById('debriefContent');
    
    if (toggle && content) {
        toggle.addEventListener('click', function() {
            content.classList.toggle('active');
            const icon = toggle.querySelector('.accordion-icon');
            if (icon) {
                icon.style.transform = content.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
            }
        });
    }
}

// Form submission
function initFormSubmission() {
    const form = document.getElementById('scoreForm');
    const resetBtn = document.getElementById('resetForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveScore();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
                form.reset();
                document.querySelectorAll('.row-total').forEach(el => el.textContent = '0');
                document.getElementById('teamTotal').textContent = '0';
                document.getElementById('finalTarget').value = '56';
                document.querySelectorAll('.score-goal-card').forEach(card => card.classList.remove('achieved'));
                document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
                document.getElementById('displayNameSection').classList.remove('visible');
                document.getElementById('successMessage').classList.remove('visible');
            }
        });
    }
}

// Save score
async function saveScore() {
    const optIn = document.getElementById('optInLeaderboard').checked;

    // Gather player data
    const players = [];
    for (let row = 1; row <= 4; row++) {
        const level1 = parseInt(document.querySelector(`.level1-pts[data-row="${row}"]`)?.value) || 0;
        const level2 = parseInt(document.querySelector(`.level2-pts[data-row="${row}"]`)?.value) || 0;
        const level3 = parseInt(document.querySelector(`.level3-pts[data-row="${row}"]`)?.value) || 0;
        const role = document.querySelector(`.player-role[data-row="${row}"]`)?.value || '';

        players.push({
            row,
            role,
            level1,
            level2,
            level3,
            total: level1 + level2 + level3
        });
    }

    // Gather hazard data
    const hazardSelects = document.querySelectorAll('.hazard-select');
    const hazards = Array.from(hazardSelects).map(select => select.value);
    const targetData = calculateTarget(hazards);

    // Count goals
    const goalsCount = document.querySelectorAll('input.goal-checkbox[type="checkbox"]:checked').length;

    // Get display name if opted in
    const displayName = optIn ? document.getElementById('displayName').value || 'Anonymous Team' : null;

    // Build complete game score using pure function
    const gameScore = buildGameScore(players, targetData, goalsCount, displayName);

    console.log('Game Score Object:', gameScore);

    // Prepare data for database (flatter structure for compatibility)
    const data = {
        display_name: gameScore.display_name,
        team_score: gameScore.team_score,
        target_score: gameScore.target_score,
        is_win: gameScore.is_win,
        goals_achieved: gameScore.goals_achieved,
        roles_played: players.filter(p => p.role).map(p => p.role),
        created_at: gameScore.created_at
    };

    // If not opted in, just show success message
    if (!optIn) {
        showSuccessMessage();
        return;
    }

    // Try to save to Supabase
    if (supabase) {
        try {
            const { error } = await supabase
                .from('scores')
                .insert([data]);

            if (error) throw error;

            showSuccessMessage();
            loadLeaderboards();
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            saveToLocalStorage(data);
            showSuccessMessage();
        }
    } else {
        saveToLocalStorage(data);
        showSuccessMessage();
    }
}

// Local storage fallback
function saveToLocalStorage(data) {
    const scores = JSON.parse(localStorage.getItem('rbd_scores') || '[]');
    scores.push(data);
    localStorage.setItem('rbd_scores', JSON.stringify(scores));
}

function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    if (message) {
        message.classList.add('visible');
        message.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// =====================================================
// LEADERBOARDS
// =====================================================
async function loadLeaderboards() {
    let scores = [];
    
    // Try Supabase first
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('scores')
                .select('*')
                .not('display_name', 'is', null)
                .order('created_at', { ascending: false });
            
            if (!error && data) {
                scores = data;
            }
        } catch (error) {
            console.error('Error loading from Supabase:', error);
        }
    }
    
    // Fallback to local storage
    if (scores.length === 0) {
        scores = JSON.parse(localStorage.getItem('rbd_scores') || '[]')
            .filter(s => s.display_name);
    }
    
    renderWinsLeaderboard(scores);
    renderScoresLeaderboard(scores);
}

function renderWinsLeaderboard(scores) {
    const tbody = document.querySelector('#winsLeaderboard tbody');
    const noData = document.getElementById('noWinsData');
    
    if (!tbody) return;
    
    // Aggregate by team name
    const teams = {};
    scores.forEach(score => {
        if (!score.display_name) return;
        
        if (!teams[score.display_name]) {
            teams[score.display_name] = { wins: 0, games: 0 };
        }
        teams[score.display_name].games++;
        if (score.is_win) teams[score.display_name].wins++;
    });
    
    // Convert to array and sort
    const sorted = Object.entries(teams)
        .map(([name, data]) => ({
            name,
            wins: data.wins,
            games: data.games,
            winRate: data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0
        }))
        .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)
        .slice(0, 10);
    
    if (sorted.length === 0) {
        tbody.innerHTML = '';
        if (noData) noData.style.display = 'block';
        return;
    }
    
    if (noData) noData.style.display = 'none';
    
    tbody.innerHTML = sorted.map((team, index) => `
        <tr>
            <td class="rank-cell ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</td>
            <td class="team-name">${escapeHtml(team.name)}</td>
            <td class="stat-value">${team.wins}</td>
            <td>${team.games}</td>
            <td>${team.winRate}%</td>
        </tr>
    `).join('');
}

function renderScoresLeaderboard(scores) {
    const tbody = document.querySelector('#scoresLeaderboard tbody');
    const noData = document.getElementById('noScoresData');
    
    if (!tbody) return;
    
    // Sort by score
    const sorted = scores
        .filter(s => s.display_name)
        .sort((a, b) => b.team_score - a.team_score)
        .slice(0, 10);
    
    if (sorted.length === 0) {
        tbody.innerHTML = '';
        if (noData) noData.style.display = 'block';
        return;
    }
    
    if (noData) noData.style.display = 'none';
    
    tbody.innerHTML = sorted.map((score, index) => `
        <tr>
            <td class="rank-cell ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</td>
            <td class="team-name">${escapeHtml(score.display_name)}</td>
            <td class="stat-value">${score.team_score}</td>
            <td>${score.target_score}</td>
            <td>${formatDate(score.created_at)}</td>
        </tr>
    `).join('');
}

// =====================================================
// UTILITIES
// =====================================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
