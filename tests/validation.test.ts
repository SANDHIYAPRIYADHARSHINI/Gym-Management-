import {describe,it,expect,afterAll} from 'vitest';
import request from 'supertest';
import {models} from '../server/model.js';
import {redact,driver} from '../server/db.js';
import {app} from '../server/app.js';
afterAll(()=>driver.close());
describe('API boundaries without database mocks',()=>{
 it('rejects unauthenticated reads',async()=>{expect((await request(app).get('/api/records/members')).status).toBe(401);});
 it('rejects a cross-origin mutation before connecting to the database',async()=>{process.env.APP_ORIGIN='http://localhost:5173';expect((await request(app).post('/api/register').set('Origin','https://untrusted.example').send({})).status).toBe(403);});
 it('rejects malformed login requests',async()=>{process.env.APP_ORIGIN='http://localhost:5173';expect((await request(app).post('/api/login').set('Origin',process.env.APP_ORIGIN).send({email:'invalid'})).status).toBe(400);});
 it('requires a ten digit member phone',()=>{expect(models.members.schema.safeParse({name:'Test',phone:'123',joinDate:'2026-01-01',branchId:'1',planId:'1'}).success).toBe(false);});
 it.each([0,-1,1.5])('rejects invalid payment %s',amount=>{expect(models.payments.schema.safeParse({amount,paymentDate:'2026-01-01',memberId:'1'}).success).toBe(false);});
 it('redacts nested private parameters',()=>{expect(redact({props:{phone:'9100000000'},passwordHash:'hash',amount:10})).toEqual({props:{phone:'[REDACTED]'},passwordHash:'[REDACTED]',amount:10});});
});
