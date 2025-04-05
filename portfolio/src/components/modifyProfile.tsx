import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaUser, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import countries from './countries.json';
import { useUser } from './refreshPage';
import 'aos/dist/aos.css';
import AOS from 'aos';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image_url?: string;
  code: string;
  contactNumber: string;
  gender: string;
  password: string;
  qualification: string;
  address: string;
  experienceLevel: string;
  educationalLevel: string;
}

function ModifyProfile() {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUserData: refreshContextUserData } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    image_url: '',
    code: '',
    contactNumber: '',
    gender: '',
    password: '',
    qualification: '',
    address: '',
    experienceLevel: '',
    educationalLevel: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.get('http://localhost:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('API Response:', response.data);

      if (!response.data || !response.data.first_name) {
        throw new Error('User data not found in response');
      }

      const backendBaseUrl = 'http://localhost:8000';
      const fullImageUrl = response.data.image_url
        ? `${backendBaseUrl}${response.data.image_url}`
        : null;

      setUser(response.data);
      setFormData({
        firstName: response.data.first_name || '',
        lastName: response.data.last_name || '',
        email: response.data.email || '',
        image_url: response.data.image_url || '',
        code: response.data.code || '',
        contactNumber: response.data.contact_number || '',
        gender: response.data.gender || '',
        password: '', // Do not pre-populate password from API
        qualification: response.data.qualification || '',
        address: response.data.address || '',
        experienceLevel: response.data.experience_level || '',
        educationalLevel: response.data.educational_level || '',
      });
      setImageUrl(fullImageUrl);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to fetch user data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'User unauthenticated',
        text: 'You must be logged in before updating profile.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/employee_login');
      });
      return;
    }
    fetchUserData();
  }, [navigate]);

  // Handle refresh from location state
  useEffect(() => {
    if (location.state?.refresh) {
      fetchUserData();
    }
  }, [location.state?.refresh]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setImageUrl(fileUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('first_name', formData.firstName); // Match backend field name
    formDataToSend.append('last_name', formData.lastName); // Match backend field name
    formDataToSend.append('email', formData.email);
    formDataToSend.append('code', formData.code);
    formDataToSend.append('contact_number', formData.contactNumber); // Match backend field name
    formDataToSend.append('gender', formData.gender);
    if (formData.password.trim() !== '') {
      formDataToSend.append('password', formData.password);
    }
    formDataToSend.append('qualification', formData.qualification);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('experience_level', formData.experienceLevel); // Match backend field name
    formDataToSend.append('educational_level', formData.educationalLevel); // Match backend field name

    if (selectedFile) {
      formDataToSend.append('image', selectedFile);
    }

    // Log the form data being sent
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.put(
        'http://localhost:8000/api/user/update',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Update response:', response.data);

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        confirmButtonText: 'OK',
      }).then(() => {
        fetchUserData(); // Refresh user data
        navigate('/dashboard', { state: { refresh: true } });
      });
    } catch (error) {
      console.error('Failed to update profile:', error);

      if (error instanceof AxiosError && error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        let errorMessage = 'Please fix the following errors:\n';
        for (const field in validationErrors) {
          errorMessage += `- ${validationErrors[field].join(', ')}\n`;
        }
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: errorMessage,
          confirmButtonText: 'OK',
        });
      } else if (error instanceof Error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to update profile. Please try again later.',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update profile. Please try again later.',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  if (loading) {
    return <div className=" h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen" style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen pb-10 w-screen">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-16 py-6 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-8" data-aos="fade-down" data-aos-delay="100">
        <Link to="/" className="flex items-center">
          <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
            <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-3xl font-bold">Professionals & Matches</h1>
        </Link>

        <h2 className="text-white text-2xl font-bold">Modify Profile</h2>

        <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
          <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
        </div>
      </nav>

      {/* Modify Profile Form */}
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
         
          <form onSubmit={handleSubmit} id="formModifyProfile" className="text-white">
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6 text-center" data-aos="fade-in">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image Section */}
              <div className="md:w-1/4 flex flex-col items-center" data-aos="fade-right" data-aos-delay="300">
                <div className="bg-blue-500 bg-opacity-20 border-2 border-blue-300 w-[180px] h-[180px] rounded-lg overflow-hidden flex items-center justify-center mb-4">
                  <input
                    id="file-input"
                    type="file"
                    name="image_url"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser size={64} className="text-blue-300 opacity-70" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Change Profile Image
                </button>
              </div>

              {/* Form Fields */}
              <div className="md:w-3/4" data-aos="fade-left" data-aos-delay="400">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Personal Information */}
                  <div>
                    <label className="block text-blue-300 mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Contact Number</label>
                    <div className="flex">
                      <input
                        type="text"
                        list="options"
                        className="w-1/4 p-3 bg-white bg-opacity-10 border border-blue-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="Code"
                      />
                      <input
                        type="number"
                        className="w-3/4 p-3 bg-white bg-opacity-10 border border-blue-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="contactNumber"
                        min={0}
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="Number"
                      />
                      <datalist id="options">
                        <option value="" selected disabled hidden></option>
                        {countries.map((country) => (
                          <option value={country.code} key={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Gender</label>
                    <select
                      name="gender"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="" disabled selected hidden></option>
                      <option className='text-black' value="Male">Male</option>
                      <option className='text-black' value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        className="absolute bg-transparent right-3 top-1/2 transform -translate-y-1/2 text-blue-300"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 border-t border-blue-300 my-4"></div>

                  {/* Additional Information */}
                  <div>
                    <label className="block text-blue-300 mb-1">Qualification</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Address</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      list="opyion"
                    />
                    <datalist id="opyion">
                      <option value="" disabled hidden></option>
                      <option value="FarNorth">FarNorth</option>
                      <option value="North">North</option>
                      <option value="Adamawa">Adamawa</option>
                      <option value="East">East</option>
                      <option value="Centre">Centre</option>
                      <option value="West">West</option>
                      <option value="North West">North West</option>
                      <option value="South West">South West</option>
                      <option value="Littoral">Littoral</option>
                      <option value="South">South</option>
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Experience Level</label>
                    <select
                      name="experienceLevel"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                    >
                      <option className='text-black' value="" disabled hidden></option>
                      <option className='text-black' value="Entry-level">Entry-level</option>
                      <option className='text-black' value="Mid-level">Mid-level</option>
                      <option className='text-black' value="Senior-level">Senior-level</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Educational Level</label>
                    <input
                      type="text"
                      list="optiol"
                      name="educationalLevel"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.educationalLevel}
                      onChange={handleChange}
                    />
                    <datalist id="optiol">
                      <option value="OL">OL</option>
                      <option value="AL">AL</option>
                      <option value="HND">HND</option>
                      <option value="Bachelor Degree">Bachelor Degree</option>
                      <option value="Master Degree">Master Degree</option>
                      <option value="PHD">PHD</option>
                    </datalist>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModifyProfile;