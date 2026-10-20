import { useState } from "react";

export default function SplashIntro({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleVideoEnd = () => {
    setIsExiting(true);
    // Jalankan callback setelah durasi animasi slide selesai (600ms)
    setTimeout(() => {
      onFinish();
    }, 600);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // Animasi Slide ke Atas
        transform: isExiting ? "translateY(-100%)" : "translateY(0)",
        opacity: isExiting ? 0.8 : 1,
        transition: "transform 0.6s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.6s ease",
        pointerEvents: isExiting ? "none" : "auto",
      }}
    >
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <source src="/intro.mp4" type="video/mp4" />
        Browser Anda tidak mendukung video HTML5.
      </video>

      <button
        onClick={handleVideoEnd}
        style={{
          position: "absolute",
          bottom: "30px",
          right: "30px",
          background: "rgba(255, 255, 255, 0.2)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          padding: "8px 18px",
          borderRadius: "20px",
          cursor: "pointer",
          backdropFilter: "blur(5px)",
        }}
      >
        Skip Intro
      </button>
    </div>
  );
}