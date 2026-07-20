import ApiError from "../models/ApiError.js";

export default (req, res, next) => {
    if(!req.user){
        return next(ApiError.unauthorized());
    }
    return next();
};