import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaPaperPlane, FaCheck, FaCheckDouble, FaTrash } from 'react-icons/fa';
import axios from 'axios';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  read_at?: string | null;
  status?: 'sent' | 'delivered' | 'read';
  chat_session_id: number;
  is_deleted?: boolean;
  deleted_by_sender?: boolean;  // Add this
  deleted_by_receiver?: boolean; // Add this
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  profile_image?: string;
}

const Chatbox: React.FC = () => {
  const { receiverId } = useParams<{ receiverId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiver, setReceiver] = useState<User | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [isTyping, setIsTyping] = useState(false);
  // const [chatSessionId, setChatSessionId] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Change to useRef to ensure consistency across renders
    const chatSessionIdRef = useRef<number | null>(null);
  
    // Setter function that updates both state and ref
    const setChatSessionId = useCallback((sessionId: number | null) => {
      // Log every time we attempt to set the session ID
      console.log('Setting Chat Session ID:', {
        previousRefValue: chatSessionIdRef.current,
        newValue: sessionId,
        stackTrace: new Error().stack
      });
      
      chatSessionIdRef.current = sessionId;
    }, []);

     // Helper function to get current chat session ID
  const getCurrentChatSessionId = () => {
    console.log('Getting Current Chat Session ID:', {
      refValue: chatSessionIdRef.current,
      stackTrace: new Error().stack
    });
    return chatSessionIdRef.current;
  };

  

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      throw new Error('No authentication token found');
    }
    return {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch current user details
// Fetch current user details
// Fetch current user details
useEffect(() => {
  const getUserFromToken = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      await Swal.fire({
        title: 'Session Expired',
        text: 'Please login again',
        icon: 'error',
      });
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(
        'http://localhost:8000/api/current-user', 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      setCurrentUserId(response.data.id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        await Swal.fire({
          title: 'Session Expired',
          text: 'Please login again',
          icon: 'error',
        });
        navigate('/login');
      } else {
        console.error('Failed to get user ID:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to authenticate user',
          icon: 'error',
        });
      }
    }
  };

  getUserFromToken();
}, [navigate]);

  // Fetch receiver details
  useEffect(() => {
    const getReceiverDetails = async () => {
      if (receiverId && currentUserId) {
        try {
          const response = await axios.get(`http://localhost:8000/api/users/${receiverId}`, getAuthHeaders());
          setReceiver(response.data);
          await getChatSession();
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: `Failed to load contact information: ${(error as Error).message}`,
            icon: 'error',
          });
        }
      }
    };
    
    getReceiverDetails();
  }, [receiverId, currentUserId]);

  // Get or create chat session
  const getChatSession = useCallback(async () => {
    if (!currentUserId || !receiverId || chatSessionIdRef.current) {
      console.log('Skipping chat session creation:', {
        currentUserId,
        receiverId,
        existingSessionId: chatSessionIdRef.current
      });
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:8000/api/chat/session', 
        {
          user_id: currentUserId,
          participant_id: parseInt(receiverId)
        }, 
        getAuthHeaders()
      );
      
      const sessionId = response.data.id;
      if (sessionId && sessionId !== chatSessionIdRef.current) {
        setChatSessionId(sessionId);
        console.log('Chat session initialized:', sessionId);
        await fetchMessages(sessionId); // Fetch messages after session is set
      }
    } catch (error) {
      console.error('Failed to get chat session:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      Swal.fire({
        title: 'Error',
        text: 'Failed to initialize chat session',
        icon: 'error'
      });
    }
  }, [currentUserId, receiverId, navigate]);
  // Update useEffect to add a dependency on currentUserId
  useEffect(() => {
    const getReceiverDetails = async () => {
      if (receiverId && currentUserId) {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/users/${receiverId}`, 
            getAuthHeaders()
          );
          setReceiver(response.data);
          
          // Only get chat session if we don't already have one
          if (!chatSessionIdRef.current) {
            await getChatSession();
          }
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: `Failed to load contact information: ${(error as Error).message}`,
            icon: 'error',
          });
        }
      }
    };
    
    getReceiverDetails();
  }, [receiverId, currentUserId, getChatSession]);
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  // Fetch messages for the chat session
  const fetchMessages = async (sessionId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/chat/messages/${sessionId}`,
        getAuthHeaders()
      );
  
      const newMessages = response.data.data.data;

      console.log('Fetched Messages Debug:', {
        sessionId,
        messageCount: newMessages.length,
        currentUserId,
        receiverId
      });

      setMessages(newMessages);
      setLoading(false);
      scrollToBottom();
       // Only mark messages as read if session is confirmed
       const currentSessionId = getCurrentChatSessionId();

       if (currentSessionId) {
        await markMessagesAsRead(newMessages, currentSessionId);
      } else {
        console.warn('Skipping mark as read: No valid session ID');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setLoading(false);

      Swal.fire({
        title: 'Error',
        text: 'Failed to load messages',
        icon: 'error'
      });
    }
  };
  // Mark messages as read
  const markMessagesAsRead = async (messagesToMark: Message[], sessionId: number) => {
    if (!currentUserId || !sessionId) return;
  
    const unreadMessages = messagesToMark.filter(msg => 
      msg.receiver_id === currentUserId && !msg.read_at
    );
  
    if (unreadMessages.length === 0) return;
  
    try {
      await axios.post(
        'http://localhost:8000/api/chat/mark-read',
        { 
          message_ids: unreadMessages.map(msg => msg.id),
          chat_session_id: sessionId
        },
        getAuthHeaders()
      );
  
      // Notify parent window that messages were read
      if (window.parent) {
        window.parent.postMessage({ type: 'MESSAGES_READ' }, '*');
      }
  
      // Update local messages state
      setMessages(prev => prev.map(msg => 
        unreadMessages.some(m => m.id === msg.id)
          ? { ...msg, read_at: new Date().toISOString() }
          : msg
      ));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const sendMessage = async () => {
    // Use chatSessionIdRef.current instead of chatSessionId
    const currentSessionId = chatSessionIdRef.current;
    
    if (!newMessage.trim() || !currentSessionId) {
      console.warn('Cannot send message:', {
        messageContent: newMessage,
        sessionId: currentSessionId
      });
      return;
    }
  
    try {
      const response = await axios.post(
        `http://localhost:8000/api/chat/send/${currentSessionId}`,
        {
          sender_id: currentUserId,
          receiver_id: receiverId,
          message: newMessage
        },
        getAuthHeaders()
      );
  
      const sentMessage = response.data.data;
      
      // Log sent message details
      console.log('Message Sent Successfully:', {
        messageId: sentMessage.id,
        sessionId: currentSessionId
      });
  
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      scrollToBottom();
    } catch (error: unknown) {
      // Type guard to check if error is an axios error with a response
      if (axios.isAxiosError(error)) {
        console.error('Failed to send message - Full Error:', error);
        console.error('Error Response:', error.response?.data);
        Swal.fire({
          title: 'Error',
          text: `Failed to send message: ${error.response?.data?.error || error.message}`,
          icon: 'error',
        });
      } else {
        // Handle other types of errors
        console.error('Unexpected error:', error);
        Swal.fire({
          title: 'Error',
          text: 'An unexpected error occurred',
          icon: 'error',
        });
      }
    }
  };

  const deleteMessage = async (messageId: number, forEveryone: boolean = false)  => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
  
    const isSentMessage = message.sender_id === currentUserId;

     const result = await Swal.fire({
    title: 'Delete Message?',
    html: isSentMessage
      ? forEveryone
        ? 'This will delete the message for everyone. Are you sure?'
        : 'This will delete the message only for you. Are you sure?'
      : 'This will delete the message from your view. Are you sure?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  })
  
    if (!result.isConfirmed) return;
  
    try {
      await axios.delete(
        `http://localhost:8000/api/chat/messages/${messageId}`,
        { 
          ...getAuthHeaders(),
          data: { for_everyone: forEveryone } 
        }
      );
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            ...(isSentMessage 
              ? { 
                  deleted_by_sender: true,
                  ...(forEveryone ? { deleted_by_receiver: true } : {})
                }
              : { deleted_by_receiver: true })
          };
        }
        return msg;
      }));
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Your message has been deleted.',
        icon: 'success',
        timer: 1500
      });
    } catch (error) {
      console.error('Failed to delete message - Full Error:', error);
      
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Error Response:', error.response?.data);
        console.error('Error Status:', error.response?.status);
        console.error('Error Headers:', error.response?.headers);
      }
  
      Swal.fire({
        title: 'Delete Error',
        html: `
          <p>Failed to delete message.</p>
          <small>Error: ${error instanceof Error ? error.message : 'Unknown error'}</small>
          <small>Status: ${axios.isAxiosError(error) ? error.response?.status : 'N/A'}</small>
        `,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const renderMessageContent = (msg: Message) => {
    // Check if message is deleted for current user
    const isDeletedForMe = 
    (msg.sender_id === currentUserId && (msg.deleted_by_sender || msg.is_deleted)) ||
    (msg.receiver_id === currentUserId && (msg.deleted_by_receiver || msg.is_deleted));
  
    if (isDeletedForMe) {
      return (
        <div className="p-3 rounded-lg inline-block max-w-[85%] break-words bg-gray-200 text-gray-500 italic">
          {msg.deleted_by_sender && msg.deleted_by_receiver 
            ? 'Message deleted' 
            : 'Message deleted for you'}
        </div>
      );
    }
  
    return (
      <div className="relative group">
        {/* Message content */}
        <div className={`p-3 rounded-lg inline-block max-w-[85%] break-words relative ${
          msg.sender_id === currentUserId 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : 'bg-gray-200 text-gray-800 rounded-tl-none'
        }`}>
          <p className="mb-1">{msg.message}</p>
          <div className="flex items-center justify-end space-x-2">
            <small className={`text-xs ${msg.sender_id === currentUserId ? 'text-blue-200' : 'text-gray-500'}`}>
              {formatTime(msg.created_at)}
            </small>
            {getStatusIcon(msg)}
          </div>
        </div>
  
        {/* Delete options (shown on hover) */}
        <div className="message-options absolute -right-8 top-1/2 transform -translate-y-1/2 hidden group-hover:block">
          {msg.sender_id === currentUserId ? (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMessage(msg.id, false);
                }}
                className="text-gray-600 hover:text-gray-900 p-1 text-sm"
                title="Delete for me"
              >
                <FaTrash className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMessage(msg.id, true);
                }}
                className="text-red-600 hover:text-red-900 p-1 text-sm ml-1"
                title="Delete for everyone"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteMessage(msg.id, false);
              }}
              className="text-gray-600 hover:text-gray-900 p-1 text-sm"
              title="Delete for me"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Typing indicator handler
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) handleTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Get status icon based on message read status
  const getStatusIcon = (message: Message) => {
    if (message.sender_id !== currentUserId) return null;
    
    return message.read_at 
      ? <FaCheckDouble className="text-blue-500 ml-1" /> // Blue double check for read
      : <FaCheck className="text-gray-500 ml-1" />; // Gray single check for sent
  };

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-950 min-h-screen w-screen">
      <nav className="flex items-center justify-between px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md shadow-md mb-4">
        <Link to="/" className="flex items-center">
          <div className="w-[60px] h-[60px] bg-black rounded-full overflow-hidden">
            <img src="/pam.png" alt="PAM Logo" className="p-2 w-full h-full object-contain" />
          </div>
          <h1 className="ml-4 text-white text-2xl font-bold">Professionals & Matches</h1>
        </Link>
        <h2 className="text-white text-2xl font-bold">Chat</h2>
        <div className="flex items-center space-x-4">
          <Link to="/settings" className="text-white hover:text-blue-300 transition-colors">
            Settings
          </Link>
          <Link to="/contact" className="text-white hover:text-blue-300 transition-colors">
            Contact
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-md">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-all duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-white">
                {receiver ? `Chat with ${receiver.first_name} ${receiver.last_name}` : 
                 receiverId ? `Chat with User #${receiverId}` : 'Loading...'}
              </h2>
              <div className="ml-4 flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-white">Connected</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div 
                className="h-96 overflow-y-auto border p-4 mb-4 rounded-lg bg-black bg-opacity-20" 
                ref={messageContainerRef}
              >
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 my-10">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`mb-4 ${msg.sender_id === currentUserId ? 'text-right' : 'text-left'} relative group hover:bg-opacity-10 hover:bg-gray-500 rounded-lg transition-colors`}
                    onClick={(e) => {
                        // Only show delete on click if it's the sender's message
                        if (msg.sender_id === currentUserId) {
                          const trashBtn = e.currentTarget.querySelector('.delete-btn');
                          if (trashBtn) {
                            trashBtn.classList.toggle('hidden');
                          }
                        }
                      }}>
                      <div className={`p-3 rounded-lg inline-block max-w-[85%] break-words relative ${
                        msg.sender_id === currentUserId 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-gray-200 text-gray-800 rounded-tl-none'
                      }`}>
                        <p className="mb-1">{msg.message}</p>
                        <div className="flex items-center justify-end space-x-2">
                          <small className={`text-xs ${msg.sender_id === currentUserId ? 'text-blue-200' : 'text-gray-500'}`}>
                            {formatTime(msg.created_at)}
                          </small>
                          {getStatusIcon(msg)}
                        </div>
                        
                        {/* Delete button for all messages */}
                        <button 
                         onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(msg.id);
                        }}
                        className="delete-btn absolute -right-8 top-1/2 transform -translate-y-1/2 text-red-500 hidden hover:text-red-700"
                        title="Delete message" >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                
                {isTyping && (
                  <div className="text-left mb-4">
                    <div className="p-3 rounded-lg inline-block max-w-[85%] bg-gray-200 text-gray-800 rounded-tl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border p-3 rounded-l-lg bg-white bg-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <button 
                  onClick={sendMessage}
                  className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbox;