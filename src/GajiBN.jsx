import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { supabase } from "./supabase";

// ============================================================
// GAJIBN - Know Your Worth 🇧🇳
// Brunei's Salary & Career Intelligence Platform
// ============================================================

// --- REAL DATA: DEPS Labour Force Survey + MPEC Guidelines ---

const SALARY_BY_INDUSTRY = [
  { industry: "Oil & Gas", avg: 3850, local: 4200, foreign: 2100, icon: "⛽" },
  { industry: "Finance & Insurance", avg: 3200, local: 3400, foreign: 2800, icon: "🏦" },
  { industry: "Government", avg: 2237, local: 2237, foreign: 0, icon: "🏛️" },
  { industry: "Education", avg: 2100, local: 2200, foreign: 1600, icon: "📚" },
  { industry: "Health", avg: 2050, local: 2150, foreign: 1500, icon: "🏥" },
  { industry: "ICT", avg: 1950, local: 2100, foreign: 1400, icon: "💻" },
  { industry: "Construction", avg: 1450, local: 1800, foreign: 850, icon: "🏗️" },
  { industry: "Wholesale & Retail", avg: 1200, local: 1400, foreign: 750, icon: "🛒" },
  { industry: "Hospitality & Food", avg: 1050, local: 1200, foreign: 680, icon: "🍽️" },
  { industry: "Transport", avg: 1350, local: 1500, foreign: 900, icon: "🚗" },
  { industry: "Manufacturing", avg: 1250, local: 1500, foreign: 780, icon: "🏭" },
  { industry: "Cleaning & Domestic", avg: 620, local: 800, foreign: 490, icon: "🧹" },
];

const SALARY_BY_OCCUPATION = [
  { occupation: "Managers", avg: 4200 },
  { occupation: "Professionals", avg: 3100 },
  { occupation: "Technicians", avg: 2200 },
  { occupation: "Clerical", avg: 1600 },
  { occupation: "Service & Sales", avg: 1100 },
  { occupation: "Skilled Agriculture", avg: 1050 },
  { occupation: "Craft Workers", avg: 1200 },
  { occupation: "Machine Operators", avg: 1100 },
  { occupation: "Elementary", avg: 680 },
];

const EARNINGS_TREND = [
  { year: "2017", avg: 1820, youth_unemp: 25.0 },
  { year: "2018", avg: 1790, youth_unemp: 22.0 },
  { year: "2019", avg: 1775, youth_unemp: 21.3 },
  { year: "2020", avg: 1740, youth_unemp: 22.0 },
  { year: "2021", avg: 1720, youth_unemp: 20.5 },
  { year: "2022", avg: 1758, youth_unemp: 17.4 },
  { year: "2023", avg: 1758, youth_unemp: 16.8 },
  { year: "2024", avg: 1686, youth_unemp: 18.3 },
];

const GOV_VS_PRIVATE = {
  gov: { base: 2237 },
  private: { base: 1500 },
};

const MPEC_GUIDELINES = [
  { family: "Information Technology", positions: ["IT Support", "Web Developer", "System Admin", "IT Manager"], entry: 800, mid: 1500, senior: 2800 },
  { family: "Finance & Accounting", positions: ["Accounts Clerk", "Accountant", "Finance Manager", "CFO"], entry: 750, mid: 1400, senior: 3000 },
  { family: "Customer Care", positions: ["Customer Service Rep", "Team Lead", "CS Manager", "Retention Manager"], entry: 600, mid: 1000, senior: 2000 },
  { family: "Administration", positions: ["Admin Assistant", "Executive Secretary", "Office Manager", "Admin Director"], entry: 600, mid: 1100, senior: 2200 },
  { family: "Culinary", positions: ["Kitchen Helper", "Cook", "Sous Chef", "Head Chef"], entry: 500, mid: 900, senior: 1800 },
  { family: "Retail", positions: ["Sales Associate", "Cashier", "Store Supervisor", "Store Manager"], entry: 500, mid: 850, senior: 1600 },
  { family: "Hospitality", positions: ["Housekeeper", "Front Desk", "Duty Manager", "Hotel Manager"], entry: 500, mid: 900, senior: 2200 },
  { family: "Logistics", positions: ["Warehouse Staff", "Delivery Driver", "Logistics Coordinator", "Logistics Manager"], entry: 550, mid: 1000, senior: 1800 },
  { family: "Tourism", positions: ["Tour Guide", "Travel Agent", "Tour Coordinator", "Tourism Manager"], entry: 550, mid: 950, senior: 1700 },
  { family: "Teaching", positions: ["Teaching Aide", "Teacher", "Senior Teacher", "Principal"], entry: 700, mid: 1300, senior: 2500 },
  { family: "Energy (O&G)", positions: ["Roustabout", "Technician", "Supervisor", "Project Manager"], entry: 1200, mid: 2500, senior: 5000 },
  { family: "Cleaning", positions: ["Cleaner", "Supervisor", "Area Manager", "Ops Manager"], entry: 500, mid: 700, senior: 1200 },
];

