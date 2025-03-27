let processes = [];
let colorIndex = 0;
const ganttColors = ['#3498db', '#2ecc71', '#e67e22', '#9b59b6', '#e74c3c'];

document.getElementById('algorithm').addEventListener('change', function() {
    document.getElementById('timeQuantum').style.display = 
        this.value === 'rr' ? 'inline-block' : 'none';
});

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
        addProcess();
    }
});

function validateProcess(id, arrival, burst, priority) {
    if (!/^[A-Za-z0-9]+$/.test(id)) {
        alert('Process ID must be alphanumeric!');
        return false;
    }
    if (processes.some(p => p.id === id)) {
        alert('Process ID must be unique!');
        return false;
    }
    if (isNaN(arrival) || arrival < 0 || isNaN(burst) || burst < 1 || isNaN(priority)) {
        alert('Invalid input values!');
        return false;
    }
    return true;
}

function addProcess() {
    const id = document.getElementById('processId').value.trim();
    const arrival = parseInt(document.getElementById('arrivalTime').value);
    const burst = parseInt(document.getElementById('burstTime').value);
    const priority = parseInt(document.getElementById('priority').value);

    if (!validateProcess(id, arrival, burst, priority)) return;

    processes.push({
        id,
        arrival,
        burst,
        priority,
        remaining: burst,
        start: -1,
        finish: -1
    });

    const table = document.getElementById('processTable').getElementsByTagName('tbody')[0];
    const row = table.insertRow();
    row.innerHTML = `
        <td>${id}</td>
        <td>${arrival}</td>
        <td>${burst}</td>
        <td>${priority}</td>
        <td><button class="remove-btn" onclick="removeProcess(this)">Remove</button></td>
    `;

    document.getElementById('processId').value = '';
    document.getElementById('arrivalTime').value = '';
    document.getElementById('burstTime').value = '';
    document.getElementById('priority').value = '';
}

function removeProcess(button) {
    const row = button.closest('tr');
    const index = row.rowIndex - 1;
    processes.splice(index, 1);
    row.remove();
}

function startSimulation() {
    if (processes.length === 0) {
        alert('Please add at least one process!');
        return;
    }
    
    const algorithm = document.getElementById('algorithm').value;
    let result;
    const quantum = parseInt(document.getElementById('timeQuantum').value) || 1;

    switch(algorithm) {
        case 'fcfs':
            result = FCFS([...processes]);
            break;
        case 'sjf':
            result = SJF([...processes]);
            break;
        case 'srtf':
            result = SRTF([...processes]);
            break;
        case 'priority':
            result = PriorityScheduling([...processes]);
            break;
        case 'rr':
            result = RoundRobin([...processes], quantum);
            break;
        default:
            alert('Invalid algorithm selected!');
            return;
    }

    renderGantt(result.gantt);
    showMetrics(result.metrics);
}

// Scheduling Algorithms
function FCFS(procs) {
    procs = procs.map(p => ({...p}));
    procs.sort((a, b) => a.arrival - b.arrival || a.priority - b.priority);
    let currentTime = 0;
    const gantt = [];
    
    for (const p of procs) {
        p.start = Math.max(currentTime, p.arrival);
        p.finish = p.start + p.burst;
        currentTime = p.finish;
        gantt.push({ process: p.id, start: p.start, end: p.finish });
    }
    return calculateMetrics(procs, gantt);
}

function SJF(procs) {
    procs = procs.map(p => ({...p}));
    procs.sort((a, b) => a.arrival - b.arrival);
    let currentTime = 0;
    const gantt = [];
    const queue = [];
    const completed = [];
    
    while (procs.length > 0 || queue.length > 0) {
        while (procs.length > 0 && procs[0].arrival <= currentTime) {
            queue.push(procs.shift());
        }
        
        if (queue.length === 0) {
            currentTime = procs[0].arrival;
            continue;
        }
        
        queue.sort((a, b) => a.burst - b.burst);
        const p = queue.shift();
        p.start = currentTime;
        p.finish = currentTime + p.burst;
        currentTime = p.finish;
        completed.push(p);
        
        gantt.push({ process: p.id, start: p.start, end: p.finish });
    }
    
    return calculateMetrics(completed, gantt);
}

