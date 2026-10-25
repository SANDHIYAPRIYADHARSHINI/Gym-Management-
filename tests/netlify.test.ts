import {describe,it,expect,afterAll} from 'vitest';
import {handler} from '../netlify/functions/api.js';
import {driver} from '../server/db.js';
afterAll(()=>driver.close());
describe('Netlify API adapter',()=>{
 it('validates login without AWS sourceIp or a trusted forwarded chain',async()=>{
 process.env.APP_ORIGIN='https://example.netlify.app';
 const event={httpMethod:'POST',path:'/api/login',headers:{host:'example.netlify.app',origin:'https://example.netlify.app','content-type':'application/json','x-nf-client-connection-ip':'203.0.113.42','x-forwarded-for':'198.51.100.1'},multiValueHeaders:{},queryStringParameters:null,multiValueQueryStringParameters:null,body:JSON.stringify({email:'invalid'}),isBase64Encoded:false,requestContext:{}};
 const response:any=await (handler as any)(event,{});expect(response.statusCode).toBe(400);
 });
 it('preserves API routing and authentication',async()=>{
 const event={httpMethod:'GET',path:'/api/records/members',headers:{host:'example.netlify.app'},multiValueHeaders:{},queryStringParameters:null,multiValueQueryStringParameters:null,body:null,isBase64Encoded:false,requestContext:{}};
 const response:any=await (handler as any)(event,{});
 expect(response.statusCode).toBe(401);expect(JSON.parse(response.body).error).toBe('Please sign in');
 });
});
