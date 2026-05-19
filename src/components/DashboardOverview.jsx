import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api.js";
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';

const GET_SUSPICIOUS_USERS = gql`
  query {
    getSuspiciousUsers {
      id
      name
      email
    }
  }
`;

// A beautiful, professional, animated dashboard presentation
export default function DashboardOverview({ workouts }) {
  const [isRunning, setIsRunning] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'Admin';

  const { data: suspiciousData } = useQuery(GET_SUSPICIOUS_USERS, {
    skip: !isAdmin,
    pollInterval: 5000
  });

  // Poll backend status for simulation
  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const { running } = await api.getSimulationStatus();
        setIsRunning(running);
      } catch (err) {
        // Ignore offline errors
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      const res = await api.startSimulation();
      if (res.ok) {
        setIsRunning(true);
        window.dispatchEvent(new CustomEvent("fittrack:workouts-changed"));
      }
    } catch (err) {
      console.warn("Could not start simulation:", err);
    }
  };

  const handleStop = async () => {
    try {
      await api.stopSimulation();
      setIsRunning(false);
    } catch (err) {
      console.warn("Could not stop simulation:", err);
    }
  };

  // -- Doughnut Data Calculation (Dynamic from true backend workouts) -- 
  const counts = useMemo(() => {
    const obj = { Cardio: 0, Strength: 0, Flexibility: 0, "Full Body": 0, Other: 0 };
    workouts.forEach(w => {
      if (w.type && obj[w.type] !== undefined) {
         obj[w.type]++;
      } else {
         // Try to derive type from name if missing
         const n = (w.name || '').toLowerCase();
         if (n.includes('cardio') || n.includes('run') || n.includes('swim')) obj.Cardio++;
         else if (n.includes('strength') || n.includes('push') || n.includes('lift')) obj.Strength++;
         else if (n.includes('flex') || n.includes('mobil') || n.includes('stretch')) obj.Flexibility++;
         else if (n.includes('body') || n.includes('circuit')) obj["Full Body"]++;
         else obj.Other++;
      }
    });
    return obj;
  }, [workouts]);

  const totalChartWorkouts = workouts.length || 1; // prevent div by zero

  // SVG Doughnut Math
  const doughnutSegments = useMemo(() => {
     let offset = 0;
     const radius = 40;
     const circumference = 2 * Math.PI * radius; // ~251.2
     const colors = { Cardio: "#ff5e62", Strength: "#ff9966", Flexibility: "#26D0CE", "Full Body": "#00b4db", Other: "#bdc3c7" };
     
     return Object.entries(counts).map(([type, count]) => {
         const percentage = count / totalChartWorkouts;
         const dashLength = percentage * circumference;
         const emptySpace = circumference - dashLength;
         
         const segment = {
             type,
             count,
             color: colors[type],
             dasharray: `${Math.max(dashLength - 2, 0)} ${emptySpace + 2}`, // -2 for small gap effect
             dashoffset: -offset
         };
         offset += dashLength;
         return segment;
     }).filter(s => s.count > 0);
  }, [counts, totalChartWorkouts]);

  // -- Line Path Calculation --
  const linePoints = useMemo(() => {
    // Take the duration of the last 15 workouts
    const recent = workouts.slice(-15).map(w => w.duration || 0);
    if (recent.length === 0) return "10,70 L 190,70";
    
    // Auto-scale
    const maxDur = Math.max(...recent, 100);
    const width = 180;
    const height = 60;
    
    return recent.map((val, i) => {
      const x = 10 + (i / (recent.length > 1 ? recent.length - 1 : 1)) * width;
      const y = 70 - (val / maxDur) * height; // y goes down as value goes up
      return `${x},${y}`;
    }).join(" L ");
  }, [workouts]);
  
  const recentGraphPoints = workouts.slice(-15).map(w => w.duration || 0);
  const maxDur = Math.max(...recentGraphPoints, 100);

  return (
    <div className="premium-card advanced-dashboard">
      <div className="overview-header-simple">
        <div>
          <h3>Activity Analytics</h3>
          <p className="subtitle">Real-time health insights & progress</p>
        </div>
        <div className="controls-simple" style={{ gap: '10px', display: 'flex', alignItems: 'center' }}>
          <div className={`pulse-indicator ${isRunning ? 'active' : ''}`} />
          <button className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`} 
                  onClick={isRunning ? handleStop : handleStart}>
            {isRunning ? 'Stop Simulation' : 'Start Simulation'}
          </button>
        </div>
      </div>

      <div className="simple-charts-grid" style={{ marginTop: '20px' }}>
        {/* Doughnut Chart */}
        <div className="simple-chart-box">
          <h4>Workout Distribution</h4>
          <div className="simple-svg-wrap" style={{ position: 'relative' }}>
            <svg viewBox="0 0 100 100" className="simple-circle-animate" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(200,200,200,0.2)" strokeWidth="12" />
              {doughnutSegments.map(seg => (
                  <circle 
                    key={seg.type}
                    cx="50" cy="50" r="40" 
                    fill="none" 
                    stroke={seg.color} 
                    strokeWidth="12" 
                    strokeDasharray={seg.dasharray}
                    strokeDashoffset={seg.dashoffset}
                    style={{ transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
              ))}
            </svg>
            <div className="svg-center" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{workouts.length}</span>
              <small style={{ color: '#b8b8b8', fontWeight: 600 }}>Total</small>
            </div>
          </div>
          <div className="simple-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '15px' }}>
            {doughnutSegments.map(seg => (
              <div key={seg.type} className="legend-badge" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color }} />
                {seg.type}: {seg.count}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Line Graph */}
        <div className="simple-chart-box large">
          <h4>Recent Intensity Trend</h4>
          <div className="simple-svg-wrap" style={{ 
              background: 'linear-gradient(180deg, rgba(255, 106, 0, 0.05) 0%, rgba(255, 153, 102, 0) 100%)',
              borderRadius: '12px',
              border: '1px solid #333',
              padding: '10px',
              maxWidth: 'none'
            }}>
            <svg viewBox="0 0 200 80">
              <defs>
                 <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff5e62" />
                    <stop offset="100%" stopColor="#ff9966" />
                 </linearGradient>
              </defs>
              <line x1="10" y1="10" x2="190" y2="10" stroke="#333" strokeDasharray="2 4" strokeWidth="0.5" />
              <line x1="10" y1="40" x2="190" y2="40" stroke="#333" strokeDasharray="2 4" strokeWidth="0.5" />
              <line x1="10" y1="70" x2="190" y2="70" stroke="#333" strokeWidth="0.5" />
              <path d={`M ${linePoints}`} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'd 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              {recentGraphPoints.map((val, i) => {
                 const x = 10 + (i / (recentGraphPoints.length > 1 ? recentGraphPoints.length - 1 : 1)) * 180;
                 const y = 70 - (val / maxDur) * 60;
                 return (
                   <g key={i} style={{ transition: 'all 0.5s ease', transform: `translate(${x}px, ${y}px)` }}>
                     <circle cx="0" cy="0" r="4" fill="#111" stroke="#ff5e62" strokeWidth="2" />
                   </g>
                 );
              })}
            </svg>
          </div>
          <p className="graph-note" style={{ color: '#b8b8b8', fontSize: '13px', marginTop: '10px' }}>
            Graph shows duration (minutes) for the last {recentGraphPoints.length} exercises.
          </p>
        </div>
      </div>

      {/* Horizontal Bar Chart (New Feature for Assignment 3) */}
      <div className="premium-card" style={{ marginTop: '24px', background: 'rgba(0,0,0,0.2)', padding: '24px' }}>
        <h4 style={{ marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Workout Frequency by Type</h4>
        <div className="horizontal-bar-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.entries(counts).filter(([type]) => type !== 'Other').map(([type, count]) => {
            const percentage = (count / totalChartWorkouts) * 100;
            const colors = { Cardio: "#ff5e62", Strength: "#ff9966", Flexibility: "#26D0CE", "Full Body": "#00b4db" };
            return (
              <div key={type} className="bar-item" style={{ width: '100%' }}>
                <div className="bar-info" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="bar-label" style={{ fontWeight: '600', fontSize: '14px', letterSpacing: '0.5px' }}>{type}</span>
                  <span className="bar-value" style={{ fontSize: '14px', color: '#888' }}>
                    <strong style={{ color: colors[type] || '#fff', fontSize: '16px', marginRight: '4px' }}>{count}</strong>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>sessions</span>
                  </span>
                </div>
                <div className="bar-track" style={{ width: '100%', background: '#222', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div 
                    className="bar-progress" 
                    style={{ 
                      height: '100%',
                      width: `${percentage}%`, 
                      background: colors[type] || '#fff',
                      boxShadow: `0 0 10px ${colors[type]}44`,
                      borderRadius: '4px',
                      transition: 'width 1s ease'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdmin && (
        <div className="premium-card" style={{ marginTop: '24px', background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)' }}>
          <h4 style={{ color: '#ff3b30' }}>⚠️ Suspicious Activity Log (Admin View)</h4>
          {suspiciousData?.getSuspiciousUsers?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
              {suspiciousData.getSuspiciousUsers.map(u => (
                <li key={u.id} style={{ padding: '8px', borderBottom: '1px solid rgba(255,0,0,0.1)', color: '#fff' }}>
                  <span style={{ fontWeight: 'bold' }}>{u.name}</span> ({u.email}) - <span style={{ color: '#ff3b30', fontSize: '12px' }}>FLAGGED</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#888', marginTop: '10px', fontSize: '14px' }}>No suspicious activity detected.</p>
          )}
        </div>
      )}
    </div>
  );
}
