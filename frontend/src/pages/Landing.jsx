import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="container">
      <h1>SplitEase</h1>

      <Link to="/login">
        <button className="btn">Login</button>
      </Link>

      <Link to="/signup">
        <button className="btn">Sign Up</button>
      </Link>
    </div>
  );
}