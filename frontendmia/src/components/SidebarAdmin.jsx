import styles from "../css/components/SidebarAdmin.module.css";
import icon from "../assets/iconSimple.svg";
import logo from "../assets/icon.svg";
import { EllipsisVertical, PanelLeftClose, PanelLeftOpen, Pen, Plus, LogIn, LogOut, User, LayoutDashboard, FolderKanban, File } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import api from "../js/api"; // Pastikan path import api sudah benar

export default function SidebarAdmin() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const response = await api.get("submissions");
        setSubmissions(response.data.data || response.data);
      } catch (error) {
        console.error("Gagal memuat submissions:", error);
      }
    }
    fetchSubmissions();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    navigate("/login");
  };

  const navLink = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin"
    },
    {
      label: "Submission",
      icon: File,
      path: "/admin/submission"
    },
    {
      label: "Category",
      icon: FolderKanban,
      path: "/admin/categories"
    }
  ]

  return (
    <div className={clsx(styles.container, !open ? styles.close : "")}>
      <div className={styles.content}>
        
        <div className={styles.topWrapper}>
          <div className={styles.logoWrapper}>
            <img src={icon} alt="" className={styles.icon} />
            <img src={logo} alt="" className={styles.logo} />
          </div>
          <div
            className={styles.logoIcon}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <PanelLeftClose /> : <PanelLeftOpen />}
          </div>
        </div>

        <nav className={styles.navMenu}>
          {
            navLink.map((item) => {
              return <div className={clsx(styles.navItem, item.path === location.pathname && styles.navItemActive)} onClick={() => navigate(item.path)}>
                <item.icon size={20} />
                {item.label}
              </div>
            })
          }
        </nav>

        <div className={styles.account} ref={dropdownRef}>
          {user ? (
            <div className={styles.accContent}>
              <div className={styles.accLeft}>
                <User size={18} style={{ marginRight: '8px', opacity: 0.7 }} />
                <div className={styles.accName}>
                  {user.name || user.username || "User"}
                </div>
              </div>
              <div 
                className={styles.accRight} 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              >
                <EllipsisVertical size={16}/>
              </div>

              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              <LogIn size={18} />
              <span>Log in</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}