import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? 'http://34.207.211.78:4000' : 'http://localhost:4000';

export const socket = io(URL);