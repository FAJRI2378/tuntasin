import styles from "../css/components/SplashIntro.module.css"
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
    className={styles.container}
      style={{
        transform: isExiting ? "translateY(-100%)" : "translateY(0)",
        pointerEvents: isExiting ? "none" : "auto",
      }}
    >
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className={styles.video}
      >
        <source src="/intro.mp4" type="video/mp4" />
        Browser Anda tidak mendukung video HTML5.
      </video>

    </div>
  );
}