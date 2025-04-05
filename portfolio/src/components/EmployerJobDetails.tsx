import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

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

const EmployerJobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the job ID from the URL
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get(`http://localhost:8000/api/employer/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJob(response.data);
      } catch (error) {
        setError('Failed to fetch job details. Please try again later.');
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleDeleteJob = async (jobId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/employer/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted job from the list
      setJobs(jobs.filter((job) => job.id !== jobId));

        Swal.fire({
               icon: 'success',
               title: 'Deleted',
               text: 'Job deleted succesfully',
               confirmButtonText: 'OK',
             }).then(() => {
               window.location.href = '/employer_dashboard';
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!job) {
    return <div>Job not found.</div>;
  }

  return (
    <div>
          <div className="bg-blue-900 w-screen mb-5">
          <nav className="flex items-center w-[84pc] justify-between border-b-[1px] border-b-black mb-[-20px] ">
            <img src="/pam.png" alt="Not Found" className="w-[80px] ml-5" />
            <h2 className="text-white text-center text-2xl"> Job Details</h2>
            <img src="/pam.png" alt="Not Found" className="w-[80px] ml-5" />
          </nav>
        </div>
    
    <div className="p-8 bg-gray-100 w-screen h-screen">
    <Link to="/employer_dashboard">
        <button className=" bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Back to Dashboard
        </button>
      </Link>
     <div className='flex justify-center items-center mx-auto '>
     <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4">{job.job_title}</h1>
        <p className="text-gray-600"><span className="font-semibold">Company:</span> {job.company_description}</p>
        <p className="text-gray-600"><span className="font-semibold">Location:</span> {job.location}</p>
        <p className="text-gray-600"><span className="font-semibold">Job Type:</span> {job.job_type}</p>
        <p className="text-gray-600"><span className="font-semibold">Salary Range:</span> {job.salary_range}</p>
        <p className="text-gray-600"><span className="font-semibold">Educational Level:</span> {job.educational_level}</p>
        <p className="text-gray-600"><span className="font-semibold">Experience Level:</span> {job.experience_level}</p>
        <p className="text-gray-600"><span className="font-semibold">Job Duration:</span> {job.job_duration}</p>
        <p className="text-gray-600"><span className="font-semibold">Skills Required:</span> {job.skill_required}</p>
        <p className="text-gray-600"><span className="font-semibold">Posted on:</span> {new Date(job.created_at).toLocaleDateString()}</p>
        <p className="text-gray-600 mt-4"><span className="font-semibold">Job Description:</span> {job.job_description}</p>

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
  
     </div>
     
     
    </div>
    </div>
  );
};

export default EmployerJobDetails;