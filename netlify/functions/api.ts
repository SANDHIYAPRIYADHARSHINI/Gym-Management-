import serverless from 'serverless-http';
import {app} from '../../server/app.js';

// Keep the Express API and browser under the same origin for cookie authentication.
export const handler = serverless(app);
