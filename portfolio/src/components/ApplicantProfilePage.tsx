import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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
  video_url?: string;
  resume_url?: string;
}

const ApplicantProfilePage: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const applicantFromState = location.state?.applicantData;

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    if (applicantFromState) {
      setApplicant(applicantFromState);
      setLoading(false);
      return;
    }

    const fetchApplicant = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/employer/applicant/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplicant(response.data);
      } catch (error) {
        setError('Failed to fetch applicant details. Please try again later.');
        console.error('Error fetching applicant details:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch applicant details.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplicant();
    }
  }, [id, applicantFromState]);

  const handleContactApplicant = async () => {
    const organisationName = "Your Organisation Name";
    const qualification = applicant?.qualification || "a job";

    const message = `You have been contacted by ${organisationName} because you applied for ${qualification} from PAM. Connect to have more information.`;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/send-sms',
        {
          to: applicant?.contact_number,
          message: message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'SMS Sent',
          text: 'The applicant has been notified.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send SMS.',
        });
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send SMS.',
      });
    }
  };

  const handleAcceptApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/applicants/${applicant?.id}/status`,
        { status: 'accepted' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Application Accepted',
        text: 'The applicant has been notified.',
      }).then(() => {
        if (applicant) {
          setApplicant({ ...applicant, status: 'accepted' });
        }
      });
    } catch (error) {
      console.error('Error accepting application:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to accept application.',
      });
    }
  };

  const handleRejectApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/applicants/${applicant?.id}/status`,
        { status: 'denied' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Application Rejected',
        text: 'The applicant has been notified.',
      }).then(() => {
        if (applicant) {
          setApplicant({ ...applicant, status: 'denied' });
        }
      });
    } catch (error) {
      console.error('Error rejecting application:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reject application.',
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen" style={{ color: 'red' }}>{error}</div>;
  }

  if (!applicant) {
    return <div className="flex justify-center items-center h-screen">No applicant found.</div>;
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

      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center mb-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Previous
        </button>

        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md"
          data-aos="zoom-in"
          data-aos-delay="300">
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Profile Info */}
            <div className="md:w-1/2">
              <div className="flex justify-center mb-4">
                {applicant.image ? (
                  <img
                    src={applicant.image.startsWith('http') ? applicant.image : `http://localhost:8000${applicant.image}`}
                    alt={`${applicant.first_name} ${applicant.last_name}`}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
                    {applicant.first_name.charAt(0).toUpperCase()}
                    {applicant.last_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                {applicant.first_name} {applicant.last_name}
              </h2>
              
              <div className="space-y-2">
                <p className="text-md text-white"><strong>Email:</strong> {applicant.email}</p>
                <p className="text-md text-white"><strong>Qualification:</strong> {applicant.qualification || 'Not specified'}</p>
                <p className="text-md text-white"><strong>Experience:</strong> {applicant.experienceLevel || 'Not specified'}</p>
                <p className="text-md text-white"><strong>Education:</strong> {applicant.educational_level || 'Not specified'}</p>
                <p className="text-md text-white"><strong>Address:</strong> {applicant.address || 'Not specified'}</p>
                <p className="text-md text-white"><strong>Country Code:</strong> {applicant.code || 'Not specified'}</p>
                <p className="text-md text-white"><strong>Contact Number:</strong> {applicant.contact_number || 'Not specified'}</p>
                <p className="text-md text-white"><strong>Gender:</strong> {applicant.gender || 'Not specified'}</p>
                <p className="text-md text-white"><strong>Applied on:</strong> {new Date(applicant.application_date).toLocaleDateString()}</p>
                <p className="text-md text-white">
                  <strong>Status:</strong> 
                  <span className={`ml-2 ${
                    applicant.status === 'accepted' ? 'text-green-500' :
                    applicant.status === 'denied' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    {applicant.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column - Application Materials */}
        
         
<div className="md:w-1/2">
  <div className="bg-white bg-opacity-5 rounded-lg p-4 mb-4">
    <h3 className="text-lg font-semibold text-white mb-2">Application Materials</h3>
    
    {applicant.resume_url ? (
  <a 
    href={applicant.resume_url}
    target="_blank" 
    rel="noopener noreferrer"
    className="text-blue-300 hover:text-blue-200 inline-block"
  >
    <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300">
      Download Resume
    </div>
  </a>
) : (
  <p className="text-white text-opacity-70">No resume submitted</p>
)}
    {applicant.video_url && (
      <div>
        <h4 className="text-white font-semibold mb-2">Video Introduction</h4>
        <div className="bg-black bg-opacity-50 rounded-lg overflow-hidden">
          <video 
            controls 
            className="w-full"
            onError={(e) => console.error('Video error:', e)}
          >
            <source 
              src={applicant.video_url} 
              type="video/mp4" 
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    )}

    {!applicant.resume_url && !applicant.video_url && (
      <p className="text-white text-opacity-70">No application materials submitted</p>
    )}
  </div>
</div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button 
              onClick={handleAcceptApplication}
              className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300 ${
                applicant.status === 'accepted' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={applicant.status === 'accepted'}
            >
              Accept Application
            </button>
            <button 
              onClick={handleRejectApplication}
              className={`bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-300 ${
                applicant.status === 'denied' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={applicant.status === 'denied'}
            >
              Reject Application
            </button>
            <button 
              onClick={handleContactApplicant} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
            >
              Contact Applicant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfilePage;