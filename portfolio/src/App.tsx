
import './App.css'
import React from 'react'
// import { FaLightbulb } from 'react-icons/fa'
import Router from './router'
// import { BrowserRouter, Route} from 'react-router-dom'
import { ReactDOM } from 'react';
import { PusherProvider } from './components/PusherContext';
import usePusher from './components/usePusher';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';



function App(){
  // usePusher(); // Initialize Pusher

  // // Request notification permission when the app loads
  // useEffect(() => {
  //   if (Notification.permission !== 'granted') {
  //     Notification.requestPermission();
  //   }
  // }, []);
  return(
   <div>
     <PusherProvider> {/* Wrap the Router with PusherProvider */}
      <Router />
      <ToastContainer />
    </PusherProvider>
   </div>

  );
}


// ReactDOM.render(<App/>, document.getElementById('root')); 
export default App
