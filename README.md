<div align="center">
  <img src="CrewAgent/logoCS.png" alt="CrewSpace Logo" width="120" height="120" style="border-radius: 20px" />
  <h1>CrewSpace</h1>
  <p><strong>The Intelligent Agentic Engine & Configurable Chatflow Workspace</strong></p>
</div>

---

## What is CrewSpace?

CrewSpace is a two-part ecosystem consisting of a **Next.js Dashboard (`Chatflows`)** and a **Smart Chrome Extension (`CrewAgent` -> rebranded as *CrewSpace*)**. Together, they allow you to create powerful, customizable AI agents that act directly inside your browser.

With CrewSpace, you do not just talk to an AI; the AI **sees your webpage context**, **understands DOM elements**, and can autonomously **Click**, **Scroll**, **Type**, **Translate**, and **Navigate** on your behalf while you retain full control over its personality and backend LLM models.

---

## Project Architecture

### 1. Chatflows (The Backend & Dashboard)
Built with Next.js, this is your control center.
* **Agentic Node Editor**: A drag-and-drop workspace where you can create customized "Chatflows", defining specific agents, their roles, personalities, and the LLM they use.
* **API Key Management**: Securely store API keys for **Google Gemini** and **Sarvam AI**. No hardcoded keys in the extension logic.
* **Dynamic Syncing**: Every Chatflow and API key you configure syncs instantly to a local JSON datastore (`.crewspace-data.json`).
* **Extension Bridge**: Serves the `/api/extension/chat`, `/api/extension/models`, and `/api/extension/translate` routes. This processes the heavy agentic logic and returns specific actionable JSON to your Chrome extension.

### 2. CrewSpace Extension (The Frontend Agent)
A Chrome Sidebar Extension that acts as your autonomous co-pilot.
* **Context Aware**: Injects your current Browser URL, Page Title, Page Content, and Interactable DOM Elements directly into the prompt transparently.
* **Agentic Execution**: Parses the backend JSON response to perform DOM actions (clicks, typing, scrolling) without you lifting a finger.
* **Dynamic Selection**: Instantly lists your specific configured Chatflows directly in its dropdown header. If you create an Agent named "Marketing Expert" in the dashboard, you can select it in the extension immediately.
* **Speech to Text**: Out-of-the-box multi-lingual voice command support.
* **Page Translation**: Uses the Bhashini API via the dashboard to directly translate text nodes on live websites.

---

## Supported LLM Providers

Presently, CrewSpace supports full agentic configuration for:
- **Google Gemini** (`gemini-flash-latest`, etc.)
- **Sarvam AI** (`sarvam-m`)

---

## Setup & Installation

Follow these instructions to get both the Dashboard and the Extension running on your local machine.

### Part 1: Running the Chatflows Dashboard

1. Navigate to the dashboard directory:
   \`\`\`bash
   cd Chatflows
   \`\`\`

2. Install dependencies (if you haven't already):
   \`\`\`bash
   npm install
   \`\`\`

3. Start the Next.js development server:
   \`\`\`bash
   npm run dev
   \`\`\`
   Your backend is now running at `http://localhost:3000`. Keep this running!

4. Navigate to `http://localhost:3000` in your browser. Complete the initial setup by navigating to **"API Keys"** and adding your respective API Keys for Gemini or Sarvam. Add a Chatflow and configure its Agent Node.

### Part 2: Installing the CrewSpace Extension

1. Open a new tab in Google Chrome and go to exactly:
   \`chrome://extensions/\`

2. Enable **"Developer mode"** by toggling the switch in the top right corner.

3. Click **"Load unpacked"** in the top left.

4. Select the **`CrewAgent`** directory inside this project folder.

5. Once loaded, click the **Extensions Puzzle Icon** in Chrome's top right toolbar, and **Pin** the CrewSpace extension.

### Part 3: Using the Agent

1. Click the CrewSpace icon in your browser toolbar to open the sidebar.
2. In the top dropdown, select the **Chatflow** you configured in the dashboard.
3. Chat naturally, ask general questions, or issue agentic commands like:
   * *"Scroll down a bit"*
   * *"Click the sign in button"*
   * *"Search for laptops in the search bar"*
   * *"Translate this page to Hindi"*

---

## Customizing Your Agent

If you want to tweak how the AI behaves:
1. Go to the Next.js **Chatflows** Dashboard (`http://localhost:3000`).
2. Open a Chatflow.
3. Click the Agent Node or open the side configuration panel.
4. Tweak the Model, Role, and Personality. 
5. The extension will automatically inherit these behaviors on your very next message!

---

*CrewSpace - Pure Intelligence inside your Browser.*
*_Built for Prajyukti Hackathon 2026_*