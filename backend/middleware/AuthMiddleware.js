import JWTService from "../services/JWTService.js";
import ApiError from "../models/ApiError.js";

export default (req, res, next) => {
    if(req.method === "OPTIONS"){
        return next();
    }

    const token = req.cookies.token;

    if(token){
        try{
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