// src/components/MessagesList.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  profile_image?: string;
  unread_count: number;
  type: 'employer' | 'jobseeker' | 'admin';
  organisation_name?: string;
  domain?: string;
  address?: string;
}

const MessagesList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          'http://localhost:8000/api/messages/contacts',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setContacts(response.data);
        setFilteredContacts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
        setLoading(false);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load contacts',
          icon: 'error',
        });
      }
    };

    fetchContacts();
  }, [navigate]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredContacts(contacts);
      return;
    }
    const filtered = contacts.filter((contact) => {
      return (
        contact.first_name?.toLowerCase().includes(query) ||
        contact.last_name?.toLowerCase().includes(query) ||
        contact.organisation_name?.toLowerCase().includes(query) ||
        contact.domain?.toLowerCase().includes(query) ||
        contact.address?.toLowerCase().includes(query)
      );
    });
    setFilteredContacts(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>
        <h2 className="text-white text-2xl font-bold">Messages</h2>
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
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        <div className="mb-6">
          <input
            type="search"
            placeholder="Search contacts..."
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
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="p-4 border border-gray-300 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center items-center">
                {contact.profile_image ? (
                  <img
                    src={`http://localhost:8000${contact.profile_image}`}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentNode) {
                        const fallbackElement = document.createElement("div");
                        fallbackElement.className = "w-28 h-28 flex justify-center items-center rounded-full bg-gray-300 shadow-lg text-white font-bold text-4xl";
                        fallbackElement.textContent = contact.first_name[0] + contact.last_name[0];
                        e.currentTarget.parentNode.appendChild(fallbackElement);
                      }
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
                    {contact.first_name[0] + contact.last_name[0]}
                  </div>
                )}
              </div>
              <p className="text-white mt-4">
                <span className="font-semibold">Name:</span> {contact.first_name} {contact.last_name}
              </p>
              {contact.organisation_name && (
                <p className="text-white">
                  <span className="font-semibold">Organization:</span> {contact.organisation_name}
                </p>
              )}
              {contact.domain && (
                <p className="text-white">
                  <span className="font-semibold">Domain:</span> {contact.domain}
                </p>
              )}
              {contact.address && (
                <p className="text-white">
                  <span className="font-semibold">Address:</span> {contact.address}
                </p>
              )}
 
<div className="flex justify-between items-center mt-4">
  <div className="flex items-center text-blue-300">
    <FaEnvelope className="mr-2" />
    {contact.unread_count > 0 && (
      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {contact.unread_count}
      </span>
    )}
  </div>
  <button
    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-300"
    onClick={() => {
      // Use consistent route paths that match your router configuration
      if (contact.type === 'employer' || contact.type === 'admin') {
        navigate(`/chat/${contact.id}`);
      } else {
        navigate(`/chat/${contact.id}`); // Use same path for all types for simplicity
      }
    }}
  >
    View Messages
  </button>
</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessagesList;