import {Link, useLocation } from 'react-router-dom';
import React, {useEffect, useState } from 'react';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';



interface Employees{
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string|null;
  code: string;
  contact_number: string;
  gender: string;
  password: string;
  qualification: string;
  address: string;
  job_Id: number;
  experience_level: string;
  educational_level: string;
  created_at: string;
}

function EmployeePage(){
  const location = useLocation(); 
  const [employs, setEmploy] = useState<Employees[]>([]);  // All job seekers fetched from the API
  const [filteredEmploy, setFilteredEmploy] = useState<Employees[]>([]);  // Job seekers profil fetched from the API
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

   // Initialize AOS when the component mounts
   useEffect(() => {
      AOS.init({
          duration: 1000, // Animation duration in milliseconds
          once: true, // Whether animation should happen only once
      });
  }, []);

  useEffect(()=>{
    const fetchEmployee = async () =>{
      try{
        const response = await axios.get('http://127.0.0.1:8000/api/employeePage');
        console.log('API Response:', response.data); // Log the response
        // Ensure the response is an array
        if (Array.isArray(response.data)) {
          setEmploy(response.data);
          setFilteredEmploy(response.data); // Initialize filteredJobs with all jobs
        } else {
          setError('Invalid response format. Expected an array.');
          setEmploy([]); // Set job seekers to an empty array to avoid errors
          setFilteredEmploy([]);
        }
      }  catch (error) {
        setError('Failed to fetch user profile. Please try again later.');
        console.error('Error fetching Job Seekers profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [location.state?.refresh]);

    // Handle search input change
     const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    };

    // Handle search button click 
    const handleSearch = () =>{
      const query = searchQuery.toLowerCase().trim();

      if(!query){
        // If the search query is empty, show all jobs seekers profiles
        setFilteredEmploy(employs);
        return;
      } 
      // Filter Job Seeker profile based on the search query 
      const filtered = employs.filter((employ) => {
        return(
          employ.qualification.toLowerCase().includes(query)||
          employ.experience_level.toLowerCase().includes(query)||
          employ.educational_level.toLowerCase().includes(query)||
          employ.address.toLowerCase().includes(query)
        );
      });
      setFilteredEmploy(filtered);
    };

    if(loading){
      return <div>Loading...</div>
    }
    if(error){
      return <div style={{color: 'red'}} >{error} </div>;
    }



    return(
        <>
        <div>
        <nav className='flex items-center w-[85pc] justify-between border-b-[1px] border-b-black shadow-md'>
      <div className='w-[90px] h-[90px] bg-black shadow-lg'>  <img src="pam.png" alt="NOT FOUND" className='p-3' /></div>
       <div className='cursor-pointer font-bold'>
        <ul className='flex gap-20 '> 
       <a href='/header'> <li className='hover:underline text-black hover:text-blue-600 font-bold'>HOME</li></a>
       <Link to={"/jobs"}> <li className='hover:underline hover:text-blue-600 text-black  font-bold'>JOBS</li></Link>
     <Link to={"/login"}>  <a href='#'> <li className='hover:underline text-black hover:text-blue-600 font-bold'>LOG IN</li></a> </Link>
        <a href='#'><li className='hover:underline text-black hover:text-blue-600 font-bold'>CONTACT</li></a>
        <li className='underline text-blue-600  font-bold'>HIRE</li>
        </ul>
        </div>
      <div className=''>    
        <input type="search" placeholder='Search' className='border-blue-800 
        border-2 border-opacity-50 rounded-md mr-2 h-[6vh] shadow-sm'
        value={searchQuery}
        onChange={handleSearchInputChange}
        />
        <button className='bg-blue-800 bg-opacity-80 text-white hover:text-blue-600 hover:bg-white 
        hover:border-opacity-50 px-6 py-2 rounded-md transition-all duration-300 shadow-md'
        onClick={handleSearch} 
        >Search</button>
        </div>  
        <div className='w-[90px] h-[90px] bg-black shadow-lg'>  <img src="pam.png" alt="NOT FOUND" className='p-3' /></div>
        </nav>
        <div className='p-8'>
          <h1 className='text-2xl font-bold text-center  text-blue-600 mb-6 shadow-lg'>Job Seeker's Profiles</h1>
          {
            filteredEmploy.length === 0?(
              <p>No User Profile Available At The Moment</p>
            ) : (
              <div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shadow-lg'>
               {
                filteredEmploy.map((employ,index)=>(
                  <div key={employ.id} className="p-4 border border-gray-300 shadow-lg
                   rounded-lg hover:shadow-xl transition-shadow duration-300" 
                   data-aos="fade-right"
                   data-aos-delay={index*100}>
                    <p className='flex justify-center items-center'> <img
                        src={`http://127.0.0.1:8000${employ.image_url}`}
                        alt="Profile"
                        className="w-28 h-28 flex justify-center 
                        items-center rounded-full object-cover shadow-lg"
                        onError={(e) => { // If the image fails to load, replace it with a default text
                          e.currentTarget.style.display = 'none'; // Hide the broken image
                          
                          
                          if (e.currentTarget.parentNode) { // Ensure parentNode exists
                            const fallbackElement = document.createElement("div");
                            fallbackElement.className =
                              "w-28 h-28 flex justify-center items-center rounded-full bg-gray-300 shadow-lg text-white font-bold text-4xl";
                            fallbackElement.textContent = employ.first_name[0] + employ.last_name[0]; // Show initials
                          e.currentTarget.parentNode.appendChild(fallbackElement);
                          
                        

                        }}}
                        data-aos="fade-down"
                        data-aos-delay={index*200}  />
                   </p>
                   <p className='text-gray-600'>
                    <span className='font-semibold'> Name:</span>{employ.first_name} {employ.last_name}
                   </p>
                   
                   <p className='text-gray-600'>
                    <span className='font-semibold'>Gender:</span>{employ.gender}
                   </p>
                   <p className='text-gray-600'>
                    <span className='font-semibold'>Qualification:</span>{employ.qualification}
                   </p>
                   <p className='text-gray-600'>
                    <span className='font-semibold'>Educational Level:</span>{employ.educational_level}
                   </p>
                   <p className='text-gray-600'>
                    <span className='font-semibold'>Experience Level:</span> {employ.experience_level}
                   </p>
                   {/* <p className='text-gray-600'>Created on:{new Date(employ.created_at).toLocaleDateString()} </p> */}

                
                 <div className='flex justify-center items-center'>
                 <button className='mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
                  shadow-md transition-all duration-300'>
                   Hire
                   </button>
                 </div>
                
                  </div>
                ) )
               }
                </div>
              </div>
            )
          }
        </div>
        </div>
        
        </>
    )
}
export default EmployeePage;