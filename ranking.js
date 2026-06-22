function renderRanking() {
    const search = document.getElementById('searchUser').value.toLowerCase();
    const container = document.getElementById('rankTable');

    // Собираем всех пользователей
    const allUsers = {};
    
    // Добавляем текущего пользователя
    allUsers[profile.name] = {
        name: profile.name,
        matches: matches.length,
        elo: matches.length > 0 ? matches[matches.length - 1].eloAfter || 0 : 0,
        winrate: matches.length > 0 ? (matches.filter(m => m.result === 'win').length / matches.length * 100) : 0,
        avgRating: matches.length > 0 ? matches.reduce((s, m) => s + safeNumber(m.rating), 0) / matches.length : 0
    };

    // Добавляем пользователей из сохраненных данных
    Object.values(users).forEach(user => {
        if (user.name && user.name !== profile.name) {
            allUsers[user.name] = user;
        }
    });

    // Сортируем по Elo
    let sorted = Object.values(allUsers)
        .filter(u => u.name.toLowerCase().includes(search))
        .sort((a, b) => b.elo - a.elo);

    if (sorted.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">👀 Пользователей не найдено</div>';
        return;
    }

    container.innerHTML = sorted.map((user, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
        const isCurrentUser = user.name === profile.name;
        return `
            <div class="user-item" style="${isCurrentUser ? 'border:2px solid #FF5500;' : ''}">
                <span class="rank-num">${medal}</span>
                <span class="user-name">${user.name} ${isCurrentUser ? '⭐' : ''}</span>
                <span class="user-stats">${user.matches} матчей</span>
                <span class="user-stats">${user.winrate.toFixed(1)}% WR</span>
                <span class="user-stats">Рейтинг: ${user.avgRating.toFixed(2)}</span>
                <span class="user-elo">${Math.round(user.elo)} Elo</span>
            </div>
        `;
    }).join('');
}

function addUserToRanking() {
    const userData = {
        name: profile.name,
        matches: matches.length,
        elo: matches.length > 0 ? matches[matches.length - 1].eloAfter || 0 : 0,
        winrate: matches.length > 0 ? (matches.filter(m => m.result === 'win').length / matches.length * 100) : 0,
        avgRating: matches.length > 0 ? matches.reduce((s, m) => s + safeNumber(m.rating), 0) / matches.length : 0
    };
    users[profile.name] = userData;
    saveData();
}
