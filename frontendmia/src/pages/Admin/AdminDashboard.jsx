import { useEffect, useState } from "react";
import api from "../../js/api.js";
import { FileText, Clock, RefreshCw, CheckCircle, Flame, BarChart3 } from "lucide-react";
import styles from "../../css/pages/Admin.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await api.get("admin/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil statistik admin:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <div style={{ color: "#3b82f6", fontSize: "1.2rem", fontWeight: "bold", animation: "pulse 1.5s infinite" }}>Memuat Data...</div>
      </div>
    );
  }

  // Data untuk Grafik Recharts
  const chartData = [
    { name: "Pending", total: stats?.pending || 0, color: "#f59e0b" }, // Kuning
    { name: "Diproses", total: stats?.process || 0, color: "#3b82f6" }, // Biru
    { name: "Selesai", total: stats?.completed || 0, color: "#10b981" }, // Hijau
  ];

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>Pantau laporan masyarakat dan statistik infrastruktur secara real-time.</p>
      </header>

      {/* Grid Statistik 4 Kartu */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Total Laporan Masuk</span>
            <div className={styles.iconBox} style={{ background: "rgba(148, 163, 184, 0.1)", color: "#cbd5e1" }}><FileText size={20}/></div>
          </div>
          <div className={styles.statValue}>{stats?.total || 0}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Menunggu Verifikasi</span>
            <div className={styles.iconBox} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}><Clock size={20}/></div>
          </div>
          <div className={styles.statValue}>{stats?.pending || 0}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Sedang Dikerjakan</span>
            <div className={styles.iconBox} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}><RefreshCw size={20}/></div>
          </div>
          <div className={styles.statValue}>{stats?.process || 0}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>Tuntas / Selesai</span>
            <div className={styles.iconBox} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}><CheckCircle size={20}/></div>
          </div>
          <div className={styles.statValue}>{stats?.completed || 0}</div>
        </div>
      </div>

      {/* Bagian Bawah: Grafik & Top Voted */}
      <div className={styles.bottomGrid}>
        {/* Grafik Interaktif */}
        <div className={styles.chartSection}>
          <h3 className={styles.sectionTitle}><BarChart3 size={20} color="#3b82f6" /> Analisis Status Laporan</h3>
          <div style={{ width: "100%", height: "250px" }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }} />
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
          <h3 className={styles.sectionTitle}><Flame size={20} color="#ef4444" /> Skala Prioritas Utama</h3>
          {stats?.top_voted ? (
            <div className={styles.votedCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <h4 style={{ fontSize: "1.1rem", margin: 0, color: "#fff" }}>{stats.top_voted.label}</h4>
                <div className={styles.votedBadge}>
                  <Flame size={14} /> {stats.top_voted.votes_count} Votes
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.5", marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {stats.top_voted.description}
              </p>
              <div style={{ fontSize: "0.75rem", color: "#64748b", borderTop: "1px solid #334155", paddingTop: "0.8rem", display: "flex", justifyContent: "space-between" }}>
                <span>📍 {stats.top_voted.location}</span>
                <span>👤 {stats.top_voted.user?.username || "Warga"}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: "#64748b", fontSize: "0.9rem", textAlign: "center", marginTop: "2rem" }}>Belum ada laporan dengan dukungan warga.</p>
          )}
        </div>
      </div>
    </div>
  );
}