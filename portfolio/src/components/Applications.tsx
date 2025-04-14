import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface JobApplication {
  id: number;
  job_id: number;
  job_title: string;
  application_date: string;
  status: string;
  organisation_name: string;
  qualification:string;
  location:string;

}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get status filter from URL query params
  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get('status') || 'all';

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
        // Filter applications based on status if specified
        let filteredApplications = response.data;
        if (statusFilter !== 'all') {
          filteredApplications = response.data.filter(
            (app: JobApplication) => app.status === statusFilter
          );
        }
        setApplications(filteredApplications);
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
  }, [statusFilter]); // Refetch when status filter changes

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>
        <h2 className="text-white text-2xl font-bold">
          {statusFilter === 'all' ? 'All Applications' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Applications`}
        </h2>
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

        {/* Status Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          <Link
            to="/applications"
            className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}
          >
            All
          </Link>
          <Link
            to="/applications?status=pending"
            className={`px-4 py-2 rounded-md ${statusFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'}`}
          >
            Pending
          </Link>
          <Link
            to="/applications?status=accepted"
            className={`px-4 py-2 rounded-md ${statusFilter === 'accepted' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
          >
            Accepted
          </Link>
          <Link
            to="/applications?status=denied"
            className={`px-4 py-2 rounded-md ${statusFilter === 'denied' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}
          >
            Denied
          </Link>
        </div>

        {isLoading ? (
          <p className="text-white">Loading applications...</p>
        ) : applications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md">
                <div className='flex justify-between'>
                  <h2 className="text-xl font-bold text-white">{application.job_title}</h2>
                  <p className="text-sm text-white">
                    Status:{' '}
                    <span className={`font-bold ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </p>
                </div>
                {application.organisation_name && (
                  <p className="text-sm text-white mt-2">Company: {application.organisation_name}</p>
                )}
                  {application.qualification && (
                  <p className="text-sm text-white mt-2">Qualification: {application.qualification}</p>
                )}
                  {application.location && (
                  <p className="text-sm text-white mt-2">Location: {application.location}</p>
                )}
                <p className="text-sm text-white mt-2">
                  Applied on: {new Date(application.application_date).toLocaleDateString()}
                </p>
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
          <div className="text-center py-8">
            <p className="text-white text-lg">
              No {statusFilter === 'all' ? '' : statusFilter} applications found.
            </p>
            <Link
              to="/jobs"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;