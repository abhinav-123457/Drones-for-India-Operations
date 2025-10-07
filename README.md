# MEDIVAC DRONE

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/downloads/)

## Overview

This repository provides tools, scripts, and documentation for drone operations tailored to the Indian context. It focuses on regulatory compliance with the Directorate General of Civil Aviation (DGCA) guidelines, mission planning, real-time data processing, and applications in sectors like agriculture, disaster response, surveillance, and environmental monitoring. Whether you're a hobbyist, researcher, or enterprise user, this project helps streamline safe and efficient drone deployments across India's diverse terrains and airspace.

Key goals:
- Ensure adherence to NPNT (No Permission-No Takeoff) protocols and UIN (Unique Identification Number) requirements.
- Optimize flight paths for urban, rural, and high-altitude regions.
- Integrate with popular drone hardware (e.g., DJI, custom builds) and software stacks.

## Features

- **Regulatory Compliance Toolkit**: Automated checks for DGCA rules, including Remote Pilot License (RPL) validation and zone mapping via Digital Sky platform.
- **Mission Planning Interface**: Web-based planner using OpenDroneMap for route optimization, obstacle avoidance, and battery estimation.
- **Data Analytics Pipeline**: Process telemetry data with Python scripts for GIS mapping (using Folium/QGIS) and AI-driven insights (e.g., crop health via computer vision).
- **Simulation Environment**: DroneKit/PX4 integration for virtual testing without risking real hardware.
- **Real-Time Monitoring Dashboard**: Flask-based UI for live feeds, alerts, and logging.

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Git
- Docker (optional, for simulation)
- Drone hardware/simulator (e.g., QGroundControl for testing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/abhinav-123457/Drones-for-India-Operations.git
   cd Drones-for-India-Operations
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up environment variables (create a `.env` file):
   ```
   DGCA_API_KEY=your_dgca_key_here
   MAPBOX_TOKEN=your_mapbox_token  # For GIS features
   DRONEKIT_SIM=udp:127.0.0.1:14550  # For simulation
   ```

### Quick Start

Run a sample mission planner:
```bash
python src/mission_planner.py --zone "Delhi" --payload "camera" --duration 30
```

This generates a flight plan JSON and visualizes it on a map.

## Usage

### Example: Basic Flight Simulation
1. Start the simulator:
   ```bash
   python src/simulator.py
   ```
2. In another terminal, plan and execute a mock flight:
   ```bash
   python src/flight_controller.py --route sample_route.geojson
   ```
3. View logs and analytics:
   ```bash
   python src/analyze_telemetry.py --file logs/flight_001.csv
   ```

### Example: Compliance Check
```bash
python src/compliance_checker.py --uin "IND123456" --operation "survey" --location "Mumbai"
```
Output: Pass/Fail report with remediation steps.

For full API docs, see `docs/api.md`. Interactive Jupyter notebooks in `notebooks/` for data exploration.

## Project Structure

```
Drones-for-India-Operations/
├── src/                  # Core scripts (mission planning, compliance, etc.)
├── notebooks/            # Jupyter notebooks for analysis
├── docs/                 # Documentation and guides
├── tests/                # Unit tests
├── requirements.txt      # Python dependencies
├── README.md             # This file
└── LICENSE               # MIT License
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Before submitting, run tests:
```bash
pytest tests/
```

Report issues or suggest enhancements via [GitHub Issues](https://github.com/abhinav-123457/Drones-for-India-Operations/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with open-source tools like DroneKit, PX4, and Folium.
- Thanks to DGCA for public resources on drone regulations.
- Inspired by community projects in Indian drone tech.

## Contact

Abhinav Kumar - [email@example.com](mailto:email@example.com)  
Project Link: [https://github.com/abhinav-123457/Drones-for-India-Operations](https://github.com/abhinav-123457/Drones-for-India-Operations)

For support or queries, open an issue or reach out directly. Fly safe! 🚁