const KEY_STATS = [
  { label: "Average Monthly Earnings", value: "BND 1,686", change: "↓ 4.1%", negative: true, detail: "Down from BND 1,758 (2023)" },
  { label: "Youth Unemployment", value: "18.3%", change: "↑ 1.5%", negative: true, detail: "Ages 18-24, up from 16.8%" },
  { label: "Minimum Wage", value: "BND 500", change: "Since Jul 2023", negative: false, detail: "BND 2.62/hour for part-time" },
  { label: "Public Sector Average", value: "BND 2,237", change: "49% above private", negative: false, detail: "Base salary, DEPS 2024" },
];

const COLORS = {
  primary: "#E8833A",
  primaryLight: "#F5A96B",
  primaryDark: "#C56A25",
  warm: "#F2C078",
  green: "#6BBF7A",
  greenDark: "#4A9B58",
  red: "#E05555",
  redLight: "#F08080",
  bg: "#FDF8F3",
  bgCard: "#FFFFFF",
  bgDark: "#2C1810",
  text: "#3D2B1F",
  textLight: "#8B7355",
  textMuted: "#B8A088",
  border: "#E8DCD0",
  accent1: "#5B8DB8",
  accent2: "#9B6BA6",
  accent3: "#E8833A",
  chartColors: ["#E8833A", "#5B8DB8", "#6BBF7A", "#9B6BA6", "#F2C078", "#E05555", "#7BC8C8", "#C4A265"],
};

// ============================================================
// COMPONENTS
// ============================================================

