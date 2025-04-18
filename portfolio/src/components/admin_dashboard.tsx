import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faUsers, faBriefcase, faChartBar, faCog,
  faComment, faBell, faSearch, faDownload, faChevronDown,
  faCheckCircle, faTimesCircle, faExclamationCircle, faDollarSign,
  faSignOutAlt, faUserFriends, faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Pusher from 'pusher-js';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'employer' | 'jobseeker';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
}

interface JobPosting {
  id: string;
  title: string;
  company: string;
  status: 'active' | 'pending' | 'removed';
  category: string;
  featured: boolean;
  postedDate: string;
}

interface Metric {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}
interface ApiError{
  message:string;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [metricsData, setMetricsData] = useState<Metric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [banDays, setBanDays] = useState(7);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Fetch initial users and jobs
  useEffect(() => {
    fetchUsers();
    fetchJobs();
  }, []);

  // Pusher setup
  useEffect(() => {
    const pusher = new Pusher('de6b8a16c9b286c69d8b', {
      cluster: 'mt1',
      forceTLS: true,
      authEndpoint: 'http://localhost:8000/api/pusher/auth',
      auth: {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      },
    });

    // User registration channel
    const userChannel = pusher.subscribe('admin.users');
    
    userChannel.bind('App\\Events\\NewUserRegistered', (data: any) => {
      const userData = data.user;
      const newUser: User = {
        id: userData.id.toString(),
        name: data.type === 'employer' ? 
          userData.organisation_name : 
          `${userData.first_name} ${userData.last_name || ''}`,
        email: userData.email,
        type: data.type,
        status: 'active',
        joinDate: new Date().toISOString()
      };
      
      setUsers(prevUsers => [newUser, ...prevUsers]);
      
      // Show notification
      const notification: Notification = {
        id: Date.now(),
        type: 'user',
        message: `New ${data.type} registered: ${newUser.name}`,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
    });

    // Job posting channel
    const jobChannel = pusher.subscribe('admin.jobs');
    
    jobChannel.bind('App\\Events\\JobPosted', (data: any) => {
      const jobData = data.job;
      const newJob: JobPosting = {
        id: jobData.id.toString(),
        title: jobData.job_title,
        company: jobData.company_description,
        status: 'active',
        category: jobData.job_category,
        featured: false,
        postedDate: new Date(jobData.created_at).toISOString()
      };
      
      setJobs(prevJobs => [newJob, ...prevJobs]);
      
      // Show notification
      const notification: Notification = {
        id: Date.now(),
        type: 'job',
        message: `New job posted: ${newJob.title} by ${newJob.company}`,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      userChannel.unbind_all();
      userChannel.unsubscribe();
      jobChannel.unbind_all();
      jobChannel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/notifications');
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/metrics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        setMetricsData([
          { 
            label: 'Active Users', 
            value: data.activeUsers,
            change: data.userGrowth,
            icon: <FontAwesomeIcon icon={faUsers} className="w-6 h-6 text-blue-500" />
          },
          { 
            label: 'Active Jobs', 
            value: data.activeJobs,
            change: data.jobGrowth,
            icon: <FontAwesomeIcon icon={faBriefcase} className="w-6 h-6 text-green-500" />
          },
          { 
            label: 'Revenue', 
            value: data.revenue,
            change: data.revenueChange,
            icon: <FontAwesomeIcon icon={faDollarSign} className="w-6 h-6 text-purple-500" />
          },
          { 
            label: 'Success Rate', 
            value: data.successRate,
            change: data.successRateChange,
            icon: <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-emerald-500" />
          }
        ]);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoadingMetrics(false);
      }
    };
    
    fetchMetrics();
  }, []);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('adminToken');
      
        if (!token) {
          console.error('No admin token found');
          return;
        }
        
        const response = await fetch('http://localhost:8000/api/admin/activities', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };
    
    fetchActivities();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

// Example for handleBanUser
const handleBanUser = async (userId: string, userType: string) => {
  try {
    const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/${userType}/ban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ days: banDays })
    });
    
