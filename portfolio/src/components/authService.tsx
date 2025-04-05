// import axios from 'axios';
import api from '../api/axios'; // Update this import
import axios from 'axios';



const API_URL = 'http://localhost:8000/api';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  code: string;
  contactNumber: string;
  gender: string;
  password: string;
  qualification?: string;
  address: string;
  experienceLevel?: string;
  educationalLevel?: string;
}

interface EntrepreneurData {
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  code: string;
  contactNumber: string;
  gender: string;
  password: string;
  organisationName: string;
  address: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface JobPostData {
  jobTitle: string;
  educationalLevel: string;
  jobDescription: string;
  salaryRange: string;
  jobCategory: string;
  experienceLevel: string;
  companyDescription: string;
  skillRequired: string;
  jobType: string;
  jobDuration: string;
  location: string;
}

export const Register = async (data: RegisterData) => {
  const response = await api.post(`${API_URL}/register`, {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    image_url: data.imageUrl,
    code: data.code,
    contact_number: data.contactNumber,
    gender: data.gender,
    password: data.password,
    qualification: data.qualification,
    address: data.address,
    experience_level: data.experienceLevel,
    educational_level: data.educationalLevel,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

export const logine = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post('/logine', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUser = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  const response = await api.post(
    `${API_URL}/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

export const postJob = async (data: JobPostData) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('User is not authenticated. Please log in.');
  }

  try {
    const response = await api.post(
      `${API_URL}/jobPost`,
      {
        job_title: data.jobTitle,
        educational_level: data.educationalLevel,
        job_description: data.jobDescription,
        salary_range: data.salaryRange,
        job_category: data.jobCategory,
        experience_level: data.experienceLevel,
        company_description: data.companyDescription,
        skill_required: data.skillRequired,
        job_type: data.jobType,
        job_duration: data.jobDuration,
        location: data.location,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error posting job:', error);
    throw error;
  }
};

export const Entrepreneur = async (data: EntrepreneurData) => {
  const response = await api.post(`${API_URL}/entrepreneur`, {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    image_url: data.imageUrl,
    code: data.code,
    contact_number: data.contactNumber,
    gender: data.gender,
    password: data.password,
    organisation_name: data.organisationName,
    address: data.address,
  });
  return response.data;
};

export const performWarmMatch = async (jobId: number) => {
  const response = await api.get(`${API_URL}/jobs/${jobId}/warm-matches`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};