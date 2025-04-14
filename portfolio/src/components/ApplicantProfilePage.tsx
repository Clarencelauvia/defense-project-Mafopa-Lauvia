import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faEnvelope,
  faFilePdf,
  faVideo
} from '@fortawesome/free-solid-svg-icons';
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
  code: string;
  address?: string;
  contact_number?: string;
  gender?: string;
  image?: string;
  video_url?: string | null;
  resume_url?: string | null;
}

const ApplicantProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);
  useEffect(() => {
    console.log('Applicant data:', {
      video_url: applicant?.video_url,
      resume_url: applicant?.resume_url
    });
  }, [applicant]);

  const fetchApplicant = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<Applicant>(
        `http://localhost:8000/api/employer/applicant/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.first_name || !response.data.last_name) {
        throw new Error('Applicant data is missing required name fields');
      }

      setApplicant(response.data );
    } catch (err) {
      setError('Failed to fetch applicant details');
      console.error('Error fetching applicant:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplicant();
  }, [fetchApplicant]);

  const updateApplicationStatus = useCallback(async (status: 'accepted' | 'denied') => {
    if (!applicant?.id) return;
  
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      console.log('Attempting to update status for applicant:', applicant.id, 'to:', status);
      
      const response = await axios.put(
        `http://localhost:8000/api/employer/applicants/${applicant.id}/status`,
        { status },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          } 
        }
      );
  
      console.log('Update successful:', response.data);
  
      const successMessage = status === 'accepted' 
        ? 'Application Accepted! The applicant has been notified.' 
        : 'Application Rejected. The applicant has been notified.';
  
      await Swal.fire({
        title: status === 'accepted' ? 'Success!' : 'Rejected',
        text: successMessage,
        icon: status === 'accepted' ? 'success' : 'info',
        confirmButtonColor: '#3085d6'
      });
  
      // Refresh applicant data
      await fetchApplicant();
    } catch (err) {
      console.error('Full error object:', err);
      
      let errorMessage = 'Failed to update application status';
      let errorDetails = '';
      
      if (axios.isAxiosError(err)) {
        console.error('API Error Response:', err.response?.data);
        errorMessage = err.response?.data?.message || errorMessage;
        errorDetails = err.response?.data?.error || '';
      }
  
      await Swal.fire({
        title: 'Error!',
        html: `<div>
          <p>${errorMessage}</p>
          ${errorDetails ? `<p class="text-sm mt-2">${errorDetails}</p>` : ''}
        </div>`,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setProcessing(false);
    }
  }, [applicant?.id, fetchApplicant]);

  const handleContactApplicant = useCallback(async () => {
    if (!applicant?.contact_number) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'No contact number available for this applicant.'
      });
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        'http://localhost:8000/api/send-sms',
        { 
          to: applicant.contact_number, 
          message: `You have been contacted regarding your application. Please check your email for details.` 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await Swal.fire({
        icon: 'success',
        title: 'Message Sent',
        text: 'The applicant has been notified.',
      });
    } catch (err) {
      console.error('Contact error:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to contact applicant',
      });
    } finally {
      setProcessing(false);
    }
  }, [applicant]);

  if (loading) {
    return (
      <div className="text-white w-screen h-screen bg-gradient-to-b from-blue-800 to-blue-950">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-800 to-blue-950 text-red-500">
        {error}
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-800 to-blue-950 text-white">
        No applicant found.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>
        <h2 className="text-white text-2xl font-bold">Applicant Profile</h2>
        <div className="flex items-center space-x-4">
          <Link to="/settings" className="text-white hover:text-blue-300 transition-colors">
            Settings
          </Link>
          <Link to="/contact" className="text-white hover:text-blue-300 transition-colors">
            Contact
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 flex flex-col items-center">
        <button
          onClick={() => navigate('/employer_dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4 self-start"
        >
          Back to Dashboard
        </button>

        {/* Main Profile Content - Centered */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md mb-6 w-full max-w-4xl" 
            data-aos="zoom-in"
            data-aos-delay="100">
          {/* Applicant Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center">
{applicant.image ? (
  <img src={`http://localhost:8000${applicant.image}`} alt="Profile" 
   className="h-16 w-16 rounded-full object-cover" />
) : (
  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
    {applicant.first_name?.charAt(0) || '?'}{applicant.last_name?.charAt(0) || '?'}
  </div>
)}
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-white">
                  {applicant.first_name} {applicant.last_name}
                </h2>
                <p className="text-sm text-gray-300">{applicant.email}</p>
                <div className="mt-1 flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    applicant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    applicant.status === 'denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => updateApplicationStatus('accepted')}
                disabled={applicant.status === 'accepted' || processing}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  applicant.status === 'accepted' ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                {processing && applicant.status !== 'accepted' ? 'Processing...' : 'Accept'}
              </button>
              <button
                onClick={() => updateApplicationStatus('denied')}
                disabled={applicant.status === 'denied' || processing}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  applicant.status === 'denied' ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
              >
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                {processing && applicant.status !== 'denied' ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={handleContactApplicant}
                disabled={processing || !applicant.contact_number}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Contact
              </button>
            </div>
          </div>

          {/* Applicant Details */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-300">Full Name</p>
                  <p className="mt-1 text-sm text-white">
                    {applicant.first_name} {applicant.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Email</p>
                  <p className="mt-1 text-sm text-white">{applicant.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Phone</p>
                  <p className="mt-1 text-sm text-white">
                    {applicant.code} {applicant.contact_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Gender</p>
                  <p className="mt-1 text-sm text-white">{applicant.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Address</p>
                  <p className="mt-1 text-sm text-white">{applicant.address || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-300">Qualification</p>
                  <p className="mt-1 text-sm text-white">{applicant.qualification || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Experience Level</p>
                  <p className="mt-1 text-sm text-white">{applicant.experienceLevel || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Education Level</p>
                  <p className="mt-1 text-sm text-white">{applicant.educational_level || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Application Date</p>
                  <p className="mt-1 text-sm text-white">
                    {new Date(applicant.application_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Materials */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-4">Application Materials</h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
           

{/* Resume Section */}
<div className="bg-white bg-opacity-10 p-4 rounded-lg">
  <div className="flex items-center mb-3">
    <FontAwesomeIcon icon={faFilePdf} className="text-red-400 mr-2" />
    <h4 className="font-medium text-white">Resume</h4>
  </div>
  
  {applicant.resume_url ? (
    <div className="space-y-3">
      <iframe
        src={applicant.resume_url.startsWith('http') ? applicant.resume_url : `http://localhost:8000${applicant.resume_url}`}
        className="w-full h-96 border border-gray-600 rounded bg-white"
        title="Applicant Resume"
      />
      <a
        href={applicant.resume_url.startsWith('http') ? applicant.resume_url : `http://localhost:8000${applicant.resume_url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Download Resume
      </a>
    </div>
  ) : (
    <p className="text-sm text-gray-300">No resume submitted</p>
  )}
</div>

{/* Video Section */}
<div className="bg-white bg-opacity-10 p-4 rounded-lg">
  <div className="flex items-center mb-3">
    <FontAwesomeIcon icon={faVideo} className="text-blue-400 mr-2" />
    <h4 className="font-medium text-white">Video Introduction</h4>
  </div>
  
  {applicant.video_url ? (
    <div className="space-y-3">
      <video
        controls
        className="w-full rounded border border-gray-600"
        src={applicant.video_url.startsWith('http') ? applicant.video_url : `http://localhost:8000${applicant.video_url}`}
      />
      <a
        href={applicant.video_url.startsWith('http') ? applicant.video_url : `http://localhost:8000${applicant.video_url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Open Video in New Tab
      </a>
    </div>
  ) : (
    <p className="text-sm text-gray-300">No video submitted</p>
  )}
</div>
            </div>
          </div>
        </div>

        {/* Back Button - Centered */}
        <div className="mb-6 w-full max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 mt-5 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300 w-full justify-center"
          >
            Back to Applicants
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfilePage;