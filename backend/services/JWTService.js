import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

class JWTService {
    generateToken(user){
        const payload = {
            id: user.id,
            role: user.role
        }
        return jwt.sign(payload, SECRET_KEY, {expiresIn: "24h"});
    }

    validateToken(token) {
        try{
            return jwt.verify(token, SECRET_KEY);
        }
        catch(err){
            return null;
        }
    }
};

export default new JWTService();