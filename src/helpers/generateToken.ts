const crypto = require('crypto');

// Function to generate a random JWT secret
export const generateRandomJWTSecret = (length: Number) => {
    const randomBytes = crypto.randomBytes(length);
    return randomBytes.toString('base64'); // Use 'hex' instead of 'base64' if you prefer a hexadecimal string
};