CPU Scheduling Simulator
A CPU Scheduling Simulator that implements multiple scheduling algorithms to demonstrate how processes are scheduled in an operating system.

📌 Features
✔ Supports multiple scheduling algorithms:

First Come First Serve (FCFS)

Shortest Job Next (SJN)

Shortest Remaining Time First (SRTF)

Round Robin (RR)

Priority Scheduling (Preemptive & Non-Preemptive)
✔ User input for process details (arrival time, burst time, priority, etc.)
✔ Displays Gantt charts for scheduling execution
✔ Calculates and displays:

Average Waiting Time

Average Turnaround Time
✔ Preemptive and Non-Preemptive modes

🛠 Installation & Usage
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/cpu-scheduling-simulator.git
cd cpu-scheduling-simulator
Compile and run (for C++ version):

bash
Copy
Edit
g++ cpu_scheduler.cpp -o cpu_scheduler
./cpu_scheduler
Or, for Python version:

bash
Copy
Edit
python cpu_scheduler.py
Follow the prompts to enter process details and view scheduling results.

📊 Example Output
yaml
Copy
Edit
Enter number of processes: 3
Enter Process ID, Arrival Time, Burst Time:
P1 0 5
P2 1 3
P3 2 8

Scheduling Algorithm: Round Robin (Time Quantum = 2)

Gantt Chart:
| P1 | P2 | P3 | P1 | P2 | P3 | P1 | P3 |

Average Waiting Time: 4.67 ms  
Average Turnaround Time: 8.33 ms  
🏗️ Contributing
Contributions are welcome! Feel free to submit pull requests or report issues.

📜 License
This project is licensed under the MIT License.

