import styles from "../css/components/Sidebar.module.css";
import logo from "../assets/icon.svg";
import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom"; // 1. Import Link

export default function SideBar() {
  const [open, setOpen] = useState(true);

  return (
    <div className={clsx(styles.container, !open ? styles.close : "")}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <img src={logo} alt="" />
          <div
            className={styles.logoIcon}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <PanelLeftClose /> : <PanelLeftOpen />}
          </div>
        </div>
        <div className={styles.create}>
          <div className={styles.createTop}></div>
          
          {/* 2. Ubah div menjadi Link ke /create */}
          <Link to="/create" className={styles.createButton}>
            <Plus size={16} /> <div>Create Submission</div>
          </Link>

          <div className={styles.createBottom}></div>
        </div>
        <div className={styles.reports}>
          <div className={styles.reportsLabel}>Submission</div>
          <div className={styles.reportsWrapper}>
            <div className={styles.reportsItem}>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}