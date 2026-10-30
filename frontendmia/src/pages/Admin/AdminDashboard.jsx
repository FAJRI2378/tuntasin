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

  // Data untuk Grafik
  const chartData = [
    { name: "Pending", total: stats?.pending || 0, color: "#f59e0b" },
    { name: "Diproses", total: stats?.process || 0, color: "#3b82f6" },
    { name: "Invalid", total: stats?.invalid || 0, color: "#ef4444" },
    { name: "Selesai", total: stats?.completed || 0, color: "#10b981" },
  ];

  // Data untuk Kartu Statistik (Label sudah disesuaikan)
  const submissionData = [
    {
      label: "Total Laporan Masuk",
      background: "rgba(148, 163, 184, 0.1)",
      color: "#cbd5e1",
      icon: FileText,
      data: "total",
    },
    {
      label: "Menunggu Verifikasi",
      background: "rgba(245, 158, 11, 0.1)",
      color: "#f59e0b",
      icon: Clock,
      data: "pending",
    },
    {
      label: "Sedang Dikerjakan",
      background: "rgba(59, 130, 246, 0.1)",
      color: "#3b82f6",
      icon: RefreshCw,
      data: "process",
    },
    {
      label: "Laporan Invalid",
      background: "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
      icon: XCircle,
      data: "invalid",
    },
    {
      label: "Tuntas / Selesai",
      background: "rgba(16, 185, 129, 0.1)",
      color: "#10b981",
      icon: CheckCircle,
      data: "completed",
    },
  ];

  return (
    <div>
      {/* CSS Animasi Skeleton Pulse */}
      <style>
        {`
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .skeleton-box {
            background-color: #334155;
            border-radius: 4px;
            animation: skeleton-pulse 1.5s infinite ease-in-out;
          }
        `}
      </style>

      <header className={styles.header}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>
          Pantau laporan masyarakat dan statistik infrastruktur secara real-time.
        </p>
      </header>

      {loading ? (
        /* ======================== SKELETON LOADING UI ======================== */
        <>
          {/* Skeleton Grid Statistik (5 Kartu) */}
          <div className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className="skeleton-box" style={{ height: "16px", width: "60%" }}></div>
                  <div className="skeleton-box" style={{ width: "32px", height: "32px", borderRadius: "8px" }}></div>
                </div>
                <div className="skeleton-box" style={{ height: "28px", width: "40%", marginTop: "15px", borderRadius: "6px" }}></div>
              </div>
            ))}
          </div>

          {/* Skeleton Bagian Bawah: Grafik & Top Voted */}
          <div className={styles.bottomGrid}>
            
            {/* Skeleton Grafik */}
            <div className={styles.chartSection}>
              <h3 className={styles.sectionTitle} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div className="skeleton-box" style={{ width: "24px", height: "24px", borderRadius: "4px" }}></div>
                <div className="skeleton-box" style={{ width: "200px", height: "20px" }}></div>
              </h3>
              <div style={{ width: "100%", height: "250px", display: "flex", alignItems: "flex-end", gap: "20px", padding: "10px 0" }}>
                {/* Batang-batang grafik skeleton acak */}
                <div className="skeleton-box" style={{ width: "40px", height: "40%", borderRadius: "4px 4px 0 0" }}></div>
                <div className="skeleton-box" style={{ width: "40px", height: "70%", borderRadius: "4px 4px 0 0" }}></div>
                <div className="skeleton-box" style={{ width: "40px", height: "30%", borderRadius: "4px 4px 0 0" }}></div>
                <div className="skeleton-box" style={{ width: "40px", height: "90%", borderRadius: "4px 4px 0 0" }}></div>
              </div>
            </div>

            {/* Skeleton Skala Prioritas */}
            <div className={styles.votedSection}>
              <h3 className={styles.sectionTitle} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div className="skeleton-box" style={{ width: "24px", height: "24px", borderRadius: "4px" }}></div>
                <div className="skeleton-box" style={{ width: "180px", height: "20px" }}></div>
              </h3>
              <div className={styles.votedCard}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div className="skeleton-box" style={{ height: "20px", width: "60%" }}></div>
                  <div className="skeleton-box" style={{ height: "24px", width: "70px", borderRadius: "12px" }}></div>
                </div>
                <div className="skeleton-box" style={{ height: "14px", width: "100%", marginBottom: "8px" }}></div>
                <div className="skeleton-box" style={{ height: "14px", width: "90%", marginBottom: "8px" }}></div>
                <div className="skeleton-box" style={{ height: "14px", width: "50%", marginBottom: "20px" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #334155", paddingTop: "1rem" }}>
                  <div className="skeleton-box" style={{ height: "14px", width: "30%" }}></div>
                  <div className="skeleton-box" style={{ height: "14px", width: "25%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ======================== ACTUAL DATA UI ======================== */
        <>
          {/* Grid Statistik 5 Kartu */}
          <div className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {submissionData.map((item, index) => {
              return (
                <div key={index} className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <span>{item.label}</span>
                    <div
                      className={styles.iconBox}
                      style={{
                        background: item.background,
                        color: item.color,
                      }}
                    >
                      <item.icon size={20} />
                    </div>
                  </div>
                  <div className={styles.statValue}>{stats?.[item.data] || 0}</div>
                </div>
              );
            })}
          </div>

          {/* Bagian Bawah: Grafik & Top Voted */}
          <div className={styles.bottomGrid}>
            {/* Grafik Interaktif */}
            <div className={styles.chartSection}>
              <h3 className={styles.sectionTitle}>
                <BarChart3 size={20} color="#3b82f6" /> Analisis Status Laporan
              </h3>
              <div style={{ width: "100%", height: "250px" }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Laporan Paling Mendesak */}
            <div className={styles.votedSection}>
              <h3 className={styles.sectionTitle}>
                <Flame size={20} color="#ef4444" /> Skala Prioritas Utama
              </h3>
              {stats?.top_voted ? (
                <div
                  className={styles.votedCard}
                  onClick={() => navigate("/admin/submissions")}
                  style={{ cursor: "pointer", transition: "all 0.2s ease-in-out" }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "1.1rem", margin: 0, color: "#fff" }}>
                      {stats.top_voted.label}
                    </h4>
                    <div className={styles.votedBadge}>
                      <Flame size={14} /> {stats.top_voted.votes_count} Votes
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#94a3b8",
                      lineHeight: "1.5",
                      marginBottom: "1rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {stats.top_voted.description}
                  </p>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      borderTop: "1px solid #334155",
                      paddingTop: "0.8rem",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>📍 {stats.top_voted.location}</span>
                    <span>👤 {stats.top_voted.user?.username || "Warga"}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: "#64748b", fontSize: "0.9rem", textAlign: "center", marginTop: "2rem" }}>
                  Belum ada laporan dengan dukungan warga.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}