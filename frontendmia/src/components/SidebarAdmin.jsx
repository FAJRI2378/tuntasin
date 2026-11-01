import styles from "../css/components/SidebarAdmin.module.css";
import icon from "../assets/iconSimple.svg";
import logo from "../assets/icon.svg";
import { EllipsisVertical, PanelLeftClose, PanelLeftOpen, LogIn, LogOut, User, LayoutDashboard, FolderKanban, File, Flame } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { Link, useNavigate, useLocation } from "react-router-dom";

const MOBILE_QUERY = "(max-width: 800px)";

export default function SidebarAdmin() {
  const isMobileNow = () => window.matchMedia(MOBILE_QUERY).matches;

  const [isMobile, setIsMobile] = useState(isMobileNow);
  // Di HP sidebar mulai dalam keadaan tertutup (50px), di desktop terbuka
  const [open, setOpen] = useState(() => !isMobileNow());
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Sinkronkan state saat ukuran layar berubah (rotasi HP, resize window)
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => {
      setIsMobile(e.matches);
      setOpen(!e.matches);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
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

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setOpen(false); // tutup otomatis setelah pilih menu di HP
  };

  const navLink = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Submission", icon: File, path: "/admin/submission" },
    { label: "Category", icon: FolderKanban, path: "/admin/categories" },
    { label: "Peta Prioritas", icon: Flame, path: "/admin/heatmap" },
  ];

  return (
    <>
      {/* Backdrop: hanya tampil di HP saat sidebar terbuka (diatur lewat CSS) */}
      {open && isMobile && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />
      )}

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
              role="button"
              aria-label={open ? "Tutup sidebar" : "Buka sidebar"}
            >
              {open ? <PanelLeftClose /> : <PanelLeftOpen />}
            </div>
          </div>

          <nav className={styles.navMenu}>
            {navLink.map((item) => (
              <div
                key={item.path}
                className={clsx(styles.navItem, item.path === location.pathname && styles.navItemActive)}
                onClick={() => handleNavigate(item.path)}
                title={item.label}
                style={{ cursor: "pointer" }}
              >
                <item.icon size={20} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div className={styles.account} ref={dropdownRef}>
            {user ? (
              <div className={styles.accContent}>
                <div className={styles.accLeft}>
                  <User size={18} style={{ marginRight: "8px", opacity: 0.7, flexShrink: 0 }} />
                  <div className={styles.accName}>{user.name || user.username || "User"}</div>
                </div>
                <div
                  className={styles.accRight}
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ cursor: "pointer", padding: "4px", borderRadius: "4px" }}
                >
                  <EllipsisVertical size={16} />
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
              <Link to="/login" className={styles.loginBtn} title="Log in">
                <LogIn size={18} style={{ flexShrink: 0 }} />
                <span>Log in</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}