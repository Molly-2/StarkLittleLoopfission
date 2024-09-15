const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const JAMENDO_CLIENT_ID = '24b3fe50';  // Replace with your Jamendo client ID
const JAMENDO_CLIENT_SECRET = 'ffd682a0ac2e2355fe4b238b599fccaf';  // Replace with your Jamendo client secret

// Function to get the access token
async function getAccessToken() {
    const tokenURL = 'https://api.jamendo.com/oauth/token';

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', JAMENDO_CLIENT_ID);
    params.append('client_secret', JAMENDO_CLIENT_SECRET);

    try {
        const response = await axios.post(tokenURL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.message);
        throw new Error('Unable to retrieve access token');
    }
}

// Endpoint to search for music based on query
app.get('/sing', async (req, res) => {
    try {
        const query = req.query.query;

        // Validate if the query parameter exists
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Get the access token
        const accessToken = await getAccessToken();

        // Make a request to Jamendo API with the access token
        const response = await axios.get('https://api.jamendo.com/v3.0/tracks', {
            params: {
                client_id: JAMENDO_CLIENT_ID,
                format: 'json',
                limit: 1,
                name: query
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // Check if any tracks were found
        if (response.data.results.length === 0) {
            return res.status(404).json({ message: 'No tracks found' });
        }

        // Return the first track's music URL
        const track = response.data.results[0];
        return res.json({ track_url: track.audio });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
