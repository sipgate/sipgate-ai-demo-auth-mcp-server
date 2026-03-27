# ----------- Build Stage -----------
FROM node:24-alpine AS build

# Set working directory
WORKDIR /app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# ----------- Production Stage -----------
FROM node:24-alpine AS prod

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json for prod install
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy built app from build stage
COPY --from=build /app/dist ./dist

EXPOSE 8088

# Start the server
CMD ["node", "dist/main.js"]
