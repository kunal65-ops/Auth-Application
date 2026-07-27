import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getDashboardApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const response = await getDashboardApi();
        if (isMounted && response?.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Failed to load dashboard data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout completed');
    } finally {
      setLoggingOut(false);
    }
  };
  if (loading) {
    return (
      <div className="auth-container">
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }
  const currentUser = dashboardData?.user || user;
  const info = dashboardData?.dashboardInfo;
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
              {info?.welcomeMessage || `Welcome back, ${currentUser?.email}`}
            </p>
          </div>
          <button
            className="btn-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-label">User Email</div>
            <div className="info-value">{currentUser?.email || 'N/A'}</div>
          </div>
          <div className="info-card">
            <div className="info-label">User ID</div>
            <div className="info-value" style={{ fontSize: '0.95rem' }}>
              {currentUser?._id || 'N/A'}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">Account Created</div>
            <div className="info-value" style={{ fontSize: '0.95rem' }}>
              {currentUser?.createdAt
                ? new Date(currentUser.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'N/A'}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">System Status</div>
            <div className="info-value" style={{ color: 'var(--success-color)' }}>
              {info?.systemStatus || 'Active'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;