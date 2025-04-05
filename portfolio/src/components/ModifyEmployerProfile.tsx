import React, { useState, useEffect } from 'react';
import { FaUser, FaEyeSlash, FaEye, FaArrowLeft } from 'react-icons/fa';
import countries from './countries.json';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import 'aos/dist/aos.css';
import AOS from 'aos';

interface Employer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
  code: string;
  contact_number: string;
  gender: string;
  password: string;
  organisation_name: string;
  domain: string;
  address: string;
}

interface ErrorResponse {
  message: string;
  errors: {
    [key: string]: string[]; // Each field can have multiple error messages
  };
}

const ModifyEmployerProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    imageUrl: '',
    code: '',
    contactNumber: '',
    gender: '',
    password: '',
    organisationName: '',
    domain: '',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const navigate = useNavigate();

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Fetch employer data
  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get('http://localhost:8000/api/employer', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const employer = response.data;
        setFormData({
          firstName: employer.first_name,
          lastName: employer.last_name,
          email: employer.email,
          imageUrl: employer.image_url,
          code: employer.code,
          contactNumber: employer.contact_number,
          gender: employer.gender,
          password: employer.password,
          organisationName: employer.organisation_name,
          domain: employer.domain,
          address: employer.address,
        });

        if (employer.image_url) {
          setImageUrl(`http://localhost:8000${employer.image_url}`);
        }
      } catch (error) {
        console.error('Failed to fetch employer data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to fetch profile data',
          text: 'Please try again later.',
        });
      }
    };

    fetchEmployerData();
  }, []);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setImageUrl(fileUrl);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('last_name', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('image_url', formData.imageUrl);
      formDataToSend.append('code', formData.code);
      formDataToSend.append('contact_number', formData.contactNumber);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('organisation_name', formData.organisationName);
      formDataToSend.append('domain', formData.domain);
      formDataToSend.append('address', formData.address);

      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      const response = await axios.put('http://localhost:8000/api/employer/modify-profile', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated Successfully!',
        text: 'Your profile has been updated.',
      }).then(() => {
        navigate('/employer_dashboard');
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to update profile',
        text: 'Please try again later.',
      });
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

        <h2 className="text-white text-2xl font-bold">Modify Profile</h2>

        <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
          <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
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
              {/* Profile Image Section */}
              <div className="md:w-1/4 flex flex-col items-center" data-aos="fade-right" data-aos-delay="300">
                <div className="bg-blue-500 bg-opacity-20 border-2 border-blue-300 w-[180px] h-[180px] rounded-lg overflow-hidden flex items-center justify-center mb-4">
                  <input
                    id="file-input"
                    type="file"
                    name="imageUrl"
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
                      className="w-full p-3  bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option className='text-black' value="" disabled selected hidden></option>
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
                      />
                      <button
                        type="button"
                        className="absolute bg-transparent right-3 top-1/2 transform -translate-y-1/2 text-blue-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 border-t border-blue-300 my-4"></div>

                  {/* Organisation Information */}
                  <div>
                    <label className="block text-blue-300 mb-1">Organisation Name</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="organisationName"
                      value={formData.organisationName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Domain</label>
                    <input
                      type="text"
                      list="domain"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                    />
                    <datalist id="domain">
                      <option value="IT">IT</option>
                      <option value="ENGINEERING">ENGINEERING</option>
                      <option value="CONSTRUCTION">CONSTRUCTION</option>
                      <option value="HEALTH">HEALTH</option>
                      <option value="MARKETING">MARKETING</option>
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Address</label>
                    <select
                      name="address"
                      className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.address}
                      onChange={handleChange}
                    >
                      <option className='text-black' value="" disabled selected hidden></option>
                      <option className='text-black' value="Far North">Far North</option>
                      <option className='text-black' value="North">North</option>
                      <option className='text-black' value="Adamawa">Adamawa</option>
                      <option className='text-black' value="East">East</option>
                      <option className='text-black' value="Centre">Centre</option>
                      <option className='text-black' value="West">West</option>
                      <option className='text-black' value="North West">North West</option>
                      <option className='text-black' value="South West">South West</option>
                      <option className='text-black' value="Littoral">Littoral</option>
                      <option className='text-black' value="South">South</option>
                    </select>
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

export default ModifyEmployerProfile;