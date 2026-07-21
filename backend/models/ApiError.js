export default class ApiError extends Error {
    constructor(status, message){
        super();
        this.status = status;
        this.message = message;
    }

    static badRequest(message = "BAD_REQUEST"){
        return new ApiError(400, message);
    }

    static internal(message = "INTERNAL"){
        return new ApiError(500, message);
    }

    static forbidden(message = "FORBIDDEN"){
        return new ApiError(403, message);
    }

    static unauthorized(message = "UNAUTHORIZED") {
        return new ApiError(401, message);
    }
}