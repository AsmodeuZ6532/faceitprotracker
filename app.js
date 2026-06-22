function renderStats() {
    const filtered = getFilteredMatches(currentPeriod);
    const s = calculateStats(filtered);
    const progress = s.targetElo > s.elo ? (s.elo / s.targetElo * 100) : 100;
    
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><div class="label">Elo</div><div class="value">${Math.round(s.elo)}</div><div class="sub">Цель: ${s.targetElo}</div></div>
        <div class="stat-card"><div class="label">Прогресс</div><div class="value">${Math.min(100, Math.round(progress))}%</div><div class="sub">до цели</div></div>
        <div class="stat-card"><div class="label">Матчи</div><div class="value">${s.matches}</div></div>
        <div class="stat-card"><div class="label">Winrate</div><div class="value">${s.winrate.toFixed(1)}%</div></div>
        <div class="stat-card"><div class="label">Ср. рейтинг</div><div class="value">${s.avgRating.toFixed(2)}</div></div>
        <div class="stat-card"><div class="label">Ср. ADR</div><div class="value">${s.avgAdr.toFixed(1)}</div></div>
        <div class="stat-card"><div class="label">Ср. K/D</div><div class="value">${s.avgKd.toFixed(2)}</div></div>
        <div class="stat-card"><div class="label">Серия побед</div><div class="value">${s.winStreak}</div><div class="sub">Макс: ${s.maxWinStreak}</div></div>
        <div class="stat-card"><div class="label">Серия поражений</div><div class="value">${s.lossStreak}</div></div>
    `;
}

function renderGoals() {
    const s = calculateStats(matches);
    const container = document.getElementById('goalProgressContainer');
    const g = goals;
    
    const progressElo = g.elo > 0 ? Math.min(100, (s.elo / g.elo) * 100) : 0;
    const progressRating = g.rating > 0 ? Math.min(100, (s.avgRating / g.rating) * 100) : 0;
    const progressAdr = g.adr > 0 ? Math.min(100, (s.avgAdr / g.adr) * 100) : 0;
    const progressWinrate = g.winrate > 0 ? Math.min(100, (s.winrate / g.winrate) * 100) : 0;
    
    container.innerHTML = `
        <div class="goal-item"><span class="label">Elo</span><span class="value">${Math.round(s.elo)}/${g.elo}</span><div class="progress-bar"><div class="progress-fill" style="width:${progressElo}%"></div></div><span>${Math.round(progressElo)}%</span></div>
        <div class="goal-item"><span class="label">Рейтинг</span><span class="value">${s.avgRating.toFixed(2)}/${g.rating}</span><div class="progress-bar"><div class="progress-fill" style="width:${progressRating}%"></div></div><span>${Math.round(progressRating)}%</span></div>
        <div class="goal-item"><span class="label">ADR</span><span class="value">${s.avgAdr.toFixed(1)}/${g.adr}</span><div class="progress-bar"><div class="progress-fill" style="width:${progressAdr}%"></div></div><span>${Math.round(progressAdr)}%</span></div>
        <div class="goal-item"><span class="label">Winrate</span><span class="value">${s.winrate.toFixed(1)}%/${g.winrate}%</span><div class="progress-bar"><div class="progress-fill" style="width:${progressWinrate}%"></div></div><span>${Math.round(progressWinrate)}%</span></div>
    `;
}

function renderMaps() {
    const mapNames = ['Mirage', 'Inferno', 'Dust2', 'Nuke', 'Ancient', 'Anubis', 'Cache', 'Overpass'];
    const grid = document.getElementById('mapGrid');
    
    grid.innerHTML = mapNames.map(name => {
        const ms = matches.filter(m => (m.map || '').toLowerCase() === name.toLowerCase());
        const n = ms.length;
        if (!n) return `<div class="map-card"><div class="map-name">${name}</div><div class="map-stat">Нет матчей</div></div>`;
        
        const wins = ms.filter(m => m.result === 'win').length;
        const winrate = wins / n * 100;
        const avgRating = ms.reduce((s, m) => s + safeNumber(m.rating), 0) / n;
        const avgAdr = ms.reduce((s, m) => s + safeNumber(m.adr), 0) / n;
        const kd = ms.reduce((s, m) => s + calcKD(m.kills, m.deaths), 0) / n;
        
        return `<div class="map-card">
            <div class="map-name">${name}</div>
            <div class="map-stat">Матчей: ${n}</div>
            <div class="map-stat">Winrate: ${winrate.toFixed(0)}%</div>
            <div class="map-stat">Рейтинг: ${avgRating.toFixed(2)}</div>
            <div class="map-stat">ADR: ${avgAdr.toFixed(1)}</div>
            <div class="map-stat">K/D: ${kd.toFixed(2)}</div>
        </div>`;
    }).join('');
}

function renderAll() {
    renderStats();
    renderMatchesTable();
    renderAnalytics();
    renderMaps();
    renderGoals();
    renderProfile();
    renderRanking();
    updateAllCharts();
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

// Загружаем данные
loadData();

// Устанавливаем текущую дату
document.getElementById('matchDate').value = new Date().toISOString().slice(0, 10);

// Устанавливаем цели
document.getElementById('goalElo').value = goals.elo || 2000;
document.getElementById('goalRating').value = goals.rating || 1.5;
document.getElementById('goalAdr').value = goals.adr || 90;
document.getElementById('goalWinrate').value = goals.winrate || 60;

// ============================================
// СОБЫТИЯ
// ============================================

// Табы
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        document.querySelectorAll('[id^="tab-"]').forEach(el => el.classList.add('hidden'));
        document.getElementById('tab-' + tab).classList.remove('hidden');
        setTimeout(() => renderAll(), 50);
    });
});

// Сохранение матча
document.getElementById('saveMatchBtn').addEventListener('click', saveMatch);

// Поиск и сортировка
document.getElementById('searchMatches').addEventListener('input', renderMatchesTable);
document.getElementById('sortMatches').addEventListener('change', renderMatchesTable);

// Фильтры периода
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentPeriod = this.dataset.period;
        renderAll();
    });
});

// Экспорт JSON
document.getElementById('exportJsonBtn').addEventListener('click', function() {
    const blob = new Blob([JSON.stringify(matches, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'matches.json';
    a.click();
});

// Экспорт CSV
document.getElementById('exportCsvBtn').addEventListener('click', function() {
    if (!matches.length) return;
    const headers = ['date', 'map', 'score', 'result', 'eloBefore', 'eloAfter', 'rating', 'kills', 'deaths', 'assists', 'adr', 'kast', 'entry', 'clutches', 'role', 'comment'];
    let csv = headers.join(',') + '\n';
    matches.forEach(m => {
        csv += headers.map(h => (m[h] || '')).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'matches.csv';
    a.click();
});

// Импорт
document.getElementById('importBtn').addEventListener('click', function() {
    document.getElementById('importFileInput').click();
});
document.getElementById('importFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        try {
            const data = JSON.parse(ev.target.result);
            if (Array.isArray(data)) {
                matches = data;
                saveData();
                renderAll();
                alert('✅ Импорт выполнен успешно!');
            }
        } catch (err) {
            alert('❌ Ошибка импорта');
        }
    };
    reader.readAsText(file);
    this.value = '';
});

// Сохранение целей
document.getElementById('setGoalsBtn').addEventListener('click', function() {
    goals.elo = safeNumber(document.getElementById('goalElo').value, 2000);
    goals.rating = safeNumber(document.getElementById('goalRating').value, 1.5);
    goals.adr = safeNumber(document.getElementById('goalAdr').value, 90);
    goals.winrate = safeNumber(document.getElementById('goalWinrate').value, 60);
    saveData();
    renderAll();
});

// Сохранение имени профиля
document.getElementById('saveProfileName').addEventListener('click', saveProfileName);
document.getElementById('profileNameInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') saveProfileName();
});

// Поиск в рейтинге
document.getElementById('searchUser').addEventListener('input', debounce(renderRanking, 300));

// Обработка ресайза
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => updateAllCharts(), 200);
});

// Запускаем приложение
renderAll();

// Добавляем пользователя в рейтинг каждые 30 секунд (обновление)
setInterval(() => {
    if (matches.length > 0) {
        addUserToRanking();
    }
}, 30000);
