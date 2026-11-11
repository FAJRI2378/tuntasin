import styles from "../css/components/SplashIntro.module.css"
import { useState } from "react";

export default function SplashIntro({ onFinish }) {
  const [isExiting, setIsExiting] = useState(localStorage.getItem("intro") || false);

  const handleFinish = () => {
    setIsExiting(true);
    localStorage.setItem("intro", true)
    if (onFinish) onFinish();
  };

  return (
    <div
      className={styles.container}
      onClick={handleFinish} /* Klik di mana saja untuk skip jika video macet */
      style={{
        transform: isExiting ? "translateY(-100%)" : "translateY(0)",
        pointerEvents: isExiting ? "none" : "auto",
        transition: "transform 0.8s ease-in-out",
      }}
    >
      <video
        autoPlay
        muted
        playsInline
        onEnded={handleFinish}
        className={styles.video}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>
    </div>
  );
}