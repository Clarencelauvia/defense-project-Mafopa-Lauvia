import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Job {
  id: number;
  job_title: string;
  job_description: string;
  salary_range: string;
  job_type: string;
  location: string;
  created_at: string;
}

const ManageJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/employer/manage-jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to fetch jobs',
        text: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/employer/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs(jobs.filter((job) => job.id !== jobId));

      Swal.fire({
        icon: 'success',
        title: 'Job deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete job:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to delete job',
        text: 'Please try again later.',
      });
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (isLoading) {
    return <div className=" h-screen">Loading...</div>;
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
        <h2 className="text-white text-2xl font-bold">Manage Jobs</h2>
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
          onClick={() => navigate('/employer_dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4"
        >
          Back to Dashboard
        </button>

        {jobs.length === 0 ? (
          <p className="text-white text-center">You haven't posted any jobs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-white text-center">{job.job_title}</h2>
                <p className="text-sm text-white">{job.job_description}</p>
                <div className="flex justify-between mt-4">
                  <span className="text-sm text-white">{job.location}</span>
                  <span className="text-sm text-white">{job.job_type}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <span className="text-sm text-white">{job.salary_range}</span>
                  <span className="text-sm text-white">Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-4 mt-6 justify-center items-center">
                  <Link
                    to={`/employer/edit-job/${job.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Modify Job
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Delete Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;