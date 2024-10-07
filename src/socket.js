import io from 'socket.io-client';

// Use environment variable to dynamically set the backend URL
const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'; // Fallback to localhost if not set

const socket = io(backendURL);

export default socket;
