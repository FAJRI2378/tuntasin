import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../js/api";    
import {
  ArrowRight,
  Map,
  Activity,
  Megaphone,
  ShieldCheck,
  FileText,
  MapPin,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Camera,
  Users,
} from "lucide-react";

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

export default function LandingPage() {
  const [stats, setStats] = useState([
    { value: "...", label: "Laporan masuk" },
    { value: "...", label: "Terselesaikan" },
    { value: "...", label: "Dukungan warga" },
    { value: "...", label: "Rata-rata respons" },
  ]);

  useEffect(() => {
    // Memanggil endpoint menggunakan instance api yang sudah terkonfigurasi
    api.get("landing-stats")
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
            {/* ROUTING: Tombol Daftar ke /register */}
            <Link 
              to="/register" 
              className="hidden sm:block text-sm font-semibold opacity-80 transition hover:opacity-100"
            >
              Daftar
            </Link>
            {/* ROUTING: Tombol Masuk ke /login */}
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
          {/* ROUTING: Tombol Buat Laporan ke /create */}
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
          {/* ROUTING: Tombol Eksplorasi ke /heatmap */}
          <Link 
            to="/heatmap"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/60 px-8 py-4 text-base font-bold backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/90"
          >
             Eksplorasi Peta
          </Link>
        </div>

        {/* --- HERO PREVIEW CARD --- */}
        <div className="relative mt-16 w-full max-w-4xl">
          <div className="rounded-[2rem] border border-white/70 bg-white/55 p-3 shadow-[0_30px_80px_rgba(19,55,106,0.18)] backdrop-blur-xl">
            <div className="relative h-[300px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6EBFF] to-[#CDD6FF] md:h-[360px]">
              {/* grid peta */}
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(19,55,106,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(19,55,106,0.10) 1px, transparent 1px)",
                  backgroundSize: "44px 44px",
                }}
              />
              {/* jalan */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 800 360"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M-10 250 C 150 200, 250 300, 420 220 S 700 120, 820 170"
                  stroke="white"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M180 -10 C 220 100, 300 140, 340 380"
                  stroke="white"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>
              {/* heat blobs */}
              <div className="absolute left-[18%] top-[48%] h-40 w-40 rounded-full bg-[#13376A]/50 blur-3xl" />
              <div className="absolute left-[52%] top-[28%] h-32 w-32 rounded-full bg-[#13376A]/35 blur-3xl" />
              <div className="absolute left-[72%] top-[58%] h-28 w-28 rounded-full bg-[#1FC468]/40 blur-3xl" />

              {/* pins */}
              <div className="floaty absolute left-[22%] top-[40%]">
                <MapPin size={34} fill={C.navy} color="white" />
              </div>
              <div
                className="floaty absolute left-[55%] top-[22%]"
                style={{ animationDelay: "1s" }}
              >
                <MapPin size={30} fill={C.navy} color="white" />
              </div>
              <div
                className="floaty absolute left-[75%] top-[52%]"
                style={{ animationDelay: "2s" }}
              >
                <MapPin size={30} fill={C.green} color="white" />
              </div>

              {/* kartu laporan */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 sm:left-auto sm:w-72">
                <div className="rounded-2xl border border-white/80 bg-white/90 p-4 text-left shadow-lg backdrop-blur">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold">Jalan Berlubang · Depok</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: C.green }}
                    >
                      Diproses
                    </span>
                  </div>
                  <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-[#C0CBFF]/60">
                    <div
                      className="h-full w-2/3 rounded-full"
                      style={{ background: C.green }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs opacity-70">
                    <ThumbsUp size={12} /> 248 dukungan warga
                  </div>
                </div>
              </div>
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
      <section id="fitur" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
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

        <div className="grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {/* Card 1: Heatmap */}
          <div className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_20px_50px_rgba(19,55,106,0.15)] md:col-span-2">
            <div className="absolute right-6 top-6 grid grid-cols-6 gap-2 opacity-70 transition-transform duration-500 group-hover:scale-105">
              {Array.from({ length: 24 }).map((_, i) => {
                const levels = [0.12, 0.25, 0.45, 0.7, 1];
                const l = levels[(i * 7 + (i % 5)) % 5];
                return (
                  <span
                    key={i}
                    className="h-6 w-6 rounded-md"
                    style={{ background: C.navy, opacity: l }}
                  />
                );
              })}
            </div>
            <div className="relative z-10">
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
                style={{
                  background: "rgba(19,55,106,0.08)",
                  borderColor: "rgba(19,55,106,0.15)",
                }}
              >
              </div>
              <h3 className="mb-2 text-2xl font-bold">Pemetaan Prioritas Heatmap</h3>
              <p className="max-w-md opacity-70">
                Visualisasi titik kerusakan infrastruktur secara real-time. Area
                dengan warna tergelap menandakan urgensi tertinggi berdasarkan jumlah
                laporan dan dukungan warga.
              </p>
            </div>
          </div>

          {/* Card 2: Voting */}
          <div className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_20px_50px_rgba(19,55,106,0.15)]">
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
          <div className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_20px_50px_rgba(19,55,106,0.15)]">
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
            className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-white/10 p-8 text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(19,55,106,0.45)] md:col-span-2"
            style={{ background: C.navy }}
          >
            <div className="absolute right-8 top-8 flex flex-col gap-3 opacity-90">
              {[
                { icon: Clock, t: "Menunggu Verifikasi", done: true },
                { icon: FileText, t: "Dalam Pengerjaan", done: true },
                { icon: CheckCircle2, t: "Selesai", done: false },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur"
                >
                  <s.icon
                    size={16}
                    color={s.done ? C.green : "rgba(255,255,255,0.5)"}
                  />
                  {s.t}
                </div>
              ))}
            </div>
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <Activity size={24} color={C.green} />
              </div>
              <h3 className="mb-2 text-2xl font-bold">Pantau Progres Real-Time</h3>
              <p className="max-w-md text-white/75">
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