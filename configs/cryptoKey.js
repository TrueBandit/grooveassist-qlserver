import { randomBytes } from 'crypto';

const privateKey = randomBytes(32).toString('hex');

export default { privateKey };
