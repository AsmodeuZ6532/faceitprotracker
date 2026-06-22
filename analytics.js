function renderAnalytics() {
    const n = matches.length;
    if (!n) {
        document.getElementById('analyticsCards').innerHTML = '<div class="analytics-item">Нет данных</div>';
        return;
    }

    let wins = 0, totalRating = 0, totalAdr = 0, totalKast = 0, totalKd = 0;
    let mapStats = {}, roleStats = {};
    let bestMatch = null, worstMatch = null;

    matches.forEach((m) => {
        if (m.result === 'win') wins++;
        totalRating += safeNumber(m.rating);
        totalAdr += safeNumber(m.adr);
        totalKast += parseInt(m.kast) || 0;
        const kd = calcKD(m.kills, m.deaths);
        totalKd += kd;

        const map = m.map || 'Unknown';
        if (!mapStats[map]) mapStats[map] = { w: 0, l: 0, rating: 0, adr: 0, kd: 0, count: 0 };
        mapStats[map].count++;
        if (m.result === 'win') mapStats[map].w++;
        else mapStats[map].l++;
        mapStats[map].rating += safeNumber(m.rating);
        mapStats[map].adr += safeNumber(m.adr);
        mapStats[map].kd += kd;

        const role = m.role || 'Other';
        if (!roleStats[role]) roleStats[role] = { w: 0, l: 0, count: 0 };
        roleStats[role].count++;
        if (m.result === 'win') roleStats[role].w++;
        else roleStats[role].l++;

        const r = safeNumber(m.rating);
        if (!bestMatch || r > safeNumber(bestMatch.rating)) bestMatch = m;
        if (!worstMatch || r < safeNumber(worstMatch.rating)) worstMatch = m;
    });

    const avgRating = totalRating / n;
    const avgAdr = totalAdr / n;
    const avgKast = totalKast / n;
    const avgKd = totalKd / n;
    const winrate = wins / n * 100;

    const mapEntries = Object.entries(mapStats).map(([name, st]) => ({
        name,
        w: st.w,
        l: st.l,
        rating: st.rating / st.count,
        adr: st.adr / st.count,
        kd: st.kd / st.count,
        count: st.count
    }));
    const bestMap = mapEntries.sort((a, b) => b.w / b.count - a.w / a.count)[0];
    const worstMap = mapEntries.sort((a, b) => a.w / a.count - b.w / b.count)[0];

    const roleEntries = Object.entries(roleStats).map(([name, st]) => ({
        name,
        winrate: st.w / st.count * 100,
        count: st.count
    }));
    const bestRole = roleEntries.sort((a, b) => b.winrate - a.winrate)[0];
    const worstRole = roleEntries.sort((a, b) => a.winrate - b.winrate)[0];

    document.getElementById('analyticsCards').innerHTML = `
        <div class="analytics-item"><span class="orange">Ср. рейтинг</span><br><strong>${avgRating.toFixed(2)}</strong></div>
        <div class="analytics-item"><span class="orange">Ср. ADR</span><br><strong>${avgAdr.toFixed(1)}</strong></div>
        <div class="analytics-item"><span class="orange">Ср. KAST</span><br><strong>${avgKast.toFixed(1)}%</strong></div>
        <div class="analytics-item"><span class="orange">Ср. K/D</span><br><strong>${avgKd.toFixed(2)}</strong></div>
        <div class="analytics-item"><span class="orange">Winrate</span><br><strong>${winrate.toFixed(1)}%</strong></div>
        <div class="analytics-item"><span class="orange">Лучшая карта</span><br>${bestMap ? bestMap.name + ' (' + (bestMap.w / bestMap.count * 100).toFixed(0) + '%)' : '—'}</div>
        <div class="analytics-item"><span class="orange">Худшая карта</span><br>${worstMap ? worstMap.name + ' (' + (worstMap.w / worstMap.count * 100).toFixed(0) + '%)' : '—'}</div>
        <div class="analytics-item"><span class="orange">Лучшая роль</span><br>${bestRole ? bestRole.name + ' (' + bestRole.winrate.toFixed(0) + '%)' : '—'}</div>
        <div class="analytics-item"><span class="orange">Худшая роль</span><br>${worstRole ? worstRole.name + ' (' + worstRole.winrate.toFixed(0) + '%)' : '—'}</div>
        <div class="analytics-item"><span class="orange">Самый сильный матч</span><br>${bestMatch ? bestMatch.map + ' ' + bestMatch.rating : '—'}</div>
        <div class="analytics-item"><span class="orange">Самый слабый матч</span><br>${worstMatch ? worstMatch.map + ' ' + worstMatch.rating : '—'}</div>
    `;
}
