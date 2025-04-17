# AstroCAD

An interactive 3D CAD viewer that lets you load and inspect models, control the camera, and display live sensor data streams in real time.

## Backend Setup (Docker Compose)

Your `docker-compose.yml` (located at the project root) uses version 3.8 and defines a single service for your Flask app.

To get started:

1. **Clone the repository**

   ```bash
   git clone https://github.com/StylishSocks/rel-space.git
   cd rel-space
   ```

2. **Build and start the Flask service**

   This command will build the image (if needed) and start the container:

   ```bash
   docker-compose up --build
   ```

3. **Verify the service**

   Open your browser or API client at `http://localhost:5000/api` to confirm the Flask app is running.

4. **Stop the service**

   Press `Ctrl+C` in the terminal, or run:

   ```bash
   docker-compose down
   ```

## Frontend Setup (React App)

> *Note: The frontend is not yet integrated into Docker Compose and must be run manually.*

1. **Navigate to the frontend React app directory**

   ```bash
   cd react-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Access the app**

   Go to `http://localhost:5173` in your browser.

## Scripts

- **Backend**

  - `docker-compose up --build`: Build and start the Flask service.
  - `docker-compose down`: Stop and remove the service container.

- **Frontend**

  - `npm run dev`: Run the React development server.

---


