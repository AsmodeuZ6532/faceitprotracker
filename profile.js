function renderProfile() {
    const s = calculateStats(matches);
    document.getElementById('profileMatches').textContent = s.matches;
    document.getElementById('profileWinrate').textContent = s.winrate.toFixed(1) + '%';
    document.getElementById('profileRating').textContent = s.avgRating.toFixed(2);
    document.getElementById('profileAdr').textContent = s.avgAdr.toFixed(1);
    document.getElementById('profileKd').textContent = s.avgKd.toFixed(2);
    document.getElementById('profileElo').textContent = Math.round(s.elo);

    const roles = {};
    matches.forEach(m => {
        const r = m.role || 'Other';
        roles[r] = (roles[r] || 0) + 1;
    });
    const topRole = Object.entries(roles).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('profileRole').textContent = 'Основная роль: ' + (topRole ? topRole[0] : '—');

    const mapCount = {};
    matches.forEach(m => {
        const map = m.map || 'Unknown';
        mapCount[map] = (mapCount[map] || 0) + 1;
    });
    const topMaps = Object.entries(mapCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]).join(', ');
    document.getElementById('profileMaps').textContent = 'Любимые карты: ' + (topMaps || '—');

    document.getElementById('profileNameInput').value = profile.name || 'Игрок';
    document.getElementById('currentUser').textContent = '👤 ' + (profile.name || 'Игрок');
}

function saveProfileName() {
    const name = document.getElementById('profileNameInput').value.trim();
    if (name) {
        profile.name = name;
        saveData();
        renderProfile();
    }
}
