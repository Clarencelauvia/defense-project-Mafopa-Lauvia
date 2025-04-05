// src/components/JobSeekerChatBox.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const JobSeekerChatBox: React.FC = () => {
  const { receiverId } = useParams<{ receiverId: string }>();
  
  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      {/* Similar structure to your ChatBox but with job seeker specific features */}
      <h1>Job Seeker Chat with ID: {receiverId}</h1>
      {/* Implement your job seeker chat UI here */}
    </div>
  );
};

export default JobSeekerChatBox;