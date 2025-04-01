"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";  // To navigate the user to another page after successful signup
import { auth, firestore, doc, setDoc } from "../lib/firebase";  // Import Firebase auth and Firestore methods
import { createUserWithEmailAndPassword } from "firebase/auth";  // Firebase method to create a user
import styles from './signup.module.css';  // Import the CSS for styling

const SignupPage = () => {
  // States for holding user details and error messages
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();  // Next.js router to handle page navigation

  // Handle the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevent page reload on form submit

    // Clear any previous error
    setError("");

    try {
      // Firebase function to create a user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // After user creation, save additional user data to Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        name,
        age,
        jobTitle,
        email,
        createdAt: new Date().toISOString(),
      });

      // Redirect user to the login page after successful signup
      router.push("/login");  // Redirect to login page
    } catch (error: any) {
      // If there's an error (e.g., invalid email/password), display it to the user
      setError(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.header}>Create an Account</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

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

          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className={styles.button}>Sign Up</button>
        </form>

        {/* Display error message if any */}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default SignupPage;
