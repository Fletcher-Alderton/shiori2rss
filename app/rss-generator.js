import fetch from 'node-fetch';
import { create } from 'xmlbuilder2';
import fs from 'fs';

// Set your Shiori API URL
const apiBaseUrl = process.env.API_BASE_URL;

// Function to log in and fetch session ID
async function loginAndGetSessionId() {
    const loginData = {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD,
        remember: true,
        owner: true
    };

    try {
        const response = await fetch(`${apiBaseUrl}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            throw new Error(`Login failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.session;
    } catch (error) {
        console.error('Error logging in:', error);
        return null;
    }
}

// Function to fetch bookmarks and update RSS feed
async function fetchAndRefresh(sessionId) {
    try {
        const response = await fetch(`${apiBaseUrl}/api/bookmarks`, {
            headers: {
                'X-Session-Id': sessionId
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();

        // Update RSS feed with fetched bookmark data
        updateRSSFeed(data.bookmarks);
    } catch (error) {
        console.error('Error fetching and refreshing:', error);
    }
}



// Function to update the RSS feed with fetched bookmark data and save as XML file
async function updateRSSFeed(bookmarks) {
    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('rss').att('version', '2.0');
    root.att('xmlns:content', 'http://purl.org/rss/1.0/modules/content/');

    const channel = root.ele('channel');
    channel.ele('title').txt('Shiori');
    channel.ele('link').txt('https://fletcheralderton.com');
    channel.ele('description').txt('My Shiori bookmarks');
    // Add self-reference link using Atom namespace
    channel.ele('atom:link').att('href', 'https://shiori2rss.rehctelf.com').att('rel', 'self').att('type', 'application/rss+xml');

    for (const bookmark of bookmarks) {
        // Function to fetch the length of the image
        async function getImageLength(imageURL) {
            try {
                const response = await fetch(imageURL);
                if (response.ok) {
                    return response.headers.get('content-length');
                }
            } catch (error) {
                console.error('Error fetching image:', error);
            }
            return null;
        }

        const item = channel.ele('item');
        item.ele('title').txt(bookmark.title);
        item.ele('description').txt(bookmark.excerpt);
        item.ele('pubDate').txt(new Date(bookmark.modified).toUTCString());
        item.ele('link').txt(encodeURI(bookmark.url));
        item.ele('guid').txt(bookmark.url);
        item.ele('content:encoded').txt(`<a href="${encodeURI(bookmark.url)}">Read More</a>`);

        if (bookmark.imageURL) {
            const imageLength = await getImageLength(`${apiBaseUrl}${bookmark.imageURL}`);
            if (imageLength) {
                item.ele('enclosure').att('url', `${apiBaseUrl}${bookmark.imageURL}`).att('type', 'image/jpeg').att('length', imageLength);
            }
        }
    }

    const rssFeed = root.end({ prettyPrint: true });

    // Save the XML content to a file
    fs.writeFileSync('./rss-feed.xml', rssFeed);

    console.log('RSS feed updated and saved successfully');
}

(async () => {
    const initialSessionId = await loginAndGetSessionId();

    if (initialSessionId) {
        // Fetch data immediately on script start
        fetchAndRefresh(initialSessionId);

        // Fetch data every minute (60 * 1000 milliseconds)
        setInterval(() => fetchAndRefresh(initialSessionId), 60 * 1000);

    }
})();