    const data = await response.json();
    if (response.ok) {
      Swal.fire({
        title: 'User Banned',
        text: `User has been banned for ${banDays} days until ${new Date(data.user.banned_until).toLocaleString()}`,
        icon: 'success'
      });
      
      // Refresh users
      fetchUsers();
    } else {
      throw new Error(data.message || 'Failed to ban user');
    }
  } catch (error) {
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    Swal.fire({
      title: 'Error',
      text: errorMessage,
      icon: 'error'
    });
  }
};
  const handleUnbanUser = async (userId: string, userType: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/${userType}/unban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: 'User Unbanned',
          text: 'User has been unbanned successfully',
          icon: 'success'
        });
        
        // Refresh users
        fetchUsers();
      } else {
        throw new Error(data.message || 'Failed to unban user');
      }
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error'
      });
    }
  };

  const handleDeleteUser = async (userId: string, userType: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/${userType}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          Swal.fire(
            'Deleted!',
            'User has been deleted.',
            'success'
          );
          // Refresh users
          fetchUsers();
        } else {
          throw new Error(data.message || 'Failed to delete user');
        }
      } catch (error) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error'
        });
      }
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This job will be deleted and the employer will be notified!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:8000/api/admin/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          }
        });
        
        const data = await response.json();
        if (response.ok) {
          Swal.fire(
            'Deleted!',
            'Job has been deleted and employer notified.',
            'success'
          );
          
          // Refresh jobs
          fetchJobs();
        } else {
          throw new Error(data.message || 'Failed to delete job');
        }
      } catch (error) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error'
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin_login';
  };

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>

        <h2 className="text-white text-2xl font-bold">Admin Dashboard</h2>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <FontAwesomeIcon 
              icon={faBell} 
              className="w-6 h-6 text-white cursor-pointer" 
              onClick={() => setShowNotifications(!showNotifications)}
            />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white bg-opacity-90 backdrop-blur-md rounded-lg shadow-lg z-50">
                <div className="p-2 font-semibold text-gray-700">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No new notifications</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`w-2 h-2 rounded-full mt-1 mr-2 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-blue-600 bg-opacity-70 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 mb-6">
            <div className="flex flex-col items-center text-white">
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
                AD
              </div>
              <p className="text-xl font-semibold mb-1 mt-4">Admin User</p>
              <p className="text-sm text-blue-200 mb-4">lauviamafopa697@gmail.com</p>
              <Link
                to="/admin/settings"
                className="w-full py-2 bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white text-center rounded-lg transition-all duration-300"
              >
                Admin Settings
              </Link>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
            <nav className="text-white">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex bg-blue-800 items-center py-3 px-4 rounded-lg mb-2 transition-colors ${
                  activeTab === 'overview' ? 'bg-white text-black ' : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-3" />
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex bg-blue-800 items-center py-3 px-4 rounded-lg mb-2 transition-colors ${
                  activeTab === 'users' ? 'bg-white text-black' : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <FontAwesomeIcon icon={faUsers} className="mr-3" />
                Users
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className={`w-full flex bg-blue-800 items-center py-3 px-4 rounded-lg mb-2 transition-colors ${
                  activeTab === 'jobs' ? 'bg-white text-black' : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <FontAwesomeIcon icon={faBriefcase} className="mr-3" />
                Jobs
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex bg-blue-800 items-center py-3 px-4 rounded-lg mb-2 transition-colors ${
                  activeTab === 'analytics' ? 'bg-white text-black' : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <FontAwesomeIcon icon={faChartBar} className="mr-3" />
                Analytics
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex bg-blue-800 items-center py-3 px-4 rounded-lg mb-2 transition-colors ${
                  activeTab === 'settings' ? 'bg-white text-black' : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <FontAwesomeIcon icon={faCog} className="mr-3" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex bg-blue-800 items-center py-3 px-4 rounded-lg text-white mb-2 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                Log Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:w-3/4">
          {/* Overview Section */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
                <p className="text-3xl font-bold text-white">Welcome, Admin!</p>
                <p className="text-blue-200 mt-2">Here's your platform overview</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricsData.map((metric, index) => (
                  <div key={index} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-blue-300 border-opacity-30">
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center">
                        {metric.icon}
                      </div>
                      <span className={`text-sm font-medium ${
                        metric.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {metric.label === 'Revenue' ? '$' : ''}{metric.value.toLocaleString()}
                      {metric.label === 'Success Rate' ? '%' : ''}
                    </h3>
                    <p className="text-sm text-blue-200 mt-1">{metric.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                  <button 
                    className="text-sm bg-blue-800 text-white hover:text-blue-200"
                    onClick={() => setActiveTab('users')}
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {notifications.slice(0, 3).map((notification, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 p-4 bg-white bg-opacity-5 rounded-lg hover:bg-white hover:bg-opacity-10 cursor-pointer"
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon 
                          icon={notification.type === 'user' ? faUserFriends : faBriefcase} 
                          className="w-5 h-5 text-blue-600" 
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{notification.message}</p>
                        <p className="text-xs text-blue-300">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Section */}
          {activeTab === 'users' && (
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">User Management</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                    Export
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 relative">
                    <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-5 border border-blue-300 border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select
                    className="px-4 py-2 bg-white bg-opacity-5 border border-blue-300 border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all" className="bg-blue-800">All Status</option>
                    <option value="active" className="bg-blue-800">Active</option>
                    <option value="inactive" className="bg-blue-800">Inactive</option>
                    <option value="suspended" className="bg-blue-800">Suspended</option>
                  </select>

                  <select
                    className="px-4 py-2 bg-white bg-opacity-5 border border-blue-300 border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                  >
                    <option value="all" className="bg-blue-800">All Types</option>
                    <option value="employer" className="bg-blue-800">Employer</option>
                    <option value="jobseeker" className="bg-blue-800">Job Seeker</option>
                  </select>
                </div>

                {/* Ban Days Selector */}
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-blue-300">Ban Duration (days):</label>
                  <select
                    className="px-4 py-2 bg-white bg-opacity-5 border border-blue-300 border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    value={banDays}
                    onChange={(e) => setBanDays(Number(e.target.value))}
                  >
                    <option value="1">1</option>
                    <option value="7">7</option>
                    <option value="30">30</option>
                    <option value="365">365</option>
                    <option value="9999">Permanent</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white bg-opacity-5">
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Join Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-300 divide-opacity-30">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white hover:bg-opacity-5">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{user.name}</div>
                                <div className="text-sm text-blue-200">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 bg-opacity-20 text-blue-300">
                              {user.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              user.status === 'active' ? 'bg-green-100 bg-opacity-20 text-green-300' :
                              user.status === 'inactive' ? 'bg-gray-100 bg-opacity-20 text-gray-300' :
                              'bg-red-100 bg-opacity-20 text-red-300'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-blue-200">
                            {new Date(user.joinDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {user.status === 'suspended' ? (
                              <button 
                                onClick={() => handleUnbanUser(user.id, user.type)}
                                className="text-white bg-green-600 hover:bg-green-700 mr-2 px-3 py-1 rounded"
                              >
                                Unban
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleBanUser(user.id, user.type)}
                                className="text-white bg-yellow-500 hover:bg-yellow-600 mr-2 px-3 py-1 rounded"
                              >
                                Ban
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteUser(user.id, user.type)}
                              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Section */}
          {activeTab === 'jobs' && (
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Job Postings</h2>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-white border border-blue-300 border-opacity-30 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">
                      Bulk Actions
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Add New Job
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 relative">
                    <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-5 border border-blue-300 border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>

                  <select className="px-4 py-2 bg-white bg-opacity-5 border border-blue-300 border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
                    <option className="bg-blue-800">All Categories</option>
                    <option className="bg-blue-800">Technology</option>
                    <option className="bg-blue-800">Marketing</option>
                    <option className="bg-blue-800">Design</option>
                  </select>

                  <select className="px-4 py-2 bg-white bg-opacity-5 border border-blue-300 border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
                    <option className="bg-blue-800">All Status</option>
                    <option className="bg-blue-800">Active</option>
                    <option className="bg-blue-800">Pending</option>
                    <option className="bg-blue-800">Removed</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white bg-opacity-5">
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Job</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Featured</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Posted Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-300 divide-opacity-30">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-white hover:bg-opacity-5">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-white">{job.title}</div>
                              <div className="text-sm text-blue-200">{job.company}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 bg-opacity-20 text-blue-300">
                              {job.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              job.status === 'active' ? 'bg-green-100 bg-opacity-20 text-green-300' :
                              job.status === 'pending' ? 'bg-yellow-100 bg-opacity-20 text-yellow-300' :
                              'bg-red-100 bg-opacity-20 text-red-300'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              job.featured ? 'bg-purple-100 bg-opacity-20 text-purple-300' : 'bg-gray-100 bg-opacity-20 text-gray-300'
                            }`}>
                              {job.featured ? 'Featured' : 'Standard'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-blue-200">
                            {new Date(job.postedDate).toLocaleDateString()}
                          </td>
                          <td className="flex px-6 py-4 text-sm">
                            <button 
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-white bg-red-600 hover:bg-red-700 mr-2 px-3 py-1 rounded"
                            >
                              Delete
                            </button>
                            <button className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
                <p className="text-3xl font-bold text-white">Platform Analytics</p>
                <p className="text-blue-200 mt-2">Detailed insights and metrics</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-blue-300 border-opacity-30">
                  <h2 className="text-lg font-semibold text-white mb-4">Revenue Overview</h2>
                  <div className="h-64 flex items-center justify-center bg-white bg-opacity-5 rounded-lg">
                    <p className="text-blue-200">Revenue chart will be displayed here</p>
                  </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-blue-300 border-opacity-30">
                  <h2 className="text-lg font-semibold text-white mb-4">User Growth</h2>
                  <div className="h-64 flex items-center justify-center bg-white bg-opacity-5 rounded-lg">
                    <p className="text-blue-200">User growth chart will be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Additional Analytics */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-blue-300 border-opacity-30">
                <h2 className="text-lg font-semibold text-white mb-6">Platform Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-300 mb-2">Average Response Time</h3>
                    <p className="text-2xl font-bold text-white">2.5 days</p>
                  </div>
                  <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-300 mb-2">Job Success Rate</h3>
                    <p className="text-2xl font-bold text-white">85%</p>
                  </div>
                  <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-300 mb-2">User Satisfaction</h3>
                    <p className="text-2xl font-bold text-white">4.8/5.0</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">System Configuration</h2>
                
                <div className="space-y-6">
                  {/* Job Categories */}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-4">Job Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Technology', 'Marketing', 'Design', 'Sales'].map((category) => (
                        <span key={category} className="px-3 py-1 bg-white bg-opacity-10 rounded-full text-sm text-white">
                          {category}
                        </span>
                      ))}
                      <button className="px-3 py-1 border border-dashed border-blue-300 border-opacity-30 rounded-full text-sm text-blue-300 hover:border-blue-400 hover:text-blue-200">
                        + Add Category
                      </button>
                    </div>
                  </div>

                  {/* Email Templates */}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-4">Email Templates</h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-between px-4 py-2 bg-white bg-opacity-5 rounded-lg hover:bg-white hover:bg-opacity-10">
                        <span className="text-sm text-white">Welcome Email</span>
                        <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 text-blue-300" />
                      </button>
                      <button className="w-full flex items-center justify-between px-4 py-2 bg-white bg-opacity-5 rounded-lg hover:bg-white hover:bg-opacity-10">
                        <span className="text-sm text-white">Job Application</span>
                        <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 text-blue-300" />
                      </button>
                      <button className="w-full flex items-center justify-between px-4 py-2 bg-white bg-opacity-5 rounded-lg hover:bg-white hover:bg-opacity-10">
                        <span className="text-sm text-white">Password Reset</span>
                        <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 text-blue-300" />
                      </button>
                    </div>
                  </div>

                  {/* Platform Settings */}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-4">Platform Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Enable Job Applications</p>
                          <p className="text-xs text-blue-300">Allow users to submit job applications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">User Verification</p>
                          <p className="text-xs text-blue-300">Require email verification for new accounts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" checked readOnly />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Maintenance Mode</p>
                          <p className="text-xs text-blue-300">Put the platform in maintenance mode</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;