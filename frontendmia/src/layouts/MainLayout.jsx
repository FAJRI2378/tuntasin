import { useEffect, useState } from "react";
import SideBar from "../components/Sidebar";
import SplashIntro from "../components/SplashIntro";
import styles from "../css/layouts/MainLayout.module.css";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await api.get("/check");
        const data = response.data;

        if (data.is_admin) {
          if (!data.valid) {
            navigate("/login");
          } else {
            navigate("/admin");
          }
        }
      } catch (error) {
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  if (isLoading) {
    return;
  }

  return (
    <div className={styles.container}>
      <SplashIntro />
      <SideBar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
