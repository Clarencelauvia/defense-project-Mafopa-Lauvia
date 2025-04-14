import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Dashboard from './components/dashboard';
import Signin from './components/signin';
import RegisterPage from './components/RegisterPage';
import Entrejobs from './components/entrejobs';
import Login from './components/login';
import Employee from './components/employee_login';
import Employer from './components/employer_login';
import Setting from './components/setting';
import Jobs from './components/jobs';
import Employer_dashboard from './components/employer_dashboard';
import ForgotPassword from './components/forgotPassword';
import ResetPassword from './components/resetPassord';
import EmployeePage from './components/employeePage';
import EmployerPage from './components/employerPage';
import WarmMatchesPage from './components/warmMatchPage';
import DisplayJobs from './components/displayJobs';
import SavedJobDetails from './components/savedJobDetails';
import ModifyProfile from './components/modifyProfile';
import { UserProvider } from './components/refreshPage'; 
import ApplicantProfilePage from './components/ApplicantProfilePage';
import ApplicantsListPage from './components/ApplicantListPage';
import ModifyJobs from './components/ModifyJobs';
import ManageJobs from './components/ManageJobs';
import ModifyEmployerProfile from './components/ModifyEmployerProfile';
import Applications from './components/Applications';
import EmployerJobDetails from './components/EmployerJobDetails';
import RecentApplicantsPage from './components/RecentApplicantsPage';
import AllRecommendedJobsPage from './components/AllRecommendedJobsPage';
import AllSavedJobsPage from './components/AllSavedJobsPage';
import Chatbox from './components/ChatBox';
import AdminDashboard from './components/admin_dashboard';
import MessagesList from './components/MessagesList';
import JobseekerChatBox from './components/JobSeekerChatBox';
// import LoginFrequencyGraph from './components/LoginFrequencyGraph';
import AdminLogin from './components/Admin_login';
import AdminForgotPassword from './components/AdminForgotPassword';
import AdminResetPassword from './components/AdminResetPassword'
import NotificationBell from './components/NotificationBell';



function Router() {
  return (
    <UserProvider> {/* Wrap the entire app with UserProvider */}
      <BrowserRouter>
        <Routes>
          <Route path="/header" element={<Header />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/RegisterPage" element={<RegisterPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/employee_login" element={<Employee />} />
          <Route path="/employer_login" element={<Employer />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/Jobs" element={<Jobs />} />
          <Route path="/Employer_dashboard" element={<Employer_dashboard />} />
          <Route path="/employer/post-job" element={<Entrejobs />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/employeePage" element={<EmployeePage />} />
          <Route path="/employerPage" element={<EmployerPage />} />
          <Route path="/warmMatchPage" element={<WarmMatchesPage />} />
          <Route path="/jobs/:id" element={<DisplayJobs />} />
          <Route path="/job/:id" element={<DisplayJobs />} />
          <Route path="/saved-job/:id" element={<SavedJobDetails />} />
          <Route path="/modifyProfile" element={<ModifyProfile />} />
          <Route path="/employer/applicants" element={<ApplicantsListPage />} />
          <Route path="/employer/applicant/:id" element={<ApplicantProfilePage />} />
          <Route path="/employer/edit-job/:jobId" element={<ModifyJobs />} />
          <Route path="/employer/manage-jobs" element={<ManageJobs />} /> 
          <Route path="/employer/modify-profile" element={<ModifyEmployerProfile />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/employer/job/:id" element={<EmployerJobDetails />} /> 
          <Route path="/employer/recent-applicants" element={<RecentApplicantsPage />} />
          <Route path="/all-saved-jobs" element={<AllSavedJobsPage />} />
          <Route path="/all-recommended-jobs" element={<AllRecommendedJobsPage />} />
          <Route path="/chat/:receiverId" element={<Chatbox />} />
          <Route path="/messages" element={<Chatbox />} />
          <Route path='/admin/dashboard' element={<AdminDashboard/>} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
<Route path="/admin/reset-password" element={<AdminResetPassword />} />
        
<Route path="/message-list" element={<MessagesList />} />
<Route path="/chat/:receiverId" element={<Chatbox />} />
<Route path="/jobseeker-chat/:receiverId" element={<JobseekerChatBox />} />
{/* <Route path='/LoginFrequency' element={<LoginFrequencyGraph/>} /> */}
<Route path="/admin_login" element={<AdminLogin />} />
<Route path="/notificationBell" element={<NotificationBell/>} />

        </Routes>
       
        
      </BrowserRouter>
    </UserProvider>
  );
}

export default Router;