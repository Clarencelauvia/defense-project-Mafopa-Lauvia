import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaArrowLeft } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface Job {
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

const ModifyJobs: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job>({
    job_title: '',
    educational_level: '',
    job_description: '',
    salary_range: '',
    job_category: '',
    experience_level: '',
    company_description: '',
    skill_required: '',
    job_type: '',
    job_duration: '',
    location: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 1000,
      once: true,
    });

    // Fetch job details
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/employer/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(response.data);
      } catch (error) {
        console.error('Failed to fetch job:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to fetch job details',
          text: 'Please try again later.',
        });
      }
    };

    fetchJob();
  }, [jobId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/employer/jobs/${jobId}`, job, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: 'success',
        title: 'Job updated successfully',
      }).then(() => {
        navigate('/employer/manage-jobs');
      });
    } catch (error) {
      console.error('Failed to update job:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to update job',
        text: 'Please try again later.',
      });
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setJob({ ...job, [e.target.name]: e.target.value });
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

        <h2 className="text-white text-2xl font-bold">Edit Job Details</h2>

        <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
          <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
        </div>
      </nav>

      {/* Job Editing Form */}
      <div className="container mx-auto px-6">
          {/* Back Button */}
          <div className="mb-6" data-aos="fade-right" data-aos-delay="250">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300"
            >
              <FaArrowLeft className="mr-2" />
              Previous
            </button>
          </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg p-8 max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="200">
        

          <form onSubmit={handleSubmit} id="JobPosting" className="text-white">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Job Icon Section */}
              <div className="md:w-1/4 flex flex-col items-center" data-aos="fade-right" data-aos-delay="300">
                <div className="bg-blue-500 bg-opacity-20 border-2 border-blue-300 w-[180px] h-[180px] rounded-lg overflow-hidden flex items-center justify-center mb-4">
                  <FaBriefcase size={64} className="text-blue-300 opacity-70" />
                </div>
                <div className="text-center text-blue-300">
                  <p className="text-lg font-semibold mb-2">Edit Job Details</p>
                  <p className="text-sm opacity-80">Update the job information below</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="md:w-3/4" data-aos="fade-left" data-aos-delay="400">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Job Information - Left Column */}
                  <div>
                    <label htmlFor="job_title" className="block text-blue-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      name="job_title"
                      id="job_title"
                      list="poto"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={job.job_title}
                      onChange={handleChange}
                    />
                    <datalist id="poto">
                      <option value="Front-End Developer">Front-End Developer</option>
                      <option value="Back-End Developer">Back-End Developer</option>
                      <option value="Full Stack">Full Stack</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Medical Doctor">Medical Doctor</option>
                      <option value="Shopkeeper">Shopkeeper</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Mechanician">Mechanician</option>
                      <option value="IT Technician">IT Technician</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Agronomist">Agronomist</option>
                      <option value="Stylist">Stylist</option>
                      <option value="Mechanical Engineer">Mechanical Engineer</option>
                    </datalist>
                    
                    <label htmlFor="job_description" className="block text-blue-300 mt-4 mb-1">Job Description</label>
                    <textarea
                      name="job_description"
                      id="job_description"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                      value={job.job_description}
                      onChange={handleChange}
                    ></textarea>
                    
                    <label htmlFor="job_category" className="block text-blue-300 mt-4 mb-1">Job Category</label>
                    <input
                      type="text"
                      name="job_category"
                      id="job_category"
                      list="select"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={job.job_category}
                      onChange={handleChange}
                    />
                    <datalist id="select">
                      <option value="IT Technician">IT Technician</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Health">Health</option>
                      <option value="Trader">Trader</option>
                      <option value="Teaching">Teaching</option>
                      <option value="IT Support">IT Support</option>
                    </datalist>
                    
                    <label htmlFor="company_description" className="block text-blue-300 mt-4 mb-1">Company Name</label>
                    <textarea
                      name="company_description"
                      id="company_description"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                      value={job.company_description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  
                  {/* Job Information - Right Column */}
                  <div>
                    <label htmlFor="educational_level" className="block text-blue-300 mb-1">Educational Level</label>
                    <input
                      type="text"
                      list="optiond"
                      name="educational_level"
                      id="educational_level"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={job.educational_level}
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
                    
                    <label htmlFor="salary_range" className="block text-blue-300 mt-4 mb-1">Salary Range</label>
                    <select
                      name="salary_range"
                      id="salary_range"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={job.salary_range}
                      onChange={handleChange}
                    >
                      <option value="" disabled hidden></option>
                      <option value="15000">15000</option>
                      <option value="15000-50000">15000-50000</option>
                      <option value="50000-200000">50000-200000</option>
                      <option value="200000-500000">200000-500000</option>
                      <option value="+500000">+500000</option>
                    </select>
                    
                    <label htmlFor="experience_level" className="block text-blue-300 mt-4 mb-1">Experience Level</label>
                    <select
                      name="experience_level"
                      id="experience_level"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={job.experience_level}
                      onChange={handleChange}
                    >
                      <option value="" disabled hidden></option>
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior-level">Senior-level</option>
                    </select>
                    
                    <label htmlFor="skill_required" className="block text-blue-300 mt-4 mb-1">Skills Required</label>
                    <textarea
                      placeholder="Maximum of three"
                      name="skill_required"
                      id="skill_required"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                      maxLength={45}
                      value={job.skill_required}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  
                  {/* Bottom Section - Full Width */}
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="job_type" className="block text-blue-300 mb-1">Job Preference</label>
                      <select
                        name="job_type"
                        id="job_type"
                        className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={job.job_type}
                        onChange={handleChange}
                      >
                        <option value="" disabled hidden></option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="job_duration" className="block text-blue-300 mb-1">Job Duration</label>
                      <select
                        name="job_duration"
                        id="job_duration"
                        className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={job.job_duration}
                        onChange={handleChange}
                      >
                        <option value="" disabled hidden></option>
                        <option value="3 months">3 months</option>
                        <option value="6 Months">6 months</option>
                        <option value="1 Year">1 Year</option>
                        <option value="Unspecified">Unspecified</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-blue-300 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        list="options"
                        className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={job.location}
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
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Save Changes
                  </button>
                </div>

               
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModifyJobs;