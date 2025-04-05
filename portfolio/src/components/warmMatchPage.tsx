import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUser } from './refreshPage'; // Adjust the import path
import Swal from 'sweetalert2';
import axios from 'axios';

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string | null;
  code: string;
  contact_number: string;
  gender: string;
  password: string;
  qualification: string;
  address: string;
  experience_level: string;
  educational_level: string;
  created_at: string;
}

const WarmMatchesPage: React.FC = () => {
  const location = useLocation();
  const { user } = useUser();
  // const { user } = useUser(); // Use the updated user data from the context
  const warmMatches = location.state?.warmMatches || [];
  const Navigate = useNavigate();
  const performWarmMatch = async (jobId: number) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/jobs/${jobId}/warm-matches`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const warmMatches = response.data;
  
      // Navigate to the WarmMatchesPage with the matched data
      Navigate('/warmMatchPage', { state: { warmMatches } });
    } catch (error) {
      console.error('Error fetching warm matches:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch warm matches. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
      }).then(() => {
        // Redirect to the dashboard if warm match fails
        Navigate('/employer_dashboard');
      });
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className='flex items-center w-[85pc] justify-between border-b-[1px] border-b-black'>
        <div className='w-[90px] h-[90px] bg-black'>
          <img src="pam.png" alt="NOT FOUND" className='p-3' />
        </div>
        <div className='cursor-pointer font-bold'>
          <ul className='flex gap-20'>
            <a href='/header'>
              <li className='hover:underline text-black hover:text-blue-600 font-bold'>HOME</li>
            </a>
            <Link to={"/jobs"}>
              <li className='hover:underline hover:text-blue-600 text-black font-bold'>JOBS</li>
            </Link>
            <Link to={"/login"}>
              <a href='#'>
                <li className='hover:underline text-black hover:text-blue-600 font-bold'>LOG IN</li>
              </a>
            </Link>
            <a href='#'>
              <li className='hover:underline text-black hover:text-blue-600 font-bold'>CONTACT</li>
            </a>
            <li className='underline text-blue-600 font-bold'>HIRE</li>
          </ul>
        </div>
        <div className='w-[90px] h-[90px] bg-black'>
          <img src="pam.png" alt="NOT FOUND" className='p-3' />
        </div>
      </nav>

      {/* Main Content */}
      <div className='p-6'>
        <h1 className='text-2xl font-bold text-center underline text-blue-600 mb-6'>Warm Matches</h1>
       <Link to={"/employer_dashboard"} >  <button className='mb-5 bg-blue-600 text-white hover:bg-black hover:text-white'>Back To Dashboard</button></Link>
        {warmMatches.length === 0 ? (
          <p>No matching profiles found at the moment.</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {warmMatches.map((employ: Employee) => (
              <div key={employ.id} className="p-4 border border-gray-300 rounded-lg">
                {/* Profile Image */}
                <p className='flex justify-center items-center'>
                  <img
                    src={`http://127.0.0.1:8000${employ.image_url}`}
                    alt="Profile"
                    className="w-28 h-28 flex justify-center items-center rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'; // Hide the broken image
                      if (e.currentTarget.parentNode) {
                        const fallbackElement = document.createElement("div");
                        fallbackElement.className =
                          "w-28 h-28 flex justify-center items-center rounded-full bg-gray-300 text-white font-bold text-xl";
                        fallbackElement.textContent = employ.first_name[0] + employ.last_name[0]; // Show initials
                        e.currentTarget.parentNode.appendChild(fallbackElement);
                      }
                    }}
                  />
                </p>

                {/* Profile Details */}
                <p className='text-gray-600'>
                  <span className='font-semibold'>First Name:</span> {employ.first_name}
                </p>
                <p className='text-gray-600'>
                  <span className='font-semibold'>Last Name:</span> {employ.last_name}
                </p>
                <p className='text-gray-600'>
                  <span className='font-semibold'>Gender:</span> {employ.gender}
                </p>
                <p className='text-gray-600'>
                  <span className='font-semibold'>Qualification:</span> {employ.qualification}
                </p>
                <p className='text-gray-600'>
                  <span className='font-semibold'>Educational Level:</span> {employ.educational_level}
                </p>
                <p className='text-gray-600'>
                  <span className='font-semibold'>Experience Level:</span> {employ.experience_level}
                </p>
                <p className='text-gray-600'>
                  Created on: {new Date(employ.created_at).toLocaleDateString()}
                </p>

                {/* Hire Button */}
                <button className='mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700'>
                  Hire
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WarmMatchesPage;