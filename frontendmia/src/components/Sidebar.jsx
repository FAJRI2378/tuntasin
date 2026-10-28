import styles from "../css/components/Sidebar.module.css";
import icon from "../assets/iconSimple.svg";
import logo from "../assets/icon.svg";
// Tambahkan import ikon History di sini
import { EllipsisVertical, PanelLeftClose, PanelLeftOpen, Pen, Plus, LogIn, LogOut, User, History } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import api from "../js/api"; 

export default function SideBar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  // State untuk data submissions dan user
  const [submissions, setSubmissions] = useState([]);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Ambil data user dari localStorage saat komponen dimuat
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Ambil data submissions dari API Laravel
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

  // Menutup dropdown jika klik di luar elemen
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

  return (
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
          >
            {open ? <PanelLeftClose /> : <PanelLeftOpen />}
          </div>
        </div>

        {/* Create Button */}
        <div className={styles.create}>
          <div className={styles.createTop}></div>
          <Link to="/create" className={styles.createButton} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Plus /> <div>Create Submission</div>
          </Link>
          <div className={styles.createBottom}></div>
        </div>

        {/* TOMBOL BARU: Riwayat Submission */}
        <div style={{ padding: "0 15px", marginTop: "10px", marginBottom: "10px" }}>
          <Link 
            to="/history" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              padding: "10px 15px", 
              backgroundColor: "#1e293b", 
              color: "#cbd5e1", 
              borderRadius: "8px", 
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease-in-out"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#334155";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#1e293b";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            <History size={18} />
            <div>Riwayat Submission</div>
          </Link>
        </div>

        {/* Submissions List (Dinamis dari state) */}
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
                    <div className={styles.reportEdit}>
                      <Pen size={12} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '8px 12px', fontSize: '12px', opacity: 0.6 }}>
                Belum ada submission.
              </div>
            )}
          </div>
        </div>

        {/* Account / Login Section */}
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