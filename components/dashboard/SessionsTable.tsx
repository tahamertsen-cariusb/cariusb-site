"use client";
import { LogOut, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";

const mockSessions = [
  { id: "s1", device: "MacBook Pro", agent: "Chrome 129", ip: "192.168.1.5", lastSeen: "2m ago", status: "active" as const },
  { id: "s2", device: "iPhone 15", agent: "Safari iOS", ip: "192.168.1.8", lastSeen: "1h ago", status: "active" as const },
];

/**
 * SessionsTable - Table with Device, Agent, IP, Last Seen, Action columns
 * Includes "Sign out all" button and proper table markup for a11y
 */
export function SessionsTable() {
  const handleSignOut = (sessionId: string) => {
    console.log(`Sign out session: ${sessionId}`);
    // Stub: No-op for now
  };

  const handleSignOutAll = () => {
    console.log("Sign out all sessions");
    // Stub: No-op for now
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("mobile")) {
      return <Smartphone className="w-4 h-4 text-text2" aria-hidden="true" />;
    }
    return <Monitor className="w-4 h-4 text-text2" aria-hidden="true" />;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-text1">Active Sessions</h2>
        {mockSessions.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSignOutAll}
            className="flex items-center gap-2"
            aria-label="Sign out all sessions"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Sign out all</span>
          </Button>
        )}
      </div>

      {mockSessions.length === 0 ? (
        <p className="text-sm text-text2">No active sessions</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Active sessions">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--color-stroke)" }}>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text2 uppercase tracking-wider">Device</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text2 uppercase tracking-wider">Agent</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text2 uppercase tracking-wider">IP</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text2 uppercase tracking-wider">Last Seen</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text2 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockSessions.map((session) => (
                <tr
                  key={session.id}
                  className="border-b hover:bg-surface-2/50 transition-colors"
                  style={{ borderColor: "var(--color-stroke)" }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device)}
                      <span className="text-sm text-text1">{session.device}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-text2">{session.agent}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-text2 font-mono">{session.ip}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text2">{session.lastSeen}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        session.status === "active" 
                          ? "bg-success/20 text-success border border-success/30" 
                          : "bg-text2/20 text-text2 border border-text2/30"
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSignOut(session.id)}
                      className="flex items-center gap-2"
                      aria-label={`Sign out ${session.device}`}
                    >
                      <LogOut className="w-3 h-3" aria-hidden="true" />
                      <span>Sign out</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}