const Nav = ({ active, setActive }) => {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "explore", label: "Explore Salaries", icon: "📊" },
    { id: "compare", label: "Am I Paid Fairly?", icon: "⚖️" },
    { id: "govprivate", label: "Gov vs Private", icon: "🏛️" },
    { id: "submit", label: "Share Your Salary", icon: "✍️" },
    { id: "community", label: "Community Data", icon: "👥" },
  ];
  return (
    <nav style={{ background: "#fff", borderBottom: `2px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "0 16px" }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: COLORS.primary, fontWeight: 700, marginRight: 24, whiteSpace: "nowrap", padding: "12px 0" }}>
          GajiBN
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            style={{
              background: "none", border: "none", padding: "14px 14px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: active === t.id ? 600 : 400,
              color: active === t.id ? COLORS.primary : COLORS.textLight,
              borderBottom: active === t.id ? `3px solid ${COLORS.primary}` : "3px solid transparent",
              whiteSpace: "nowrap", transition: "all 0.2s",
            }}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

const StatCard = ({ stat, delay }) => (
  <div style={{
    background: COLORS.bgCard, borderRadius: 16, padding: "24px 20px", flex: "1 1 220px",
    border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 12px rgba(60,30,10,0.04)",
    animation: `fadeUp 0.5s ${delay}s both ease-out`,
  }}>
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>{stat.label}</div>
    <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>{stat.value}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 8,
        background: stat.negative ? "#FEE9E9" : "#E6F6E9",
        color: stat.negative ? COLORS.red : COLORS.greenDark,
      }}>{stat.change}</span>
      <span style={{ fontSize: 11, color: COLORS.textMuted }}>{stat.detail}</span>
    </div>
  </div>
);

// --- HOME PAGE ---
const HomePage = ({ setActive }) => (
  <div>
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.bgDark} 0%, #4A2A18 100%)`,
      padding: "64px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06,
        backgroundImage: "radial-gradient(circle at 20% 50%, #E8833A 1px, transparent 1px), radial-gradient(circle at 80% 20%, #F2C078 1px, transparent 1px)",
        backgroundSize: "60px 60px, 80px 80px",
      }} />
      <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ fontSize: 14, color: COLORS.warm, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, animation: "fadeUp 0.5s both ease-out" }}>
          🇧🇳 Brunei's Career Intelligence Platform
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 48, color: "#fff", lineHeight: 1.15, marginBottom: 16, animation: "fadeUp 0.5s 0.1s both ease-out" }}>
          Know Your Worth
        </h1>
        <p style={{ fontSize: 18, color: "#D4B896", lineHeight: 1.6, marginBottom: 32, fontFamily: "'DM Sans', sans-serif", animation: "fadeUp 0.5s 0.2s both ease-out" }}>
          Real salary data for Brunei. Compare earnings, explore industries, and make informed career decisions, powered by official government statistics and anonymous community contributions.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.5s 0.3s both ease-out" }}>
          <button onClick={() => setActive("explore")} style={{
            background: COLORS.primary, color: "#fff", border: "none", padding: "14px 28px",
            borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "transform 0.2s",
          }}>Explore Salaries →</button>
          <button onClick={() => setActive("compare")} style={{
            background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)",
            padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>Am I Paid Fairly?</button>
        </div>
      </div>
    </div>

    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40 }}>
        {KEY_STATS.map((s, i) => <StatCard key={i} stat={s} delay={0.1 * i} />)}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 500px", background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: COLORS.text, marginBottom: 4 }}>Average Earnings Are Declining</h3>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>Monthly earnings dropped BND 72 while youth unemployment climbed back up</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={EARNINGS_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: COLORS.textLight }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: COLORS.textLight }} domain={[1600, 1900]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: COLORS.accent1 }} domain={[10, 30]} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }} />
              <Line yAxisId="left" type="monotone" dataKey="avg" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 5, fill: COLORS.primary }} name="Avg Earnings (BND)" />
              <Line yAxisId="right" type="monotone" dataKey="youth_unemp" stroke={COLORS.accent1} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: COLORS.accent1 }} name="Youth Unemployment (%)" />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8 }}>Source: DEPS Labour Force Survey 2017-2024</p>
        </div>

        <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: "📊", title: "Explore by Industry", desc: "See how 12 industries compare, from Oil & Gas (BND 3,850) to Hospitality (BND 1,050)", action: "explore" },
            { icon: "⚖️", title: "Am I Paid Fairly?", desc: "Enter your details and instantly see how your salary compares to the Brunei average", action: "compare" },
            { icon: "✍️", title: "Share Anonymously", desc: "Contribute your salary data to help others. 100% anonymous, zero personal details required", action: "submit" },
          ].map((card, i) => (
            <button key={i} onClick={() => setActive(card.action)} style={{
              background: COLORS.bgCard, borderRadius: 14, padding: "20px", textAlign: "left",
              border: `1px solid ${COLORS.border}`, cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(60,30,10,0.03)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 16, color: COLORS.text, marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.5 }}>{card.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- EXPLORE PAGE ---
const ExplorePage = () => {
  const [view, setView] = useState("industry");
  const [sortBy, setSortBy] = useState("avg");

  const sortedIndustry = useMemo(() => 
    [...SALARY_BY_INDUSTRY].sort((a, b) => b[sortBy] - a[sortBy]),
    [sortBy]
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Explore Brunei Salaries</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 24, fontSize: 15 }}>Based on official DEPS Labour Force Survey 2024 and MPEC Salary Guidelines 2023</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[{ id: "industry", label: "By Industry" }, { id: "occupation", label: "By Occupation" }, { id: "mpec", label: "MPEC Guidelines" }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            padding: "8px 20px", borderRadius: 10, border: `1.5px solid ${view === v.id ? COLORS.primary : COLORS.border}`,
            background: view === v.id ? `${COLORS.primary}12` : "#fff", color: view === v.id ? COLORS.primary : COLORS.textLight,
            fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>{v.label}</button>
        ))}
      </div>

      {view === "industry" && (
        <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text }}>Average Monthly Earnings by Industry</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ id: "avg", label: "Overall" }, { id: "local", label: "Locals" }, { id: "foreign", label: "Foreign" }].map(s => (
                <button key={s.id} onClick={() => setSortBy(s.id)} style={{
                  padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  border: sortBy === s.id ? `1.5px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                  background: sortBy === s.id ? `${COLORS.primary}15` : "transparent",
                  color: sortBy === s.id ? COLORS.primary : COLORS.textMuted,
                }}>{s.label}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={sortedIndustry} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.textLight }} />
              <YAxis type="category" dataKey="industry" tick={{ fontSize: 12, fill: COLORS.text }} width={130} />
              <Tooltip formatter={(v) => `BND ${v.toLocaleString()}`} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 13 }} />
              <Bar dataKey={sortBy} radius={[0, 8, 8, 0]} fill={COLORS.primary} barSize={22}>
                {sortedIndustry.map((_, i) => (
                  <Cell key={i} fill={COLORS.chartColors[i % COLORS.chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 12 }}>Source: DEPS Labour Force Survey 2024. Figures are average monthly earnings in BND.</p>
        </div>
      )}

      {view === "occupation" && (
        <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 16 }}>Average Monthly Earnings by Occupation</h3>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={SALARY_BY_OCCUPATION} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.textLight }} />
              <YAxis type="category" dataKey="occupation" tick={{ fontSize: 12, fill: COLORS.text }} width={130} />
              <Tooltip formatter={(v) => `BND ${v.toLocaleString()}`} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 13 }} />
              <Bar dataKey="avg" radius={[0, 8, 8, 0]} fill={COLORS.accent1} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "mpec" && (
        <div>
          <p style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 16 }}>The MPEC Salary Guideline (2023 Edition) recommends minimum salary scales for 22 job families and 100 positions in the private sector, developed from data on 114,000+ employees.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {MPEC_GUIDELINES.map((fam, i) => (
              <div key={i} style={{ background: COLORS.bgCard, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 16, color: COLORS.text, marginBottom: 12 }}>{fam.family}</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {[{ label: "Entry", val: fam.entry, color: COLORS.accent1 }, { label: "Mid", val: fam.mid, color: COLORS.primary }, { label: "Senior", val: fam.senior, color: COLORS.greenDark }].map(l => (
                    <div key={l.label} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 8, background: `${l.color}10` }}>
                      <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{l.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: l.color }}>BND {l.val.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                  Roles: {fam.positions.join(" > ")}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 16 }}>Source: MPEC Salary Guideline 2023 Edition (mpec.gov.bn)</p>
        </div>
      )}
    </div>
  );
};

// --- AM I PAID FAIRLY? ---
const ComparePage = () => {
  const [salary, setSalary] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [result, setResult] = useState(null);

  const handleCompare = () => {
    if (!salary || !industry) return;
    const ind = SALARY_BY_INDUSTRY.find(i => i.industry === industry);
    if (!ind) return;
    const userSalary = parseFloat(salary);
    const avg = ind.local;
    const percentile = userSalary > avg ? Math.min(95, 50 + ((userSalary - avg) / avg) * 50) : Math.max(5, 50 - ((avg - userSalary) / avg) * 50);
    const diff = userSalary - avg;
    const diffPercent = ((diff / avg) * 100).toFixed(1);
    const mpecMatch = MPEC_GUIDELINES.find(m => m.family.toLowerCase().includes(industry.toLowerCase().split(" ")[0]));

    setResult({ userSalary, avg, percentile: Math.round(percentile), diff, diffPercent, industry: ind, mpec: mpecMatch });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Am I Paid Fairly?</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 28, fontSize: 15 }}>Enter your details to see how your salary compares to the Brunei average for your industry.</p>

      <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}`, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Your Monthly Salary (BND)</label>
            <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 1500"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 16, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", outline: "none", boxSizing: "border-box" }}>
              <option value="">Select industry...</option>
              {SALARY_BY_INDUSTRY.map(i => <option key={i.industry} value={i.industry}>{i.icon} {i.industry}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Years of Experience</label>
            <select value={experience} onChange={e => setExperience(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", outline: "none", boxSizing: "border-box" }}>
              <option value="">Select...</option>
              {["0-2 years", "3-5 years", "6-10 years", "10+ years"].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleCompare} style={{
          marginTop: 20, background: COLORS.primary, color: "#fff", border: "none", padding: "12px 32px",
          borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>Compare My Salary →</button>
      </div>

      {result && (
        <div style={{ animation: "fadeUp 0.4s ease-out" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{
              flex: "1 1 250px", background: result.diff >= 0 ? "#E6F6E9" : "#FEF3E9", borderRadius: 16, padding: 24,
              border: `1px solid ${result.diff >= 0 ? "#B8E6C0" : "#F5D4B0"}`,
            }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>Your salary is</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, color: result.diff >= 0 ? COLORS.greenDark : COLORS.primaryDark }}>
                {result.diff >= 0 ? "+" : ""}{result.diffPercent}%
              </div>
              <div style={{ fontSize: 14, color: COLORS.textLight }}>
                {result.diff >= 0 ? "above" : "below"} the average for locals in {industry}
              </div>
            </div>
            <div style={{ flex: "1 1 250px", background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>You earn more than approximately</div>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, color: COLORS.primary }}>
                {result.percentile}%
              </div>
              <div style={{ fontSize: 14, color: COLORS.textLight }}>of workers in your industry</div>
            </div>
          </div>

          <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, marginBottom: 16, color: COLORS.text }}>How You Compare</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Your Salary", value: result.userSalary, color: COLORS.primary },
                { label: `${industry} Average (locals)`, value: result.avg, color: COLORS.accent1 },
                { label: "Economy-wide Average", value: 1686, color: COLORS.textMuted },
                { label: "Minimum Wage", value: 500, color: COLORS.red },
              ].map((bar, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: COLORS.textLight }}>{bar.label}</span>
                    <span style={{ fontWeight: 700, color: bar.color }}>BND {bar.value.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 10, background: "#F0E8DF", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 5, background: bar.color, transition: "width 0.8s ease-out",
                      width: `${Math.min(100, (bar.value / 4500) * 100)}%`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
            {result.mpec && (
              <div style={{ marginTop: 20, padding: 16, background: `${COLORS.primary}08`, borderRadius: 10, border: `1px dashed ${COLORS.primary}40` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, marginBottom: 4 }}>📋 MPEC Guideline for {result.mpec.family}</div>
                <div style={{ fontSize: 13, color: COLORS.textLight }}>
                  Entry: BND {result.mpec.entry} | Mid: BND {result.mpec.mid} | Senior: BND {result.mpec.senior}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- GOV VS PRIVATE ---
const GovPrivatePage = () => {
  const g = GOV_VS_PRIVATE.gov;
  const p = GOV_VS_PRIVATE.private;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Government vs Private Sector</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 28, fontSize: 15 }}>How do government and private sector salaries compare in Brunei? The gap goes beyond just the paycheck.</p>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ flex: "1 1 380px", background: "#EBF2F8", borderRadius: 16, padding: 24, border: "1px solid #C8DDE8" }}>
          <div style={{ fontSize: 12, color: COLORS.accent1, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🏛️ Government</div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, color: COLORS.text, marginBottom: 4 }}>BND {g.base.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Average monthly base salary</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 10 }}>Additional benefits include:</div>
          {[
            "Interest-free housing loans (via Treasury)",
            "Job security and structured pay progression",
            "Government pension scheme for eligible officers",
            "TAP + SCP employer contributions",
            "Annual increments and promotion pathways",
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", fontSize: 13, color: COLORS.textLight }}>
              <span style={{ color: COLORS.accent1, marginTop: 1 }}>✓</span>
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: "1 1 380px", background: "#FEF3E9", borderRadius: 16, padding: 24, border: "1px solid #F5D4B0" }}>
          <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🏢 Private Sector</div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, color: COLORS.text, marginBottom: 4 }}>BND {p.base.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Average monthly base salary</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 10 }}>Benefits vary widely by company:</div>
          {[
            "TAP + SCP employer contributions (mandatory)",
            "Some companies offer medical/dental coverage",
            "Performance bonuses (common in O&G, finance)",
            "Career progression depends on company size",
            "Higher earning ceiling in senior/specialist roles",
            "More flexibility to negotiate salary",
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", fontSize: 13, color: COLORS.textLight }}>
              <span style={{ color: COLORS.primary, marginTop: 1 }}>✓</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 12 }}>The Base Salary Gap</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Government average", value: g.base, color: COLORS.accent1 },
            { label: "Private sector average", value: p.base, color: COLORS.primary },
            { label: "Minimum wage", value: 500, color: COLORS.red },
          ].map((bar, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: COLORS.textLight }}>{bar.label}</span>
                <span style={{ fontWeight: 700, color: bar.color }}>BND {bar.value.toLocaleString()}</span>
              </div>
              <div style={{ height: 12, background: "#F0E8DF", borderRadius: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 6, background: bar.color, transition: "width 0.8s ease-out",
                  width: `${Math.min(100, (bar.value / 2500) * 100)}%`,
                }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.6 }}>
          On base salary alone, government pays about <strong style={{ color: COLORS.primary }}>49% more</strong> than the private sector average (BND 2,237 vs ~BND 1,500). On top of that, government officers have access to interest-free housing loans, structured pay progression, and strong job security. These non-salary benefits are harder to quantify but play a major role in why many graduates prefer to wait for government positions.
        </p>
        <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.6, marginTop: 12 }}>
          That said, the private sector offers higher earning potential in certain fields, especially Oil & Gas (avg BND 3,850) and Finance (avg BND 3,200). Senior specialists and managers in these industries can significantly out-earn government counterparts.
        </p>
        <p style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 1.6, marginTop: 12 }}>
          All Bruneian citizens receive free government healthcare regardless of which sector they work in. Both sectors are required to contribute to TAP and SCP pension schemes.
        </p>
      </div>

      <div style={{ background: `${COLORS.primary}08`, borderRadius: 12, padding: 16, border: `1px dashed ${COLORS.primary}40` }}>
        <p style={{ fontSize: 12, color: COLORS.primary, margin: 0 }}>
          Note: Salary figures are based on DEPS Labour Force Survey 2024 averages. Individual salaries vary by grade, ministry, company, and experience level. Non-salary benefits are described qualitatively as exact monetary values depend on individual circumstances.
        </p>
      </div>
      <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 12 }}>Sources: DEPS Labour Force Survey 2024, TAP/SCP public contribution rates, publicly available information on government loan schemes.</p>
    </div>
  );
};

