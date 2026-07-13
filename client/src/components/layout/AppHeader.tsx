import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Button from "../ui/Button";
import { logout, selectCurrentUser } from "../../features/auth/authSlice";
import styles from "./AppHeader.module.css";

export default function AppHeader() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  function handleLogout() {
    dispatch(logout());
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>LOGO</div>

      {/* Placeholder — wired up to real question filtering in a later step */}
      <input
        type="search"
        className={styles.search}
        placeholder="Search"
        disabled
        aria-label="Search questions"
      />

      <div className={styles.actions}>
        {/* Placeholder — opens AskQuestionModal once it exists (Step 5) */}
        <Button type="button" disabled className={styles.askButton}>
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
