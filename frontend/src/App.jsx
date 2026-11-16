import { useEffect, useState } from "react";
import {
  Activity, ArrowDown, ArrowUpRight, Bot, Check, ChevronDown, CircleHelp,
  Clock3, Command, FileText, Globe2, LayoutDashboard, Menu, MessageSquare,
  MoreHorizontal, Paperclip, Plus, Search, Send, Settings2, ShieldCheck,
  Sparkles, Terminal, Wrench, Zap
} from "lucide-react";

const suggestions = [
  { icon: Search, title: "Research a topic", detail: "Find information and create a concise report." },
  { icon: CalculatorIcon, title: "Calculate something", detail: "Solve calculations and explain the result." },
  { icon: FileText, title: "Summarize a document", detail: "Turn a long document into key points." }
];

function CalculatorIcon(props) {
  return <Command {...props} />;
}

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  async function sendMessage(value = message) {
    const prompt = value.trim();
    if (!prompt || busy) return;
    setMessages((items) => [...items, { role: "user", content: prompt }]);
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The request could not be completed.");
      setMessages((items) => [...items, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((items) => [...items, {
        role: "assistant",
        content: error.message.includes("Failed to fetch")
          ? "I can't reach the NOVA backend yet. Start the backend server and try again."
          : error.message
      }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} /></div>
          <span>NOVA</span><span className="brand-beta">BETA</span>
          <button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu">×</button>
        </div>

        <button className="workspace-switch">
          <div className="workspace-avatar">N</div>
          <div className="workspace-copy"><strong>Personal workspace</strong><small>Free development plan</small></div>
          <ChevronDown size={15} />
        </button>

        <button className="new-task-button" onClick={() => { setMessages([]); setMobileMenu(false); }}>
          <Plus size={17} /> New task <span>⌘ K</span>
        </button>

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
            <div className="usage-heading"><span>Starter workspace</span><span>0%</span></div>
            <div className="usage-track"><span /></div>
            <small>Usage tracking will appear here.</small>
          </div>
          <div className="profile-row">
            <div className="profile-avatar">N</div>
            <div className="profile-copy"><strong>NOVA Builder</strong><small>Personal account</small></div>
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
            <div className={`connection-pill ${apiStatus}`}><span className="status-dot"/>{apiStatus === "checking" ? "Checking server" : apiStatus === "online" ? "Backend online" : "Backend offline"}</div>
            <button className="icon-button" aria-label="Search"><Search size={18}/></button>
            <button className="help-button"><CircleHelp size={16}/> Help</button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line"/> YOUR AI WORKSPACE</div>
              <h1>Make things happen<span>.</span></h1>
              <p>Give NOVA a goal. It will help turn your instructions into action.</p>
            </div>
            <div className="date-chip"><Zap size={15}/> Your workspace is ready</div>
          </section>

          <section className="stats-grid" aria-label="Workspace overview">
            <div className="stat-card"><div className="stat-top"><span>Tasks completed</span><div className="stat-icon green"><Check size={17}/></div></div><div className="stat-number">0</div><div className="stat-foot">Your completed tasks will show here</div></div>
            <div className="stat-card"><div className="stat-top"><span>Tasks in progress</span><div className="stat-icon violet"><Activity size={17}/></div></div><div className="stat-number">0</div><div className="stat-foot">No active tasks right now</div></div>
            <div className="stat-card"><div className="stat-top"><span>Connected tools</span><div className="stat-icon orange"><Wrench size={17}/></div></div><div className="stat-number">1 <small>ready to configure</small></div><div className="stat-foot">More integrations coming soon</div></div>
          </section>

          <section className="work-grid">
            <div className="assistant-panel" id="assistant">
              <div className="panel-heading">
                <div className="panel-title"><div className="mini-orb"><Sparkles size={16}/></div><div><h2>AI Assistant</h2><p>Your automation workspace</p></div></div>
                <button className="icon-button" aria-label="More options"><MoreHorizontal size={19}/></button>
              </div>

              <div className="chat-body">
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <div className="hero-orb"><div className="orb-core"><Sparkles size={25}/></div><i/><b/></div>
                    <div className="chat-greeting">Hello, I'm NOVA<span>.</span></div>
                    <p>Your AI workspace is ready. Tell me what you'd like to get done.</p>
                    <div className="suggestion-grid">
                      {suggestions.map(({ icon: Icon, title, detail }) => (
                        <button className="suggestion-card" key={title} onClick={() => sendMessage(title === "Research a topic" ? "Help me research a topic and prepare a concise report." : title === "Calculate something" ? "Help me calculate something." : "I want to summarize a document. Explain how to get started.")}>
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
                  </div>
                )}
              </div>

              <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Give NOVA an instruction..." rows="2" />
                <div className="composer-bottom">
                  <div className="composer-tools"><button type="button" className="tool-button" title="File upload coming soon"><Paperclip size={16}/></button><span><ShieldCheck size={13}/> You stay in control</span></div>
                  <button className="send-button" type="submit" disabled={!message.trim() || busy}><Send size={16}/></button>
                </div>
              </form>
              <div className="composer-note">NOVA can make mistakes. Review important actions before approving them.</div>
            </div>

            <aside className="right-column">
              <div className="side-panel" id="tasks">
                <div className="side-panel-heading"><div><h3>Task activity</h3><p>Your recent automation runs</p></div><button className="text-button">View all <ArrowUpRight size={13}/></button></div>
                <div className="empty-state"><div className="empty-state-icon"><Activity size={19}/></div><strong>No tasks yet</strong><p>Your agent activity will appear here once you run your first task.</p></div>
              </div>

              <div className="side-panel tools-panel" id="tools">
                <div className="side-panel-heading"><div><h3>Agent tools</h3><p>Capabilities available to NOVA</p></div><button className="icon-button" aria-label="Tool settings"><Settings2 size={16}/></button></div>
                <div className="tool-row"><div className="tool-symbol calc"><Command size={16}/></div><div className="tool-info"><strong>Calculator</strong><small>Basic calculations</small></div><span className="tool-state">Planned</span></div>
                <div className="tool-row"><div className="tool-symbol web"><Globe2 size={16}/></div><div className="tool-info"><strong>Web research</strong><small>Search and summarize</small></div><span className="tool-state">Planned</span></div>
                <div className="tool-row"><div className="tool-symbol docs"><FileText size={16}/></div><div className="tool-info"><strong>Document reader</strong><small>Understand your files</small></div><span className="tool-state">Planned</span></div>
                <button className="manage-tools" disabled>Manage integrations <ArrowUpRight size={14}/></button>
              </div>

              <div className="security-note"><div><ShieldCheck size={17}/><strong>Safety first</strong></div><p>NOVA will ask for approval before consequential actions. Your API keys stay on the server.</p></div>
            </aside>
          </section>

          <footer className="footer"><span>© 2026 NOVA Workspace</span><span><span className="footer-dot"/> Built for thoughtful automation</span><span>Version 0.1.0</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