function SRTF(procs) {
    procs = procs.map(p => ({...p, remaining: p.burst}));
    procs.sort((a, b) => a.arrival - b.arrival);
    let currentTime = 0;
    const gantt = [];
    const queue = [];
    const completed = [];
    
    while (procs.length > 0 || queue.length > 0) {
        while (procs.length > 0 && procs[0].arrival <= currentTime) {
            queue.push(procs.shift());
        }
        
        if (queue.length === 0) {
            currentTime = procs[0]?.arrival || currentTime;
            continue;
        }
        
        queue.sort((a, b) => a.remaining - b.remaining);
        const p = queue[0];
        const execTime = Math.min(
            p.remaining,
            (procs[0]?.arrival - currentTime) || Infinity
        );
        
        if (gantt.length === 0 || gantt[gantt.length-1].process !== p.id) {
            gantt.push({ process: p.id, start: currentTime, end: currentTime + execTime });
        } else {
            gantt[gantt.length-1].end += execTime;
        }
        
        currentTime += execTime;
        p.remaining -= execTime;
        
        if (p.remaining === 0) {
            p.finish = currentTime;
            completed.push(queue.shift());
        }
    }
    
    return calculateMetrics(completed, gantt);
}

function PriorityScheduling(procs) {
    procs = procs.map(p => ({...p}));
    procs.sort((a, b) => a.arrival - b.arrival);
    let currentTime = 0;
    const gantt = [];
    const queue = [];
    const completed = [];
    
    while (procs.length > 0 || queue.length > 0) {
        while (procs.length > 0 && procs[0].arrival <= currentTime) {
            queue.push(procs.shift());
        }
        
        if (queue.length === 0) {
            currentTime = procs[0].arrival;
            continue;
        }
        
        queue.sort((a, b) => a.priority - b.priority);
        const p = queue.shift();
        p.start = currentTime;
        p.finish = currentTime + p.burst;
        currentTime = p.finish;
        completed.push(p);
        
        gantt.push({ process: p.id, start: p.start, end: p.finish });
    }
    
    return calculateMetrics(completed, gantt);
}

function RoundRobin(procs, quantum) {
    procs = procs.map(p => ({...p, remaining: p.burst}));
    procs.sort((a, b) => a.arrival - b.arrival);
    let currentTime = 0;
    const gantt = [];
    const queue = [];
    const completed = [];
    
    while (procs.length > 0 || queue.length > 0) {
        while (procs.length > 0 && procs[0].arrival <= currentTime) {
            queue.push(procs.shift());
        }
        
        if (queue.length === 0) {
            currentTime = procs[0]?.arrival || currentTime;
            continue;
        }
        
        const p = queue.shift();
        const execTime = Math.min(p.remaining, quantum);
        
        if (gantt.length === 0 || gantt[gantt.length-1].process !== p.id) {
            gantt.push({ process: p.id, start: currentTime, end: currentTime + execTime });
        } else {
            gantt[gantt.length-1].end += execTime;
        }
        
        currentTime += execTime;
        p.remaining -= execTime;
        
        while (procs.length > 0 && procs[0].arrival <= currentTime) {
            queue.push(procs.shift());
        }
        
        if (p.remaining > 0) {
            queue.push(p);
        } else {
            p.finish = currentTime;
            completed.push(p);
        }
    }
    
    return calculateMetrics(completed, gantt);
}

function calculateMetrics(procs, gantt) {
    if (!procs || procs.length === 0) {
        return {
            gantt: [],
            metrics: { avgWait: 0, avgTurnaround: 0 }
        };
    }

    procs.forEach(p => {
        p.turnaround = p.finish - p.arrival;
        p.wait = p.turnaround - p.burst;
    });

    const totalWait = procs.reduce((sum, p) => sum + p.wait, 0);
    const totalTurnaround = procs.reduce((sum, p) => sum + p.turnaround, 0);

    return {
        gantt,
        metrics: {
            avgWait: totalWait / procs.length,
            avgTurnaround: totalTurnaround / procs.length
        }
    };
}

function renderGantt(gantt) {
    const container = document.getElementById('ganttChart');
    container.innerHTML = '';
    colorIndex = 0;
    
    gantt.forEach(block => {
        const div = document.createElement('div');
        div.className = 'gantt-block';
        div.style.width = `${(block.end - block.start) * 40}px`;
        div.style.backgroundColor = ganttColors[colorIndex % ganttColors.length];
        div.innerHTML = `
            ${block.process}
            <div class="gantt-time">${block.start}-${block.end}</div>
        `;
        container.appendChild(div);
        colorIndex++;
    });
}

function showMetrics(metrics) {
    const container = document.getElementById('results');
    container.innerHTML = `
        <div class="metric-card">
            <h3>Average Waiting Time</h3>
            <p>${metrics.avgWait.toFixed(2)}</p>
        </div>
        <div class="metric-card">
            <h3>Average Turnaround Time</h3>
            <p>${metrics.avgTurnaround.toFixed(2)}</p>
        </div>
    `;
    document.querySelector('.results').scrollIntoView({ behavior: 'smooth' });
}