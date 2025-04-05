import React, { createContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';

// Define the type for the Pusher context value
type PusherContextType = Pusher | null;

// Create the context with an initial value of `null`
export const PusherContext = createContext<PusherContextType>(null);

// Define the type for the data received from the `job.posted` event
interface JobPostedData {
  job: {
    id: number;
    job_title: string;
    // Add other fields as needed
  };
}

// Define the props for the PusherProvider component
interface PusherProviderProps {
  children: React.ReactNode;
}

export const PusherProvider: React.FC<PusherProviderProps> = ({ children }) => {
  const [pusher, setPusher] = useState<PusherContextType>(null);

  useEffect(() => {
    // Initialize Pusher
    const pusherInstance = new Pusher('de6b8a16c9b286c69d8b', {
      cluster: 'mt1',
      forceTLS: true,
    });

    // Subscribe to the 'job-posted' channel
    const channel = pusherInstance.subscribe('job-posted');

    // Bind to the 'job.posted' event
    channel.bind('job.posted', (data: JobPostedData) => {
      console.log('New job posted:', data);
      // Display a notification or update the UI
    });

    // Set the Pusher instance in state
    setPusher(pusherInstance);

    // Cleanup on unmount
    return () => {
      pusherInstance.unsubscribe('job-posted');
      pusherInstance.disconnect();
    };
  }, []);

  return (
    <PusherContext.Provider value={pusher}>
      {children}
    </PusherContext.Provider>
  );
};