import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack); // Log the error stack for debugging

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
