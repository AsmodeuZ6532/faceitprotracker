function drawLineChart(canvasId, data, label, color = '#FF5500', secondData = null, secondColor = '#FFAA00') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = Math.min(rect.width - 48, 1200);
    const height = 250;
    
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    if (!data || data.length < 2) {
        ctx.fillStyle = '#666';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Недостаточно данных для графика (нужно минимум 2 матча)', width / 2, height / 2);
        return;
    }

    const allData = secondData ? [...data, ...secondData] : data;
    const maxVal = Math.max(...allData, 1);
    const minVal = Math.min(...allData, 0);
    const range = maxVal - minVal || 1;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight * (1 - i / 4));
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText((minVal + range * i / 4).toFixed(1), padding.left - 5, y + 3);
    }

    function drawLine(dataSet, colorSet, labelSet) {
        if (!dataSet || dataSet.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = colorSet;
        ctx.lineWidth = 2.5;
        for (let i = 0; i < dataSet.length; i++) {
            const x = padding.left + (i / (dataSet.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((dataSet[i] - minVal) / range) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = colorSet;
        for (let i = 0; i < dataSet.length; i++) {
            const x = padding.left + (i / (dataSet.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((dataSet[i] - minVal) / range) * chartHeight;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        if (labelSet) {
            ctx.fillStyle = colorSet;
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            const lastX = padding.left + ((dataSet.length - 1) / (dataSet.length - 1)) * chartWidth;
            const lastY = padding.top + chartHeight - ((dataSet[dataSet.length - 1] - minVal) / range) * chartHeight;
            ctx.fillText(labelSet, lastX + 8, lastY + 4);
        }
    }

    drawLine(data, color, label);
    if (secondData) {
        drawLine(secondData, secondColor, 'ADR');
    }

    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(data.length / 10));
    for (let i = 0; i < data.length; i += step) {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        ctx.fillText(i + 1, x, height - 5);
    }
}

function updateAllCharts() {
    const filtered = getFilteredMatches(currentPeriod || 'all');
    
    const eloData = filtered.map(m => m.eloAfter || 0);
    drawLineChart('eloChart', eloData, 'Elo');
    
    const ratingData = filtered.map(m => safeNumber(m.rating));
    const adrData = filtered.map(m => safeNumber(m.adr));
    drawLineChart('ratingAdrChart', ratingData, 'Рейтинг', '#FF5500', adrData, '#FFAA00');
    
    const winrateData = [];
    for (let i = 0; i < filtered.length; i++) {
        const start = Math.max(0, i - 4);
        const slice = filtered.slice(start, i + 1);
        const winsInSlice = slice.filter(m => m.result === 'win').length;
        winrateData.push((winsInSlice / slice.length) * 100);
    }
    drawLineChart('winrateChart', winrateData, 'Winrate %', '#00CC88');
}
