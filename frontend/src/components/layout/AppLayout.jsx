import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useApiData } from "../../hooks/useApiData";
import { getWallet } from "../../services/walletService";
import { formatInr } from "../../utils/format";
import AnimatedNumber from "../common/AnimatedNumber";

export default function AppLayout() {
  const { data: wallet, loading, error } = useApiData(getWallet, []);

  return (
    <div className="app-shell">
      <Navbar />

      <div className="wallet-indicator">
        {loading && <span>Loading balance...</span>}
        {error && <span className="wallet-indicator-error">Balance unavailable</span>}
        {wallet && (
          <span>
            Virtual Cash: <AnimatedNumber value={wallet.virtualCash} format={formatInr} />
          </span>
        )}
      </div>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
