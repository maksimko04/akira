import ApiError from "../models/ApiError.js";

export default (err, req, res, next) => {
    if(err instanceof ApiError){
        return res.status(err.status).json({err: err.message});
    }

    if(err.name === "ValidationError"){
        return res.status(500).json({message: "UNEXPECRED_ERROR_DATABASE"});
    }

    res.status(500).json({err: "UNEXPECTED_ERROR"})
};