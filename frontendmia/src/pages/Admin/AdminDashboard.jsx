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
  User,
  MapPin,
  Download
} from "lucide-react";
import styles from "../../css/pages/AdminDashboard.module.css";
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
    <div className={styles.adWrap}>
      {/* HEADER DENGAN TOMBOL EXPORT */}
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
            <h1 className={styles.title}>Overview</h1>
            <p className={styles.subtitle}>
              Pantau laporan masyarakat dan statistik infrastruktur secara real-time.
            </p>
        </div>
        
        {/* --- TOMBOL UNDUH LAPORAN PDF --- */}
        <button 
          onClick={() => {
            // Karena ini unduhan file, kita bisa gunakan window.open yang mengarah ke endpoint API
            // Pastikan URL disesuaikan dengan base URL API kamu di hosting
            window.open('https://tuntasin.epistura.web.id/api/admin/export-pdf', '_blank');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#10b981', // Warna hijau
            color: 'white',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          <Download size={18} />
          Unduh Laporan (PDF)
        </button>
      </header>

      {loading ? (
        <>
          {/* Skeleton statistik */}
          <div className={`${styles.statsGrid} ${styles.adStats}`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.skeletonBox} style={{ height: "16px", width: "60%" }} />
                  <div className={styles.skeletonBox} style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
                </div>
                <div className={styles.skeletonBox} style={{ height: "28px", width: "40%", marginTop: "15px", borderRadius: "6px" }} />
              </div>
            ))}
          </div>

          {/* Skeleton bagian bawah (selalu 1 kolom saat loading) */}
          <div className={`${styles.adBottom} ${styles.adBottomLoading}`}>
            <div className={`${styles.chartSection} ${styles.adPanel}`}>
              <h3 className={`${styles.sectionTitle} ${styles.adPanelTitle}`}>
                <div className={styles.skeletonBox} style={{ width: "24px", height: "24px" }} />
                <div className={styles.skeletonBox} style={{ width: "min(200px, 60%)", height: "20px" }} />
              </h3>
              <div style={{ width: "100%", height: "220px", display: "flex", alignItems: "flex-end", gap: "20px", padding: "10px 0" }}>
                {[40, 70, 30, 90].map((h, i) => (
                  <div key={i} className={styles.skeletonBox} style={{ flex: 1, maxWidth: "40px", height: `${h}%`, borderRadius: "4px 4px 0 0" }} />
                ))}
              </div>
            </div>

            <div className={`${styles.votedSection} ${styles.adPanel}`}>
              <h3 className={`${styles.sectionTitle} ${styles.adPanelTitle}`}>
                <div className={styles.skeletonBox} style={{ width: "24px", height: "24px" }} />
                <div className={styles.skeletonBox} style={{ width: "min(180px, 60%)", height: "20px" }} />
              </h3>
              <div className={styles.votedCard}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div className={styles.skeletonBox} style={{ height: "20px", width: "60%" }} />
                  <div className={styles.skeletonBox} style={{ height: "24px", width: "70px", borderRadius: "12px" }} />
                </div>
                <div className={styles.skeletonBox} style={{ height: "14px", width: "100%", marginBottom: "8px" }} />
                <div className={styles.skeletonBox} style={{ height: "14px", width: "90%", marginBottom: "8px" }} />
                <div className={styles.skeletonBox} style={{ height: "14px", width: "50%", marginBottom: "20px" }} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Kartu statistik */}
          <div className={`${styles.statsGrid} ${styles.adStats}`}>
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

          <div className={styles.adBottom}>
            {/* Grafik */}
            <div className={`${styles.chartSection} ${styles.adPanel}`}>
              <h3 className={`${styles.sectionTitle} ${styles.adPanelTitle}`}>
                <BarChart3 size={20} color="#3b82f6" /> Analisis Status Laporan
              </h3>
              <div className={styles.adChart}>
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
            <div className={`${styles.votedSection} ${styles.adPanel}`}>
              <h3 className={`${styles.sectionTitle} ${styles.adPanelTitle}`}>
                <Flame size={20} color="#ef4444" /> Skala Prioritas Utama
              </h3>
              {stats?.top_voted ? (
                <div
                  className={`${styles.votedCard} ${styles.adVoted}`}
                  onClick={() => navigate("/admin/submissions")}
                >
                  <div className={styles.adVotedHead}>
                    <h4>{stats.top_voted.label}</h4>
                    <div className={`${styles.votedBadge} ${styles.adBadge}`}>
                      <Flame size={14} /> {stats.top_voted.votes_count} Votes
                    </div>
                  </div>
                  <p className={styles.adVotedDesc}>{stats.top_voted.description}</p>
                  <div className={styles.adVotedFoot}>
                    <span><MapPin /> {stats.top_voted.location}</span>
                    <span><User size={14} /> {stats.top_voted.user?.username || "Warga"}</span>
                  </div>
                </div>
              ) : (
                <p className={styles.adEmpty}>Belum ada laporan dengan dukungan warga.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}