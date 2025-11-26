

// RESPONSE: 
// {result: Array(19)}
// result : Array(19)
// 0 : {id: 1, root: '/show', folder: 'RND', size: 1693401909265, available_space: 185254863175680, …}
// 1 : {id: 2, root: '/show', folder: 'DEV', size: 1199662571800, available_space: 185254863175680, …}
// 2 : {id: 3, root: '/show', folder: '_RNDFX', size: 278440988719, available_space: 185254863175680, …}
// 3 : {id: 4, root: '/show', folder: 'tru', size: 108607064797, available_space: 185254863175680, …}
// 4 : {id: 5, root: '/show', folder: 'shr', size: 4904692054, available_space: 185254863175680, …}
// 5 : {id: 6, root: '/show', folder: 'lib', size: 16301156876, available_space: 185254863175680, …}
// 6 : {id: 7, root: '/show', folder: '_TEST', size: 17027514140600, available_space: 185254863175680, …}
// 7 : {id: 8, root: '/show', folder: 'mbf', size: 163947083217218, available_space: 185254863175680, …}
// 8 : {id: 9, root: '/show', folder: '_Asset', size: 1753836957215, available_space: 185254863175680, …}
// 9 : {id: 10, root: '/show2', folder: 'sht', size: 3357845410945, available_space: 204616713109504, …}
// 10: {id: 11, root: '/show2', folder: 'mdo', size: 3111080707152, available_space: 204616713109504, …}
// 11: {id: 12, root: '/show2', folder: 'xyz', size: 30932878654, available_space: 204616713109504, …}
// 12: {id: 13, root: '/show2', folder: 'xgd', size: 2024382934, available_space: 204616713109504, …}
// 13: {id: 14, root: '/show2', folder: 'taz', size: 2266946565276, available_space: 204616713109504, …}
// 14: {id: 15, root: '/show2', folder: 'agt', size: 26299979724, available_space: 204616713109504, …}
// 15: {id: 16, root: '/show2', folder: 'sgl', size: 2047934420256, available_space: 204616713109504, …}
// 16: {id: 17, root: '/show2', folder: 'upp', size: 7651921433424, available_space: 204616713109504, …}
// 17: {id: 18, root: '/show2', folder: 'bht', size: 126639034597374, available_space: 204616713109504, …}
// 18: {id: 19, root: '/show2', folder: 'pmg', size: 188935315105, available_space: 204616713109504, …}
// length : 19
// [[Prototype]] : Array(0)
// [[Prototype]] : Object

// ================================
//  설정 영역
// ================================
const TOTAL_SHOW  = 427 * 1024 * 1024 * 1024 * 1024;
const TOTAL_SHOW2 = 327 * 1024 * 1024 * 1024 * 1024;

function human(bytes) {
    const units = ['B','KB','MB','GB','TB','PB'];
    if (!bytes || bytes <= 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const v = bytes / Math.pow(1024, i);
    return (v >= 10 ? v.toFixed(1) : v.toFixed(2)) + ' ' + units[i];
}

function randomColor(alpha=0.7) {
    const r = Math.floor(Math.random()*255);
    const g = Math.floor(Math.random()*255);
    const b = Math.floor(Math.random()*255);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ================================
//  FETCH
// ================================
fetch("http://10.0.20.22:8000/db/")
    .then(r => r.json())
    .then(data => {

        const show_labels = [], show_sizes = [], show_colors = [];
        const show2_labels = [], show2_sizes = [], show2_colors = [];

        let usedShow = 0, usedShow2 = 0;

        data.result.forEach(e => {
            const used = e.size;
            const color = randomColor(0.7);

            if (e.root === "/show") {
                usedShow += used;
                show_labels.push(e.folder);
                show_sizes.push(used);
                show_colors.push(color);
            } else if (e.root === "/show2") {
                usedShow2 += used;
                show2_labels.push(e.folder);
                show2_sizes.push(used);
                show2_colors.push(color);
            }
        });

        // ================================
        //  Summary 출력
        // ================================
        document.getElementById("show-summary").innerText =
            `총용량: ${human(TOTAL_SHOW)} | 사용: ${human(usedShow)} | 남음: ${human(TOTAL_SHOW - usedShow)}`;

        document.getElementById("show2-summary").innerText =
            `총용량: ${human(TOTAL_SHOW2)} | 사용: ${human(usedShow2)} | 남음: ${human(TOTAL_SHOW2 - usedShow2)}`;

        // ================================
        //  SHOW CHART (v2)
// ================================
        const ctx = document.getElementById('show').getContext('2d');

        if (window.showChart) window.showChart.destroy();

        window.showChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: show_labels,
                datasets: [{
                    label: 'SHOW',
                    data: show_sizes,
                    backgroundColor: show_colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,

                legend: {
                    onClick: function() {},      // ★ 클릭 무효
                    labels: {
                        fontSize: 18,           // ★ 글자 크기 적용
                        boxWidth: 30            // ★ 네모 크기 적용
                    }
                },

                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            suggestedMax: Math.max(...show_sizes) * 1.2,  // ★ show 기준
                            callback: function(v){ return human(v); }
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            autoSkip: false,
                            fontSize: 14
                        }
                    }]
                },

                tooltips: {
                    callbacks: {
                        label: function(t){ return "Used: " + human(t.yLabel); }
                    }
                }
            }
        });

        // ================================
        //  SHOW2 CHART (v2)
// ================================
        const ctx1 = document.getElementById('show2').getContext('2d');

        if (window.show2Chart) window.show2Chart.destroy();

        window.show2Chart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: show2_labels,
                datasets: [{
                    label: 'SHOW2',
                    data: show2_sizes,
                    backgroundColor: show2_colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,

                legend: {
                    onClick: function() {},      // ★ 클릭 무효
                    labels: {
                        fontSize: 18,
                        boxWidth: 30
                    }
                },

                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            suggestedMax: Math.max(...show2_sizes) * 1.2,   // ★ show2 기준
                            callback: function(v){ return human(v); }
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            autoSkip: false,
                            fontSize: 14
                        }
                    }]
                },

                tooltips: {
                    callbacks: {
                        label: function(t){ return "Used: " + human(t.yLabel); }
                    }
                }
            }
        });

    });
