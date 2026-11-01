import styles from "../css/components/Sidebar.module.css";
import icon from "../assets/iconSimple.svg";
import logo from "../assets/icon.svg";
import {
  EllipsisVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  LogIn,
  LogOut,
  User,
  Home,
  Trash2,
  Pen,
  Map,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../js/api";

const MOBILE_QUERY = "(max-width: 800px)";

export default function SideBar() {
  const isMobileNow = () => window.matchMedia(MOBILE_QUERY).matches;

  const [isMobile, setIsMobile] = useState(isMobileNow);
  // Terbuka di desktop, tertutup (50px) di HP
  const [open, setOpen] = useState(() => !isMobileNow());
  const navigate = useNavigate();
  const location = useLocation();

  // State untuk data submissions dan user
  const [submissions, setSubmissions] = useState([]);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // State untuk menu titik 3 pada tiap submission
  const [actionMenuId, setActionMenuId] = useState(null);
  const dropdownRef = useRef(null);

  // Sesuaikan state hanya saat melewati breakpoint (bukan di setiap resize,
  // supaya keyboard HP / address bar tidak menutup sidebar secara tiba-tiba)
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
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Mengambil data submissions dan memperbarui secara otomatis
  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const response = await api.get("submissions");
        const allData = response.data.data || response.data;

        const rawUser = localStorage.getItem("user");
        const parsedUser = rawUser ? JSON.parse(rawUser) : {};
        const currentUserId = parsedUser.id || parsedUser.user?.id;

        if (currentUserId) {
          const mySubmissions = allData.filter((item) => item.user_id == currentUserId);
          setSubmissions(mySubmissions);
        } else {
          setSubmissions([]);
        }
      } catch (error) {
        console.error("Gagal memuat submissions:", error);
      }
    }

    fetchSubmissions();

    window.addEventListener("submissionUpdated", fetchSubmissions);
    return () => {
      window.removeEventListener("submissionUpdated", fetchSubmissions);
    };
  }, [location.pathname]);

  // Menutup dropdown jika klik di luar elemen
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (!event.target.closest(".action-menu")) {
        setActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeOnMobile = () => {
    if (isMobile) setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    navigate("/login");
  };

  // --- FUNGSI HAPUS SUBMISSION ---
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus laporan ini?");
    if (!confirmDelete) return;

    try {
      await api.delete(`submissions/${id}`);

      setSubmissions((prev) => prev.filter((item) => item.id !== id));
      setActionMenuId(null);

      // Memicu event agar komponen lain (seperti Home) ikut memperbarui data
      window.dispatchEvent(new Event("submissionUpdated"));
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert("Gagal menghapus laporan.");
    }
  };

  const navBtn = [
    { path: "/", icon: Home, label: "Home", class: "home" },
    { path: "/create", icon: Plus, label: "Create Submission", class: "create" },
    { path: "/heatmap", icon: Map, label: "Peta Prioritas", class: "heatmap" },
  ];

  return (
    <>
      {/* Backdrop: hanya tampil di HP saat sidebar terbuka (diatur lewat CSS) */}
      {open && isMobile && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <div className={clsx(styles.container, !open ? styles.close : "")}>
        <div className={styles.content}>
          {/* Top / Logo */}
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

          <nav className={styles.sideButtons}>
            {navBtn.map((item) => (
              <div key={item.path} className={clsx(styles[item.class], item.path === location.pathname && styles.navBtnActive)}>
                <div className={styles.sideBtnTop}></div>
                <Link
                  to={item.path}
                  onClick={closeOnMobile}
                  title={item.label}
                  className={styles[item.class + "Button"]}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <item.icon /> <div>{item.label}</div>
                </Link>
                <div className={styles.sideBtnBottom}></div>
              </div>
            ))}
          </nav>

          {/* --- DAFTAR SUBMISSIONS --- */}
          <div className={styles.reports}>
            <div className={styles.reportsLabel}>Recent Submissions</div>
            <div className={styles.reportsWrapper}>
              {submissions.length > 0 ? (
                submissions.map((item) => (
                  <div key={item.id} className={styles.reportsItem}>
                    <div className={styles.report}>
                      <div className={styles.reportName} title={item.label}>
                        {item.label}
                      </div>

                      {/* MENU TITIK 3 (ACTION) */}
                      <div className="action-menu" style={{ position: "relative" }}>
                        <div
                          className={styles.reportEdit}
                          style={{ cursor: "pointer", padding: "4px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuId(actionMenuId === item.id ? null : item.id);
                          }}
                        >
                          <EllipsisVertical size={14} />
                        </div>

                        {actionMenuId === item.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute",
                              right: "-10px",
                              top: "22px",
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                              padding: "5px",
                              zIndex: 99999,
                              display: "flex",
                              flexDirection: "column",
                              gap: "5px",
                              minWidth: "90px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.5)",
                            }}
                          >
                            <button
                              onClick={() => {
                                navigate(`/edit/${item.id}`);
                                setActionMenuId(null);
                                closeOnMobile();
                              }}
                              style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", color: "#fff", border: "none", padding: "6px", cursor: "pointer", fontSize: "12px", borderRadius: "4px" }}
                              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <Pen size={12} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(item.id);
                                setActionMenuId(null);
                              }}
                              style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", color: "#ef4444", border: "none", padding: "6px", cursor: "pointer", fontSize: "12px", borderRadius: "4px" }}
                              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "8px 12px", fontSize: "12px", opacity: 0.6 }}>Belum ada submission.</div>
              )}
            </div>
          </div>

          {/* Account / Login Section */}
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
                      <LogOut size={14} /> <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className={styles.loginBtn} title="Log in" onClick={closeOnMobile}>
                <LogIn size={18} style={{ flexShrink: 0 }} /> <span>Log in</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}