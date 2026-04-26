import { useState } from "react";
import { register, login } from "../api";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ onSuccess }) {
  const { loginUser } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name: "", phone: "", password: "", village: "", language: "te" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    // Basic frontend validation to avoid confusing blank submits
    if (!form.phone.trim() || !form.password.trim()) {
      return setError("Phone and password are required.");
    }
    if (mode === "register" && !form.name.trim()) {
      return setError("Please enter your name.");
    }

    setError(""); setLoading(true);
    try {
      const fn = mode === "login" ? login : register;
      const res = await fn(form);
      loginUser(res.data.token, res.data.user);
      onSuccess?.();
    } catch (err) {
      const serverError = err.response?.data?.error;
      setError(serverError || err.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#064e3b,#065f46)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Noto Sans Telugu','Noto Sans Devanagari',system-ui,sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 28, width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>🏥</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#064e3b" }}>SwasthyaVani</div>
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>ప్రతి గ్రామానికి వైద్యసేవ • हर गाँव के लिए</div>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: mode === m ? "#064e3b" : "transparent", color: mode === m ? "#fff" : "#6b7280", fontWeight: 600, cursor: "pointer", fontSize: 14, transition: "all .2s" }}>
              {m === "login" ? "🔑 Login" : "📝 Register"}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        {mode === "register" && (
          <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full Name / పేరు / नाम" style={inputStyle} />
        )}
        <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Phone Number / ఫోన్" type="tel" style={inputStyle} />
        <input value={form.password} onChange={e => set("password", e.target.value)} placeholder="Password (min 4 chars)" type="password" style={inputStyle} />

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 4, display: "block" }}>Preferred Language</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[["te","తెలుగు"],["hi","हिंदी"],["en","English"]].map(([code, label]) => (
              <button key={code} onClick={() => set("language", code)} style={{ flex:1, padding:"8px 4px", borderRadius:8, border:`2px solid ${form.language===code?"#064e3b":"#e5e7eb"}`, background: form.language===code?"#064e3b":"#fff", color: form.language===code?"#fff":"#374151", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {mode === "register" && <>
          <input value={form.village} onChange={e => set("village", e.target.value)} placeholder="Village / గ్రామం / गाँव" style={inputStyle} />
        </>}

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</div>}

        <button onClick={handle} disabled={loading} style={{ width:"100%", background: loading?"#d1d5db":"linear-gradient(135deg,#064e3b,#047857)", color:"#fff", border:"none", borderRadius:14, padding:14, fontSize:16, fontWeight:700, cursor: loading?"default":"pointer" }}>
          {loading ? "⏳ Please wait..." : mode === "login" ? "🔑 Login" : "✅ Register"}
        </button>

        <div style={{ textAlign:"center", marginTop:16 }}>
          <a href="tel:104" style={{ color:"#065f46", textDecoration:"none", fontSize:13 }}>📞 Need help? Call 104 Health Helpline</a>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", border: "2px solid #e5e7eb", borderRadius: 12, padding: "13px 16px",
  fontSize: 15, marginBottom: 12, outline: "none", boxSizing: "border-box",
  fontFamily: "'Noto Sans Telugu','Noto Sans Devanagari',system-ui,sans-serif",
};
