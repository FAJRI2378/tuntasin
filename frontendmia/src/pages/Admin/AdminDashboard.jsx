import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../js/api.js";
import {
  FileText,
  Clock,
  RefreshCw,
  CheckCircle,
  Flame,
  BarChart3,
  XCircle,
} from "lucide-react";
import styles from "../../css/pages/Admin.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Semua gaya layout & responsif dipusatkan di sini (tanpa hack selector atribut / inline grid)
const responsiveCss = `
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .skeleton-box {
    background-color: #334155;
    border-radius: 4px;
    animation: skeleton-pulse 1.5s infinite ease-in-out;
  }

  .ad-wrap {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    color: #fff;
    box-sizing: border-box;
    width: 100%;
  }

  /* Grid statistik */
  .ad-stats.ad-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 15px;
  }

  /* Grid bawah: grafik + prioritas */
  .ad-bottom {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    margin-top: 20px;
  }
  .ad-bottom.ad-bottom--loading { grid-template-columns: 1fr; }
  .ad-bottom > * { min-width: 0; } /* cegah recharts membuat overflow */

  .ad-panel {
    background-color: #1e293b;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #334155;
    box-sizing: border-box;
  }
  .ad-panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    font-size: 1.1rem;
  }
  .ad-chart { width: 100%; height: 250px; }

  .ad-voted {
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
  }
  .ad-voted:hover { transform: scale(1.02); }
  .ad-voted-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 1rem;
  }
  .ad-voted-head h4 {
    font-size: 1.05rem;
    margin: 0;
    color: #fff;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .ad-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    background-color: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
  }
  .ad-voted-desc {
    font-size: 0.85rem;
    color: #94a3b8;
    line-height: 1.5;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .ad-voted-foot {
    font-size: 0.75rem;
    color: #64748b;
    border-top: 1px solid #334155;
    padding-top: 0.8rem;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 12px;
  }
  .ad-empty {
    color: #64748b;
    font-size: 0.9rem;
    text-align: center;
    margin-top: 2rem;
  }

  /* ---------- Tablet (<= 900px): grafik & prioritas jadi 1 kolom ---------- */
  @media screen and (max-width: 900px) {
    .ad-bottom { grid-template-columns: 1fr; gap: 15px; }
  }

  /* ---------- HP / sidebar tertutup (<= 800px) ---------- */
  @media screen and (max-width: 800px) {
    .ad-wrap {
      padding: 10px;
      margin-left: 50px;               /* lebar sidebar tertutup */
      width: auto;
      max-width: calc(100vw - 55px);
      overflow-x: hidden;
    }
    .ad-panel { padding: 15px; }
    .ad-chart { height: 220px; }
    .${styles.title} { font-size: 1.4rem !important; }
    .${styles.subtitle} { font-size: 0.85rem !important; }
  }

  /* ---------- HP kecil (<= 480px): kartu statistik 2 kolom ---------- */
  @media screen and (max-width: 480px) {
    .ad-stats.ad-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .ad-stats.ad-stats > :first-child { grid-column: 1 / -1; } /* "Total" selebar penuh */
    .ad-panel-title { font-size: 1rem; }
    .ad-chart { height: 200px; }
  }
`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const response = await api.get("admin/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil statistik admin:", error);
    } finally {
      setLoading(false);
    }
  }

  const chartData = [
    { name: "Pending", total: stats?.pending || 0, color: "#f59e0b" },
    { name: "Diproses", total: stats?.process || 0, color: "#3b82f6" },
    { name: "Invalid", total: stats?.invalid || 0, color: "#ef4444" },
    { name: "Selesai", total: stats?.completed || 0, color: "#10b981" },
  ];

  const submissionData = [
    { label: "Total Laporan Masuk", background: "rgba(148, 163, 184, 0.1)", color: "#cbd5e1", icon: FileText, data: "total" },
    { label: "Menunggu Verifikasi", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", icon: Clock, data: "pending" },
    { label: "Sedang Dikerjakan", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", icon: RefreshCw, data: "process" },
    { label: "Laporan Invalid", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", icon: XCircle, data: "invalid" },
    { label: "Tuntas / Selesai", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", icon: CheckCircle, data: "completed" },
  ];

  return (
    <div className="ad-wrap">
      <style>{responsiveCss}</style>

      <header className={styles.header}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>
          Pantau laporan masyarakat dan statistik infrastruktur secara real-time.
        </p>
      </header>

      {loading ? (
        <>
          {/* Skeleton statistik */}
          <div className={`${styles.statsGrid} ad-stats`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className="skeleton-box" style={{ height: "16px", width: "60%" }} />
                  <div className="skeleton-box" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
                </div>
                <div className="skeleton-box" style={{ height: "28px", width: "40%", marginTop: "15px", borderRadius: "6px" }} />
              </div>
            ))}
          </div>

          {/* Skeleton bagian bawah (selalu 1 kolom saat loading) */}
          <div className="ad-bottom ad-bottom--loading">
            <div className={`${styles.chartSection} ad-panel`}>
              <h3 className={`${styles.sectionTitle} ad-panel-title`}>
                <div className="skeleton-box" style={{ width: "24px", height: "24px" }} />
                <div className="skeleton-box" style={{ width: "min(200px, 60%)", height: "20px" }} />
              </h3>
              <div style={{ width: "100%", height: "220px", display: "flex", alignItems: "flex-end", gap: "20px", padding: "10px 0" }}>
                {[40, 70, 30, 90].map((h, i) => (
                  <div key={i} className="skeleton-box" style={{ flex: 1, maxWidth: "40px", height: `${h}%`, borderRadius: "4px 4px 0 0" }} />
                ))}
              </div>
            </div>

            <div className={`${styles.votedSection} ad-panel`}>
              <h3 className={`${styles.sectionTitle} ad-panel-title`}>
                <div className="skeleton-box" style={{ width: "24px", height: "24px" }} />
                <div className="skeleton-box" style={{ width: "min(180px, 60%)", height: "20px" }} />
              </h3>
              <div className={styles.votedCard}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div className="skeleton-box" style={{ height: "20px", width: "60%" }} />
                  <div className="skeleton-box" style={{ height: "24px", width: "70px", borderRadius: "12px" }} />
                </div>
                <div className="skeleton-box" style={{ height: "14px", width: "100%", marginBottom: "8px" }} />
                <div className="skeleton-box" style={{ height: "14px", width: "90%", marginBottom: "8px" }} />
                <div className="skeleton-box" style={{ height: "14px", width: "50%", marginBottom: "20px" }} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Kartu statistik */}
          <div className={`${styles.statsGrid} ad-stats`}>
            {submissionData.map((item, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span>{item.label}</span>
                  <div className={styles.iconBox} style={{ background: item.background, color: item.color }}>
                    <item.icon size={20} />
                  </div>
                </div>
                <div className={styles.statValue}>{stats?.[item.data] || 0}</div>
              </div>
            ))}
          </div>

          <div className="ad-bottom">
            {/* Grafik */}
            <div className={`${styles.chartSection} ad-panel`}>
              <h3 className={`${styles.sectionTitle} ad-panel-title`}>
                <BarChart3 size={20} color="#3b82f6" /> Analisis Status Laporan
              </h3>
              <div className="ad-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={35}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Laporan paling mendesak */}
            <div className={`${styles.votedSection} ad-panel`}>
              <h3 className={`${styles.sectionTitle} ad-panel-title`}>
                <Flame size={20} color="#ef4444" /> Skala Prioritas Utama
              </h3>
              {stats?.top_voted ? (
                <div
                  className={`${styles.votedCard} ad-voted`}
                  onClick={() => navigate("/admin/submissions")}
                >
                  <div className="ad-voted-head">
                    <h4>{stats.top_voted.label}</h4>
                    <div className={`${styles.votedBadge} ad-badge`}>
                      <Flame size={14} /> {stats.top_voted.votes_count} Votes
                    </div>
                  </div>
                  <p className="ad-voted-desc">{stats.top_voted.description}</p>
                  <div className="ad-voted-foot">
                    <span>📍 {stats.top_voted.location}</span>
                    <span>👤 {stats.top_voted.user?.username || "Warga"}</span>
                  </div>
                </div>
              ) : (
                <p className="ad-empty">Belum ada laporan dengan dukungan warga.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}