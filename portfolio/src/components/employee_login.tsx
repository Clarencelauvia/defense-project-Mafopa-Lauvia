import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import AOS from 'aos';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import Font Awesome icons

const EmployeeLogin: React.FC = () => {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

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
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const rawResponse = await response.text();
      let result;
      try {
        result = JSON.parse(rawResponse);
      } catch (error) {
        console.error('Response is not JSON:', rawResponse);
        setErrorMessage('An unexpected error occurred. Please try again.');
        return;
      }

      if (response.ok) {
        setSuccessMessage(result.message);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);

        Swal.fire({
          title: `Welcome Back, ${result.user.last_name}!`,
          text: 'You are being redirected to your dashboard.',
          imageUrl: result.user.image,
          imageWidth: 200,
          imageHeight: 200,
          imageAlt: 'Profile Picture',
          showConfirmButton: true,
          confirmButtonText: 'Go to Dashboard',
          customClass: {
            image: 'rounded-image',
          },
        }).then(() => {
          window.location.href = result.redirect;
        });
      } else {
        setErrorMessage(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred during login.');
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
              <li className="text-blue-300 font-semibold border-b-2 border-blue-300 pb-1">LOG IN</li>
            </Link>
            <Link to={"/contact"}>
              <li className="text-white font-semibold hover:text-blue-300 hover:border-b-2 hover:border-blue-300 pb-1">CONTACT</li>
            </Link>
            <Link to={"/setting"}>
              <li className="text-white font-semibold hover:text-blue-300 hover:border-b-2 hover:border-blue-300 pb-1">SETTING</li>
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
          Login as Job Seeker
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
              placeholder="Enter your email"
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
                placeholder="Enter your password"
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

          <div className="text-center mt-4">
            <Link to="/forgotPassword">
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

export default EmployeeLogin;