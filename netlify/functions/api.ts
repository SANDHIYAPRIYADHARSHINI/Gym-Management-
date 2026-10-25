import serverless from 'serverless-http';
import {isIP} from 'node:net';
import type {IncomingMessage} from 'node:http';
import {app} from '../../server/app.js';

// Netlify's Lambda compatibility event does not always contain an AWS sourceIp.
// Use Netlify's edge-provided address, never an arbitrary X-Forwarded-For chain.
export const handler = serverless(app, {
  request(request: IncomingMessage, event: any) {
    const headers = event.headers || {};
    const candidate = headers['x-nf-client-connection-ip'] || headers['X-Nf-Client-Connection-Ip']
      || event.requestContext?.http?.sourceIp || event.requestContext?.identity?.sourceIp;
    const address = typeof candidate === 'string' && isIP(candidate) ? candidate : '127.0.0.1';
    Object.defineProperty(request.socket, 'remoteAddress', {value:address, configurable:true});
    Object.defineProperty(request, 'ip', {value:address, configurable:true});
    delete request.headers['x-forwarded-for'];
  }
});
