import { useState } from "react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    // Email validation
    if (!email.includes("@") || !email.includes(".")) {
      alert("Enter a valid email");
      return;
    }

    // Password validation
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(
        "https://splitease-backend-0e77.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Signup Success");
        window.location.href = "/create-group";
      } else {
        alert(data.message || "Signup Failed");
      }
    } catch (error) {
      alert("Server Error");
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSignup} className="container">
      <h2>Signup</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit" className="btn">
        Signup
      </button>
    </form>
  );
}