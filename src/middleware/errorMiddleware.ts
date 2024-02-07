// errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';

const errorMiddleware = (
    error: any,  // 'any' is used here, you might want to create specific types for your errors
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', error);

    // Handle specific types of errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
    }

    // Handle other types of errors as needed

    // Default to a generic server error
    res.status(500).json({ error: 'Internal Server Error' });
};

export default errorMiddleware;
