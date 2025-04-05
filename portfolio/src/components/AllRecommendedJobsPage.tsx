import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';

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

const AllRecommendedJobsPage: React.FC = () => {
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:8000/api/jobs/recommended', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data)) {
          setRecommendedJobs(response.data);
        } else {
          setError('Invalid response format. Expected an array.');
        }
      } catch (error) {
        setError('Failed to fetch recommended jobs. Please try again later.');
        console.error('Error fetching recommended jobs:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch recommended jobs.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, []);

  const handlePreviousClick = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className=" h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen" style={{ color: 'red' }}>{error}</div>;
  }

  if (recommendedJobs.length === 0) {
    return <div className="flex justify-center items-center h-screen">No recommended jobs found.</div>;
  }

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>
        <h2 className="text-white text-2xl font-bold">All Recommended Jobs</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedJobs.map((job) => (
            <div key={job.id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-bold text-white">{job.job_title}</h2>
              <p className="text-sm text-white mb-2">{job.company_description}</p>
              <p className="text-sm text-white mb-2">Location: {job.location}</p>
              <p className="text-sm text-white mb-2">Job Type: {job.job_type}</p>
              <p className="text-sm text-white mb-4">Posted on: {new Date(job.created_at).toLocaleDateString()}</p>
              <Link to={`/job/${job.id}`}>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300">
                  View Details
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mb-6" data-aos="fade-right" data-aos-delay="250">
          <button
            onClick={handlePreviousClick}
            className="bg-blue-600 mt-5 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Previous
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllRecommendedJobsPage;