# Use Node.js as base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the local files to the container
COPY . .

# Install dependencies (if any)
RUN npm install express

# Create a simple Express server
RUN echo "const express = require('express'); \
const app = express(); \
const PORT = 8080; \
app.use(express.static('public')); \
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));" > server.js

# Expose the port
EXPOSE 8080

# Run the server
CMD ["node", "server.js"]
