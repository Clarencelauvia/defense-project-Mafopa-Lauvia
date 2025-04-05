import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/resetPassword', {
                email,
            });
             
            setMessage(response.data.message);

            // Show SweetAlert2 success message
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message,
            }).then(() => {
                // Redirect to the login page after the user clicks "OK"
                navigate('/employer_login'); 
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
        <div className="flex flex-col w-screen justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

                {message && <p className="text-green-600 text-center mb-4">{message}</p>}
                {error && <p className="text-red-600 text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md mt-4 hover:bg-blue-700 transition"
                    >
                        Send Default Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;