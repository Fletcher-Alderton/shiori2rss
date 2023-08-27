import http from 'http';
import fs from 'fs';

const rssFilePath = './rss-feed.xml';
const port = 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/rss-feed.xml') {
        fs.readFile(rssFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/rss+xml' });
                res.end(data);
            }
        });
    } else if (req.url === '/') { // Handle the root URL
        fs.readFile(rssFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                // Display the XML contents as plain text
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
