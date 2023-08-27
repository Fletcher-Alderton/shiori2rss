# Use a Node.js base image
FROM node:18

# Set a working directory
WORKDIR /

# Copy your JavaScript files into the container
COPY package.json package-lock.json /
RUN npm install
COPY . /

# Expose the port your application is listening on (if needed)
EXPOSE 3000

# Command to run your rss generator and the feed server
CMD ["sh", "-c", "node ./app/rss-generator.js & node ./app/rss-feed.js"]


