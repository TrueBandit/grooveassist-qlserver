import { findUserAndAuth } from '../graphQL/models/userBL.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config'

const privateKey = process.env.TOKEN_SECRET

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, privateKey, { expiresIn: 7200 });  // expires in 2 hours
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, privateKey);
        return decoded.id; // Return user ID
    } catch (error) {
        // Handle invalid token
        throw new Error('Invalid or expired token');
    }
};

const authController = {
    async validateUserCredentials(userLoginObject) {
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
    verifyToken,    // Export the verifyToken function
};

export { authController };
