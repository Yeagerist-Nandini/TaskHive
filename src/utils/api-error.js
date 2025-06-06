class ApiError extends Error{
    constructor(
        statusCode,
        message,
        errors = [],
        stack = "",
    ){
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.success = false;

        //capture stack trace
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.contructor)  //?
        }
    }
}


export {ApiError};