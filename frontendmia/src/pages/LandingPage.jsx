import React, { useState, useEffect } from "react";
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
} from "lucide-react";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSubmission } from "../contexts/SubmissionContext";
import SplashIntro from "../components/SplashIntro";

/* Palet diambil dari logo Tuntasin */
const C = {
  bg: "#C0CBFF", // periwinkle
  navy: "#13376A",
  green: "#1FC468",
};

function Logo({ size = "text-2xl" }) {
  return (
    <span
      className={`${size} font-extrabold tracking-tight leading-none`}
      style={{ color: C.navy, fontFamily: "'Poppins', sans-serif" }}
    >
      tuntas
      <span className="relative inline-block">
        <span style={{ fontFamily: "'Poppins', sans-serif" }}>ı</span>
        <span
          className="absolute rounded-full"
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
            <strong style={{ fontSize: "1rem", display: "block", marginBottom: "4px" }}>
              {item.label}
            </strong>
            {popupDetail && (
              <p style={{ fontSize: "0.8rem", margin: "0 0 6px 0", color: "#334155" }}>
                {item.description}
              </p>
            )}
            <div style={{ fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "2px" }}>
              {popupDetail && <span>📍 {item.location}</span>}
              <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                🔥 {votes} Dukungan (Vote)
              </span>
              {popupDetail && (
                <span style={{ textTransform: "uppercase", fontWeight: "bold", color: "#2563eb" }}>
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

  const { submission, setSubmission } = useSubmission();

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
          { value: data.rata_rata_respons || "1-3 hari", label: "Rata-rata respons" },
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
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden selection:bg-[#1FC468]/30"
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

      {/* --- BACKGROUND SOFT GLOW --- */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -top-32 -left-24 h-[460px] w-[460px] rounded-full bg-white/40 blur-[110px]" />
        <div
          className="absolute top-1/3 -right-24 h-[420px] w-[420px] rounded-full blur-[120px]"
          style={{ background: "rgba(31,196,104,0.18)" }}
        />
        <div className="absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-[#8FA2FF]/40 blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/60 bg-white/50 px-5 py-3 shadow-[0_8px_30px_rgba(19,55,106,0.10)] backdrop-blur-xl">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#fitur" className="opacity-70 transition hover:opacity-100">
              Fitur
            </a>
            <a href="#cara-kerja" className="opacity-70 transition hover:opacity-100">
              Cara Kerja
            </a>
            <a href="#dampak" className="opacity-70 transition hover:opacity-100">
              Dampak
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="hidden sm:block text-sm font-semibold opacity-80 transition hover:opacity-100"
            >
              Daftar
            </Link>
            <Link
              to="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(19,55,106,0.35)]"
              style={{ background: C.navy }}
            >
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-36 pb-16 text-center">
        <h1 className="mb-6 text-5xl font-extrabold leading-[1.08] tracking-tight md:text-7xl">
          Wujudkan Infrastruktur
          <br />
          <span className="relative inline-block">
            Lebih Baik, Bersama
            <span style={{ color: C.green }}>.</span>
            <svg
              className="absolute -bottom-2 left-0 w-full"
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

        <p className="mb-10 max-w-2xl text-lg leading-relaxed opacity-75">
          Platform kolaboratif yang menghubungkan masyarakat dan pemerintah secara
          transparan. Laporkan kerusakan, tentukan prioritas bersama lewat voting,
          dan pantau progres perbaikannya secara real-time.
        </p>

        <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/create"
            className="group flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(19,55,106,0.35)]"
            style={{ background: C.navy }}
          >
            Mulai Buat Laporan
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            to="/heatmap"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/60 px-8 py-4 text-base font-bold backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/90"
          >
            Eksplorasi Peta
          </Link>
        </div>

        {/* --- HERO PREVIEW CARD (PETA ASLI) --- */}
        <div className="relative mt-16 w-full max-w-4xl z-0">
          <div className="rounded-[2rem] border border-white/70 bg-white/55 p-3 shadow-[0_30px_80px_rgba(19,55,106,0.18)] backdrop-blur-xl">
            <div className="relative isolate h-[350px] w-full overflow-hidden rounded-3xl md:h-[450px]">
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
      <section id="dampak" className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/70 bg-white/50 p-6 backdrop-blur-xl md:grid-cols-4 md:p-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold md:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm opacity-65">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- BENTO FEATURES --- */}
      <section id="fitur" className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-12 text-center">
          <p
            className="mb-2 text-sm font-bold uppercase tracking-widest"
            style={{ color: C.green }}
          >
            Fitur Unggulan
          </p>
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Semua yang kamu butuhkan
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 md:auto-rows-[minmax(280px,auto)]">
          {/* Card 1: Heatmap (teks + peta) */}
          <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/55 backdrop-blur-xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(19,55,106,0.15)] md:col-span-2 md:flex-row">
            {/* Teks */}
            <div className="order-2 flex flex-col justify-end p-6 md:order-1 md:w-1/2 md:p-8">
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
                style={{
                  background: "rgba(19,55,106,0.08)",
                  borderColor: "rgba(19,55,106,0.15)",
                }}
              >
                <MapIcon size={24} color={C.navy} />
              </div>
              <h3 className="mb-2 text-xl font-bold md:text-2xl">
                Pemetaan Prioritas Heatmap
              </h3>
              <p className="text-sm opacity-70">
                Visualisasi titik kerusakan infrastruktur secara real-time. Warna
                dan ukuran titik menandakan urgensi berdasarkan status dan dukungan
                warga.
              </p>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
                {legend.map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Peta */}
            <div className="relative isolate order-1 h-56 md:order-2 md:h-auto md:min-h-[280px] md:w-1/2">
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
          <div className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_20px_50px_rgba(19,55,106,0.15)] md:p-8">
            <div className="relative z-10">
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
                style={{
                  background: "rgba(31,196,104,0.12)",
                  borderColor: "rgba(31,196,104,0.3)",
                }}
              >
                <Megaphone size={24} color={C.green} />
              </div>
              <h3 className="mb-2 text-xl font-bold">Sistem Voting Warga</h3>
              <p className="text-sm opacity-70">
                Berikan suaramu pada laporan paling krusial agar segera ditindaklanjuti
                oleh pihak berwenang.
              </p>
            </div>
          </div>

          {/* Card 3: Transparansi */}
          <div className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_20px_50px_rgba(19,55,106,0.15)] md:p-8">
            <div className="relative z-10">
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
                style={{
                  background: "rgba(19,55,106,0.08)",
                  borderColor: "rgba(19,55,106,0.15)",
                }}
              >
                <ShieldCheck size={24} color={C.navy} />
              </div>
              <h3 className="mb-2 text-xl font-bold">Transparansi Penuh</h3>
              <p className="text-sm opacity-70">
                Akses terbuka terhadap dokumen perbaikan (PDF) dan catatan resmi dari
                tim lapangan.
              </p>
            </div>
          </div>

          {/* Card 4: Live tracking */}
          <div
            className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 p-6 text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(19,55,106,0.45)] md:col-span-2 md:p-8"
            style={{ background: C.navy }}
          >
            <div className="mb-6 flex flex-wrap gap-2 opacity-90 md:absolute md:right-8 md:top-8 md:mb-0 md:flex-col md:gap-3">
              {[
                { icon: Clock, t: "Menunggu Verifikasi", done: true },
                { icon: FileText, t: "Dalam Pengerjaan", done: true },
                { icon: CheckCircle2, t: "Selesai", done: false },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold backdrop-blur sm:gap-3 sm:px-4"
                >
                  <s.icon
                    size={16}
                    color={s.done ? C.green : "rgba(255,255,255,0.5)"}
                  />
                  {s.t}
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-auto">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <Activity size={24} color={C.green} />
              </div>
              <h3 className="mb-2 text-xl font-bold md:text-2xl">Pantau Progres Real-Time</h3>
              <p className="max-w-md text-sm text-white/75 md:text-base md:pr-48">
                Tidak ada lagi laporan yang menggantung. Lacak setiap perubahan status
                laporanmu dari "Menunggu Verifikasi" hingga "Selesai" langsung dari
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CARA KERJA --- */}
      <section id="cara-kerja" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <p
            className="mb-2 text-sm font-bold uppercase tracking-widest"
            style={{ color: C.green }}
          >
            Cara Kerja
          </p>
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Tiga langkah menuju tuntas
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-3xl border border-white/70 bg-white/55 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/80"
            >
              <span className="absolute right-6 top-4 text-6xl font-extrabold opacity-[0.07]">
                {i + 1}
              </span>
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{ background: i === 2 ? C.green : C.navy }}
              >
                <s.icon size={22} />
              </div>
              <h3 className="mb-2 text-xl font-bold">{s.title}</h3>
              <p className="text-sm leading-relaxed opacity-70">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 border-t border-[#13376A]/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm opacity-70 sm:flex-row">
          <Logo size="text-xl" />
          <span>© {new Date().getFullYear()} Tuntasin. Dibuat untuk warga.</span>
        </div>
      </footer>
    </div>
  );
}