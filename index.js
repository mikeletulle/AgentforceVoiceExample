require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Store access token, session ID, and initial greeting
let accessToken = '';
let sessionId = '';
let greetingMessage = '';

// Verify all required environment variables are set
function checkEnvVars() {
    const requiredVars = ['CLIENT_ID', 'CLIENT_SECRET', 'MY_DOMAIN', 'AGENT_ID', 'AGENT_API_BASE'];
    for (const v of requiredVars) {
        if (!process.env[v]) {
            console.error(`❌ Missing required environment variable: ${v}`);
            process.exit(1);
        }
    }
}

// Request OAuth access token using client_credentials flow
async function getAccessToken() {
    try {
        const response = await axios.post(`https://${process.env.MY_DOMAIN}/services/oauth2/token`, null, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: {
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }
        });

        accessToken = response.data.access_token;
        console.log('✅ Access token acquired.');
    } catch (error) {
        console.error('❌ Failed to get access token:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Create a new agent session and extract the greeting message
async function createSession() {
    try {
        const url = `${process.env.AGENT_API_BASE}/agents/${process.env.AGENT_ID}/sessions`;

        const payload = {
            externalSessionKey: uuidv4(),
            instanceConfig: {
                endpoint: `https://${process.env.MY_DOMAIN}`
            },
            streamingCapabilities: {
                chunkTypes: ['Text']
            },
            bypassUser: true
        };

        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        sessionId = response.data.sessionId;
        console.log('✅ Session created:', sessionId);

        const greeting = response.data.messages?.[0]?.message;
        if (greeting) {
            greetingMessage = greeting;
            console.log('👋 Greeting message:', greeting);
        }
    } catch (error) {
        console.error('❌ Failed to create session:', {
            status: error.response?.status,
            path: error.config?.url,
            data: error.response?.data,
        });
        process.exit(1);
    }
}

// Serve the greeting message separately so the client can fetch it on load
app.get('/greeting', (req, res) => {
    res.json({ greeting: greetingMessage });
});

// Handle incoming messages and forward to the agent API
app.post('/send', async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await axios.post(
            `${process.env.AGENT_API_BASE}/sessions/${sessionId}/messages`,
            {
                message: {
                    sequenceId: 1,
                    type: "Text",
                    text: userMessage,
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            }
        );

        console.log("🔍 Full response from agent API:", response.data);

        const agentReply = response.data?.messages?.[0]?.message || '[No response]';
        res.json({ response: agentReply });

    } catch (error) {
        console.error('❌ Error during /send:', {
            status: error.response?.status,
            path: error.config?.url,
            data: error.response?.data,
        });
        res.status(500).json({ error: 'Failed to get agent response' });
    }
});

// Start server and initialize token/session
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    checkEnvVars();
    await getAccessToken();
    await createSession();
    console.log(`🚀 Server running on port ${PORT}`);
});
