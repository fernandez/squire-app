const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

console.log("API key preview:", ANTHROPIC_API_KEY?.slice(0, 15));

const isGitHubUrl = (text) =>
  text.trim().match(/https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+/);

const fetchGitHubIssue = async (url) => {
  const match = url
    .trim()
    .match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!match) throw new Error("Invalid GitHub issue URL");
  const [, owner, repo, number] = match;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${number}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return `Title: ${data.title}\n\nBody:\n${data.body}\n\nComments: ${data.comments}\nState: ${data.state}\nLabels: ${data.labels.map((l) => l.name).join(", ") || "none"}`;
};

export default async function handler(req, res) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  
    console.log("API key preview:", ANTHROPIC_API_KEY?.slice(0, 15));
  
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

  const { ticket } = req.body;

  if (!ticket) {
    return res.status(400).json({ error: "No ticket content provided" });
  }

  try {
    let ticketContent = ticket;
    if (isGitHubUrl(ticket)) {
      ticketContent = await fetchGitHubIssue(ticket);
    }

    const prompt = `You are an expert Technical Support Engineer. Triage the following support ticket and respond ONLY with a JSON object in this exact format, no markdown, no explanation. The confidence field should be an integer from 0 to 100 representing how confident you are in this triage given the information provided:
{
  "summary": "one sentence summary of the issue",
  "likely_cause": "clear explanation of the most likely root cause",
  "severity": "Low | Normal | High",
  "confidence": 85,
  "next_steps": ["step 1", "step 2", "step 3"],
  "relevant_docs": [{"title": "doc title", "url": "https://..."}]
}

Support ticket:
${ticketContent}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text;
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Triage error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}