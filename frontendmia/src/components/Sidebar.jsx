import styles from "../css/components/Sidebar.module.css";
import icon from "../assets/iconSimple.svg";
import logo from "../assets/icon.svg";
import { EllipsisVertical, PanelLeftClose, PanelLeftOpen, Pen, Plus } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useSubmission } from "../contexts/SubmissionContext";

export default function SideBar() {
  const [open, setOpen] = useState(true);
  const { submission } = useSubmission()

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
        <div className={styles.create}>
          <div className={styles.createTop}></div>
          <div className={styles.createButton}>
            <Plus /> <div>Create Submission</div>
          </div>
          <div className={styles.createBottom}></div>
        </div>
        <div className={styles.reports}>
          <div className={styles.reportsLabel}>Recent Submissions</div>
          <div className={styles.reportsWrapper}>
            <div className={styles.reportsItem}>
              <div className={styles.report}>
                <div className={styles.reportName}>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>
                <div className={styles.reportEdit}>
                  <Pen size={12} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.account}>
          <div className={styles.accContent}>
            <div className={styles.accLeft}>
              <div className={styles.accName}>
                Kim ilahi
              </div>
            </div>
            <div className={styles.accRight}>
              <EllipsisVertical size={14}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
