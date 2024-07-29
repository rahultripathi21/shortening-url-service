# Use the Node.js 18.18.0 image
FROM node:20

# Set working directory
WORKDIR /src

# Copy package.json and yarn.lock first to leverage caching
COPY package.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn run build

# Expose the application port
EXPOSE 3000

# Define the command to run the application in production mode
CMD ["yarn", "start:dev"]
