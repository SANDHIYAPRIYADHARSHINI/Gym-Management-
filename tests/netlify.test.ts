import {describe,it,expect,afterAll} from 'vitest';
import {handler} from '../netlify/functions/api.js';
import {driver} from '../server/db.js';
afterAll(()=>driver.close());
describe('Netlify API adapter',()=>{
 it('preserves API routing and authentication',async()=>{
 const event={httpMethod:'GET',path:'/api/records/members',headers:{host:'example.netlify.app'},multiValueHeaders:{},queryStringParameters:null,multiValueQueryStringParameters:null,body:null,isBase64Encoded:false,requestContext:{}};
 const response:any=await (handler as any)(event,{});
 expect(response.statusCode).toBe(401);expect(JSON.parse(response.body).error).toBe('Please sign in');
 });
});
