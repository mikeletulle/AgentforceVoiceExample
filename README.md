# Agentforce Voice Example

This is an example Node.js application that connects to a Salesforce Agentforce Service Agent using the [Einstein Agent API](https://developer.salesforce.com/docs/einstein/genai/guide/agent-api-get-started.html). It provides a simple browser interface that supports both text-based and speech-based interactions.

## Features

- Sends and receives messages with a Salesforce Service Agent via the Agent API.
- Optional speech-to-text input and text-to-speech output.
- Automatically displays the agent’s greeting message upon session start.
- Responsive UI with minimizable chat container and themed background.
- Icons and styles designed to mimic internal Agentforce UI.

## Setup Instructions

### 1. Salesforce Setup

You’ll need the following in your Salesforce org:

- A **Service Agent**
- A **Connected App** configured to use **Client Credentials Flow**
- That Connected App must be **associated with the agent** in Setup

For detailed steps, refer to the [official guide](https://developer.salesforce.com/docs/einstein/genai/guide/agent-api-get-started.html).

> ⚠️ The app authenticates using **Client Credentials** (app-level auth). Since agents run as a specific user, be sure that the associated user has the necessary **object and field permissions** via Permission Sets.

### 2. Clone and Run Locally

```bash
git clone https://github.com/mikeletulle/AgentforceVoiceExample.git
cd AgentforceVoiceExample
npm install

Create a .env file in the root directory:
CLIENT_ID=your_connected_app_client_id
CLIENT_SECRET=your_connected_app_client_secret
MY_DOMAIN=your_my_domain_name.my.salesforce.com
AGENT_ID=your_agent_id
AGENT_API_BASE=https://your_instance_name.salesforcegenai.com

Then start the server:

npm start
Visit http://localhost:3000 in your browser.

### 3. Deploy to Heroku
You can deploy to Heroku using:


heroku create
git push heroku master
heroku config:set CLIENT_ID=... CLIENT_SECRET=... etc.
🔒 Note: Heroku apps are public by default, so do not expose sensitive credentials or hardcode secrets in the frontend.

