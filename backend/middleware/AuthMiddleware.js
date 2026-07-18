import JWTService from "../services/JWTService.js";
import ApiError from "../models/ApiError.js";

export default (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if(authHeader){
        try{
            const token = authHeader.split(" ")[1];
            const payload = JWTService.validateToken(token);
            req.user = payload;
            next();
        }
        catch(err){
            next(ApiError.unauthorized());
        }
        return;
    }

    next();
}