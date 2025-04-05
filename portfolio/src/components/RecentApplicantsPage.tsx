import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';

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
  address?: string;
  contact_number?: string;
  gender?: string;
}

const RecentApplicantsPage: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentApplicants = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:8000/api/employer/applicants', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter applicants who applied within the last 48 hours
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const recentApplicants = response.data.filter((applicant: Applicant) => {
          const applicationDate = new Date(applicant.application_date);
          return applicationDate >= fortyEightHoursAgo;
        });

        setApplicants(recentApplicants);
      } catch (error) {
        setError('Failed to fetch recent applicants. Please try again later.');
        console.error('Error fetching recent applicants:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch recent applicants.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentApplicants();
  }, []);

  if (loading) {
    return <div className="h-screen flex">Loading...</div>;
  }

  if (error) {
    return <div className="h-screen " style={{ color: 'red' }}>{error}</div>;
  }

  if (applicants.length === 0) {
    return <div className="h-screen w-screen bg-blue-950 text-white">No recent applicants found.
     {/* Back Button */}
              <div className="mb-6" data-aos="fade-right" data-aos-delay="250">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300"
                >
                  <FaArrowLeft className="mr-2" />
                  Previous
                </button>
              </div></div>
    ;
  }

  return (
    <div className="">
      <div>
        <div className="bg-blue-900 w-screen mb-5">
          <nav className="flex items-center w-[84pc] justify-between border-b-[1px] border-b-black mb-[-20px]">
            <img src="/pam.png" alt="Not Found" className="w-[80px] ml-5" />
            <h2 className="text-white text-center text-2xl">Recent Applicants (Last 48 Hours)</h2>
            <img src="/pam.png" alt="Not Found" className="w-[80px] ml-5" />
          </nav>
        </div>
        <div className="w-screen p-8 bg-gray-100 min-h-screen mt-0">
          {/* Button to navigate back to the employer dashboard */}
          <button
            onClick={() => navigate('/employer_dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4"
          >
            Back to Dashboard
          </button>
          <br />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicants.map((applicant) => (
              <div key={applicant.id} className="bg-white border border-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{applicant.first_name} {applicant.last_name}</h2>
                  <span className={`px-2 py-1 rounded text-xs ${
                    applicant.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                    applicant.status === 'approved' ? 'bg-green-200 text-green-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Email: {applicant.email}</p>
                <p className="text-sm text-gray-600 mb-2">Qualification: {applicant.qualification || 'Not specified'}</p>
                <p className="text-sm text-gray-600 mb-2">Experience: {applicant.experienceLevel || 'Not specified'}</p>
                <p className="text-sm text-gray-600 mb-2">Education: {applicant.educational_level || 'Not specified'}</p>
                <p className="text-sm text-gray-600 mb-4">Applied on: {new Date(applicant.application_date).toLocaleDateString()}</p>
                <div className="flex justify-between items-center">
                  <Link to={`/employer/applicant/${applicant.id}`} state={{ applicantData: applicant }}>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300">
                      View Full Profile
                    </button>
                  </Link>
                  <div className="flex gap-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors duration-300">
                      Accept
                    </button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors duration-300">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentApplicantsPage;