import React, { useState } from 'react';
import { FaUser, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import countries from './countries.json';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import AOS from 'aos';

function RegisterPage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  interface ErrorResponse {
    message: string;
    errors: {
      [key: string]: string[]; // Each field can have multiple error messages
    };
  }
  
  // State to store form data 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    imageUrl: '',
    code: '',
    contactNumber: '',
    gender: '',
    password: '',
    qualification: '',
    address: '',
    experienceLevel: '',
    educationalLevel: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Get the first selected file
    if (file) {
      setSelectedFile(file);
      // Create a URL for the file to display it as an image
      const fileUrl = URL.createObjectURL(file);
      setImageUrl(fileUrl);
    }
  };
    
  const handleLabelClick = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.click();
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const Navigate = useNavigate();

  // handle form submission 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Form submitted');

    try {
      // Form validation
      if (formData.password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long');
        return;
      }
      
      if (formData.contactNumber.length > 15 || !/^\d+$/.test(formData.contactNumber)) {
        setErrorMessage('Contact number must be a valid number with a maximum of 15 digits.');
        return;
      }
      const email = formData.email;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }

      // Create a FormData object to send the file and other form data
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('image_url', formData.imageUrl);
      formDataToSend.append('code', formData.code);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('qualification', formData.qualification);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('experienceLevel', formData.experienceLevel);
      formDataToSend.append('educationalLevel', formData.educationalLevel);

      if (selectedFile) {
        formDataToSend.append('image', selectedFile); // Append the image file
      }

      // Call the Register function from authService
      const response = await axios.post('http://localhost:8000/api/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set the content type for file upload
        },
      });

      // Handle successful registration
      localStorage.setItem('token', response.data.token); // Save the token if returned
      Swal.fire({
        title: 'Registration Successful!',
        text: 'Your account has been created successfully.',
        icon: 'success',
        confirmButtonText: 'Go to Login',
      }).then(() => {
        Navigate('/employee_login'); // Redirect to login
      });

      // Clear the form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        imageUrl: '',
        code: '',
        contactNumber: '',
        gender: '',
        password: '',
        qualification: '',
        address: '',
        experienceLevel: '',
        educationalLevel: '',
      });
      setImageUrl(null);
      setSelectedFile(null);
      setSuccessMessage('Registration successful!');
    } catch (error) {
      // Handle errors
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 422) {
          // Handle validation errors
          const errors = error.response.data.errors;
          const firstErrorKey = Object.keys(errors)[0];
          const firstErrorMessage = errors[firstErrorKey][0];
          setErrorMessage(firstErrorMessage);
        } else {
          setErrorMessage('Registration failed. Please try again.');
        }
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
      console.error('Registration failed:', error);
    }
  }

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen pb-10 w-screen">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-16 py-6 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-8" data-aos="fade-down" data-aos-delay="100">
        <Link to="/" className="flex items-center">
          <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
            <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-3xl font-bold">Professionals & Matches

          </h1>
        </Link>

        <h2 className="text-white text-2xl font-bold">Sign up as a Job Seeker</h2>

        <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
          <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
        </div>
      </nav>

      {/* Registration Form */}
      <div className="container mx-auto px-6 ">
        <button
                         onClick={() => navigate(-1)}
                         className="bg-blue-600 mb-4 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300"
                       >
                         <FaArrowLeft className="" />
                         Previous
                       </button>
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg p-8 max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="200">
          <form onSubmit={handleSubmit} id="formRegister" className="text-white">
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
                    value={formData.imageUrl}
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
                  onClick={handleLabelClick}
                  className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Add Profile Image
                </button>
              </div>

              {/* Form Fields */}
              <div className="md:w-3/4" data-aos="fade-left" data-aos-delay="400">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Personal Information */}
                  <div>
                    <label className="block text-blue-300 mb-1">First Name</label>
                    <input
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
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="w-full p-3 bg-white bg-opacity-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute bg-transparent right-3 top-1/2 transform -translate-y-1/2 text-blue-300 "
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
                      <option className='text-black' value="" disabled selected hidden></option>
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

                {/* Terms and Conditions */}
                <div className="mt-6">
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                    className="opacity-40"
                  />
                  <label className="opacity-40 ml-2">
                    I agree to the terms and conditions
                  </label>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Register
                  </button>
                </div>

                {/* Login Link */}
                <div className="mt-4 text-center">
                  <Link to="/employee_login" className="text-blue-300 hover:text-white">
                    Already have an account? Login
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

export default RegisterPage;