import { useEffect, useState } from "react";
import SideBar from "../components/Sidebar";
import styles from "../css/layouts/MainLayout.module.css";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../js/api";

export default function MainLayout() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        const response = await api.get("/check");
        const data = response.data;
        console.log(data);

        // Jika user yang login adalah Admin
        if (data.is_admin && data.valid) {
          // Admin sama sekali tidak boleh mengakses MainLayout (halaman warga)
          // Lempar paksa kembali ke halaman admin
          navigate("/admin", { replace: true });
          return;
        }
      } catch (error) {
        // Jika token invalid atau error saat pengecekan
        // Biarkan atau arahkan ke login jika diperlukan
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserRole();
  }, [navigate]);

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <SideBar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}