import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Swal from 'sweetalert2';
import { FaUser, FaBriefcase, FaCheckCircle, FaTimesCircle, FaBell, FaSignOutAlt,
FaComment, FaUserFriends,  FaEnvelope, FaUserCog
 } from 'react-icons/fa';
 import Pusher from 'pusher-js';
 import LoginFrequencyGraph from './LoginFrequencyGraph';

// Interfaces
interface LoginDate {
  login_date: string;
}

interface Employer {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  image_url?: string;
  organisation_name: string;
  domain: string;
  address: string;
}

interface Job {
  id: number;
  job_title: string;
  educational_level?: string;
  job_description: string;
  salary_range: string;
  job_category?: string;
  experience_level?: string;
  company_description: string;
  skill_required?: string;
  job_type: string;
  job_duration: string;
  location: string;
  created_at: string;
}

interface Applicant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  qualification?: string;
  experienceLevel?: string;
  educational_level?: string;
  application_date: string;
  job_id: number;
  status: string;
  video_url?: string; 
  resume_url?: string; 
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  sender_name?: string;
  read: boolean;
}

// Employer Dashboard Component
const EmployerDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loginDates, setLoginDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllApplicants, setShowAllApplicants] = useState(false);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const now = new Date();
const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

const recentApplicants = applicants.filter(applicant => {
  const applicationDate = new Date(applicant.application_date);
  return applicationDate >= fortyEightHoursAgo;
});

const [pusher, setPusher] = useState<Pusher | null>(null);

