import ApiError from "../models/ApiError.js";
import Roles from "../models/Roles.js";

export default function(...allowedRoles) {
    return (req, res, next) => {

        const user = req.user;
        if(!user){
            return next(ApiError.unauthorized());
        }

        if(allowedRoles.includes(user.role)){
            return next();
        }

        return next(ApiError.forbidden());
    }
}