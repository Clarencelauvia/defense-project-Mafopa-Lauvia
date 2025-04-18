import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Link} from 'react-router-dom';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import AOS from 'aos';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

 const navigate = useNavigate();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('Attempting login with:', { email, password }); // Debug log

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Response data:', data); 
    
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
    
      setSuccessMessage(data.message);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
    
      Swal.fire({
        title: `Welcome Admin!`,
        text: 'You are being redirected to the admin dashboard.',
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'Go to Dashboard',
      }).then(() => {
        navigate('/admin/dashboard');
      });
    } catch (error: unknown) {
      console.error('Error during login:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message || 'An error occurred during login.');
      } else {
        setErrorMessage('An unexpected error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen bg-gradient-to-b from-blue-800 to-blue-950">
      {/* Navigation Bar */}
      <nav
        className="flex items-center justify-between px-16 py-6 bg-white bg-opacity-10 backdrop-blur-md shadow-md"
        data-aos="fade-down"
        data-aos-delay="100"
      >
        <div className="flex items-center">
          <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
            <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-3xl font-bold">Professionals & Matches</h1>
        </div>

        <div className="cursor-pointer">
          <ul className="flex gap-12">
            <Link to={"/header"}>
              <li className="text-white font-semibold hover:text-blue-300 hover:border-b-2 hover:border-blue-300 pb-1">HOME</li>
            </Link>
            <Link to={"/login"}>
              <li className="text-blue-300 font-semibold border-b-2 border-blue-300 pb-1">ADMIN LOGIN</li>
            </Link>
          </ul>
        </div>

        <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
          <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
        </div>
      </nav>

      {/* Login Form */}
      <div className="container mx-auto px-16 py-16">
        <div className="flex justify-center mb-12">
          <img
            src="pam.png"
            className="w-[150px] h-[150px] object-contain"
            alt="PAM Logo"
            data-aos="fade-up"
            data-aos-delay="200"
          />
        </div>

        <h2
          className="text-white font-bold text-center text-4xl mb-8"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          Admin Login
        </h2>

        <form
          onSubmit={handleSubmit}
          className="w-[450px] mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg p-8"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}
          {successMessage && <div className="text-green-500 text-center mb-4">{successMessage}</div>}

          <div className="mb-6">
            <label htmlFor="email" className="text-white block mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 bg-white bg-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="text-white block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="w-full px-4 py-2 bg-white bg-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white hover:text-blue-300 cursor-pointer"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

<div className="text-center bg-wh mt-4">
  <Link to="/admin/forgot-password">
    <button type="button" className="text-blue-300 bg-white hover:underline">
      Forgot Password?
    </button>
  </Link>
</div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;