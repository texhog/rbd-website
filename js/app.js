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

// Target calculation
function initTargetCalculation() {
    const baseTarget = document.getElementById('baseTarget');
    const finalTarget = document.getElementById('finalTarget');
    const targetBreakdown = document.getElementById('targetBreakdown');
    const hazardSelects = document.querySelectorAll('.hazard-select');

    console.log('initTargetCalculation - Found elements:', {
        baseTarget: !!baseTarget,
        finalTarget: !!finalTarget,
        targetBreakdown: !!targetBreakdown,
        hazardSelectsCount: hazardSelects.length
    });

    function calculateTarget() {
        console.log('calculateTarget() called');
        const base = parseInt(baseTarget.value) || 56;
        let totalModifier = 0;

        // Sum up all hazard modifiers from dropdowns
        hazardSelects.forEach(select => {
            const value = parseInt(select.value) || 0;
            console.log(`Hazard ${select.dataset.hazard}: ${value}`);
            totalModifier += value;
        });

        const total = base + totalModifier;
        finalTarget.value = total;

        console.log(`Calculation: ${base} + ${totalModifier} = ${total}`);

        // Update breakdown display with animation
        if (targetBreakdown) {
            targetBreakdown.textContent = `${base} + ${totalModifier} =`;
            console.log('Updated targetBreakdown.textContent to:', targetBreakdown.textContent);
            // Add pulse effect
            targetBreakdown.style.transform = 'scale(1.1)';
            setTimeout(() => {
                targetBreakdown.style.transform = 'scale(1)';
            }, 300);
        } else {
            console.error('targetBreakdown element not found!');
        }

        // Also pulse the final target
        if (finalTarget) {
            finalTarget.style.transform = 'scale(1.05)';
            setTimeout(() => {
                finalTarget.style.transform = 'scale(1)';
            }, 300);
        }

        updateWinLossAuto();
    }

    // Add event listeners to all hazard dropdowns
    hazardSelects.forEach(select => {
        select.addEventListener('change', calculateTarget);
    });

    // Initial calculation
    calculateTarget();
}

// Scoring table calculations
function initScoringTable() {
    const table = document.querySelector('.scoring-table');
    if (!table) return;
    
    const inputs = table.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });
    
    calculateTotals();
}

function calculateTotals() {
    let teamTotal = 0;

    // Calculate total from checked goals
    const checkedGoals = document.querySelectorAll('.goal-checkbox:checked');
    const goalsTotal = checkedGoals.length * 6;

    for (let row = 1; row <= 4; row++) {
        const level1 = parseInt(document.querySelector(`.level1-pts[data-row="${row}"]`)?.value) || 0;
        const level2 = parseInt(document.querySelector(`.level2-pts[data-row="${row}"]`)?.value) || 0;
        const level3 = parseInt(document.querySelector(`.level3-pts[data-row="${row}"]`)?.value) || 0;

        const rowTotal = level1 + level2 + level3;
        
        const rowTotalEl = document.querySelector(`.row-total[data-row="${row}"]`);
        if (rowTotalEl) rowTotalEl.textContent = rowTotal;
        
        teamTotal += rowTotal;
    }

    // Add goals to team total
    teamTotal += goalsTotal;

    const teamTotalEl = document.getElementById('teamTotal');
    if (teamTotalEl) teamTotalEl.textContent = teamTotal;

    updateWinLossAuto();
}

// Auto-determine win/loss
function updateWinLossAuto() {
    const teamTotal = parseInt(document.getElementById('teamTotal')?.textContent) || 0;
    const finalTarget = parseInt(document.getElementById('finalTarget')?.value) || 56;
    
    const winBtn = document.getElementById('winBtn');
    const lossBtn = document.getElementById('lossBtn');
    const gameResult = document.getElementById('gameResult');
    
    if (teamTotal >= finalTarget && teamTotal > 0) {
        winBtn?.classList.add('active');
        lossBtn?.classList.remove('active');
        if (gameResult) gameResult.value = 'win';
    } else if (teamTotal > 0) {
        winBtn?.classList.remove('active');
        lossBtn?.classList.add('active');
        if (gameResult) gameResult.value = 'loss';
    }
}

// Goal card checkboxes
function initGoalCards() {
    const checkboxes = document.querySelectorAll('.goal-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const card = this.closest('.score-goal-card');
            card.classList.toggle('achieved', this.checked);
            // Recalculate totals when goals are checked/unchecked
            calculateTotals();
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
    
    // Gather data
    const data = {
        display_name: optIn ? document.getElementById('displayName').value || 'Anonymous Team' : null,
        team_score: parseInt(document.getElementById('teamTotal').textContent) || 0,
        target_score: parseInt(document.getElementById('finalTarget').value) || 56,
        is_win: document.getElementById('gameResult').value === 'win',
        goals_achieved: document.querySelectorAll('.goal-checkbox:checked').length,
        created_at: new Date().toISOString()
    };
    
    // Gather roles played
    const roles = [];
    document.querySelectorAll('.player-role').forEach(select => {
        if (select.value) roles.push(select.value);
    });
    data.roles_played = roles;
    
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
