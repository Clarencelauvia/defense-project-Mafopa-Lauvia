import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

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
  video_url?: string;
  resume_url?: string;
}

const ApplicantsListPage: React.FC = () => {
  const location = useLocation();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const employerId = location.state?.employerId;
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/employer/applicants', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplicants(response.data);
      } catch (error) {
        setError('Failed to fetch applicants. Please try again later.');
        console.error('Error fetching applicants:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch applicants.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [employerId]);

  const handlePreviousClick = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen" style={{ color: 'red' }}>{error}</div>;
  }

  if (applicants.length === 0) {
    return <div className="flex justify-center items-center h-screen">No applicants found.</div>;
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
        <h2 className="text-white text-2xl font-bold">Applicants List</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applicants.map((applicant, index) => (
            <div key={applicant.id} 
              data-aos="zoom-in"
              data-aos-delay={index * 100}
              className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">{applicant.first_name} {applicant.last_name}</h2>
                <span className={`px-2 py-1 rounded text-xs ${
                  applicant.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                  applicant.status === 'approved' ? 'bg-green-200 text-green-800' : 
                  'bg-red-200 text-red-800'
                }`}>
                  {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-white mb-2">Email: {applicant.email}</p>
              <p className="text-sm text-white mb-2">Qualification: {applicant.qualification || 'Not specified'}</p>
              <p className="text-sm text-white mb-2">Experience: {applicant.experienceLevel || 'Not specified'}</p>
              <p className="text-sm text-white mb-2">Education: {applicant.educational_level || 'Not specified'}</p>
              <p className="text-sm text-white mb-4">Applied on: {new Date(applicant.application_date).toLocaleDateString()}</p>
              
              {/* Add indicators for video and resume */}
              <div className="flex gap-2 mb-4">
                {applicant.video_url && (
                  <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Video Available
                  </span>
                )}
                {applicant.resume_url && (
                  <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Resume Available
                  </span>
                )}
              </div>
              
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

        {/* Back Button */}
        <div className="mb-6" data-aos="fade-right" data-aos-delay="250">
          <button
            onClick={() => navigate(-1)}
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

export default ApplicantsListPage;