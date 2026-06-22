function calculateStats(data) {
    const n = data.length;
    if (!n) {
        return {
            elo: 0,
            targetElo: goals.elo || 2000,
            matches: 0,
            winrate: 0,
            avgRating: 0,
            avgAdr: 0,
            avgKd: 0,
            winStreak: 0,
            lossStreak: 0,
            maxWinStreak: 0,
            totalWins: 0,
            totalLosses: 0
        };
    }

    let totalRating = 0;
    let totalAdr = 0;
    let totalKd = 0;
    let wins = 0;
    let eloCurrent = 0;
    let maxWinStreak = 0;
    let lossStreak = 0;
    let lastResult = null;
    let curStreak = 0;

    const last = data[data.length - 1];
    eloCurrent = last.eloAfter || 0;

    data.forEach((m, i) => {
        if (m.result === 'win') wins++;
        totalRating += safeNumber(m.rating);
        totalAdr += safeNumber(m.adr);
        const k = safeNumber(m.kills, 1);
        const d = safeNumber(m.deaths, 1);
        totalKd += (k / d);

        if (i === 0) {
            curStreak = 1;
            lastResult = m.result;
        } else {
            if (m.result === lastResult) {
                curStreak++;
            } else {
                if (lastResult === 'win') {
                    if (curStreak > maxWinStreak) maxWinStreak = curStreak;
                } else {
                    if (curStreak > lossStreak) lossStreak = curStreak;
                }
                curStreak = 1;
                lastResult = m.result;
            }
        }
    });

    if (lastResult === 'win') {
        if (curStreak > maxWinStreak) maxWinStreak = curStreak;
    } else {
        if (curStreak > lossStreak) lossStreak = curStreak;
    }

    const winrate = (wins / n * 100);

    return {
        elo: eloCurrent,
        targetElo: goals.elo || 2000,
        matches: n,
        winrate: winrate,
        avgRating: totalRating / n,
        avgAdr: totalAdr / n,
        avgKd: totalKd / n,
        winStreak: lastResult === 'win' ? curStreak : 0,
        lossStreak: lastResult === 'loss' ? curStreak : 0,
        maxWinStreak: maxWinStreak,
        totalWins: wins,
        totalLosses: n - wins
    };
}

function calculateProgress(current, target) {
    if (!target || target === 0) return 0;
    return Math.min(100, (current / target) * 100);
}
