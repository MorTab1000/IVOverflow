import { useId } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../ui/Button";
import { logout, selectCurrentUser } from "../../features/auth/authSlice";
import styles from "./AppHeader.module.css";

export interface AppHeaderProps {
  onAskQuestion: () => void;
}

export default function AppHeader({ onAskQuestion }: AppHeaderProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const gradientId = useId();

  function handleLogout() {
    dispatch(logout());
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand} aria-label="IVOverflow home">
        <svg
          className={styles.brandIcon}
          width="36"
          height="36"
          viewBox="0 0 40 40"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5aa0e6" />
              <stop offset="100%" stopColor="#264d73" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="10" fill={`url(#${gradientId})`} />
          <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="700" fill="#ffffff">
            IV
          </text>
        </svg>
        <span className={styles.brandText}>Overflow</span>
      </Link>

      {/* Placeholder — wired up to real question filtering in a later step */}
      <input
        type="search"
        className={styles.search}
        placeholder="Search"
        disabled
        aria-label="Search questions"
      />

      <div className={styles.actions}>
        <Button type="button" onClick={onAskQuestion} className={styles.askButton}>
          Ask question
        </Button>

        {currentUser && <span className={styles.userName}>{currentUser.nickname}</span>}

        <button type="button" className={styles.logoutButton} onClick={handleLogout}>
          logout
        </button>
      </div>
    </header>
  );
}
