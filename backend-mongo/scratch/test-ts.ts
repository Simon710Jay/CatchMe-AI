console.log('TS-Node Test');
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('PORT:', process.env.PORT);
