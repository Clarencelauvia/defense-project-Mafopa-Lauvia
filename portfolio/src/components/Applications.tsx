import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

interface JobApplication {
  id: number;
  job_id: number;
  job_title: string;
  application_date: string;
  status: string;
  organisation_name:string;
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAppliedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: 'You must be logged in to view applications.',
          confirmButtonText: 'OK',
        }).then(() => {
          window.location.href = '/employee_login';
        });
        return;
      }

      const response = await axios.get('http://localhost:8000/api/applied-jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        setApplications(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch applied jobs:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch applied jobs. Please try again later.',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>
        <h2 className="text-white text-2xl font-bold">Applied Jobs</h2>
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

        {isLoading ? (
          <p>Loading...</p>
        ) : applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md">
             <div className='flex justify-between'>
             <h2 className="text-xl font-bold text-white text-center">{application.job_title}</h2> 
                  <p className="text-sm text-white">
                  Status:{' '}
                  <span
                    className={`font-bold ${
                      application.status === 'accepted' ? 'text-green-600' :
                      application.status === 'denied' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}
                  >
                    {application.status}
                  </span>
                </p>
                {/* <h2 className="text-xl font-bold text-white text-center">{application.organisation_name} </h2> */}
             </div>
             <br />
                <p className="text-sm text-white">Applied on: {new Date(application.application_date).toLocaleDateString()}</p>
              
                <div className="flex justify-center mt-6">
                  <Link
                    to={`/job/${application.job_id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    View Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No applied jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default Applications;