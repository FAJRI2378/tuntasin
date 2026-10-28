import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  FileText,
  Sidebar,
} from "lucide-react";
import styles from "../css/pages/Admin.module.css";
import icon from "../assets/iconSimple.svg";
import SidebarAdmin from "../components/SidebarAdmin";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();



  return (
    <div className={styles.layoutContainer}>
      <SidebarAdmin />

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
