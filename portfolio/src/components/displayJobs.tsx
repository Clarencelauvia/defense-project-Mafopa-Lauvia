import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faBookmark, 
  faCheckCircle,
  faFileUpload,
  faVideo,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

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

const DisplayJobs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('0 KB/s');
  const [uploadTimeLeft, setUploadTimeLeft] = useState('Calculating...');
  const [isUploading, setIsUploading] = useState(false);
  const [newlyPostedJobsList, setNewlyPostedJobsList] = useState<Job[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Optimized fetch with caching
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const [jobResponse, savedResponse, appliedResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/jobs/${id}`),
          token ? axios.get('http://localhost:8000/api/saved-jobs', {
            headers: { Authorization: `Bearer ${token}` },
          }) : Promise.resolve({ data: [] }),
          token ? axios.get('http://localhost:8000/api/applied-jobs', {
            headers: { Authorization: `Bearer ${token}` },
          }) : Promise.resolve({ data: [] })
        ]);

        setJob(jobResponse.data);
        setIsSaved(savedResponse.data.some((savedJob: any) => savedJob.id === parseInt(id || '')));
        setHasApplied(appliedResponse.data.some((appliedJob: any) => appliedJob.job_id === parseInt(id || '')));
      } catch (err) {
        setError(axios.isAxiosError(err) && err.response?.status === 404 
          ? 'Job not found.' 
          : 'Failed to fetch job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleSavedJob = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        await Swal.fire({
          icon: 'error',
          title: 'Login Required',
          text: 'You must be logged in to save jobs.',
          background: '#1e293b',
          color: '#ffffff'
        });
        navigate('/login');
        return;
      }

      if (isSaved) {
        // Unsave the job
        await axios.delete(`http://localhost:8000/api/jobs/${id}/unsave`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSaved(false); // Update state to show it's now unsaved
        await Swal.fire({
          icon: 'success',
          title: 'Job Unsaved',
          text: 'This job has been removed from your saved jobs.',
          background: '#1e293b',
          color: '#ffffff'
        });
      } else {
        // Save the job
        await axios.post(
          `http://localhost:8000/api/jobs/${id}/save`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsSaved(true); // Update state to show it's now saved
        await Swal.fire({
          icon: 'success',
          title: 'Job Saved',
          text: 'This job has been added to your saved jobs.',
          background: '#1e293b',
          color: '#ffffff'
        });
      }
    } catch (err) {
      console.error('Error saving job:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save job.',
        background: '#1e293b',
        color: '#ffffff'
      });
    }
};

  // Optimized file upload with progress tracking
  const uploadFile = async (file: File, type: 'resume' | 'video') => {
    const token = localStorage.getItem('token');
    if (!token) {
        await Swal.fire({
            icon: 'error',
            title: 'Login Required',
            text: 'You must be logged in to apply for jobs.',
            background: '#1e293b',
            color: '#ffffff'
        });
        navigate('/login');
        return null;
    }
  // Add client-side file size validation (as a backup)
  if (type === 'video' && file.size > 50 * 1024 * 1024) {
    throw new Error('Video file exceeds 50MB limit');
  }
  if (type === 'resume' && file.size > 5 * 1024 * 1024) {
    throw new Error('Resume file exceeds 5MB limit');
  }
    const formData = new FormData();
    formData.append('chunk', file); // Field name must match what the backend expects
    formData.append('type', type);
    formData.append('chunkIndex', '0'); // Since we're uploading whole file, use 0
    formData.append('totalChunks', '1'); // Only 1 chunk since whole file
    formData.append('filename', file.name);

    try {
        const startTime = Date.now();
        let lastLoaded = 0;
        let lastTime = startTime;

        const response = await axios.post(
            `http://localhost:8000/api/jobs/${id}/upload-chunk`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const currentTime = Date.now();
                        const timeDiff = (currentTime - lastTime) / 1000; // in seconds
                        const loadedDiff = progressEvent.loaded - lastLoaded;
                        
                        if (timeDiff > 0.1) { // Update every 100ms
                            const speed = loadedDiff / timeDiff;
                            const remaining = (progressEvent.total - progressEvent.loaded) / speed;
                            
                            setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
                            setUploadSpeed(formatBytes(speed) + '/s');
                            setUploadTimeLeft(formatTime(remaining));
                            
                            lastLoaded = progressEvent.loaded;
                            lastTime = currentTime;
                        }
                    }
                }
            }
        );

        return response.data.path;
    } catch (err) {
        console.error('Upload error:', err);
        throw err;
    }
};

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const handleApply = async () => {
    try {
      const { value: files } = await Swal.fire({
        title: 'Application Materials',
        html: `
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Video Introduction (max 50MB)</label>
            <input type="file" id="video" accept="video/*" class="swal2-file" required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Resume (PDF, Word, max 5MB)</label>
            <input type="file" id="resume" accept=".pdf,.doc,.docx" class="swal2-file" required>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        background: '#1e293b',
        color: '#ffffff',
        preConfirm: () => {
          const videoInput = document.getElementById('video') as HTMLInputElement;
          const resumeInput = document.getElementById('resume') as HTMLInputElement;
          
          if (!videoInput?.files?.length || !resumeInput?.files?.length) {
            Swal.showValidationMessage('Both files are required');
            return null;
          }
          
          const videoFile = videoInput.files[0];
          const resumeFile = resumeInput.files[0];
          
          if (videoFile.size > 50 * 1024 * 1024) {
            Swal.showValidationMessage('Video must be less than 50MB');
            return null;
          }
          
          if (resumeFile.size > 5 * 1024 * 1024) {
            Swal.showValidationMessage('Resume must be less than 5MB');
            return null;
          }
          
          return {
            video: videoFile,
            resume: resumeFile
          };
        }
      });

      if (!files) return;

      setIsUploading(true);
      setUploadProgress(0);
      
      // Upload files in parallel
      const [resumePath, videoPath] = await Promise.all([
        uploadFile(files.resume, 'resume'),
        uploadFile(files.video, 'video')
      ]);

      // Finalize application
      await axios.post(
        `http://localhost:8000/api/jobs/${id}/finalize-application`,
        { resumeFileName: resumePath, videoFileName: videoPath },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );

      setHasApplied(true);
      setIsUploading(false);
      
      await Swal.fire({
        icon: 'success',
        title: 'Application Submitted!',
        text: 'Your application has been received successfully.',
        background: '#1e293b',
        color: '#ffffff'
      });
    } catch (err) {
      setIsUploading(false);
      console.error('Application error:', err);
      
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        await Swal.fire({
          icon: 'info',
          title: 'Already Applied',
          text: 'You have already applied for this job.',
          background: '#1e293b',
          color: '#ffffff'
        });
        setHasApplied(true);
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to submit application. Please try again.',
          background: '#1e293b',
          color: '#ffffff'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-b from-blue-800 to-blue-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-800 to-blue-950">
        <div className="text-red-400 text-xl mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-800 to-blue-950">
        <div className="text-white text-xl mb-4">No job found with this ID</div>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
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
        <h2 className="text-white text-2xl font-bold">Job Details</h2>
        <div className="flex items-center space-x-4">
          <Link to="/settings" className="text-white hover:text-blue-300 transition-colors">
            Settings
          </Link>
          <Link to="/contact" className="text-white hover:text-blue-300 transition-colors">
            Contact
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-6 flex items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>

        {/* Main Job Content */}
        <div 
          className="bg-white text-xl  bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md w-full"
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          {/* Job Header */}
          <div className="flex flex-col text-xl md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">{job.job_title}</h2>
              <p className="text-blue-300">{job.company_description}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-300">{new Date(job.created_at).toLocaleDateString()}</p>
              <p className="text-blue-300">{job.location}</p>
            </div>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 gap-4 mb-6 ">
            <div className="bg-white bg-opacity-10 p-4  rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">Job Information</h3>
              <div className="grid grid-cols-2 gap-4 ">
                <div>
                  <p className=" font-medium text-gray-300">Job Type</p>
                  <p className="mt-1 text-[17px] text-white">{job.job_type}</p>
                </div>
                <div>
                  <p className=" font-medium text-gray-300">Duration</p>
                  <p className="mt-1  text-[17px] text-white">{job.job_duration}</p>
                </div>
                <div>
                  <p className=" font-medium text-gray-300">Salary Range</p>
                  <p className="mt-1 text-[17px] text-white">{job.salary_range}</p>
                </div>
                <div>
                  <p className=" font-medium text-gray-300">Education Level</p>
                  <p className="mt-1 text-[17px] text-white">{job.educational_level}</p>
                </div>
                <div>
                  <p className=" font-medium text-gray-300">Experience Level</p>
                  <p className="mt-1 text-[17px] text-white">{job.experience_level}</p>
                </div>
                <div>
                  <p className=" font-medium text-gray-300">Skills Required</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {job.skill_required.split(',').map((skill, index) => (
                      <span key={index} className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white bg-opacity-10 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Job Description</h3>
            <p className="text-gray-300 text-[17px] whitespace-pre-line">{job.job_description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleApply}
              disabled={hasApplied || isUploading}
              className={`px-4 py-2 rounded-md font-medium transition-all flex items-center justify-center ${
                hasApplied
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : isUploading
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {hasApplied ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Applied
                </>
              ) : isUploading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Uploading ({uploadProgress}%)
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
                  Apply Now
                </>
              )}
            </button>
            
            <button
  onClick={handleSavedJob}
  disabled={isUploading}
  className={`px-4 py-2 rounded-md font-medium transition-all flex items-center justify-center ${
    isSaved
      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
      : 'bg-gray-600 hover:bg-gray-700 text-white'
  }`}
>
  <FontAwesomeIcon icon={faBookmark} className="mr-2" />
  {isSaved ? 'Unsave' : 'Save Job'}
</button>
          </div>

          {isUploading && (
            <div className="mt-4 bg-white bg-opacity-10 p-3 rounded-lg">
              <div className="flex justify-between text-xs mb-1 text-white">
                <span>Upload Progress:</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-gray-300">
                <span>Speed: {uploadSpeed}</span>
                <span>Time left: {uploadTimeLeft}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayJobs;