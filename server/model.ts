import {z} from 'zod';
const name=z.string().trim().min(1).max(100),id=z.string().regex(/^[A-Za-z0-9-]{1,80}$/),money=z.number().int().positive().max(100000000),date=z.iso.date(),phone=z.string().regex(/^\d{10}$/);
export const idSchema=id;
export const models={
 branches:{label:'Branch',id:'branchId',schema:z.object({location:name,phone})},
 plans:{label:'MembershipPlan',id:'planId',schema:z.object({planName:name,fee:money})},
 trainers:{label:'Trainer',id:'trainerId',schema:z.object({name,specialization:name,branchId:id})},
 members:{label:'Member',id:'memberId',schema:z.object({name,phone,joinDate:date,branchId:id,planId:id})},
 classes:{label:'ClassSession',id:'classId',schema:z.object({className:name,schedule:name,trainerId:id,branchId:id})},
 payments:{label:'Payment',id:'paymentId',schema:z.object({amount:money,paymentDate:date,memberId:id})}
} as const;
export type Entity=keyof typeof models;
export const entitySchema=z.enum(['branches','plans','trainers','members','classes','payments']);
export const registerSchema=models.members.schema.extend({memberId:id});
export const planSchema=z.object({planId:id});
export const loginSchema=z.object({email:z.email().max(200),password:z.string().min(1).max(200)});
