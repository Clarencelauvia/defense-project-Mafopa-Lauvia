import { FaLightbulb, FaSearch, FaBriefcase, FaUserTie } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import AOS from 'aos';

function Header() {
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
          <h1 className="ml-4 text-white text-3xl font-bold">Professionals & Matches</h1>
        </div>

        <div className="cursor-pointer">
          <ul className="flex gap-12">
            <a href="#" className="transition-all duration-300">
              <li className="text-blue-300 font-semibold border-b-2 border-blue-300 pb-1">HOME</li>
            </a>
            <Link to={"/login"} className="transition-all duration-300">
              <li className="text-white font-semibold hover:text-blue-300 hover:border-b-2 hover:border-blue-300 pb-1">LOG IN</li>
            </Link>
            <a href="#" className="transition-all duration-300">
              <li className="text-white font-semibold hover:text-blue-300 hover:border-b-2 hover:border-blue-300 pb-1">CONTACT</li>
            </a>
            <Link to={"/setting"} className="transition-all duration-300">
              <li className="text-white font-semibold hover:text-blue-300 hover:border-b-2 hover:border-blue-300 pb-1">SETTING</li>
            </Link>
          </ul>
        </div>

        <div className="w-[80px] h-[80px] bg-black rounded-full overflow-hidden">
          <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
        </div>
      </nav>

      {/* Hero Section */}
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
          Matching employers with job seekers in minutes...
        </h2>

        <p
          className="text-blue-200 text-center max-w-2xl mx-auto mb-16 text-lg"
          data-aos="fade-up"
          data-aos-delay="350"
        >
          PAM helps connect the right people with the right opportunities, making job searching and hiring simpler and more efficient.
        </p>

        <div className="flex justify-center gap-12 mt-12">
          {/* Employer Card */}
          <div
            className="w-[450px] bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
            data-aos="fade-right"
            data-aos-delay="400"
          >
            <div className="p-10 text-center">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaUserTie size={50} className="text-white" />
                </div>
              </div>

              <h3 className="text-white text-3xl font-bold mb-6">Post Job Opportunities</h3>

              <p className="text-blue-100 mb-10 text-lg">
                If you are running a business of any size or type, PAM matches you with your best fit prospect employees, saving you time and resources.
              </p>

              <Link to={"/signin"}>
                <button className="w-full py-4 px-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1">
                  Employer Sign Up
                </button>
              </Link>
            </div>
          </div>

          {/* Job Seeker Card */}
          <div
            className="w-[450px] bg-white bg-opacity-10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
            data-aos="fade-left"
            data-aos-delay="400"
          >
            <div className="p-10 text-center">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaBriefcase size={50} className="text-white" />
                </div>
              </div>

              <h3 className="text-white text-3xl font-bold mb-6">Apply for Jobs</h3>

              <p className="text-blue-100 mb-10 text-lg">
                If you are looking for a job opportunity, PAM matches you with your best fit prospect employers, helping you find your dream position.
              </p>

              <Link to={"/RegisterPage"}>
                <button className="w-full py-4 px-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1">
                  Job Seeker Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;