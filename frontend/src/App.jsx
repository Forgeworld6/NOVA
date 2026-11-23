import { useEffect, useRef, useState } from "react";
import { ArrowUp, Plus, Sparkles, Menu, X } from "lucide-react";

const starters = [
  "Explain a difficult topic in simple words",
  "Help me write or improve some code",
  "Give me ideas for a project",
  "Answer a question I'm curious about"
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("checking");
  const [menuOpen, setMenuOpen] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setStatus(data.aiConfigured ? "ready" : "setup"))
      .catch(() => setStatus("offline"));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function sendMessage(value = message) {
    const prompt = value.trim();
    if (!prompt || busy) return;
    const previous = messages;
    setMessages((items) => [...items, { role: "user", content: prompt }]);
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: previous.slice(-16).map(({ role, content }) => ({ role, content }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "I couldn't complete that request. Please try again.");
      setMessages((items) => [...items, { role: "assistant", content: data.reply }]);
      setStatus("ready");
    } catch (error) {
      setMessages((items) => [...items, { role: "assistant", content: error.message }]);
      if (error.message.toLowerCase().includes("failed to fetch")) setStatus("offline");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function newChat() {
    setMessages([]);
    setMessage("");
    setMenuOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  const statusText = status === "ready"
    ? "AI connected"
    : status === "setup"
      ? "AI setup required"
      : status === "offline"
        ? "AI server not connected"
        : "Connecting";

  return (
    <main className="nova-app">
      <header className="topbar">
        <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
        <button className="brand" onClick={newChat} aria-label="NOVA home">
          <span className="brand-icon"><Sparkles size={17}/></span>
          <span>NOVA</span>
        </button>
        <div className="topbar-right">
          <span className={`connection ${status}`}><i/>{statusText}</span>
          <button className="new-chat" onClick={newChat}><Plus size={16}/><span>New chat</span></button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-popover">
          <button onClick={newChat}><Plus size={16}/> Start a new chat</button>
          <p>Your conversations stay in this browser session.</p>
        </div>
      )}

      <section className="chat-area">
        {messages.length === 0 ? (
          <div className="welcome">
            <div className="welcome-mark"><Sparkles size={24}/></div>
            <p className="welcome-kicker">YOUR AI ASSISTANT</p>
            <h1>What can I help<br className="mobile-break"/> you with?</h1>
            <p className="welcome-subtitle">Ask anything. Learn something new. Explore an idea.</p>
            <div className="starter-grid">
              {starters.map((item) => (
                <button key={item} onClick={() => sendMessage(item)}>{item}<span>↗</span></button>
              ))}
            </div>
          </div>
        ) : (
          <div className="conversation">
            {messages.map((item, index) => (
              <article className={`message ${item.role}`} key={index}>
                {item.role === "assistant" && <div className="assistant-mark"><Sparkles size={15}/></div>}
                <div className="message-bubble">
                  {item.role === "assistant" && <div className="message-name">NOVA</div>}
                  <p>{item.content}</p>
                </div>
              </article>
            ))}
            {busy && (
              <div className="thinking"><span/><span/><span/><label>NOVA is thinking</label></div>
            )}
            <div ref={endRef}/>
          </div>
        )}
      </section>

      <footer className="composer-wrap">
        <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
          <textarea
            ref={inputRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NOVA..."
            rows={1}
            aria-label="Message NOVA"
          />
          <div className="composer-bottom">
            <span>Enter to send · Shift + Enter for a new line</span>
            <button type="submit" disabled={!message.trim() || busy} aria-label="Send message"><ArrowUp size={18}/></button>
          </div>
        </form>
        <p className="disclaimer">NOVA can make mistakes. Verify important information.</p>
      </footer>
    </main>
  );
}
