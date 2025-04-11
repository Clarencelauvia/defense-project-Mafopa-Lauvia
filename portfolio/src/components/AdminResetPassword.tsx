import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/admin/reset-password', {
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setMessage(response.data.message);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: response.data.message,
      }).then(() => {
        navigate('/admin/login');
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen flex flex-col justify-center items-center">
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 shadow-md w-96">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Reset Admin Password</h2>

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="Confirm New Password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminResetPassword;