let editingIndex = null;
let currentPeriod = 'all';

function saveMatch() {
    const date = document.getElementById('matchDate').value;
    const map = document.getElementById('matchMap').value;
    const score = document.getElementById('matchScore').value;
    const result = document.getElementById('matchResult').value;
    const eloBefore = safeNumber(document.getElementById('matchEloBefore').value);
    const eloAfter = safeNumber(document.getElementById('matchEloAfter').value);
    const rating = safeNumber(document.getElementById('matchRating').value);
    const kills = parseInt(document.getElementById('matchKills').value) || 0;
    const deaths = parseInt(document.getElementById('matchDeaths').value) || 1;
    const assists = parseInt(document.getElementById('matchAssists').value) || 0;
    const adr = safeNumber(document.getElementById('matchAdr').value);
    const kast = parseInt(document.getElementById('matchKast').value) || 0;
    const entry = parseInt(document.getElementById('matchEntry').value) || 0;
    const clutches = parseInt(document.getElementById('matchClutches').value) || 0;
    const role = document.getElementById('matchRole').value;
    const comment = document.getElementById('matchComment').value;

    const matchObj = {
        id: editingIndex !== null ? matches[editingIndex].id : generateId(),
        date,
        map,
        score,
        result,
        eloBefore,
        eloAfter,
        rating,
        kills,
        deaths,
        assists,
        adr,
        kast,
        entry,
        clutches,
        role,
        comment
    };

    if (editingIndex !== null) {
        matches[editingIndex] = matchObj;
        editingIndex = null;
        document.getElementById('saveMatchBtn').textContent = '➕ Добавить';
    } else {
        matches.push(matchObj);
    }

    saveData();
    renderAll();
    document.getElementById('matchEloBefore').value = eloAfter;
    document.getElementById('matchComment').value = '';
}

function deleteMatch(index) {
    if (!confirm('Удалить этот матч?')) return;
    matches.splice(index, 1);
    saveData();
    renderAll();
}

function editMatch(index) {
    const m = matches[index];
    if (!m) return;
    editingIndex = index;
    document.getElementById('matchDate').value = m.date || '';
    document.getElementById('matchMap').value = m.map || 'Mirage';
    document.getElementById('matchScore').value = m.score || '';
    document.getElementById('matchResult').value = m.result || 'win';
    document.getElementById('matchEloBefore').value = m.eloBefore || 0;
    document.getElementById('matchEloAfter').value = m.eloAfter || 0;
    document.getElementById('matchRating').value = m.rating || 1;
    document.getElementById('matchKills').value = m.kills || 0;
    document.getElementById('matchDeaths').value = m.deaths || 0;
    document.getElementById('matchAssists').value = m.assists || 0;
    document.getElementById('matchAdr').value = m.adr || 0;
    document.getElementById('matchKast').value = m.kast || 0;
    document.getElementById('matchEntry').value = m.entry || 0;
    document.getElementById('matchClutches').value = m.clutches || 0;
    document.getElementById('matchRole').value = m.role || 'AWP';
    document.getElementById('matchComment').value = m.comment || '';
    document.getElementById('saveMatchBtn').textContent = '✏️ Обновить';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderMatchesTable() {
    const tbody = document.getElementById('matchesTableBody');
    const search = document.getElementById('searchMatches').value.toLowerCase();
    const sort = document.getElementById('sortMatches').value;
    let filtered = getFilteredMatches(currentPeriod).filter((m) => {
        const map = (m.map || '').toLowerCase();
        const comment = (m.comment || '').toLowerCase();
        return map.includes(search) || comment.includes(search);
    });

    if (sort === 'date-desc') filtered.sort((a, b) => (a.date || '').localeCompare(b.date || '') * -1);
    else if (sort === 'date-asc') filtered.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    else if (sort === 'elo') filtered.sort((a, b) => ((b.eloAfter || 0) - (b.eloBefore || 0)) - ((a.eloAfter || 0) - (a.eloBefore || 0)));
    else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    tbody.innerHTML = filtered.map((m) => {
        const idx = matches.indexOf(m);
        const kd = calcKD(m.kills, m.deaths);
        const delta = (m.eloAfter || 0) - (m.eloBefore || 0);
        return `<tr>
            <td>${formatDate(m.date)}</td>
            <td>${m.map || ''}</td>
            <td><span class="${m.result === 'win' ? 'badge-win' : 'badge-loss'}">${m.result === 'win' ? 'Победа' : 'Поражение'}</span></td>
            <td>${m.score || ''}</td>
            <td>${m.rating || 0}</td>
            <td>${kd.toFixed(2)}</td>
            <td>${m.adr || 0}</td>
            <td style="color:${delta >= 0 ? '#4CAF50' : '#f44366'}">${delta > 0 ? '+' : ''}${delta}</td>
            <td class="actions-cell">
                <button onclick="editMatch(${idx})">✏️</button>
                <button onclick="deleteMatch(${idx})">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}
