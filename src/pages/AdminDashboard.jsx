import { useQuery, gql } from "@apollo/client";
import Navbar from "../components/Navbar.jsx";
import Chat from "../components/Chat.jsx";
import { useAuth } from "../context/AuthContext";

const GET_ALL_USERS = gql`
  query {
    getAllUsers {
      id
      name
      email
      isSuspicious
      role { name }
    }
  }
`;

const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($limit: Int) {
    getAuditLogs(limit: $limit) {
      id
      userId
      action
      entity
      timestamp
    }
  }
`;

const GET_SUSPICIOUS_USERS = gql`
  query {
    getSuspiciousUsers {
      id
      name
      email
    }
  }
`;

export default function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === "Admin";

  const { data: usersData, loading: usersLoading } = useQuery(GET_ALL_USERS, {
    pollInterval: 10000
  });

  const { data: logsData, loading: logsLoading } = useQuery(GET_AUDIT_LOGS, {
    variables: { limit: 100 },
    pollInterval: 5000
  });

  const { data: suspiciousData } = useQuery(GET_SUSPICIOUS_USERS, {
    pollInterval: 5000
  });

  const allUsers = usersData?.getAllUsers || [];
  const auditLogs = logsData?.getAuditLogs || [];
  const suspiciousUsers = suspiciousData?.getSuspiciousUsers || [];

  const formatTimestamp = (ts) => {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString("ro-RO", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  };

  const getUserName = (userId) => {
    const u = allUsers.find(u => u.id === userId);
    return u ? u.name : userId.substring(0, 8) + "...";
  };

  const getActionColor = (action) => {
    if (action === "DELETE") return "#ff3b30";
    if (action === "CREATE") return "#34c759";
    if (action === "UPDATE") return "#ff9500";
    return "#8e8e93";
  };

  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="header-row">
          <div>
            <h1>🛡️ Admin Dashboard</h1>
            <p className="subtitle">User management, audit logs & security monitoring</p>
          </div>
        </div>

        {/* === SECTION 1: ALL USERS === */}
        <div className="premium-card" style={{ marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>👥</span>
            All Registered Users
            <span style={{
              background: "#333", padding: "2px 10px", borderRadius: "12px",
              fontSize: "13px", fontWeight: 600, color: "#aaa"
            }}>
              {allUsers.length} total
            </span>
          </h3>

          {usersLoading ? (
            <p style={{ color: "#888" }}>Loading users...</p>
          ) : (
            <div className="admin-table-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} style={{
                      borderBottom: "1px solid #222",
                      background: u.isSuspicious ? "rgba(255, 59, 48, 0.08)" : "transparent"
                    }}>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: "#aaa" }}>{u.email}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          background: u.role?.name === "Admin" ? "rgba(255, 149, 0, 0.2)" : "rgba(52, 199, 89, 0.15)",
                          color: u.role?.name === "Admin" ? "#ff9500" : "#34c759",
                          border: `1px solid ${u.role?.name === "Admin" ? "#ff950044" : "#34c75944"}`
                        }}>
                          {u.role?.name || "Unknown"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {u.isSuspicious ? (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700,
                            background: "rgba(255, 59, 48, 0.2)", color: "#ff3b30",
                            border: "1px solid #ff3b3044"
                          }}>
                            ⚠️ FLAGGED
                          </span>
                        ) : (
                          <span style={{ color: "#34c759", fontSize: "13px", fontWeight: 600 }}>✓ Clean</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* === SECTION 2: AUDIT LOG === */}
        <div className="premium-card" style={{ marginBottom: "24px" }}>
          <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>📋</span>
            Audit Log
            <span style={{
              background: "#333", padding: "2px 10px", borderRadius: "12px",
              fontSize: "13px", fontWeight: 600, color: "#aaa"
            }}>
              Last {auditLogs.length} actions
            </span>
          </h3>

          {logsLoading ? (
            <p style={{ color: "#888" }}>Loading logs...</p>
          ) : auditLogs.length === 0 ? (
            <p style={{ color: "#888", fontSize: "14px" }}>No actions recorded yet.</p>
          ) : (
            <div className="admin-table-scroll" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #333", textAlign: "left", position: "sticky", top: 0, background: "#1a1a1a" }}>
                    <th style={thStyle}>Timestamp</th>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Action</th>
                    <th style={thStyle}>Entity</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #222" }}>
                      <td style={tdStyle}>
                        <span style={{ color: "#888", fontSize: "13px", fontFamily: "monospace" }}>
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600 }}>{getUserName(log.userId)}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          color: getActionColor(log.action),
                          background: `${getActionColor(log.action)}22`,
                          border: `1px solid ${getActionColor(log.action)}44`
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: "#ccc" }}>{log.entity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* === SECTION 3: SUSPICIOUS USERS (OBSERVATION LIST) === */}
        <div className="premium-card" style={{
          background: suspiciousUsers.length > 0
            ? "rgba(255, 59, 48, 0.08)"
            : "rgba(52, 199, 89, 0.05)",
          border: suspiciousUsers.length > 0
            ? "1px solid rgba(255, 59, 48, 0.3)"
            : "1px solid rgba(52, 199, 89, 0.2)"
        }}>
          <h3 style={{
            marginBottom: "16px",
            display: "flex", alignItems: "center", gap: "10px",
            color: suspiciousUsers.length > 0 ? "#ff3b30" : "#34c759"
          }}>
            <span style={{ fontSize: "20px" }}>
              {suspiciousUsers.length > 0 ? "🚨" : "✅"}
            </span>
            Observation List (Suspicious Activity Detection)
            <span style={{
              background: suspiciousUsers.length > 0 ? "rgba(255,59,48,0.2)" : "#333",
              padding: "2px 10px", borderRadius: "12px",
              fontSize: "13px", fontWeight: 600,
              color: suspiciousUsers.length > 0 ? "#ff3b30" : "#aaa"
            }}>
              {suspiciousUsers.length} flagged
            </span>
          </h3>

          {suspiciousUsers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {suspiciousUsers.map((u) => (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px", borderRadius: "10px",
                  background: "rgba(255, 59, 48, 0.1)",
                  border: "1px solid rgba(255, 59, 48, 0.2)"
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#fff" }}>{u.name}</div>
                    <div style={{ color: "#999", fontSize: "13px" }}>{u.email}</div>
                  </div>
                  <span style={{
                    padding: "5px 14px", borderRadius: "8px",
                    fontSize: "12px", fontWeight: 800, letterSpacing: "1px",
                    background: "rgba(255, 59, 48, 0.25)", color: "#ff3b30",
                    border: "1px solid #ff3b3055",
                    animation: "pulse 2s infinite"
                  }}>
                    ⚠️ SUSPICIOUS
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
              <p style={{ color: "#34c759", fontWeight: 600, fontSize: "16px" }}>
                No suspicious activity detected
              </p>
              <p style={{ color: "#888", fontSize: "13px", marginTop: "5px" }}>
                The system monitors all user actions in real-time
              </p>
            </div>
          )}
        </div>

        <Chat />
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
}

const thStyle = {
  padding: "10px 14px",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "#888"
};

const tdStyle = {
  padding: "12px 14px",
  fontSize: "14px"
};
