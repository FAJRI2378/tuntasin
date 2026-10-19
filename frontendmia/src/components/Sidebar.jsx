import styles from "../css/components/Sidebar.module.css";
import logo from "../assets/icon.svg";
import { Plus } from "lucide-react";

export default function SideBar() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <img src={logo} alt="" />
        </div>
        <div className={styles.create}>
          <div className={styles.createTop}></div>
          <div className={styles.createButton}>
            <Plus size={16} /> <div>Create Submission</div>
          </div>
          <div className={styles.createBottom}></div>
        </div>
        <div className={styles.reports}>
          <div className={styles.reportsLabel}>Submission</div>
          <div className={styles.reportsWrapper}>
            <div className={styles.reportsItem}>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
