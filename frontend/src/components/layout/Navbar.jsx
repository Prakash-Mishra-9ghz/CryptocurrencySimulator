import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Pill from "../common/Pill";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Crypto Simulator <Pill tone="primary">Simulated account</Pill>
      </div>

      <div className="navbar-links">
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/market">Market</NavLink>
        <NavLink to="/portfolio">Portfolio</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
      </div>

      <div className="navbar-user">
        <NavLink to="/profile">{user?.username || user?.email || "Profile"}</NavLink>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
