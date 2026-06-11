# squire

Squire is a technical support triage assistant that leverages Claude AI. Paste a support ticket, error message, or GitHub issue URL to get guidance, documentation, and assign a severity level.

### _Usage_

Enter a GitHub Issue URL in the format `https://github.com/owner/repo/issues/123`, or the content of a support ticket, and click **Triage**.

### _Features_

- Accepts text or a GitHub issue URL
- Fetches GitHub issue content including title, body, labels, and state
- Returns troubleshooting guidance and a severity rating (Low / Normal / High)
- Supports private GitHub repositories
- Login function to manage requests

### _Tech_

- React + Vite
- Vercel
- Claude API
- GitHub REST API

---

#### Setup

```bash
git clone https://github.com/yourusername/squire.git
cd squire
npm install
```

Create a `.env` file:
```
ANTHROPIC_API_KEY=your_anthropic_key
GITHUB_TOKEN=your_github_token
APP_PASSWORD=your_password
```

```bash
vercel dev
```

#### Deploy

```bash
vercel env add ANTHROPIC_API_KEY production
vercel env add GITHUB_TOKEN production
vercel --prod
```
