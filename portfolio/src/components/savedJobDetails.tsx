import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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

function SavedJobDetails() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/jobs/${id}`);
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

  const handleUnsaveJob = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'You must be logged in to unsave a job.',
          confirmButtonText: 'OK',
        });
        return;
      }

      await axios.delete(`http://127.0.0.1:8000/api/jobs/${id}/unsave`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: 'success',
        title: 'Job Unsaved!',
        text: 'The job has been removed from your saved jobs.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/dashboard');
      });
    } catch (error) {
      console.error('Error unsaving job:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to unsave job. Please try again later.',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleApplyJob = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'You must be logged in to apply for a job.',
          confirmButtonText: 'OK',
        });
        return;
      }

      await axios.post(
        `http://127.0.0.1:8000/api/jobs/${id}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Job Applied!',
        text: 'You have successfully applied for this job.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/dashboard');
      });
    } catch (error) {
      console.error('Error applying for job:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to apply for job. Please try again later.',
        confirmButtonText: 'OK',
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
    return <div>No job found.</div>;
  }

  return (
    <div className="bg-gray-100">
      <div className="bg-blue-900 w-screen mb-5">
        <nav className="flex items-center w-[84pc] justify-between border-b-[1px] border-b-black">
          <img src="/pam.png" alt="Not Found" className="w-[80px] ml-5" />
          <h2 className="text-white text-center text-2xl">Job Overview</h2>
          <img src="/pam.png" alt="Not Found" className="w-[80px] ml-5" />
        </nav>
      </div>

      <form className="mt-10 flex justify-center items-center bg-white border w-full max-w-md mx-auto p-5 shadow-lg rounded-md hover:shadow-xl">
        <div className="mt-5">
          <h2 className="text-2xl text-center font-bold mb-4">{job.job_title}</h2>
          <p className="mb-2">
            <strong>Company:</strong> {job.company_description}
          </p>
          <p className="mb-2">
            <strong>Location:</strong> {job.location}
          </p>
          <p className="mb-2">
            <strong>Job Type:</strong> {job.job_type}
          </p>
          <p className="mb-2">
            <strong>Educational Level:</strong> {job.educational_level}
          </p>
          <p className="mb-2">
            <strong>Experience Level:</strong> {job.experience_level}
          </p>
          <p className="mb-2">
            <strong>Job Description:</strong> {job.job_description}
          </p>
          <p className="mb-2">
            <strong>Salary Range:</strong> {job.salary_range}
          </p>
          <p className="mb-2">
            <strong>Skills Required:</strong> {job.skill_required}
          </p>
          <p className="mb-2">
            <strong>Job Duration:</strong> {job.job_duration}
          </p>
          <p className="mb-2">
            <strong>Posted on:</strong> {new Date(job.created_at).toLocaleDateString()}
          </p>
          <div className="flex gap-10">
            <button
              className="bg-blue-400 text-white hover:bg-white hover:text-black w-[10pc] shadow-lg hover:shadow-xl"
            //   onClick={handleApplyJob} 
              type='button'
            >
              Apply
            </button>
            <button
              className="bg-blue-400 text-white hover:bg-white hover:text-black w-[10pc] shadow-lg hover:shadow-xl"
              onClick={handleUnsaveJob} type='button'
            >
              Unsave
            </button>
          </div>
      
        </div>
      
      </form>
    </div>
  );
}

export default SavedJobDetails;