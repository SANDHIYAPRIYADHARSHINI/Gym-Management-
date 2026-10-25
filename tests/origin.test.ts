import {describe,it,expect} from 'vitest';
import request from 'supertest';
import {isAllowedOrigin} from '../server/origin.js';
import {app} from '../server/app.js';
describe('request origin protection',()=>{
 it('accepts equivalent local development hostnames on the configured port',()=>{
  for(const host of ['localhost','127.0.0.1','[::1]'])expect(isAllowedOrigin(`http://${host}:5173`,'http://localhost:5173',false)).toBe(true);
 });
 it('uses a safe local default when APP_ORIGIN is absent',()=>expect(isAllowedOrigin('http://127.0.0.1:5173',undefined,false)).toBe(true));
 it('requires the exact configured origin in production',()=>{
  expect(isAllowedOrigin('https://gym.example','https://gym.example',true)).toBe(true);
  expect(isAllowedOrigin('http://127.0.0.1:5173','http://localhost:5173',true)).toBe(false);
  expect(isAllowedOrigin('https://preview.netlify.app','https://gym.example',true)).toBe(false);
  expect(isAllowedOrigin('https://gym.example',undefined,true)).toBe(false);
 });
 it.each([undefined,'null','https://evil.example','http://localhost:5174','https://localhost:5173','http://localhost.evil.example:5173','http://localhost:5173/path','http://user@localhost:5173'])('rejects untrusted or malformed origin %s',origin=>expect(isAllowedOrigin(origin,'http://localhost:5173',false)).toBe(false));
 it('lets 127.0.0.1 login reach credential validation',async()=>{
  const previous=process.env.APP_ORIGIN;process.env.APP_ORIGIN='http://localhost:5173';
  try {const r=await request(app).post('/api/login').set('Origin','http://127.0.0.1:5173').send({email:'invalid'});expect(r.status).toBe(400);expect(r.body.error).not.toBe('Request origin rejected');}
  finally {if(previous===undefined)delete process.env.APP_ORIGIN;else process.env.APP_ORIGIN=previous;}
 });
});
