"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";  // Correct import for Next.js App Directory
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore, doc, getDoc } from "../lib/firebase"; // Import Firebase functions
import styles from './login.module.css'; // Import CSS styles

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter(); // Router for navigation

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear any previous error

    try {
      // Firebase function to sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const docRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Serialize user data and pass it as a query parameter to the dashboard
        const userData = JSON.stringify(docSnap.data());
        
        // Manually create the query string
        const queryParams = new URLSearchParams({
          userData: userData,
        }).toString(); // Convert object to query string

        // Now, pass the query string along with the pathname
        router.push(`/dashboard?${queryParams}`);
      } else {
        setError("User does not exist.");
      }
    } catch (error: any) {
      // Handle error during login process
      setError(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.header}>Login</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.button}>Login</button>
        </form>

        {/* Display error message if any */}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
