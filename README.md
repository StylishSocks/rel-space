# AstroCAD

A simple interactive 3D CAD viewer that lets you load and inspect models, control the camera, and display live sensor data streams in real time.

## Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v1.29+)

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/StylishSocks/rel-space.git
   cd rel-space
   ```

2. **Build and launch all services**

   ```bash
   docker-compose up --build
   ```

3. **Verify the applications**

   - **Flask API**: `http://localhost:5000/api`
   - **React App**: `http://localhost:5173`

4. **Stop services**

   ```bash
   docker-compose down
   ```
