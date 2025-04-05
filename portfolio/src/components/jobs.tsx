import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';
import { PusherContext } from './PusherContext'; // Import PusherContext

interface Job {
  id: number;
  job_title: string;
  educational_level: string;
  job_description: string;
  salary_range: string;
  job_category: string;
  experience_level: string;
  company_description: string;
  skill_required: string;
  job_type: string;
  job_duration: string;
  location: string;
  created_at: string;
}

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jobsPerPage] = useState<number>(8);
  const navigate = useNavigate();

  // Access the Pusher instance from the context
  const pusher = useContext(PusherContext);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/jobs');
        console.log('API Response:', response.data);
        if (Array.isArray(response.data)) {
          setJobs(response.data);
          setFilteredJobs(response.data);
        } else {
          setError('Invalid response format. Expected an array.');
          setJobs([]);
          setFilteredJobs([]);
        }
      } catch (error) {
        setError('Failed to fetch jobs. Please try again later.');
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Listen for real-time job postings
  useEffect(() => {
    if (pusher) {
      const channel = pusher.subscribe('job-posted'); // Subscribe to the 'job-posted' channel
      channel.bind('job.posted', (newJob: Job) => {
        console.log('New job posted:', newJob);
        // Add the new job to the list
        setJobs((prevJobs) => [newJob, ...prevJobs]);
        setFilteredJobs((prevJobs) => [newJob, ...prevJobs]);
      });

      // Cleanup on unmount
      return () => {
        pusher.unsubscribe('job-posted');
      };
    }
  }, [pusher]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter((job) => {
      return (
        job.job_title.toLowerCase().includes(query) ||
        job.job_category.toLowerCase().includes(query) ||
        job.company_description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.job_type.toLowerCase().includes(query) ||
        job.educational_level.toLowerCase().includes(query) ||
        job.experience_level.toLowerCase().includes(query)
      );
    });

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

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

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const handlePreviousClick = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen" style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>
        <h2 className="text-white text-2xl font-bold">Job Listings</h2>
        <div className="flex items-center space-x-4">
          <Link to="/settings" className="text-white hover:text-blue-300 transition-colors">
            Settings
          </Link>
          <Link to="/contact" className="text-white hover:text-blue-300 transition-colors">
            Contact
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4"
        >
          Back to Dashboard
        </button>

        <div className="flex justify-center mb-6">
          <input
            type="search"
            placeholder="Search"
            className="border-blue-800 border-2 border-opacity-50 rounded-md mr-2 h-[6vh] shadow-sm"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <button
            className="bg-blue-800 bg-opacity-80 text-white hover:text-blue-600 hover:bg-white hover:border-opacity-50 px-6 py-2 rounded-md transition-all duration-300 shadow-md"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {currentJobs.length === 0 ? (
          <p className="text-white text-center">No Jobs Available At the Moment</p>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <h2 className="text-xl font-semibold text-white mb-4 text-center underline" data-aos="fade-down" data-aos-delay={index * 200}>
                    {job.job_category}
                  </h2>
                  <p className="text-sm text-white">
                    <span className="font-semibold">Job Title:</span> {job.job_title}
                  </p>
                  <p className="text-sm text-white">
                    <span className="font-semibold">Company Name:</span> {job.company_description}
                  </p>
                  <p className="text-sm text-white">
                    <span className="font-semibold">Location:</span> {job.location}
                  </p>
                  <p className="text-sm text-white">
                    <span className="font-semibold">Job Preference:</span> {job.job_type}
                  </p>
                  <p className="text-sm text-white">
                    <span className="font-semibold">Educational Level:</span> {job.educational_level}
                  </p>
                  <p className="text-sm text-white">
                    <span className="font-semibold">Experience Level:</span> {job.experience_level}
                  </p>
                  <p className="text-sm text-white">Posted on: {new Date(job.created_at).toLocaleDateString()}</p>

                  <div className="flex justify-center items-center mt-4">
                    <Link to={`/job/${job.id}`} onClick={() => console.log(`Navigating to job ID: ${job.id}`)}>
                      <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-300">
                        See More
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              {Array.from({ length: Math.ceil(filteredJobs.length / jobsPerPage) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`mx-1 px-4 py-2 rounded-lg ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-[-20px]">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300"
          >
            <FaArrowLeft className="" />
            Previous
          </button>
          <i className='text-blue-950'>hh</i>
        </div>
      </div>
    </div>
  );
}

export default Jobs;