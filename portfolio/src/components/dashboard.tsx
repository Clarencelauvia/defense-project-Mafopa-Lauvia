import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default styling
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';
import { useUser } from './refreshPage'; // Adjust the import path
import 'aos/dist/aos.css';
import AOS from 'aos';
import Pusher from 'pusher-js';
import LoginFrequencyGraph from './LoginFrequencyGraph';
import { FaUser, FaBriefcase, FaCheckCircle, FaTimesCircle, FaBell, FaSignOutAlt, FaUserCog } from 'react-icons/fa';

// Interfaces
interface LoginDate {
  login_date: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  image_url?: string;
  qualification?: string;
  experienceLevel?: string;
  educationalLevel?: string;
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

// Dashboard Component
const Dashboard: React.FC = () => {
  const location = useLocation();
  const { user, fetchUserData } = useUser(); // Use user and fetchUserData from the context
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loginDates, setLoginDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [jobApplied, setJobApplied] = useState(0); // Example: Number of jobs applied
  const [applicationAccepted, setApplicationAccepted] = useState(0); // Example: Number of applications accepted
  const [applicationDenied, setApplicationDenied] = useState(0); // Example: Number of applications denied
  const [newlyPostedJobs, setNewlyPostedJobs] = useState(0); // Example: Number of newly posted jobs
const navigate = useNavigate();
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
    fetchUserData(); 
  }, [fetchUserData]);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const jobsResponse = await axios.get('http://localhost:8000/api/jobs');
      setJobs(jobsResponse.data);
      
      // Calculate newly posted jobs (within the last 48 hours)
      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const newlyPosted = jobsResponse.data.filter((job: Job) => {
        const jobDate = new Date(job.created_at);
        return jobDate > fortyEightHoursAgo;
      });
      setNewlyPostedJobs(newlyPosted.length);
      return jobsResponse.data;
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  // Fetch applied jobs
  const fetchAppliedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      
      const response = await axios.get('http://localhost:8000/api/apply-jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Handle different response formats
      let count = 0;
      if (Array.isArray(response.data)) {
        count = response.data.length;
      } else if (response.data?.appliedJobs && Array.isArray(response.data.appliedJobs)) {
        count = response.data.appliedJobs.length;
      } else if (typeof response.data?.count === 'number') {
        count = response.data.count;
      } else if (response.data) {
        // If it's an object but we don't know its structure, try to count keys
        count = Object.keys(response.data).length;
      }
  
      setJobApplied(count);
    } catch (error) {
      console.error('Failed to fetch applied jobs:', error);
      setJobApplied(0);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppliedJobs().catch(error => {
        console.error('Error in periodic job count fetch:', error);
      });
    }, 30000); // Refresh every 30 seconds
  
    return () => clearInterval(interval);
  }, []);

  // Fetch application status
  const fetchApplicationStatus = async () =>{
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }
      const response = await axios.get('http://localhost:8000/api/application-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setApplicationAccepted(response.data.accepted || 0);
        setApplicationDenied(response.data.denied || 0);
      }
    } catch (error) {
      console.error('Failed to fetch application status:', error);
    }
  }

  // Filter jobs based on user data
  const filterJobs = (jobs: Job[], user: User) => {
    return jobs.filter((job) => {
      const userEducationalLevel = user.educationalLevel?.toLowerCase().trim() || '';
      const userExperienceLevel = user.experienceLevel?.toLowerCase().trim() || '';
      const userQualification = user.qualification?.toLowerCase().trim() || '';

      const jobEducationalLevel = job.educational_level?.toLowerCase().trim() || '';
      const jobExperienceLevel = job.experience_level?.toLowerCase().trim() || '';
      const jobCategory = job.job_category?.toLowerCase().trim() || '';
      const jobSkillRequired = job.skill_required?.toLowerCase().trim() || '';

      const isMatch =
        (userEducationalLevel && jobEducationalLevel.includes(userEducationalLevel)) || 
        (userExperienceLevel && jobExperienceLevel.includes(userExperienceLevel)) || 
        (userQualification && (jobCategory.includes(userQualification) || jobSkillRequired.includes(userQualification))); 

      return isMatch;
    });
  };


  // Fetch login dates
  const fetchLoginDates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoginDates(response.data.login_dates);
    } catch (error) {
      console.error('Failed to fetch login dates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data fetching
  useEffect(() => {
    const initializeData = async () => {
      const jobsData = await fetchJobs();
      if (user && jobsData) {
        setFilteredJobs(filterJobs(jobsData, user));
      }
      await fetchLoginDates();
      await fetchAppliedJobs();
      await fetchApplicationStatus();
    };

    initializeData();
  }, [user]); // Add user as a dependency

  // Toggle dark mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // Handle "See More" button click
  const handleSeeMore = () => {
    setDisplayCount((prevCount) => prevCount + 10);
  };


useEffect(() => {
  console.log('Received login dates:', loginDates);
  if (loginDates.length > 0) {
      console.log('Sample login date:', loginDates[0]);
      console.log('Parsed sample date:', new Date(loginDates[0]));
  }
}, [loginDates]);


  // Custom tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
        const dateString = date.toISOString().split('T')[0];
        // Check if any login date matches this date
        if (loginDates.some(loginDate => loginDate.startsWith(dateString))) {
            return <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">✓</div>;
        }
    }
    return null;
};

  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(false);
  // Function for saving jobs
  const fetchSavedJobs = async () => {
    setIsLoadingSavedJobs(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token for saved job:', token); // Debugging: Check if the token exists
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get('http://localhost:8000/api/saved-jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Saved Jobs Response:', response.data); // Debugging: Check the response

      if (Array.isArray(response.data)) {
        setSavedJobs(response.data);
      } else {
        console.error('Invalid response format. Expected an array.');
      }
      console.log(response.data);
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);

      // Narrowing the error type to AxiosError
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          console.error('Server error. Please try again later.');
          alert('Server error. Please try again later.');
        }

        if (error.response?.status === 401) {
          console.error('Unauthorized: User is not authenticated or token is invalid.');
          // Redirect to login page or show a message to the user
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'User is not authenticated or token is invalid.',
            confirmButtonText: 'OK',
          }).then(() => {
            window.location.href = '/employee_login';
          });
        } else {
          console.error('Axios error:', error.message);
        }
      } else if (error instanceof Error) {
        console.error('Other error:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
    } finally {
      setIsLoadingSavedJobs(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const toggleToShowAll = () => {
    setShowAll(!showAll);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'User unauthenticated',
        text: 'You must be logged in before updating profile.',
        confirmButtonText: 'OK',
      }).then(() => {
        window.location.href = '/employee_login';
      });
      return;
    }

    fetchUserData();
  }, [location]);

  const handleApply = async (JobId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.post(`http://localhost:8000/api/jobs/${JobId}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire({
        icon: 'success',
        title: 'JobApplicationSucess',
        text: 'Job Successfully applied',
        confirmButtonText: 'OK',
      }).then(() => {
        window.location.href = '/dashboard';
      });
    } catch (error) {
      console.error('Error applying for job:', error);
      Swal.fire({
        icon: 'error',
        title: 'ApplicationFailled',
        text: 'Job application failed',
        confirmButtonText: 'Ok',
      });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Goodbye!',
      text: `Thanks for using our platform, ${user?.first_name }!`,
      icon: 'info',
      confirmButtonText: 'OK',
      timer: 3000, // Auto close after 3 seconds
      timerProgressBar: true,
      willClose: () => {
        // Clear the token from local storage
        localStorage.removeItem('token');
        // Redirect to the login page
        window.location.href = '/employee_login';
      }
    });
  };



useEffect(() => {
  // Initialize Pusher
  const pusherClient = new Pusher('de6b8a16c9b286c69d8b', { // Your Pusher key
    cluster: 'mt1',
    forceTLS: true
  });
  setPusher(pusherClient);

  return () => {
    if (pusherClient) {
      pusherClient.disconnect();
    }
  };
}, []);

useEffect(() => {
  if (!pusher || !user?.id) return;

  // Subscribe to channel for this user
  const channel = pusher.subscribe(`user.${user.id}`);
  
  // Listen for new matching job events
  channel.bind('App\\Events\\JobPosted', (data: any) => {
    Swal.fire({
      title: 'New Matching Job!',
      html: `
        <div>
          <p><strong>${data.job.job_title}</strong></p>
          <p>${data.job.company_description}</p>
          <p>Location: ${data.job.location}</p>
          <p>Salary: ${data.job.salary_range}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'View Job',
      showCancelButton: true,
      cancelButtonText: 'Dismiss'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/job/${data.job.id}`);
      }
    });
    
    // Refresh job recommendations
    fetchJobs().then(jobsData => {
      if (jobsData && user) {
        setFilteredJobs(filterJobs(jobsData, user));
      }
    });
  });

  return () => {
    channel.unbind('App\\Events\\JobPosted');
  };
}, [pusher, user, navigate]);
 
  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4" data-aos="fade-down" data-aos-delay="100">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>

        <h2 className="text-white text-2xl font-bold">Job Seeker's Dashboard</h2>

        <div className="flex items-center space-x-4">
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
        <div className="md:w-1/4" data-aos="fade-right" data-aos-delay="200">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 mb-6">
            {user && (
              <div className="flex flex-col items-center text-white">
                {user.image_url ? (
                  <img
                    src={`http://localhost:8000${user.image_url}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mb-4 border-2 border-blue-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
                  {user.first_name.charAt(0).toUpperCase()}
                  {user.last_name.charAt(0).toUpperCase()}
                </div>
                )}
                <p className="text-xl font-semibold mb-1">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-blue-200 mb-4">{user.email}</p>
                <Link 
                  to="/modifyProfile" 
                  className="w-full py-2 bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white text-center rounded-lg transition-all duration-300"
                >
                  Edit Profile
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white bg-opacity-10  backdrop-blur-md rounded-xl p-4" data-aos="fade-right" data-aos-delay="300">
            <nav className="text-white">
              <Link
                to="/dashboard"
                className="flex items-center py-3 px-4 rounded-lg text-white mb-2 bg-blue-600 bg-opacity-50"
              >
                <FaUser className="mr-3" /> Dashboard
              </Link>
              <Link
                to="/jobs"
                className="flex items-center py-3 px-4 rounded-lg mb-2 text-white  hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <FaBriefcase className="mr-3" /> Jobs
              </Link>
              <Link
                to="/applications"
                className="flex items-center py-3 px-4 rounded-lg mb-2 text-white hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <FaCheckCircle className="mr-3" /> Applications
              </Link>
                 <Link
                              to="/"
                              className="flex items-center py-3 px-4 rounded-lg text-white mb-2 hover:bg-white hover:bg-opacity-10 transition-colors"
                            >
                              <FaUserCog className="mr-3" /> Discuss With Admin
                            </Link>
               <Link 
                     to=""  onClick={handleLogout}
                className="flex items-center py-3 px-4 rounded-lg text-white mb-2 hover:bg-white hover:bg-opacity-10 transition-colors"
               >
                 <FaSignOutAlt className="mr-3" /> Log Out
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:w-3/4" data-aos="fade-left" data-aos-delay="200">
          {user && (
            <>
              {/* Welcome Message */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 mb-6">
                <p className="text-3xl font-bold text-white">
                  Welcome Back, {user.first_name}!
                </p>
                <p className="text-blue-200 mt-2">Here's your job activity overview</p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-aos="fade-up" data-aos-delay="300">
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-blue-300 border-opacity-30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Jobs Applied</h3>
                    <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center">
                      <FaBriefcase className="text-blue-300" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{jobApplied}</p>
                  <Link to="/applications" className="text-blue-300 hover:text-blue-200 text-sm">View Details →</Link>
                </div>
                {/* Job accepted */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-green-300 border-opacity-30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Accepted</h3>
                    <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-30 flex items-center justify-center">
                      <FaCheckCircle className="text-green-300" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{applicationAccepted}</p>
                  <Link to="/applications?status=accepted" className="text-green-300 hover:text-green-200 text-sm">View Details →</Link>
                </div>
                {/* job declined  */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-red-300 border-opacity-30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Declined</h3>
                    <div className="w-10 h-10 rounded-full bg-red-500 bg-opacity-30 flex items-center justify-center">
                      <FaTimesCircle className="text-red-300" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{applicationDenied}</p>
                  <Link to="/applications?status=denied" className="text-red-300 hover:text-red-200 text-sm">View Details →</Link>
                </div>
                
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-yellow-300 border-opacity-30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">New Jobs</h3>
                    <div className="w-10 h-10 rounded-full bg-yellow-500 bg-opacity-30 flex items-center justify-center">
                      <FaBell className="text-yellow-300" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">{newlyPostedJobs}</p>
                  <Link to="/jobs" className="text-yellow-300 hover:text-yellow-200 text-sm">View All →</Link>
                </div>
              </div>

              {/* Job Recommendations and Saved Jobs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Job Recommendations */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6" data-aos="fade-up" data-aos-delay="400">
                  <h2 className="text-xl font-semibold text-white mb-4">Job Recommendations</h2>
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-blue-200 mb-4">No jobs match your profile.</p>
                      <Link to="/jobs">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          See All Job Opportunities
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {filteredJobs.slice(0, 1).map((job) => (
                          <div key={job.id} className="border border-blue-300 border-opacity-30 rounded-lg p-4 hover:bg-white hover:bg-opacity-5 transition-colors">
                            <h3 className="text-lg font-bold text-white">{job.job_category || job.job_title}</h3>
                            <p className="text-sm text-blue-200 mb-1">{job.company_description}</p>
                            <div className="flex justify-between items-center text-xs text-blue-300 mb-3">
                              <span>{job.location}</span>
                              <span>{job.job_type}</span>
                            </div>
                            <Link to={`/job/${job.id}`}>
                              <button className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                View Details
                              </button>
                            </Link>
                          </div>
                        ))}
                      </div>
                      {filteredJobs.length > 1 && (
  <div className="mt-4 text-center">
    <Link to="/all-recommended-jobs">
      <button className="bg-blue-600 bg-opacity-70 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        See All Matches
      </button>
    </Link>
  </div>
)}
                    </>
                  )}
                </div>

                {/* Saved Jobs */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6" data-aos="fade-up" data-aos-delay="500">
                  <h2 className="text-xl font-semibold text-white mb-4">Saved Jobs</h2>
                  {isLoadingSavedJobs ? (
                    <div className="flex justify-center py-6">
                      <p className="text-blue-200">Loading saved jobs...</p>
                    </div>
                  ) : savedJobs.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {(showAll ? savedJobs : savedJobs.slice(0, 1)).map((job) => (
                          <div key={job.id} className="border border-blue-300 border-opacity-30 rounded-lg p-4 hover:bg-white hover:bg-opacity-5 transition-colors">
                            <h3 className="text-lg font-bold text-white">{job.job_category || job.job_title}</h3>
                            <p className="text-sm text-blue-200 mb-1">{job.company_description}</p>
                            <div className="flex justify-between items-center text-xs text-blue-300 mb-3">
                              <span>{job.location}</span>
                              <span>{job.job_type}</span>
                            </div>
                            <Link to={`/job/${job.id}`}>
                              <button className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                View Details
                              </button>
                            </Link>
                          </div>
                        ))}
                      </div>

{savedJobs.length > 1 && (
  <div className="mt-4 text-center">
    <Link to="/all-saved-jobs">
      <button className="bg-blue-600 bg-opacity-70 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        {showAll ? 'See Less' : 'See All Saved Jobs'}
      </button>
    </Link>
  </div>
)}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-blue-200 mb-4">No saved jobs found.</p>
                      <Link to="/jobs">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Browse Jobs
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

          {/* Login Activity Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" data-aos="fade-up" data-aos-delay="600">
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
      <div className="flex justify-center py-6">
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

export default Dashboard;