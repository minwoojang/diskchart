

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
//  설정 영역 (df -h 값 기반 전체 용량)
// ================================
const TOTAL_SHOW  = 427 * 1024 * 1024 * 1024 * 1024;   // 427TB
const TOTAL_SHOW2 = 327 * 1024 * 1024 * 1024 * 1024;   // 327TB


// ================================
//  사람 읽기 좋은 용량 변환 함수
// ================================
function human(bytes) {
    const units = ['B','KB','MB','GB','TB','PB'];
    if (!bytes || bytes <= 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const v = bytes / Math.pow(1024, i);
    return (v >= 10 ? v.toFixed(1) : v.toFixed(2)) + ' ' + units[i];
}


// ================================
//  랜덤 컬러 생성
// ================================
function randomColor(alpha=0.7) {
    const r = Math.floor(Math.random()*255);
    const g = Math.floor(Math.random()*255);
    const b = Math.floor(Math.random()*255);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


// ================================
//  Main Fetch
// ================================
//fetch("http://127.0.0.1:8000/db/")
fetch("http://10.0.20.22:8000/db/")
    .then(response => response.json())
    .then(data => {

        // /show 데이터
        const show_labels = [];
        const show_sizes = [];
        const show_colors = [];
        let usedShow = 0;

        // /show2 데이터
        const show2_labels = [];
        const show2_sizes = [];
        const show2_colors = [];
        let usedShow2 = 0;


        // 데이터 분류
        data.result.forEach(element => {
            const used = element.size;
            const color = randomColor(0.7);

            if (element.root === "/show") {
                usedShow += used;
                show_labels.push(element.folder);
                show_sizes.push(used);
                show_colors.push(color);

            } else if (element.root === "/show2") {
                usedShow2 += used;
                show2_labels.push(element.folder);
                show2_sizes.push(used);
                show2_colors.push(color);
            }
        });


        // 남은 용량 계산
        const freeShow = TOTAL_SHOW - usedShow;
        const freeShow2 = TOTAL_SHOW2 - usedShow2;


        // ================================
        //  Summary 표기 (라벨)
        // ================================
        document.getElementById("show-summary").innerText =
            `총용량: ${human(TOTAL_SHOW)}   |   사용 용량: ${human(usedShow)}   |   사용 가능: ${human(freeShow)}`;

        document.getElementById("show2-summary").innerText =
            `총용량: ${human(TOTAL_SHOW2)}   |   사용 용량: ${human(usedShow2)}   |   사용 가능: ${human(freeShow2)}`;


        // ================================
        //  /show 차트
        // ================================
        const ctx = document.getElementById('show').getContext('2d');

        new Chart(ctx, {
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
                    onClick: function() { return; },
                    labels: {
                        fontSize: 18,
                        boxWidth: 30
                    }
                },

                scales: {
                    yAxes: [{
                        // ticks: {
                        //     min: 0,
                        //     max: TOTAL_SHOW,   // ★ 전체 용량을 Y축 max로 설정
                        //     callback: function(value) {
                        //         return human(value);
                        //     },
                        //     fontSize: 14
                        // }
                        ticks: {
                            beginAtZero: true,
                            suggestedMax: Math.max(...show_sizes) * 1.2,  // 최대값의 1.2배
                            callback: value => human(value)
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontSize: 14,
                            autoSkip: false
                        }
                    }]
                },

                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            return "Used: " + human(tooltipItem.yLabel);
                        }
                    }
                }
            }
        });


        // ================================
        //  /show2 차트
        // ================================
        const ctx1 = document.getElementById('show2').getContext('2d');

        new Chart(ctx1, {
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
                    onClick: function() { return; },
                    labels: {
                        fontSize: 18,
                        boxWidth: 30
                    }
                },

                scales: {
                    yAxes: [{
                        // ticks: {
                        //     min: 0,
                        //     max: TOTAL_SHOW2,   // ★ 전체 용량을 Y축 max로 설정
                        //     callback: function(value) {
                        //         return human(value);
                        //     },
                        //     fontSize: 14
                        // }
                        ticks: {
                            beginAtZero: true,
                            suggestedMax: Math.max(...show_sizes) * 1.2,  // 최대값의 1.2배
                            callback: value => human(value)
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontSize: 14,
                            autoSkip: false
                        }
                    }]
                },

                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            return "Used: " + human(tooltipItem.yLabel);
                        }
                    }
                }
            }
        });

    });
