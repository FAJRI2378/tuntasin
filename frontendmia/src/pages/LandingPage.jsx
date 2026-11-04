import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../js/api";
import {
  ArrowRight,
  Map as MapIcon,
  Activity,
  Megaphone,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  Camera,
  ThumbsUp,
  User,
} from "lucide-react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSubmission } from "../contexts/SubmissionContext";
import SplashIntro from "../components/SplashIntro";
import styles from "../css/pages/LandingPage.module.css";

/* Palet diambil dari logo Tuntasin */
const C = {
  bg: "#C0CBFF", // periwinkle
  navy: "#13376A",
  green: "#1FC468",
};

function Logo({ size = styles.logoDefaultSize }) {
  return (
    <span
      className={`${size} ${styles.logoText}`}
      style={{ color: C.navy, fontFamily: "'Poppins', sans-serif" }}
    >
      tuntas
      <span className={styles.logoWrapper}>
        <span style={{ fontFamily: "'Poppins', sans-serif" }}>ı</span>
        <span
          className={styles.logoDot}
          style={{
            background: C.green,
            width: "0.26em",
            height: "0.26em",
            top: "-0.08em",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </span>
      n
    </span>
  );
}

/* Warna marker berdasarkan status atau jumlah vote */
const getHeatColor = (status, votes) => {
  if (status === "pending") return "#f59e0b"; // Kuning/Orange
  if (status === "process") return "#3b82f6"; // Biru
  if (status === "invalid") return "#ef4444"; // Merah
  if (votes > 5) return "#dc2626"; // Merah Tua (Prioritas Tinggi)
  return "#10b981"; // Hijau (Selesai/Normal)
};

/* Marker peta, dipakai di hero dan di kartu fitur */
function HeatMarkers({ items, popupDetail = false }) {
  return items.map((item) => {
    const parts = (item.location || "").split(", ");
    if (parts.length < 2 || isNaN(parseFloat(parts[0]))) return null;

    const center = [parseFloat(parts[0].trim()), parseFloat(parts[1].trim())];
    const votes = item.votes_count || 0;
    const color = getHeatColor(item.status, votes);

    return (
      <CircleMarker
        key={item.id}
        center={center}
        radius={Math.min(10 + votes * 4, 35)}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 2 }}
      >
        <Popup>
          <div
            style={{
              color: "#0f172a",
              minWidth: popupDetail ? "180px" : "160px",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            <strong
              style={{
                fontSize: "1rem",
                display: "block",
                marginBottom: "4px",
              }}
            >
              {item.label}
            </strong>
            {popupDetail && (
              <p
                style={{
                  fontSize: "0.8rem",
                  margin: "0 0 6px 0",
                  color: "#334155",
                }}
              >
                {item.description}
              </p>
            )}
            <div
              style={{
                fontSize: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              {popupDetail && <span>📍 {item.location}</span>}
              <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                🔥 {votes} Dukungan (Vote)
              </span>
              {popupDetail && (
                <span
                  style={{
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    color: "#2563eb",
                  }}
                >
                  Status: {item.status}
                </span>
              )}
            </div>
          </div>
        </Popup>
      </CircleMarker>
    );
  });
}

const steps = [
  {
    icon: Camera,
    title: "Laporkan",
    desc: "Foto kerusakan, tandai lokasi di peta, dan kirim dalam hitungan detik.",
  },
  {
    icon: ThumbsUp,
    title: "Voting Warga",
    desc: "Warga lain mendukung laporan agar prioritasnya naik.",
  },
  {
    icon: CheckCircle2,
    title: "Tuntas",
    desc: "Pemerintah menindaklanjuti dan kamu memantau sampai selesai.",
  },
];

const legend = [
  { color: "#f59e0b", label: "Menunggu" },
  { color: "#3b82f6", label: "Diproses" },
  { color: "#dc2626", label: "Prioritas tinggi" },
  { color: "#10b981", label: "Normal" },
];

export default function LandingPage() {
  const [stats, setStats] = useState([
    { value: "...", label: "Laporan masuk" },
    { value: "...", label: "Terselesaikan" },
    { value: "...", label: "Dukungan warga" },
    { value: "...", label: "Rata-rata respons" },
  ]);

  const dampakRef = useRef(null);
  const fiturRef = useRef(null);
  const carakerjaRef = useRef(null);

  const { submission, setSubmission } = useSubmission();
  const [user, setUser] = useState();

  useEffect(() => {
    // 1. Memuat Statistik
    api
      .get("landing-stats")
      .then((res) => {
        const data = res.data;
        setStats([
          { value: data.total_laporan || "0", label: "Laporan masuk" },
          { value: data.laporan_selesai || "0", label: "Terselesaikan" },
          { value: data.total_dukungan || "0", label: "Dukungan warga" },
          {
            value: data.rata_rata_respons || "1-3 hari",
            label: "Rata-rata respons",
          },
        ]);
      })
      .catch((err) => {
        console.error("Gagal memuat statistik landing page:", err);
        setStats([
          { value: "0", label: "Laporan masuk" },
          { value: "0", label: "Terselesaikan" },
          { value: "0", label: "Dukungan warga" },
          { value: "1-3 hari", label: "Rata-rata respons" },
        ]);
      });

    // 2. Memuat Data Peta (jika belum ada di context)
    if (submission.length === 0) {
      api
        .get("submissions")
        .then((res) => {
          setSubmission(res.data.data || []);
        })
        .catch((err) => {
          console.error("Gagal memuat data peta:", err);
        });
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.1 }}>
      <div
        className={styles.container}
        style={{
          background: C.bg,
          color: C.navy,
          fontFamily: "'Poppins', system-ui, sans-serif",
        }}
      >
        <SplashIntro />

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .floaty { animation: floaty 5s ease-in-out infinite; }
      `}</style>

        <div className={styles.content}>
          {/* --- BACKGROUND SOFT GLOW --- */}
          <div className={styles.bgGlowContainer}>
            <div className={styles.glowTopLeft} />
            <div
              className={styles.glowTopRight}
              style={{ background: "rgba(31,196,104,0.18)" }}
            />
            <div className={styles.glowBottomLeft} />
          </div>

          {/* --- NAVBAR --- */}
          <nav className={styles.navbar}>
            <div className={styles.navInner}>
              <Logo />
              <div className={styles.navLinks}>
                <div
                  onClick={() =>
                    dampakRef.current &&
                    dampakRef.current.scrollIntoView({ behavior: "smooth" })
                  }
                  className={styles.navLinkItem}
                >
                  Dampak
                </div>
                <div
                  onClick={() =>
                    fiturRef.current &&
                    fiturRef.current.scrollIntoView({ behavior: "smooth" })
                  }
                  className={styles.navLinkItem}
                >
                  Fitur
                </div>
                <div
                  onClick={() =>
                    carakerjaRef.current &&
                    carakerjaRef.current.scrollIntoView({ behavior: "smooth" })
                  }
                  className={styles.navLinkItem}
                >
                  Cara Kerja
                </div>
              </div>
              {user ? (
                <div className={styles.acc}>
                  <User
                    size={18}
                    style={{ marginRight: "8px", opacity: 0.7, flexShrink: 0 }}
                  />
                  <div className={styles.accName}>
                    {user.name || user.username || "User"}
                  </div>
                </div>
              ) : (
                <div className={styles.navActions}>
                  <Link to="/register" className={styles.registerLink}>
                    Daftar
                  </Link>
                  <Link
                    to="/login"
                    className={styles.loginBtn}
                    style={{ background: C.navy }}
                  >
                    Masuk
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* --- HERO --- */}
          <main className={styles.heroMain}>
            <h1 className={styles.heroTitle}>
              Wujudkan Infrastruktur
              <br />
              <span className={styles.heroHighlightWrapper}>
                Lebih Baik, Bersama
                <span style={{ color: C.green }}>.</span>
                <svg
                  className={styles.heroSvgLine}
                  viewBox="0 0 300 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8 C 70 0, 150 12, 298 3"
                    stroke={C.green}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className={styles.heroDesc}>
              Platform kolaboratif yang menghubungkan masyarakat dan pemerintah
              secara transparan. Laporkan kerusakan, tentukan prioritas bersama
              lewat voting, dan pantau progres perbaikannya secara real-time.
            </p>

            <div className={styles.heroCtaGroup}>
              <Link
                to="/create"
                className={styles.primaryCta}
                style={{ background: C.navy }}
              >
                Mulai Buat Laporan
                <ArrowRight size={18} className={styles.arrowIcon} />
              </Link>
              <Link to="/heatmap" className={styles.secondaryCta}>
                Eksplorasi Peta
              </Link>
            </div>

            {/* --- HERO PREVIEW CARD (PETA ASLI) --- */}
            <div className={styles.heroMapWrapper}>
              <div className={styles.heroMapInner}>
                <div className={styles.mapContainerBox}>
                  <MapContainer
                    center={[-2.548926, 118.0148634]}
                    zoom={5}
                    style={{ height: "100%", width: "100%" }}
                    maxBounds={[
                      [6.0, 95.0],
                      [-11.0, 141.0],
                    ]}
                    minZoom={4}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <HeatMarkers items={submission} popupDetail />
                  </MapContainer>
                </div>
              </div>
            </div>
          </main>

          {/* --- STATS --- */}
          <section ref={dampakRef} id="dampak" className={styles.statsSection}>
            <div className={styles.statsGrid}>
              {stats.map((s) => (
                <div key={s.label} className={styles.statItem}>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* --- BENTO FEATURES --- */}
          <section ref={fiturRef} id="fitur" className={styles.featuresSection}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionSubtitle} style={{ color: C.green }}>
                Fitur Unggulan
              </p>
              <h2 className={styles.sectionTitle}>Semua yang kamu butuhkan</h2>
            </div>

            <div className={styles.bentoGrid}>
              {/* Card 1: Heatmap (teks + peta) */}
              <div className={styles.bentoCard1}>
                {/* Teks */}
                <div className={styles.bentoCard1Text}>
                  <div
                    className={styles.iconBox}
                    style={{
                      background: "rgba(19,55,106,0.08)",
                      borderColor: "rgba(19,55,106,0.15)",
                    }}
                  >
                    <MapIcon size={24} color={C.navy} />
                  </div>
                  <h3 className={styles.cardTitle}>
                    Pemetaan Prioritas Heatmap
                  </h3>
                  <p className={styles.cardDesc}>
                    Visualisasi titik kerusakan infrastruktur secara real-time.
                    Warna dan ukuran titik menandakan urgensi berdasarkan status
                    dan dukungan warga.
                  </p>

                  <div className={styles.legendContainer}>
                    {legend.map((l) => (
                      <span key={l.label} className={styles.legendItem}>
                        <span
                          className={styles.legendDot}
                          style={{ background: l.color }}
                        />
                        {l.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Peta */}
                <div className={styles.bentoCard1Map}>
                  <MapContainer
                    center={[-2.548926, 118.0148634]}
                    zoom={4}
                    minZoom={4}
                    scrollWheelZoom={false}
                    zoomControl={false}
                    maxBounds={[
                      [6.0, 95.0],
                      [-11.0, 141.0],
                    ]}
                    style={{
                      position: "absolute",
                      inset: 0,
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <HeatMarkers items={submission} />
                  </MapContainer>
                </div>
              </div>

              {/* Card 2: Voting */}
              <div className={styles.bentoCard2}>
                <div className={styles.cardInnerContent}>
                  <div
                    className={styles.iconBox}
                    style={{
                      background: "rgba(31,196,104,0.12)",
                      borderColor: "rgba(31,196,104,0.3)",
                    }}
                  >
                    <Megaphone size={24} color={C.green} />
                  </div>
                  <h3 className={styles.cardTitle}>Sistem Voting Warga</h3>
                  <p className={styles.cardDesc}>
                    Berikan suaramu pada laporan paling krusial agar segera
                    ditindaklanjuti oleh pihak berwenang.
                  </p>
                </div>
              </div>

              {/* Card 3: Transparansi */}
              <div className={styles.bentoCard3}>
                <div className={styles.cardInnerContent}>
                  <div
                    className={styles.iconBox}
                    style={{
                      background: "rgba(19,55,106,0.08)",
                      borderColor: "rgba(19,55,106,0.15)",
                    }}
                  >
                    <ShieldCheck size={24} color={C.navy} />
                  </div>
                  <h3 className={styles.cardTitle}>Transparansi Penuh</h3>
                  <p className={styles.cardDesc}>
                    Akses terbuka terhadap dokumen perbaikan (PDF) dan catatan
                    resmi dari tim lapangan.
                  </p>
                </div>
              </div>

              {/* Card 4: Live tracking */}
              <div className={styles.bentoCard4} style={{ background: C.navy }}>
                <div className={styles.bentoCard4Badges}>
                  {[
                    { icon: Clock, t: "Menunggu Verifikasi", done: true },
                    { icon: FileText, t: "Dalam Pengerjaan", done: true },
                    { icon: CheckCircle2, t: "Selesai", done: false },
                  ].map((s, i) => (
                    <div key={i} className={styles.badgeItem}>
                      <s.icon
                        size={16}
                        color={s.done ? C.green : "rgba(255,255,255,0.5)"}
                      />
                      {s.t}
                    </div>
                  ))}
                </div>

                <div className={styles.bentoCard4Content}>
                  <div className={styles.bentoCard4Icon}>
                    <Activity size={24} color={C.green} />
                  </div>
                  <h3 className={styles.bentoCard4Title}>
                    Pantau Progres Real-Time
                  </h3>
                  <p className={styles.bentoCard4Desc}>
                    Tidak ada lagi laporan yang menggantung. Lacak setiap
                    perubahan status laporanmu dari "Menunggu Verifikasi" hingga
                    "Selesai" langsung dari dashboard.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* --- CARA KERJA --- */}
          <section
            ref={carakerjaRef}
            id="cara-kerja"
            className={styles.howItWorksSection}
          >
            <div className={styles.sectionHeader}>
              <p className={styles.sectionSubtitle} style={{ color: C.green }}>
                Cara Kerja
              </p>
              <h2 className={styles.sectionTitle}>
                Tiga langkah menuju tuntas
              </h2>
            </div>
            <div className={styles.stepsGrid}>
              {steps.map((s, i) => (
                <div key={s.title} className={styles.stepCard}>
                  <span className={styles.stepNumber}>{i + 1}</span>
                  <div
                    className={styles.stepIconBox}
                    style={{ background: i === 2 ? C.green : C.navy }}
                  >
                    <s.icon size={22} />
                  </div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* --- FOOTER --- */}
          <footer className={styles.footer}>
            <div className={styles.footerInner}>
              <Logo size="text-xl" />
              <span>
                © {new Date().getFullYear()} Tuntasin. Dibuat untuk warga.
              </span>
            </div>
          </footer>
        </div>
      </div>
    </ReactLenis>
  );
}
