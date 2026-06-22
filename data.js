const STORAGE_KEYS = {
    MATCHES: 'ft_matches',
    GOALS: 'ft_goals',
    PROFILE: 'ft_profile',
    USERS: 'ft_users'
};

let matches = [];
let goals = { elo: 2000, rating: 1.5, adr: 90, winrate: 60 };
let profile = { name: 'Игрок' };
let users = {};

function loadData() {
    matches = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES)) || [];
    goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS)) || { elo: 2000, rating: 1.5, adr: 90, winrate: 60 };
    profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)) || { name: 'Игрок' };
    users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || {};
    
    if (matches.length === 0) {
        generateTestData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function generateTestData() {
    const mapPool = ['Mirage', 'Inferno', 'Dust2', 'Nuke', 'Ancient', 'Anubis', 'Cache', 'Overpass'];
    const roles = ['AWP', 'Rifler', 'Lurker', 'IGL', 'Support'];
    const comments = ['Хороший матч', 'Отлично сыграли', 'Нужно больше тренироваться', 'Командная работа', 'Индивидуальный перфоманс'];
    let elo = 1500;
    const today = new Date();

    for (let i = 0; i < 25; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (25 - i) * 2);
        
        const isWin = Math.random() > 0.4;
        const change = Math.floor(Math.random() * 30 + 15);
        const newElo = isWin ? elo + change : elo - change;
        const k = Math.floor(Math.random() * 20 + 10);
        const d = Math.floor(Math.random() * 15 + 8);
        
        matches.push({
            id: generateId(),
            date: date.toISOString().slice(0, 10),
            map: mapPool[Math.floor(Math.random() * mapPool.length)],
            score: `${16 - Math.floor(Math.random() * 4)}-${Math.floor(Math.random() * 14 + 10)}`,
            result: isWin ? 'win' : 'loss',
            eloBefore: elo,
            eloAfter: newElo,
            rating: parseFloat((Math.random() * 0.8 + 0.7).toFixed(2)),
            kills: k,
            deaths: d,
            assists: Math.floor(Math.random() * 8 + 2),
            adr: parseFloat((Math.random() * 60 + 40).toFixed(1)),
            kast: Math.floor(Math.random() * 30 + 60),
            entry: Math.floor(Math.random() * 4),
            clutches: Math.floor(Math.random() * 3),
            role: roles[Math.floor(Math.random() * roles.length)],
            comment: comments[Math.floor(Math.random() * comments.length)]
        });
        elo = newElo;
    }
    
    saveData();
}

function getFilteredMatches(period = 'all') {
    const now = new Date();
    let filtered = [...matches];
    
    switch(period) {
        case 'day':
            const today = now.toISOString().slice(0, 10);
            filtered = filtered.filter(m => m.date === today);
            break;
        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(m => new Date(m.date) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter(m => new Date(m.date) >= monthAgo);
            break;
        case 'year':
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            filtered = filtered.filter(m => new Date(m.date) >= yearAgo);
            break;
        case 'last30':
            filtered = filtered.slice(-30);
            break;
        default:
            break;
    }
    
    return filtered;
}
