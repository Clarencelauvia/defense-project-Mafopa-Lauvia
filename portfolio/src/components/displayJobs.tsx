import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBookmark, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

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

function DisplayJobs() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUpload, setCurrentUpload] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        if (!id) {
          setError('Job ID is missing.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/jobs/${id}`);
        setJob(response.data);
        
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Check if job is saved
            const savedJobsResponse = await axios.get('http://127.0.0.1:8000/api/saved-jobs', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const isJobSaved = savedJobsResponse.data.some((savedJob: any) => savedJob.id === parseInt(id));
            setIsSaved(isJobSaved);
            
            // Check if user has applied
            const appliedJobsResponse = await axios.get('http://127.0.0.1:8000/api/applied-jobs', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const hasUserApplied = appliedJobsResponse.data.some((appliedJob: any) => appliedJob.job_id === parseInt(id));
            setHasApplied(hasUserApplied);
          } catch (error) {
            console.error('Error checking saved/applied jobs:', error);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.status === 404 
            ? 'Job not found.' 
            : 'Failed to fetch job details. Please try again later.');
        } else {
          setError('An unexpected error occurred.');
        }
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleSavedJob = async () => {
    try {
      const token = localStorage.getItem('token');
      const jobId = job?.id;

      if (!token) {
        await Swal.fire({
          icon: 'error',
          title: 'Login Required',
          text: 'You must be logged in to save jobs.',
          confirmButtonText: 'OK',
        });
        navigate('/login');
        return;
      }

      if (!jobId) {
        throw new Error('Job ID is missing.');
      }

      if (isSaved) {
        await axios.delete(`http://127.0.0.1:8000/api/saved-jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSaved(false);
        await Swal.fire({
          icon: 'success',
          title: 'Job Unsaved',
          text: 'This job has been removed from your saved jobs.',
          confirmButtonText: 'OK',
        });
      } else {
        await axios.post(
          `http://127.0.0.1:8000/api/jobs/${jobId}/save`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsSaved(true);
        await Swal.fire({
          icon: 'success',
          title: 'Job Saved',
          text: 'This job has been added to your saved jobs.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error saving job:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save job. Please try again.',
        confirmButtonText: 'OK',
      });
    }
  };

  const uploadFileInChunks = async (
    file: File, 
    jobId: number, 
    token: string, 
    type: 'video' | 'resume'
  ): Promise<string> => {
    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
    const chunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`;

    for (let i = 0; i < chunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', i.toString());
      formData.append('totalChunks', chunks.toString());
      formData.append('filename', fileName);
      formData.append('type', type);

      setCurrentUpload(`Uploading ${type} (${i+1}/${chunks})`);
      
      await axios.post(
        `http://localhost:8000/api/jobs/${jobId}/upload-chunk`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const chunkProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              const overallProgress = Math.round(((i * CHUNK_SIZE) + (progressEvent.loaded / progressEvent.total * CHUNK_SIZE)) * 100 / file.size);
              setUploadProgress(overallProgress);
            }
          },
        }
      );
    }

    return fileName;
  };

  const handleApply = async (jobId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        await Swal.fire({
          icon: 'error',
          title: 'Login Required',
          text: 'You must be logged in to apply for jobs.',
          confirmButtonText: 'OK',
        });
        navigate('/login');
        return;
      }
  
      if (hasApplied) {
        await Swal.fire({
          icon: 'info',
          title: 'Already Applied',
          text: 'You have already applied for this position.',
          confirmButtonText: 'OK',
        });
        return;
      }
  
      // File upload dialog
      const uploadResult = await Swal.fire({
        title: 'Application Materials',
        html:
          '<div class="mb-4">' +
          '  <label class="block text-sm font-medium mb-1">Video Introduction (max 50MB)</label>' +
          '  <input type="file" id="video" accept="video/*" class="swal2-file" required>' +
          '</div>' +
          '<div>' +
          '  <label class="block text-sm font-medium mb-1">Resume (PDF, max 5MB)</label>' +
          '  <input type="file" id="resume" accept=".pdf,.doc,.docx" class="swal2-file" required>' +
          '</div>',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const videoInput = document.getElementById('video') as HTMLInputElement;
          const resumeInput = document.getElementById('resume') as HTMLInputElement;
          
          if (!videoInput?.files?.length) {
            Swal.showValidationMessage('Video file is required');
            return null;
          }
          if (!resumeInput?.files?.length) {
            Swal.showValidationMessage('Resume file is required');
            return null;
          }
          
          const videoFile = videoInput.files[0];
          const resumeFile = resumeInput.files[0];
          
          if (videoFile.size > 50 * 1024 * 1024) {
            Swal.showValidationMessage('Video must be smaller than 50MB');
            return null;
          }
          if (resumeFile.size > 5 * 1024 * 1024) {
            Swal.showValidationMessage('Resume must be smaller than 5MB');
            return null;
          }
  
          return {
            videoFile,
            resumeFile,
            resumeExt: resumeFile.name.split('.').pop()?.toLowerCase()
          };
        },
        allowOutsideClick: false
      });
  
      if (!uploadResult.isConfirmed || !uploadResult.value) return;
      
      const { videoFile, resumeFile, resumeExt } = uploadResult.value;
      
      // Handle PDF conversion if needed
      let convertResume = false;
      if (resumeExt !== 'pdf') {
        const conversionResult = await Swal.fire({
          title: 'Convert Resume?',
          text: 'Your resume is not in PDF format. Would you like to convert it?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Convert',
          cancelButtonText: 'Cancel',
        });
        
        if (!conversionResult.isConfirmed) {
          await Swal.fire({
            icon: 'error',
            title: 'PDF Required',
            text: 'Please upload a PDF resume to continue.',
            confirmButtonText: 'OK',
          });
          return;
        }
        convertResume = true;
      }
  
      // Prepare form data
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('resume', resumeFile);
      if (convertResume) {
        formData.append('convert_resume', '1');
      }
  
      // Show loading dialog
      const loadingSwal = Swal.fire({
        title: 'Submitting Application...',
        html: `
          <div class="text-left">
            <p class="mb-2">Uploading application materials...</p>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${uploadProgress}%"></div>
            </div>
            <p class="mt-2 text-sm">${uploadProgress}% complete</p>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading(Swal.getConfirmButton());
        }
      });
  
      try {
        setUploadProgress(0);
        setCurrentUpload('Starting upload...');
  
        // Make the single request with both files
        await axios.post(
          `http://localhost:8000/api/jobs/${jobId}/apply`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
                setCurrentUpload(`Uploading... (${percentCompleted}%)`);
              }
            },
          }
        );
  
        await Swal.fire({
          icon: 'success',
          title: 'Application Submitted!',
          text: 'Your application has been received successfully.',
          confirmButtonText: 'OK',
        });
  
        setHasApplied(true);
      } catch (error) {
        await Swal.close();
        let errorMessage = 'Failed to submit application';
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            setHasApplied(true);
            await Swal.fire({
              icon: 'info',
              title: 'Already Applied',
              text: 'You have already applied for this position',
              confirmButtonText: 'OK',
            });
            return;
          }
          errorMessage = error.response?.data?.message || error.message;
        }
  
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonText: 'OK',
        });
      } finally {
        setUploadProgress(0);
        setCurrentUpload('');
      }
    } catch (error) {
      console.error('Application error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred during application.',
        confirmButtonText: 'OK',
      });
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-b from-blue-800 to-blue-950">
        <div className="text-white text-xl">Loading job details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-800 to-blue-950">
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
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-800 to-blue-950">
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
    <div className=" w-screen bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen">
      <nav className="bg-white  bg-opacity-10 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="w-12 h-12 bg-black rounded-full overflow-hidden">
              <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
            </div>
            <h1 className="ml-3 text-white text-xl font-bold">Professionals & Matches</h1>
          </Link>
          
          <h2 className="text-white text-xl font-bold hidden md:block">Job Overview</h2>
          
          <div className="flex items-center space-x-4">
            <Link to="/settings" className="text-white hover:text-blue-300 transition-colors text-sm md:text-base">
              Settings
            </Link>
            <Link to="/contact" className="text-white hover:text-blue-300 transition-colors text-sm md:text-base">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      <div className="container w-screen  mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Dashboard
          </button>
        </div>

       <div className='flex justify-center'>
       <div className="bg-white w-[35pc] justify-center bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{job.job_title}</h1>
              <p className="text-blue-200">Company name: {job.company_description}</p>
            </div>
            <div className="text-right mt-8">
              <p className="text-white">{new Date(job.created_at).toLocaleDateString()}</p>
              <p className="text-blue-200">Location: {job.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Job Details</h3>
                <div className="space-y-2">
                  <p className="text-white"><span className="font-medium">Type:</span> {job.job_type}</p>
                  <p className="text-white"><span className="font-medium">Duration:</span> {job.job_duration}</p>
                  <p className="text-white"><span className="font-medium">Salary:</span> {job.salary_range}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Requirements</h3>
                <div className="space-y-2">
                  <p className="text-white"><span className="font-medium">Education:</span> {job.educational_level}</p>
                  <p className="text-white"><span className="font-medium">Experience:</span> {job.experience_level}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white ">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skill_required.split(',').map((skill, index) => (
                  <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-lg font-semibold text-white ">Job Description</p>:
          <p className="text-white whitespace-pre-line">{job.job_description}</p>
            
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => handleApply(job.id)}
              disabled={hasApplied}
              className={`px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center ${
                hasApplied
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {hasApplied ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Applied
                </>
              ) : (
                'Apply Now'
              )}
            </button>
            
            <button
              onClick={handleSavedJob}
              className={`px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center ${
                isSaved
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <FontAwesomeIcon icon={faBookmark} className="mr-2" />
              {isSaved ? 'Unsave Job' : 'Save Job'}
            </button>
          </div>
        </div>
       </div>
      </div>
    </div>
  );
}

export default DisplayJobs;