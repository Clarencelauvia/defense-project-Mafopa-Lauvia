import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import usePusher from './usePusher';

const JobNotifications: React.FC = () => {
  // Use our Pusher hook
  const { newJobs } = usePusher();
  
  return (
    <>
      {/* This container is needed for the toast notifications to appear */}
      <ToastContainer />
      
      {/* Optional: Display recent notifications in the UI */}
      {newJobs.length > 0 && (
        <div className="recent-notifications">
          <h3>Recent Job Postings</h3>
          <ul>
            {newJobs.map(job => (
              <li key={job.id}>
                <a href={`/jobs/${job.id}`}>{job.job_title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default JobNotifications;