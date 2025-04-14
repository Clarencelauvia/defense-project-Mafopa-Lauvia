import { Link } from 'react-router-dom';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import AOS from 'aos';

function Login() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

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
          <h1 className="ml-4 text-white text-3xl font-bold">Professional & Matches</h1>
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

      {/* Login Section */}
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
          Welcome to PAM
        </h2>

        <p
          className="text-blue-200 text-center max-w-2xl mx-auto mb-16 text-lg"
          data-aos="fade-up"
          data-aos-delay="350"
        >
          Please select your role to proceed with the login.
        </p>

        <div className="flex justify-center gap-12 mt-12">
          {/* Admin Card */}
          <div
            className="w-[300px] bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
            data-aos="fade-right"
            data-aos-delay="400"
          >
            <div className="p-8 text-center">
              <h3 className="text-white text-2xl font-bold mb-6">Admin</h3>
              <p className="text-blue-100 mb-8 text-lg">
                Access administrative features and manage the platform.
              </p>
        <Link to={"/admin_login"}>      <button
                className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Admin Login
              </button></Link>
            </div>
          </div>

          {/* Job Seeker Card */}
          <div
            className="w-[300px] bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="p-8 text-center">
              <h3 className="text-white text-2xl font-bold mb-6">Job Seeker</h3>
              <p className="text-blue-100 mb-8 text-lg">
                Find your dream job and apply with ease.
              </p>
              <Link to={"/employee_login"}>
                <button className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1">
                  Job Seeker Login
                </button>
              </Link>
            </div>
          </div>

          {/* Employer Card */}
          <div
            className="w-[300px] bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
            data-aos="fade-left"
            data-aos-delay="400"
          >
            <div className="p-8 text-center">
              <h3 className="text-white text-2xl font-bold mb-6">Employer</h3>
              <p className="text-blue-100 mb-8 text-lg">
                Post job opportunities and find the best talent.
              </p>
              <Link to={"/employer_login"}>
                <button className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1">
                  Employer Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;