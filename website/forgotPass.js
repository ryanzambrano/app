import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("your_supabase_url", "your_supabase_anon_key");

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const resetPassword = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const { error } = await supabase.auth.update({ password });
      if (error) throw error;
      setMessage("Password has been updated!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>Reset Your Password</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={resetPassword}>Reset Password</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default ForgotPassword;
