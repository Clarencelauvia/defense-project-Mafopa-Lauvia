import { postJob, performWarmMatch } from './authService';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaArrowLeft } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { PusherContext } from './PusherContext';

interface ErrorResponse {
  message: string;
  errors: {
    [key: string]: string[]; // Each field can have multiple error messages
  };
}
interface JobPostData {
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
}
function Entrejobs() {

  const pusher = useContext(PusherContext);
  
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const location = useLocation();
  const organisationName = location.state?.organisationName || ''; // Get organisation_name from state
  const domain = location.state?.domain || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobTitle: '',
    educationalLevel: '',
    jobDescription: '',
    salaryRange: '',
    jobCategory: domain,
    experienceLevel: '',
    companyDescription: organisationName || '', // Pre-fill with organisation_name
    jobType: '',
    skillRequired: '',
    location: '',
    jobDuration: '',
  });

  useEffect(() => {
    if (organisationName) {
      setFormData(prev => ({
        ...prev,
        companyDescription: organisationName
      }));
    }
  }, [organisationName]);
  

  // Hook for navigation 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isJobPosted, setIsJobPosted] = useState(false);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  
  // Fetch existing jobs when component mounts
  useEffect(() => {
    fetchPostedJobs();
  }, []);

  // Function to fetch existing jobs
  const fetchPostedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      // Add API call to fetch jobs posted by this employer
      const response = await axios.get('http://localhost:8000/api/employer/jobs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPostedJobs(response.data);
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
    }
  };

  // Function to check if job is a duplicate
  const isDuplicateJob = () => {
    return postedJobs.some(job => {
      const jobTitle = job.job_title?.toLowerCase() || '';
      const companyName = job.company_name?.toLowerCase() || '';
      const jobCategory = job.job_category?.toLowerCase() || '';
      
      return (
        jobTitle === formData.jobTitle.toLowerCase() && 
        companyName === formData.companyDescription.toLowerCase() &&
        jobCategory === formData.jobCategory.toLowerCase()
      );
    });
  };

  // Function to perform warm matching
  const performWarmMatch = async (jobId: number) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/jobs/${jobId}/warm-matches`);
      const warmMatches = response.data;

      // Navigate to the WarmMatchesPage with the matched data
      navigate('/warmMatchPage', { state: { warmMatches } });
    } catch (error) {
      console.error('Error fetching warm matches:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch warm matches. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // handle form submission 

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Transform data to snake_case before sending
  const transformedData = {
    job_title: formData.jobTitle,
    educational_level: formData.educationalLevel,
    job_description: formData.jobDescription,
    salary_range: formData.salaryRange,
    job_category: formData.jobCategory,
    experience_level: formData.experienceLevel,
    company_description: formData.companyDescription,
    skill_required: formData.skillRequired,
    job_type: formData.jobType,
    job_duration: formData.jobDuration,
    location: formData.location
  };

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    // call the postJob function with transformed data
    const response = await axios.post(
      'http://localhost:8000/api/jobPost',
      transformedData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Rest of your success handling code...
    setSuccessMessage('Job Posting successful!');
    setIsJobPosted(true);
    
    // Show SweetAlert success message
    Swal.fire({
      title: 'Job Posting Successful!',
      text: 'You have successfully posted the job.',
      icon: 'success',
      confirmButtonText: 'Go to dashboard',
    }).then(() => {
      navigate('/employer_dashboard', { state: { refreshJob: true } });
    });

    // Reset form
    setFormData({
      jobTitle: '',
      educationalLevel: '',
      jobDescription: '',
      salaryRange: '',
      jobCategory: domain,
      experienceLevel: '',
      companyDescription: organisationName || '',
      skillRequired: '',
      jobType: '',
      jobDuration: '',
      location: '',
    });

  } catch (error) {
    // Error handling remains the same
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 422) {
        console.error('Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
        setErrorMessage('Please fill in all required fields correctly.');
      } else {
        console.error('Job posting failed:', error);
        setErrorMessage('Job posting failed. Please try again.');
      }
    } else {
      console.error('An unexpected error occurred:', error);
      setErrorMessage('An unexpected error occurred.');
    }
  }
};

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen pb-10 w-screen">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-16 py-6 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-8" data-aos="fade-down" data-aos-delay="100">
        <Link to="/" className="flex items-center">
          <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
            <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-3xl font-bold">Professionals & Matches</h1>
        </Link>

        <h2 className="text-white text-2xl font-bold">Post a New Job</h2>

        <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
          <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
        </div>
      </nav>

      {/* Job Posting Form */}
      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 mt-0 mb-4 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300"
        >
          <FaArrowLeft className="mr-2" />
          Previous
        </button>
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg p-8 max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="200">
          <form onSubmit={handleSubmit} id="JobPosting" className="text-white">
            {/* Error/Success Messages */}
            {errorMessage && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6 text-center" data-aos="fade-in">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 text-white p-4 rounded-lg mb-6 text-center" data-aos="fade-in">
                {successMessage}
              </div>
            )}
            

            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Job Icon Section */}
              <div className="md:w-1/4 flex flex-col items-center" data-aos="fade-right" data-aos-delay="300">
              
                <div className="bg-blue-500 bg-opacity-20 border-2 border-blue-300 w-[180px] h-[180px] rounded-lg overflow-hidden flex items-center justify-center mb-4">
                  <FaBriefcase size={64} className="text-blue-300 opacity-70" />
                </div>
                <div className="text-center text-blue-300">
                  
                  <p className="text-lg font-semibold mb-2">Create a New Job</p>
                  <p className="text-sm opacity-80">Fill in the details to post a new job opportunity</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="md:w-3/4" data-aos="fade-left" data-aos-delay="400">
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                   
                  {/* Job Information - Left Column */}
                  <div>
                    <label className="block text-blue-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      id="jobTitle"
                      list="poto"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.jobTitle}
                      onChange={handleChange}
                    />
                    <datalist id="poto">
                      <option value="Front-End Developper">Front-End Developper</option>
                      <option value="Back-End Developper">Back-End Developper</option>
                      <option value="Full Stack">Full Stack</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Medical Doctor">Medical Doctor</option>
                      <option value="Shopkeeper">Shopkeeper</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Mecanician">Mecanician</option>
                      <option value="IT technician">IT Technician</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Agronomist">Agronomist</option>
                      <option value="Stylist">Stylist</option>
                      <option value="Mechanical Engineer">Mechanical Engineer</option>
                    </datalist>
                    
                    <label className="block text-blue-300 mt-4 mb-1">Job Description</label>
                    <textarea
                      name="jobDescription"
                      id="jobDescription"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                      value={formData.jobDescription}
                      onChange={handleChange}
                    ></textarea>
                    
                    <label className="block text-blue-300 mt-4 mb-1">Job Category</label>
                    <input
                      type="text"
                      name="jobCategory"
                      id="jobCategory"
                      list="select"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.jobCategory}
                      onChange={handleChange}
                    />
                    <datalist id="select">
                      <option value="IT Technician">IT Technician</option>
                      <option value="software Engineering">Software Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Health">Health</option>
                      <option value="Trader">Trader</option>
                      <option value="Teaching">Teaching</option>
                      <option value="IT Support">IT Support</option>
                    </datalist>
                    
                    <label className="block text-blue-300 mt-4 mb-1">Company Name</label>
                    <textarea
                      name="companyDescription"
                      id="companyDescription"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                      value={formData.companyDescription}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  
                  {/* Rest of the form remains unchanged */}
                  <div>
                    <label className="block text-blue-300 mb-1">Educational Level</label>
                    <input
                      type="text"
                      list="optiond"
                      name="educationalLevel"
                      id="educationalLevel"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.educationalLevel}
                      onChange={handleChange}
                    />
                    <datalist id="optiond">
                      <option value="OL">OL</option>
                      <option value="AL">AL</option>
                      <option value="HND">HND</option>
                      <option value="Bachelor Degree">Bachelor Degree</option>
                      <option value="Master Degree">Master Degree</option>
                      <option value="PHD">PHD</option>
                    </datalist>
                    
                    <label className="block text-blue-300 mt-4 mb-1">Salary Range</label>
                    <select
                      name="salaryRange"
                      id="salaryRange"
                      className="w-full p-3 bg-white  bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.salaryRange}
                      onChange={handleChange}
                    >
                      <option className='text-black' value="" disabled selected hidden></option>
                      <option className='text-black' value="15000">15000</option>
                      <option className='text-black' value="15000-50000">15000-50000</option>
                      <option className='text-black' value="50000-200000">50000-200000</option>
                      <option className='text-black' value="200000-500000">200000-500000</option>
                      <option className='text-black' value="+500000">+500000</option>
                    </select>
                    
                    <label className="block text-blue-300 mt-4 mb-1">Experience Level</label>
                    <select
                      name="experienceLevel"
                      id="experienceLevel"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                    >
                      <option className='text-black' value="" disabled selected hidden></option>
                      <option className='text-black' value="Entry-level">Entry-level</option>
                      <option className='text-black' value="Mid-level">Mid-level</option>
                      <option className='text-black' value="Senior-level">Senior-level</option>
                    </select>
                    
                    <label className="block text-blue-300 mt-4 mb-1">Skills Required</label>
                    <textarea
                      placeholder="Maximum of three"
                      name="skillRequired"
                      id="skillRequired"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                      maxLength={45}
                      value={formData.skillRequired}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  
                  {/* Bottom Section - Full Width */}
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-blue-300 mb-1">Job Preference</label>
                      <select
                        name="jobType"
                        id="jobType"
                        className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.jobType}
                        onChange={handleChange}
                      >
                        <option className='text-black' value="" disabled selected hidden></option>
                        <option className='text-black' value="Internship">Internship</option>
                        <option className='text-black' value="Freelance">Freelance</option>
                        <option className='text-black' value="Full-time">Full-time</option>
                        <option className='text-black' value="Part-time">Part-time</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-blue-300 mb-1">Job Duration</label>
                      <select
                        name="jobDuration"
                        id="jobDuration"
                        className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.jobDuration}
                        onChange={handleChange}
                      >
                        <option className='text-black' value="" disabled selected hidden></option>
                        <option className='text-black' value="3 months">3 months</option>
                        <option className='text-black' value="6 Months">6 months</option>
                        <option className='text-black' value="1 Year">1 Year</option>
                        <option className='text-black' value="Unspecified">Unspecified</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-blue-300 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        list="options"
                        className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.location}
                        onChange={handleChange}
                      />
                      <datalist id="options">
                        <option value="Maroua">Maroua</option>
                        <option value="Garoua">Garoua</option>
                        <option value="Ngaoundere">Ngaoundere</option>
                        <option value="Bertoua">Bertoua</option>
                        <option value="Yaounde">Yaounde</option>
                        <option value="Bafoussam">Bafoussam</option>
                        <option value="Bamenda">Bamenda</option>
                        <option value="Buea">Buea</option>
                        <option value="Douala">Douala</option>
                        <option value="Ebolowa">Ebolowa</option>
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className={`w-full py-4 ${isJobPosted ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1`}
                    disabled={isJobPosted}
                  >
                    {isJobPosted ? 'Job Posted' : 'Post Job'}
                  </button>
                </div>

                {/* Back to Dashboard Link */}
                <div className="mt-4 text-center">
                  <Link to="/employer_dashboard" className="text-blue-300 hover:text-white">
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Entrejobs;