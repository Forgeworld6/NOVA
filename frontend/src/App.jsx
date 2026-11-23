import { useEffect, useRef, useState } from "react";
import {
  Activity, ArrowUpRight, Bot, Check, ChevronDown, CircleHelp, Clock3,
  Command, FileText, Globe2, LayoutDashboard, Menu, MessageSquare,
  MoreHorizontal, Paperclip, Plus, Search, Send, Settings2, ShieldCheck,
  Sparkles, Wrench, Zap, X
} from "lucide-react";

const suggestions = [
  { icon: Search, title: "Research a topic", detail: "Explore a subject and organize the key findings.", prompt: "Help me research a topic and prepare a concise report." },
  { icon: Command, title: "Work through an idea", detail: "Turn a rough thought into a clear plan.", prompt: "Help me turn an idea into a practical step-by-step plan." },
  { icon: FileText, title: "Understand a document", detail: "Get help reviewing text and extracting key points.", prompt: "I want to understand and summarize a document. How should I share its contents?" }
];

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const [mobileMenu, setMobileMenu] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setApiStatus(data.aiConfigured ? "ready" : "setup"))
      .catch(() => setApiStatus("offline"));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function sendMessage(value = message) {
    const prompt = value.trim();
    if (!prompt || busy) return;
    const nextMessages = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: messages.slice(-12).map(({ role, content }) => ({ role, content }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The request could not be completed.");
      setMessages((items) => [...items, { role: "assistant", content: data.reply }]);
      setApiStatus("ready");
    } catch (error) {
      setMessages((items) => [...items, { role: "assistant", content: error.message }]);
      if (error.message.toLowerCase().includes("backend")) setApiStatus("offline");
    } finally {
      setBusy(false);
    }
  }

  function startNewChat() {
    setMessages([]);
    setMessage("");
    setMobileMenu(false);
  }

  const statusLabel = apiStatus === "ready" ? "AI connected" : apiStatus === "setup" ? "AI setup needed" : apiStatus === "offline" ? "Server unavailable" : "Connecting";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <span>NOVA</span><span className="brand-beta">PREVIEW</span>
          <button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={18}/></button>
        </div>

        <button className="workspace-switch">
          <div className="workspace-avatar">N</div>
          <div className="workspace-copy"><strong>Personal workspace</strong><small>Starter plan</small></div>
          <ChevronDown size={15} />
        </button>

        <button className="new-task-button" onClick={startNewChat}><Plus size={17} /> New chat <span>⌘ K</span></button>

        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          <a className="nav-item active" href="#home"><LayoutDashboard size={17}/> Overview</a>
          <a className="nav-item" href="#assistant"><MessageSquare size={17}/> AI Assistant</a>
          <a className="nav-item" href="#tasks"><Activity size={17}/> Tasks <span className="nav-count">0</span></a>
          <a className="nav-item" href="#tools"><Wrench size={17}/> Tools</a>
          <a className="nav-item" href="#history"><Clock3 size={17}/> History</a>
        </nav>

        <div className="nav-label tools-label">PREFERENCES</div>
        <nav className="nav-list">
          <a className="nav-item" href="#settings"><Settings2 size={17}/> Settings</a>
          <a className="nav-item" href="#help"><CircleHelp size={17}/> Help center</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="usage-card">
            <div className="usage-heading"><span>Workspace status</span><span className="usage-live">Live</span></div>
            <p>You're using the NOVA preview workspace.</p>
          </div>
          <div className="profile-row">
            <div className="profile-avatar">N</div>
            <div className="profile-copy"><strong>NOVA Builder</strong><small>Personal workspace</small></div>
            <MoreHorizontal size={18} className="muted-icon"/>
          </div>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}

      <main className="main-area" id="home">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={20}/></button>
            <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          </div>
          <div className="topbar-actions">
            <div className={`connection-pill ${apiStatus}`}><span className="status-dot"/>{statusLabel}</div>
            <button className="icon-button" aria-label="Search"><Search size={18}/></button>
            <button className="help-button"><CircleHelp size={16}/> Help</button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line"/> YOUR PERSONAL AI WORKSPACE</div>
              <h1>A little more done.<span> Every day.</span></h1>
              <p>Think clearly, get answers and turn your ideas into next steps.</p>
            </div>
            <div className="date-chip"><Zap size={15}/> A calmer way to work</div>
          </section>

          <section className="stats-grid" aria-label="Workspace overview">
            <div className="stat-card"><div className="stat-top"><span>Tasks completed</span><div className="stat-icon green"><Check size={17}/></div></div><div className="stat-number">—</div><div className="stat-foot">Task tracking will be added next</div></div>
            <div className="stat-card"><div className="stat-top"><span>Active automations</span><div className="stat-icon violet"><Activity size={17}/></div></div><div className="stat-number">—</div><div className="stat-foot">No automations connected yet</div></div>
            <div className="stat-card"><div className="stat-top"><span>AI connection</span><div className="stat-icon blue"><Sparkles size={17}/></div></div><div className="stat-number status-number">{apiStatus === "ready" ? "Connected" : apiStatus === "setup" ? "Setup needed" : apiStatus === "offline" ? "Offline" : "Checking"}</div><div className="stat-foot">Live status from the NOVA server</div></div>
          </section>

          <section className="work-grid">
            <div className="assistant-panel" id="assistant">
              <div className="panel-heading">
                <div className="panel-title"><div className="mini-orb"><Sparkles size={16}/></div><div><h2>NOVA Assistant</h2><p>Ask anything. Shape what comes next.</p></div></div>
                <button className="icon-button" aria-label="More options" onClick={startNewChat}><MoreHorizontal size={19}/></button>
              </div>

              <div className="chat-body">
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <div className="hero-orb"><div className="orb-core"><Sparkles size={25}/></div><i/><b/></div>
                    <div className="chat-greeting">What can I help you with<span>?</span></div>
                    <p>Start with a question, a challenge or an idea you're exploring.</p>
                    <div className="suggestion-grid">
                      {suggestions.map(({ icon: Icon, title, detail, prompt }) => (
                        <button className="suggestion-card" key={title} onClick={() => sendMessage(prompt)}>
                          <Icon size={17}/><strong>{title}</strong><small>{detail}</small><ArrowUpRight size={14} className="suggestion-arrow"/>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="message-list">
                    {messages.map((item, index) => (
                      <div className={`message-row ${item.role}`} key={index}>
                        <div className="message-avatar">{item.role === "assistant" ? <Sparkles size={15}/> : "Y"}</div>
                        <div className="message-content"><span>{item.role === "assistant" ? "NOVA" : "YOU"}</span><p>{item.content}</p></div>
                      </div>
                    ))}
                    {busy && <div className="thinking"><span/><span/><span/> NOVA is thinking</div>}
                    <div ref={endRef}/>
                  </div>
                )}
              </div>

              <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Message NOVA…" rows="2" aria-label="Message NOVA"/>
                <div className="composer-bottom">
                  <div className="composer-tools"><button type="button" className="tool-button" title="File attachments are coming in a later update" aria-label="Attachments"><Paperclip size={16}/></button><span><ShieldCheck size={13}/> Review important decisions</span></div>
                  <button className="send-button" type="submit" disabled={!message.trim() || busy} aria-label="Send message"><Send size={16}/></button>
                </div>
              </form>
              <div className="composer-note">NOVA may make mistakes. Check important information before acting on it.</div>
            </div>

            <aside className="right-column">
              <div className="side-panel" id="tasks">
                <div className="side-panel-heading"><div><h3>Recent activity</h3><p>Your workspace at a glance</p></div><button className="text-button">View all <ArrowUpRight size={13}/></button></div>
                <div className="empty-state"><div className="empty-state-icon"><Activity size={19}/></div><strong>Nothing here just yet</strong><p>Your task history will appear here when task tracking is connected.</p></div>
              </div>

              <div className="side-panel tools-panel" id="tools">
                <div className="side-panel-heading"><div><h3>Capabilities</h3><p>What's being built for NOVA</p></div><button className="icon-button" aria-label="Capability information"><Settings2 size={16}/></button></div>
                <div className="tool-row"><div className="tool-symbol calc"><Command size={16}/></div><div className="tool-info"><strong>AI conversation</strong><small>Context-aware chat</small></div><span className="tool-state available">Ready</span></div>
                <div className="tool-row"><div className="tool-symbol web"><Globe2 size={16}/></div><div className="tool-info"><strong>Web research</strong><small>Search and cite sources</small></div><span className="tool-state">Next</span></div>
                <div className="tool-row"><div className="tool-symbol docs"><FileText size={16}/></div><div className="tool-info"><strong>File understanding</strong><small>Read and summarize files</small></div><span className="tool-state">Next</span></div>
                <div className="tool-row"><div className="tool-symbol memory"><Bot size={16}/></div><div className="tool-info"><strong>Memory</strong><small>Remember useful context</small></div><span className="tool-state">Next</span></div>
                <button className="manage-tools" disabled>More capabilities are in development <ArrowUpRight size={14}/></button>
              </div>

              <div className="security-note"><div><ShieldCheck size={17}/><strong>Privacy by design</strong></div><p>Your AI key stays on the server. External actions will require clear permissions before they can run.</p></div>
            </aside>
          </section>

          <footer className="footer"><span>© 2026 NOVA</span><span><span className="footer-dot"/> Thoughtful tools, human control</span><span>Preview 0.2</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