useEffect(() => {
  // Initialize Pusher only once
  if (!pusher) {
    const pusherClient = new Pusher('de6b8a16c9b286c69d8b', { // Replace with your actual Pusher key
      cluster: 'mt1', // Replace with your actual cluster
      forceTLS: true,
      enabledTransports: ['ws', 'wss'] // Force WebSocket transport only
    });
    setPusher(pusherClient);
  }

  return () => {
    // Cleanup when component unmounts
    if (pusher) {
      pusher.disconnect();
    }
  };
}, []);
  // Fetch employer data
  const fetchEmployerData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get('http://localhost:8000/api/employer', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmployer(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch employer data:', error);
      handleAuthError(error);
    }
  };

  // Fetch posted jobs
  const fetchPostedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/employer/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPostedJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch posted jobs:', error);
    }
  };

  // Fetch applicants
  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/employer/applicants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplicants(response.data);
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      handleAuthError(error);
    }
  };
  // Fetch recent messages
  const fetchRecentMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !employer?.id) {
        console.log('Skipping fetch - no token or employer ID');
        return;
      }
  
      // First fetch the unread count
      const countResponse = await axios.get(
        `http://localhost:8000/api/messages/unread-count/${employer.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Make sure to set the count even if it's 0
      setUnreadMessagesCount(countResponse.data.count || 0);
      
      // Then fetch recent messages for display
      const messagesResponse = await axios.get(
        `http://localhost:8000/api/messages/recent/${employer.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecentMessages(messagesResponse.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      // Reset count on error to avoid showing incorrect badge
      setUnreadMessagesCount(0);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', error.response?.data);
      }
    }
  };
    // Mark message as read
    const markMessageAsRead = async (messageId: number) => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8000/api/messages/mark-read/${messageId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Update message in state
        setRecentMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === messageId ? { ...msg, read: true } : msg
          )
        );
    
        // Update unread count
        setUnreadMessagesCount(prev => {
          const newCount = prev - 1;
          console.log('Updating unread count from', prev, 'to', newCount);
          return newCount;
        });
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    };

  // Fetch login dates
  const fetchLoginDates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/employer/login-dates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoginDates(response.data.login_dates || []);
    } catch (error) {
      console.error('Failed to fetch login dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      if (loginDates.includes(dateString)) {
        return <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">✓</div>;
      }
    }
    return null;
  };

  // Handle authentication errors
  const handleAuthError = (error: any) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'User is not authenticated or token is invalid.',
          confirmButtonText: 'OK',
        }).then(() => {
          window.location.href = '/employer_login';
        });
      }
    }
  };

  // Initialize data fetching
  useEffect(() => {
    const initializeData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'User unauthenticated',
          text: 'You must be logged in before accessing the dashboard.',
          confirmButtonText: 'OK',
        }).then(() => {
          window.location.href = '/employer_login';
        });
        return;
      }

      const employerData = await fetchEmployerData();
      if (employerData) {
        await Promise.all([
          fetchPostedJobs(),
          fetchApplicants(),
          fetchLoginDates(),
          fetchRecentMessages(),
        ]);
      }
      
    };

    initializeData();

    if (location.state?.refreshJob) {
      fetchPostedJobs();
    }
  }, [location]);

  // Toggle dark mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // Handle "See More" button click for applicants
  const toggleShowAllApplicants = () => {
    setShowAllApplicants(!showAllApplicants);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'MESSAGES_READ') {
        fetchRecentMessages(); // Refresh the count
      }
    };
  
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'MESSAGES_READ') {
        fetchRecentMessages(); // Refresh the count
      }
    };
  
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRecentMessages();
      }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Also call when navigating back from chat
  useEffect(() => {
    fetchRecentMessages();
  }, [location]);

  // Add this to your useEffect in employer_dashboard.tsx
  useEffect(() => {
    if (!pusher) return;
  
    const channel = pusher.subscribe('applications');
    channel.bind('App\\Events\\NewApplicationEvent', (data: any) => {
      Swal.fire({
        title: 'New Application!',
        text: `A new user applied to your job posting ${data.job_title}`,
        icon: 'info',
        confirmButtonText: 'View'
      }).then(() => {
        navigate(`/employer/applicant/${data.id}`);
      });
      
      // Refresh applicants list
      fetchApplicants();
    });
  
    return () => {
      pusher.unsubscribe('applications');
    };
  }, [pusher, navigate]);

  useEffect(() => {
    if (!pusher) return;
  
    console.log('Subscribing to applications channel'); // Debug log
  
    const applicationsChannel = pusher.subscribe('private-applications');
    
    applicationsChannel.bind('App\\Events\\ApplicantStatusUpdated', (data: any) => {
      console.log('Received ApplicantStatusUpdated event:', data); // Debug log
      Swal.fire({
        title: 'Status Updated',
        text: `Application status changed to ${data.status}`,
        icon: data.status === 'accepted' ? 'success' : 'error',
        confirmButtonText: 'View'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/employer/applicant/${data.id}`);
        }
      });
    });
  
    return () => {
      console.log('Unbinding ApplicantStatusUpdated event'); // Debug log
      applicationsChannel.unbind('App\\Events\\ApplicantStatusUpdated');
    };
  }, [pusher, navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Goodbye!',
      text: `Thanks for using our platform, ${employer?.first_name}!`,
      icon: 'info',
      confirmButtonText: 'OK',
      timer: 3000, // Auto close after 3 seconds
      timerProgressBar: true,
      willClose: () => {
        // Clear the token from local storage
        localStorage.removeItem('token');
        // Redirect to the login page
        window.location.href = '/employer_login';
      }
    });
  };

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>

        <h2 className="text-white text-2xl font-bold">Employer Dashboard</h2>

        <div className="flex items-center space-x-4">
        <div className="relative">
  <Link to="/message-list" className="text-white hover:text-blue-300 transition-colors relative">
    <FaEnvelope className="text-xl" />
    {/* Always render the badge container but only show when count > 0 */}
    <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-opacity 
      duration-200 ${unreadMessagesCount > 0 ? 'opacity-100' : 'opacity-0'}`}>
      {unreadMessagesCount}
    </span>
  </Link>

</div>
          <Link to="/settings" className="text-white hover:text-blue-300 transition-colors">
            Settings
          </Link>
          <Link to="/contact" className="text-white hover:text-blue-300 transition-colors">
            Contact
          </Link>
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
            {employer && (
              <div className="flex flex-col items-center text-white">
                {employer.image_url ? (
                  <img
                    src={`http://localhost:8000${employer.image_url}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mb-4 border-2 border-blue-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
                  {employer.first_name.charAt(0).toUpperCase()}
                  {employer.last_name.charAt(0).toUpperCase()}
                </div>
                )}
                <p className="text-xl font-semibold mb-1">
                  {employer.first_name} {employer.last_name}
                </p>
                <p className="text-sm text-blue-200 ">{employer.organisation_name} </p>
                <p className="text-sm text-blue-200 ">{employer.email}</p>
                <p className="text-sm text-blue-200 mb-4">{employer.domain} </p>
                <Link
                  to="/employer/modify-profile"
                  className="w-full py-2 bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white text-center rounded-lg transition-all duration-300"
                >
                  Edit Profile
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
            
            <nav className="text-white">
              <Link
                to="/employer_dashboard"
                className="flex items-center py-3 px-4 rounded-lg text-white mb-2 bg-blue-600 bg-opacity-50"
              >
                <FaUser className="mr-3" /> Dashboard
              </Link>
              <Link
                to="/employer/manage-jobs"
                className="flex items-center py-3 px-4 rounded-lg text-white mb-2 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <FaBriefcase className="mr-3" /> Manage Jobs
              </Link>
              <Link
                to="/employer/post-job"
                className="flex items-center py-3 px-4 rounded-lg text-white mb-2 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <FaCheckCircle className="mr-3" /> Post Job
              </Link>
              <Link
                to="/employer/applicants"
                className="flex items-center py-3 px-4 rounded-lg text-white mb-2 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <FaBell className="mr-3" /> Applicants
              </Link>
              <Link
                to="/employerPage"
                className="flex items-center py-3 px-4 rounded-lg text-white mb-2 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <FaUserFriends className="mr-3" /> Discuss With Employers
              </Link>

              <Link
                to="/"
                className="flex items-center py-3 px-4 rounded-lg text-white mb-2 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <FaUserCog className="mr-3" /> Discuss With Admin
              </Link>
             
              <Link
                to="/" onClick={handleLogout}
                className="flex items-center py-3 px-4 rounded-lg text-white mb-2 hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <FaSignOutAlt className="mr-3" /> Log Out
              </Link>

              {/* <button 
  onClick={fetchRecentMessages}
  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
>
  Refresh Message Count
</button> */}
              
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:w-3/4">
          {employer && (
            <>
              {/* Welcome Message */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 mb-6">
                <p className="text-3xl font-bold text-white">
                  Welcome Back, {employer.first_name}!
                </p>
                <p className="text-blue-200 mt-2">Here's your job activity overview</p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-blue-300 border-opacity-30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Posted Jobs</h3>
                    <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center">
                      <FaBriefcase className="text-blue-300" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{postedJobs.length}</p>
                  <Link to="/employer/manage-jobs" className="text-blue-300 hover:text-blue-200 text-sm">View Details →</Link>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-green-300 border-opacity-30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Total Applicants</h3>
                    <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-30 flex items-center justify-center">
                      <FaCheckCircle className="text-green-300" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{applicants.length}</p>
                  <Link to="/employer/applicants" className="text-green-300 hover:text-green-200 text-sm">View Details →</Link>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-red-300 border-opacity-30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
                    <div className="w-10 h-10 rounded-full bg-red-500 bg-opacity-30 flex items-center justify-center">
                      <FaTimesCircle className="text-red-300" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {recentApplicants.filter(app => {
                      const appDate = new Date(app.application_date);
                      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
                      return appDate >= fortyEightHoursAgo
                    }).length}
                  </p>
                  <Link to="/employer/recent-applicants" className="text-red-300 hover:text-red-200 text-sm">View Details →</Link>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-purple-300 border-opacity-30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">New Messages</h3>
                    <div className="w-10 h-10 rounded-full bg-purple-500 bg-opacity-30 flex items-center justify-center">
                      <FaComment className="text-purple-300" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{unreadMessagesCount}</p>
                  <Link to="/message-list" className="text-purple-300 hover:text-purple-200 text-sm">View Messages →</Link>
                </div>
              </div>

              {/* Job Recommendations and Saved Jobs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Posted Jobs */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Your Posted Jobs</h2>
                  {postedJobs.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-blue-200 mb-4">You haven't posted any jobs yet.</p>
                      <Link to="/employer/post-job">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Post Job
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {(showAllJobs ? postedJobs : postedJobs.slice(0, 1)).map((job) => (
                          <div key={job.id} className="border border-blue-300 border-opacity-30 rounded-lg p-4 hover:bg-white hover:bg-opacity-5 transition-colors">
                            <h3 className="text-lg font-bold text-white">{job.job_title}</h3>
                            <p className="text-sm text-blue-200 mb-1">{job.company_description}</p>
                            <div className="flex justify-between items-center text-xs text-blue-300 mb-3">
                              <span>{job.location}</span>
                              <span>{job.job_type}</span>
                            </div>
                            <Link  to={`/employer/edit-job/${job.id}`}>
                              <button className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                View Details
                              </button>
                            </Link>
                          </div>
                        ))}
                      </div>
                      {postedJobs.length > 1 && (
  <div className="mt-4 text-center">
    <Link to="/employer/manage-jobs">
      <button className="bg-blue-600 bg-opacity-70 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        {showAllJobs ? 'See Less' : 'See More'}
      </button>
    </Link>
  </div>
)}
                    </>
                  )}
                </div>

                {/* Recent Applicants  */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
  <h2 className="text-xl font-semibold text-white mb-4">Recent Applicants (Last 48 Hours)</h2>
  {recentApplicants.length === 0 ? (
    <div className="text-center py-6">
      <p className="text-blue-200 mb-4">No applicants within the last 48 hours for your job postings.</p>
      <Link to="/employer/applicants">
        <button className="bg-blue-600  text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          View Applicants
        </button>
      </Link>
    </div>
  ) : (
    <>
      <div className="space-y-4">
        {(showAllApplicants ? recentApplicants : recentApplicants.slice(0, 1)).map((applicant) => (
        // In the Recent Applicants section
<div key={applicant.id} className="border border-blue-300 border-opacity-30 rounded-lg p-4 hover:bg-white hover:bg-opacity-5 transition-colors">
  <h3 className="text-lg font-bold text-white">{applicant.first_name} {applicant.last_name}</h3>
  <p className="text-sm text-blue-200 mb-1">{applicant.email}</p>
  <div className="flex justify-between items-center text-xs text-blue-300 mb-3">
    <span>{applicant.qualification || 'No qualification listed'}</span>
    <span>{applicant.experienceLevel || 'Not specified'}</span>
    <span>{applicant.application_date || 'Not specified'}</span>
  </div>
  {applicant.video_url && (
    <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2 mb-2">
      Video
    </span>
  )}
  {applicant.resume_url && (
    <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded mr-2 mb-2">
      Resume
    </span>
  )}
  <Link to={`/employer/applicant/${applicant.id}`}>
    <button className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
      View Full Profile
    </button>
  </Link>
</div>
        ))}
      </div>
      {recentApplicants.length > 1 && (
        <div className="mt-4 text-center">
          <Link to="/employer/recent-applicants">
            <button className="bg-blue-600 bg-opacity-70 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {showAllApplicants ? 'See Less' : 'See More'}
            </button>
          </Link>
        </div>
      )}
    </>
  )}
</div>
              </div>

            {/* Login Activity Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
  {/* Calendar - Now takes half width on larger screens */}
  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
    <h2 className="text-xl font-semibold text-white mb-4">Login Activity Calendar</h2>
    {isLoading ? (
      <div className="flex justify-center py-6">
        <p className="text-blue-200">Loading calendar data...</p>
      </div>
    ) : (
      <div className="calendar-wrapper bg-white bg-opacity-5 p-4 rounded-lg">
        <Calendar 
          tileContent={tileContent} 
          className="border-0 rounded-lg shadow-md" 
        />
      </div>
    )}
  </div>

  {/* Login Frequency Graph - Now takes half width on larger screens */}
  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
    <h2 className="text-xl font-semibold text-white mb-8">Monthly Login Frequency</h2>
    {isLoading ? (
      <div className="flex justify-center py-6 ">
        <p className="text-blue-200">Loading login data...</p>
      </div>
    ) : loginDates.length > 0 ? (
      <LoginFrequencyGraph loginDates={loginDates} />
    ) : (
      <div className="flex items-center justify-center h-full">
        <p className="text-blue-200">No login data available</p>
      </div>
    )}
  </div>
</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;