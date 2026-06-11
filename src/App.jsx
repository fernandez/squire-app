import { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [authed, setAuthed] = useState(() => {
    return localStorage.getItem("squire_authed") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (res.ok) {
        localStorage.setItem("squire_authed", "true");
        setAuthed(true);
      } else {
        setPasswordError(true);
        setPasswordInput("");
      }
    } catch {
      setPasswordError(true);
      setPasswordInput("");
    }
  };
 
  const triage = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: input }),
      });

      if (!res.ok) throw new Error(`Triage API error: ${res.status}`);
      const parsed = await res.json();
      if (parsed.error) throw new Error(parsed.error);
      setResult(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (s) => {
    if (s === "High") return "severity-high";
    if (s === "Normal") return "severity-normal";
    return "severity-low";
  };

  const confidenceColor = (c) => {
    if (c >= 80) return "confidence-high";
    if (c >= 50) return "confidence-mid";
    return "confidence-low";
  };

  if (!authed) {
    return (
      <div className="app">
        <header>
          <h1>squire</h1>
          <p>Developer support triage assistant</p>
        </header>
        <div className="login">
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className={passwordError ? "error-input" : ""}
            autoFocus
          />
          <button onClick={handleLogin}>Enter</button>
          {passwordError && <p className="error">Incorrect password</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>squire</h1>
        <p>Developer support triage assistant</p>
      </header>

      <main>
        <div className="input-section">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a support ticket, error message, or GitHub issue URL..."
            rows={8}
          />
          <button onClick={triage} disabled={loading || !input.trim()}>
            {loading ? "Triaging..." : "Triage"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <div className="result-header">
              <h2>{result.summary}</h2>
              <div className="badges">
                <span className={`severity ${severityColor(result.severity)}`}>
                  {result.severity}
                </span>
                <span className={`confidence ${confidenceColor(result.confidence)}`}>
                  {result.confidence}% confident
                </span>
              </div>
            </div>

            <div className="section">
              <h3>Likely Cause</h3>
              <p>{result.likely_cause}</p>
            </div>

            <div className="section">
              <h3>Next Steps</h3>
              <ol>
                {result.next_steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            {result.relevant_docs?.length > 0 && (
              <div className="section">
                <h3>Relevant Docs</h3>
                <ul>
                  {result.relevant_docs.map((doc, i) => (
                    <li key={i}>
                      <a href={doc.url} target="_blank" rel="noreferrer">
                        {doc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;