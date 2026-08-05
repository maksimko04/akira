import JWTService from "../services/JWTService.js"

export default (socket, next) => {
    try{
        const cookieHeader = socket.request.headers.cookie;
    
        if (!cookieHeader) {
            return next(new Error("UNAUTHORIZED"));
        }
    
        const token = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/)?.[1];
    
        if(!token) {
            return next(new Error("UNAUTHORIZED"));
        }
    
        const payload = JWTService.validateToken(token);
    
        socket.user = payload;
    
        next();
    }
    catch(err) {
        next(new Error("UNAUTHORIZED"));
    }
}