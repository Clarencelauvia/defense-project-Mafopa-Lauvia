import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {  FaArrowLeft } from 'react-icons/fa';


interface Employers {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string | null;
  code: string;
  contact_number: string;
  gender: string;
  password: string;
  organisation_name: string;
  domain: string;
  address: string;
  created_at: string;
}

function EmployerPage() {
  const [employers, setEmployer] = useState<Employers[]>([]);
  const [filteredEmployer, setFilteredEmployer] = useState<Employers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  // Initialize AOS when the component mounts
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'You must be logged in to access this page.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/employer_login');
      });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchEmployer = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/employerPage');
        if (Array.isArray(response.data)) {
          setEmployer(response.data);
          setFilteredEmployer(response.data);
        } else {
          setError('Invalid response format. Expected an array.');
          setEmployer([]);
          setFilteredEmployer([]);
        }
      } catch (error) {
        setError('Failed to fetch Employers Profiles. Please try again later.');
        console.error('Error Fetching Employers Profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployer();
  }, []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredEmployer(employers);
      return;
    }
    const filtered = employers.filter((employer) => {
      return (
        employer.organisation_name?.toLowerCase().includes(query) ||
        employer.address?.toLowerCase().includes(query) ||
        employer.domain?.toLowerCase().includes(query)
      );
    });
    setFilteredEmployer(filtered);
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>
        <h2 className="text-white text-2xl font-bold">Employers</h2>
        <div className="flex items-center space-x-4">
          <Link to="/settings" className="text-white hover:text-blue-300 transition-colors">
            Settings
          </Link>
          <Link to="/contact" className="text-white hover:text-blue-300 transition-colors">
            Contact
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4">
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
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search"
            className="border-blue-800 border-2 border-opacity-50 rounded-md mr-2 h-[6vh] shadow-sm"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <button
            className="bg-blue-800 bg-opacity-80 text-white hover:text-blue-600 hover:bg-white hover:border-opacity-50 px-6 py-2 rounded-md transition-all duration-300 shadow-md"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEmployer.map((employer, index) => (
            <div
              key={employer.id}
              className="p-4 border border-gray-300 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
              data-aos="fade-right"
              data-aos-delay={index * 100}
            >
              <div className="flex justify-center items-center">
                {employer.image_url ? (
                  <img
                    src={`http://127.0.0.1:8000${employer.image_url}`}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentNode) {
                        const fallbackElement = document.createElement("div");
                        fallbackElement.className = "w-28 h-28 flex justify-center items-center rounded-full bg-gray-300 shadow-lg text-white font-bold text-4xl";
                        fallbackElement.textContent = employer.first_name[0] + employer.last_name[0];
                        e.currentTarget.parentNode.appendChild(fallbackElement);
                      }
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
                    {employer.first_name[0] + employer.last_name[0]}
                  </div>
                )}
              </div>
              <p className="text-white mt-4">
                <span className="font-semibold">Employer Name:</span> {employer.first_name} {employer.last_name}
              </p>
              <p className="text-white">
                <span className="font-semibold">Organisation Name:</span> {employer.organisation_name}
              </p>
              <p className="text-white">
                <span className="font-semibold">Domain:</span> {employer.domain}
              </p>
              <p className="text-white">
                <span className="font-semibold">Address:</span> {employer.address}
              </p>
              <div className="flex justify-center items-center">
              <button
  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-300"
  onClick={() => navigate(`/chat/${employer.id}`)}
>
  Discuss
</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmployerPage;