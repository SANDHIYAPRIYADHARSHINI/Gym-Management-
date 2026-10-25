import {app} from './app.js';
import express from 'express';
import path from 'node:path';
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('Set JWT_SECRET to at least 32 characters');
if(process.env.NODE_ENV==='production'){app.use(express.static(path.resolve('dist')));app.get('/{*path}',(req,res)=>res.sendFile(path.resolve('dist/index.html')));}
app.listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log('GymGraph API listening on http://127.0.0.1:'+ (process.env.PORT||3001)));
