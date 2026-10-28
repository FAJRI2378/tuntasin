import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, LogOut, FileText, Sidebar } from "lucide-react";
import styles from "../css/pages/Admin.module.css";
import icon from "../assets/iconSimple.svg";
import SidebarAdmin from "../components/SidebarAdmin";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.layoutContainer}>
      <SidebarAdmin/>
      {/* Sidebar Admin */}
      <aside className={styles.sidebar}>
        <div className={styles.logoWrapper}>
          <img src={icon} alt="Logo" style={{ height: "32px" }} />
          <span className={styles.logoText}>TUNTASIN.</span>
        </div>

        <nav className={styles.navMenu}>
          <Link 
            to="/admin" 
            className={`${styles.navItem} ${location.pathname === "/admin" ? styles.navItemActive : ""}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            to="/admin/categories" 
            className={`${styles.navItem} ${location.pathname === "/admin/categories" ? styles.navItemActive : ""}`}
          >
            <FolderKanban size={20} />
            Kategori
          </Link>
          <Link 
            to="/" 
            className={styles.navItem}
          >
           
          </Link>
        </nav>

        <div className={styles.navItem} onClick={handleLogout} style={{ color: "#ef4444", marginTop: "auto" }}>
          <LogOut size={20} />
          Sign Out
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className={styles.mainContent}>
        <Outlet /> {/* Komponen seperti AdminDashboard akan dirender di sini */}
      </main>
    </div>
  );
}