import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../api/authApi";
import { useAppDispatch } from "../app/hooks";
import LoginForm, { type LoginFormValues } from "../components/auth/LoginForm";
import { setCredentials } from "../features/auth/authSlice";
import { getApiErrorMessage } from "../utils/get-error-message";
import styles from "./login-page.module.css";

const LOGIN_FAILED_MESSAGE = "Unable to log in. Please check your credentials and try again.";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit({ email, password }: LoginFormValues) {
    setErrorMessage(null);

    try {
      const { token, user } = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token, user }));
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, LOGIN_FAILED_MESSAGE));
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>LOGO</div>
        <h1 className={styles.title}>IVOverflow</h1>
        <LoginForm onSubmit={handleSubmit} isSubmitting={isLoading} errorMessage={errorMessage} />
      </div>
    </main>
  );
}
