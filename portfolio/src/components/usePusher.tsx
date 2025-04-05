import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import { toast } from 'react-toastify';

// Define proper types for the job data
interface Job {
  id: number;
  job_title: string;
  // Add other job properties as needed
}

interface JobPostedEvent {
  job: Job;
  // Add other event data properties as needed
}

const usePusher = () => {
  const [newJobs, setNewJobs] = useState<Job[]>([]);
  
  useEffect(() => {
    // Enable Pusher logging for debugging in development only
    Pusher.logToConsole = process.env.NODE_ENV === 'development';
    
    // Initialize Pusher with your app key
    const pusher = new Pusher('de6b8a16c9b286c69d8b', {
      cluster: 'mt1',
      forceTLS: true,
    });
    
    // Subscribe to the channel
    const channel = pusher.subscribe('job-posted');
    
    // Debug subscription events to verify channel connection
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to job-posted channel');
    });
    
    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Error subscribing to job-posted channel:', error);
    });
    
    // Listen for the job.posted event
    channel.bind('job.posted', (data: JobPostedEvent) => {
      console.log('New job posted event received:', data);
      
      // Update state with the new job
      setNewJobs(prevJobs => [...prevJobs, data.job]);
      
      // Show notification
      toast.info(`New job posted: ${data.job.job_title}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });
    
    // Handle Pusher connection state changes
    pusher.connection.bind('state_change', (states: {
      previous: string;
      current: string;
    }) => {
      console.log(`Pusher connection changed from ${states.previous} to ${states.current}`);
    });
    
    // Clean up on component unmount
    return () => {
      channel.unbind_all();
      pusher.unsubscribe('job-posted');
      pusher.disconnect();
    };
  }, []);
  
  return { newJobs };
};

export default usePusher;