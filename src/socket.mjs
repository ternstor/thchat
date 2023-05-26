import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const HOST = '34.207.211.78'
const URL = process.env.NODE_ENV === 'production' ? `http://${HOST}:4000` : 'http://localhost:4000';
const CORS = process.env.NODE_ENV === 'production' ? `http://${HOST}:3000` : 'http://localhost:3000';

export const socket = io(URL);
export const cors = CORS;