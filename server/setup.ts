import {driver,transaction} from './db.js';
import {models} from './model.js';
export async function constraints(){for(const m of Object.values(models))await transaction(true,run=>run(`CREATE CONSTRAINT ${m.label}_id IF NOT EXISTS FOR (n:${m.label}) REQUIRE n.${m.id} IS UNIQUE`));await transaction(true,run=>run('CREATE CONSTRAINT plan_name IF NOT EXISTS FOR (n:MembershipPlan) REQUIRE n.planName IS UNIQUE'));await transaction(true,run=>run('CREATE CONSTRAINT user_email IF NOT EXISTS FOR (n:AppUser) REQUIRE n.email IS UNIQUE'));}
if(process.argv[1]?.endsWith('setup.ts'))constraints().then(()=>console.log('Constraints ready')).finally(()=>driver.close());
