import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      {user ? (
        <div className="profile-details">
          <p>
            <strong>Username:</strong> {user.username || "—"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "—"}
          </p>
        </div>
      ) : (
        <p>No profile data available.</p>
      )}
      <button type="button" onClick={logout}>
        Log Out
      </button>
    </div>
  );
}