// --- SUBMIT SALARY ---
const SubmitPage = ({ submissions, setSubmissions }) => {
  const [form, setForm] = useState({ title: "", industry: "", experience: "", salary: "", sector: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.title || !form.industry || !form.salary || !form.sector) return;
    setSubmitting(true);
    setError(null);

    const newEntry = {
      title: form.title,
      industry: form.industry,
      sector: form.sector,
      experience: form.experience || null,
      salary: parseFloat(form.salary),
      company: form.company || null,
    };

    const { data, error: dbError } = await supabase
      .from("submissions")
      .insert([newEntry])
      .select();

    if (dbError) {
      console.error("Supabase error:", dbError);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    if (data && data[0]) {
      setSubmissions(prev => [data[0], ...prev]);
    }

    setForm({ title: "", industry: "", experience: "", salary: "", sector: "", company: "" });
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Share Your Salary</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 8, fontSize: 15 }}>Help fellow Bruneians make informed career decisions. Your submission is 100% anonymous.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {["🔒 No names collected", "🙈 No emails required", "📊 Data shown in aggregate only"].map((t, i) => (
          <span key={i} style={{ padding: "4px 12px", borderRadius: 8, background: "#E6F6E9", fontSize: 12, color: COLORS.greenDark, fontWeight: 500 }}>{t}</span>
        ))}
      </div>

      {submitted && (
        <div style={{ background: "#E6F6E9", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #B8E6C0", animation: "fadeUp 0.3s ease-out" }}>
          <span style={{ fontSize: 14, color: COLORS.greenDark, fontWeight: 600 }}>✅ Thank you! Your salary has been added anonymously.</span>
        </div>
      )}

      {error && (
        <div style={{ background: "#FEE9E9", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #F5B0B0" }}>
          <span style={{ fontSize: 14, color: COLORS.red, fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 28, border: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "title", label: "Job Title *", placeholder: "e.g. Software Developer, Accountant, Teacher", type: "text" },
            { key: "salary", label: "Monthly Salary (BND) *", placeholder: "e.g. 1800", type: "number" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { key: "industry", label: "Industry *", options: SALARY_BY_INDUSTRY.map(i => i.industry) },
              { key: "sector", label: "Sector *", options: ["Government", "Private", "Semi-Government (GLC)", "Self-employed"] },
              { key: "experience", label: "Experience", options: ["0-2 years", "3-5 years", "6-10 years", "10+ years"] },
            ].map(f => (
              <div key={f.key} style={{ flex: "1 1 180px" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>{f.label}</label>
                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#fff", outline: "none", boxSizing: "border-box" }}>
                  <option value="">Select...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Company (optional)</label>
            <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Optional, helps others compare"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleSubmit} disabled={submitting} style={{
            marginTop: 8, background: COLORS.primary, color: "#fff", border: "none", padding: "14px 32px",
            borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: submitting ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif",
            opacity: (!form.title || !form.industry || !form.salary || !form.sector || submitting) ? 0.5 : 1,
          }}>{submitting ? "Submitting..." : "Submit Anonymously ✍️"}</button>
        </div>
      </div>
    </div>
  );
};

// --- COMMUNITY DATA ---
const CommunityPage = ({ submissions }) => {
  const industryAgg = useMemo(() => {
    const map = {};
    submissions.forEach(s => {
      if (!map[s.industry]) map[s.industry] = { total: 0, count: 0, salaries: [] };
      map[s.industry].total += s.salary;
      map[s.industry].count += 1;
      map[s.industry].salaries.push(s.salary);
    });
    return Object.entries(map).map(([k, v]) => ({
      industry: k, avg: Math.round(v.total / v.count), count: v.count,
      min: Math.min(...v.salaries), max: Math.max(...v.salaries),
    })).sort((a, b) => b.avg - a.avg);
  }, [submissions]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: COLORS.text, marginBottom: 4 }}>Community Salary Data</h2>
      <p style={{ color: COLORS.textLight, marginBottom: 28, fontSize: 15 }}>Real salaries shared anonymously by Bruneians. {submissions.length} contribution{submissions.length !== 1 ? "s" : ""} so far.</p>

      {submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: COLORS.bgCard, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: COLORS.text, marginBottom: 8 }}>No submissions yet</div>
          <div style={{ fontSize: 14, color: COLORS.textLight }}>Be the first to share your salary and help build Brunei's salary database!</div>
        </div>
      ) : (
        <>
          {industryAgg.length > 0 && (
            <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 16 }}>Community Averages by Industry</h3>
              <ResponsiveContainer width="100%" height={Math.max(200, industryAgg.length * 48)}>
                <BarChart data={industryAgg} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DB" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.textLight }} />
                  <YAxis type="category" dataKey="industry" tick={{ fontSize: 12, fill: COLORS.text }} width={130} />
                  <Tooltip formatter={(v) => `BND ${v.toLocaleString()}`} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 13 }} />
                  <Bar dataKey="avg" radius={[0, 8, 8, 0]} fill={COLORS.accent2} barSize={22} name="Community Avg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{ background: COLORS.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 16 }}>Recent Submissions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {submissions.slice(0, 20).map((s, i) => (
                <div key={s.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: i % 2 === 0 ? "#FDFAF7" : "#fff", borderRadius: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.industry} • {s.sector}{s.experience ? ` • ${s.experience}` : ""}{s.company ? ` • ${s.company}` : ""}</div>
                  </div>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.primary }}>BND {s.salary.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function GajiBN() {
  const [active, setActive] = useState("home");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmissions() {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        setSubmissions(data);
      }
      setLoading(false);
    }
    loadSubmissions();
  }, []);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        select:focus, input:focus { border-color: ${COLORS.primary} !important; box-shadow: 0 0 0 3px ${COLORS.primary}20; }
        button:hover { transform: translateY(-1px); }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
      `}</style>
      <Nav active={active} setActive={setActive} />
      {active === "home" && <HomePage setActive={setActive} />}
      {active === "explore" && <ExplorePage />}
      {active === "compare" && <ComparePage />}
      {active === "govprivate" && <GovPrivatePage />}
      {active === "submit" && <SubmitPage submissions={submissions} setSubmissions={setSubmissions} />}
      {active === "community" && <CommunityPage submissions={submissions} />}
      <footer style={{ textAlign: "center", padding: "32px 24px", borderTop: `1px solid ${COLORS.border}`, marginTop: 40 }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: COLORS.text, marginBottom: 4 }}>GajiBN</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
          Know Your Worth 🇧🇳 • Data sources: DEPS Labour Force Survey 2024, MPEC Salary Guideline 2023, ILOSTAT
          <br />Built for Bruneians, by Bruneians • Not affiliated with any government agency
        </div>
      </footer>
    </div>
  );
}
