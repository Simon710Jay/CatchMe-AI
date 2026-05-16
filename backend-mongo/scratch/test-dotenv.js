const dotenv = require('dotenv');
const path = require('path');
console.log('Loading .env...');
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');
console.log('Done.');
