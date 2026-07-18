import { validationResult } from "express-validator"
import ApiError from "../models/ApiError.js";

export const createValidator = (start, isOptional, callback) => {
    let chain = start;

    if(isOptional){
        chain = chain.optional();
    }

    return callback(chain); 
};

export const finalValidator = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        next(ApiError.badRequest(errors.array()[0].msg));
    }
    
    return next();
}