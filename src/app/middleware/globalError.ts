import status from "http-status";
import AppError from "../errorHelper/AppError";
import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { TErrorSources } from "../interface/error.interface";
import z from "zod";
import { handleZodError } from "../errorHelper/handleerror";
import { sendResponse } from "../shared/sendResponse";

function errorHandler (err: any, req: Request, res: Response, next: NextFunction) {
    let statusCode: number = status.INTERNAL_SERVER_ERROR; // Default 500
    let message: string = 'Internal Server Error';
    let errorSources: TErrorSources[] = [];
    let stack: string | undefined = undefined;

    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = status.BAD_REQUEST;
        message = "Validation Error";
        errorSources.push({ message: err.message });
    }    
    else if (err instanceof AppError) {
        statusCode = err.statusCode || status.BAD_REQUEST;
        message = err.message;
        errorSources.push({ message: err.message });
    }
    else if (err instanceof z.ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack;

    }
    sendResponse(res,{
        success:false,
        message:message,
        httpStatusCode:statusCode,
        data:{errorSources,stack:process.env.NODE_ENV==='development'?err.stack:stack}
    })
}

export default errorHandler;