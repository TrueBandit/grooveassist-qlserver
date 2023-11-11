import { findUserAndAuth } from '../graphQL/models/userBL.js';
import jwt from 'jsonwebtoken';
import cryptoKey from './cryptoKey.js';

const privateKey = cryptoKey.privateKey;

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, privateKey, { expiresIn: 7200 });  // expires in 2 hours
  };
  
  const authController = {
      async authenticate(userLoginObject) {
          let user = await findUserAndAuth(userLoginObject);
          if (user) {
              var tokenData = generateToken(user._id);
              return { 
                  token: tokenData, 
                  user: user
              };
          } else {
              throw new Error('Invalid username or password');
          }
      },
      generateToken,  // Export the generateToken function
  };
  
  export { authController };