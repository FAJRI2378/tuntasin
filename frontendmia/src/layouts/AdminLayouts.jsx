import { Navigate, Outlet, useNavigate } from "react-router-dom";
import styles from "../css/pages/Admin.module.css";
import SidebarAdmin from "../components/SidebarAdmin";
import { useEffect, useState } from "react";
import api from "../js/api";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsLoading(false);
          return;
        }
        console.log("l");

        const response = await api.get("/check");
        const data = response.data;

        if (!data.is_admin) {
          if (!data.valid) {
            navigate("/login");
          } else {
            navigate("/");
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
    return <div style={{ textAlign: "center", marginTop: "50px" }}>O</div>;
  }

  return (
    <div className={styles.layoutContainer}>
      <SidebarAdmin />

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
