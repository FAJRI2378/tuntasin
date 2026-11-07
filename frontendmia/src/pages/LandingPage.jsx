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
  Check,
  Sparkles,
   Menu,
  X,
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
  bg: "#F8F9FF", // Latar belakang yang lebih terang agar terlihat bersih
  navy: "#13376A",
  green: "#1FC468",
};

const MAP_CENTER = [-2.548926, 118.0148634];
const MAP_BOUNDS = [
  [6.0, 95.0],
  [-11.0, 141.0],
];

const FALLBACK_STATS = [
  { value: "0", label: "Laporan masuk" },
  { value: "0", label: "Terselesaikan" },
  { value: "0", label: "Dukungan warga" },
  { value: "1-3 hari", label: "Rata-rata respons" },
];

const INITIAL_STATS = [
  { value: "...", label: "Laporan masuk" },
  { value: "...", label: "Terselesaikan" },
  { value: "...", label: "Dukungan warga" },
  { value: "...", label: "Rata-rata respons" },
];

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
  if (status === "pending") return "#f59e0b";
  if (status === "process") return "#3b82f6";
  if (status === "invalid") return "#ef4444";
  if (votes > 5) return "#dc2626";
  return "#10b981";
};

/* Marker peta, dipakai di kartu fitur */
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
              style={{ fontSize: "1rem", display: "block", marginBottom: "4px" }}
            >
              {item.label}
            </strong>
            {popupDetail && (
              <p
                style={{ fontSize: "0.8rem", margin: "0 0 6px 0", color: "#334155" }}
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

const badges = [
  { icon: Clock, t: "Menunggu Verifikasi", done: true },
  { icon: FileText, t: "Dalam Pengerjaan", done: true },
  { icon: CheckCircle2, t: "Selesai", done: false },
];

export default function LandingPage() {
  const [stats, setStats] = useState(INITIAL_STATS);

  const dampakRef = useRef(null);
  const fiturRef = useRef(null);
  const carakerjaRef = useRef(null);

  const { submission, setSubmission } = useSubmission();
  const [user, setUser] = useState();

  const scrollTo = (ref) =>
    ref.current && ref.current.scrollIntoView({ behavior: "smooth" });
const [menuOpen, setMenuOpen] = useState(false);

const goTo = (ref) => {
  setMenuOpen(false);
  scrollTo(ref);
};
  useEffect(() => {
    // 1. Memuat statistik
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
        setStats(FALLBACK_STATS);
      });

    // 2. Memuat data peta (jika belum ada di context)
    if (submission.length === 0) {
      api
        .get("submissions")
        .then((res) => setSubmission(res.data.data || []))
        .catch((err) => console.error("Gagal memuat data peta:", err));
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
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

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>

        <div className={styles.content}>
          {/* Background glow */}
          <div className={styles.bgGlowContainer}>
            <div className={styles.glowTopLeft} />
            <div className={styles.glowTopRight} />
            <div className={styles.glowBottomLeft} />
          </div>

         {/* NAVBAR */}
<nav className={styles.navbar}>
  <div className={styles.navInner}>
    <Logo />

    <div className={styles.navLinks}>
      <button type="button" className={styles.navLinkItem} onClick={() => goTo(dampakRef)}>
        Dampak
      </button>
      <button type="button" className={styles.navLinkItem} onClick={() => goTo(fiturRef)}>
        Fitur
      </button>
      <button type="button" className={styles.navLinkItem} onClick={() => goTo(carakerjaRef)}>
        Cara Kerja
      </button>
    </div>

    <div className={styles.navRight}>
      {user ? (
        <div className={styles.navActions}>
          <Link
            to={user.role === "admin" || user.is_admin ? "/admin" : "/create"}
            className={styles.loginBtn}
            style={{ background: C.navy }}
          >
            <span>Dashboard</span>
            <ArrowRight size={16} />
          </Link>
          <div className={styles.acc}>
            <User size={18} className={styles.accIcon} />
            <div className={styles.accName}>
              {user.name || user.username || "User"}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.navActions}>
          <Link to="/register" className={styles.registerLink}>
            Daftar
          </Link>
          <Link to="/login" className={styles.loginBtn} style={{ background: C.navy }}>
            Masuk
          </Link>
        </div>
      )}

      <button
        type="button"
        className={styles.menuToggle}
        onClick={() => setMenuOpen((o) => !o)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  </div>

  {/* Menu dropdown untuk mobile */}
  {menuOpen && (
    <div className={styles.mobileMenu}>
      {[
        { label: "Dampak", ref: dampakRef },
        { label: "Fitur", ref: fiturRef },
        { label: "Cara Kerja", ref: carakerjaRef },
      ].map((item) => (
        <button
          key={item.label}
          type="button"
          className={styles.mobileMenuItem}
          onClick={() => goTo(item.ref)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )}
</nav>

          {/* HERO */}
          <main className={styles.heroSection}>
            <div className={styles.heroGrid}>
              
              {/* Sisi Kiri - Teks & CTA */}
              <div className={styles.heroContent}>

                <h1 className={styles.heroTitle}>
                  Wujudkan Infrastruktur<br /> Lebih Baik, Bersama.
                </h1>

                <p className={styles.heroDesc}>
                  Platform yang menghubungkan masyarakat dan pemerintah untuk mewujudkan responsibility. Sampaikan laporan layanan publik dan kerusakan infrastruktur, tentukan prioritas bersama lewat voting, serta pantau progres penanganannya secara real-time.
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
                  <Link to="/heatmap" className={styles.textCta}>
                    Eksplorasi Peta &rarr;
                  </Link>
                </div>
              </div>

              {/* Sisi Kanan - Visual dengan hasil.png */}
              <div className={styles.heroVisual}>
                <div className={styles.heroImageWrapper}>
                  <img src="/hasil.png" alt="Infrastruktur dan Pelayanan Publik" className={styles.heroImageMain} />
                
                </div>
              </div>

            </div>
          </main>

          {/* STATS */}
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

          {/* FITUR */}
          <section ref={fiturRef} id="fitur" className={styles.featuresSection}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.eyebrow}>
                  <span
                    className={styles.eyebrowDot}
                    style={{ background: C.green }}
                  />
                  Fitur Unggulan
                </span>
                <h2 className={styles.sectionTitle}>
                  Semua yang kamu butuhkan
                </h2>
              </div>
              <p className={styles.sectionDesc}>
                Dari pelaporan hingga penyelesaian, setiap tahap dibuat
                transparan untuk warga dan pemerintah.
              </p>
            </div>

            <div className={styles.bentoGrid}>
              {/* Card 1: Heatmap */}
              <div className={styles.bentoCard1}>
                <div className={styles.bentoCard1Text}>
                  <div className={styles.iconBox} data-tone="navy">
                    <MapIcon size={22} color={C.navy} />
                  </div>
                  <h3 className={styles.cardTitle}>Pemetaan Prioritas Heatmap</h3>
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

                <div className={styles.bentoCard1Map}>
                  <MapContainer
                    center={MAP_CENTER}
                    zoom={4}
                    minZoom={4}
                    scrollWheelZoom={false}
                    zoomControl={false}
                    maxBounds={MAP_BOUNDS}
                    style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
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
                <div className={styles.iconBox} data-tone="green">
                  <Megaphone size={22} color={C.green} />
                </div>
                <h3 className={styles.cardTitle}>Sistem Voting Warga</h3>
                <p className={styles.cardDesc}>
                  Berikan suaramu pada laporan paling krusial agar segera
                  ditindaklanjuti oleh pihak berwenang.
                </p>
              </div>

              {/* Card 3: Transparansi */}
              <div className={styles.bentoCard3}>
                <div className={styles.iconBox} data-tone="navy">
                  <ShieldCheck size={22} color={C.navy} />
                </div>
                <h3 className={styles.cardTitle}>Transparansi Penuh</h3>
                <p className={styles.cardDesc}>
                  Akses terbuka terhadap dokumen perbaikan (PDF) dan catatan
                  resmi dari tim lapangan.
                </p>
              </div>

              {/* Card 4: Live tracking */}
              <div className={styles.bentoCard4}>
                <div className={styles.bentoCard4Content}>
                  <div className={styles.bentoCard4Icon}>
                    <Activity size={22} color={C.green} />
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

                <div className={styles.bentoCard4Badges}>
                  {badges.map((b) => (
                    <div key={b.t} className={styles.badgeItem}>
                      <b.icon
                        size={16}
                        color={b.done ? C.green : "rgba(255,255,255,0.5)"}
                      />
                      {b.t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CARA KERJA */}
          <section
            ref={carakerjaRef}
            id="cara-kerja"
            className={styles.howSection}
          >
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.eyebrow}>
                  <span
                    className={styles.eyebrowDot}
                    style={{ background: C.green }}
                  />
                  Cara Kerja
                </span>
                <h2 className={styles.sectionTitle}>Tiga langkah menuju tuntas</h2>
              </div>
              <p className={styles.sectionDesc}>
                Proses sederhana yang menghubungkan laporan warga dengan tindakan
                nyata dari pemerintah.
              </p>
            </div>

            <div className={styles.stepsGrid}>
              {steps.map((s, i) => {
                const isLast = i === steps.length - 1;
                return (
                  <div key={s.title} className={styles.stepCard}>
                    <div className={styles.stepHead}>
                      <div
                        className={styles.stepIconBox}
                        style={{ background: isLast ? C.green : C.navy }}
                      >
                        <s.icon size={22} color="#fff" />
                      </div>
                      <span className={styles.stepNumber}>
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepDesc}>{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FOOTER */}
          <footer className={styles.footer}>
            <div className={styles.footerInner}>
              <Logo size={styles.logoSmSize} />
              <span>© {new Date().getFullYear()} Tuntasin. Dibuat untuk warga.</span>
            </div>
          </footer>
        </div>
      </div>
    </ReactLenis>
  );
}