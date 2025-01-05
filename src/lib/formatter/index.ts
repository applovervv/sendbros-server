import { Request, Response } from 'express';

interface GoogleStyleResult {
  apiVersion: string;
  data: any;
  context?: string;
  error?: {
    code: number;
    message: string;
  };
}

function createGoogleStyleResponse<T>(
  req: Request, 
  res: Response, 
  status: number, 
  data: T, 
  errorMsg?: string | null
): Response {
  const result: GoogleStyleResult = {
    apiVersion: '1.0.0',
    data: data,
  };

  if (req.query.context !== undefined) {
    result.context = req.query.context as string;
  }

  if (errorMsg !== undefined && errorMsg !== null) {
    result.error = {
      code: status,
      message: errorMsg,
    };
  }

  return res.status(status).json(result);
}

export {
  createGoogleStyleResponse,
  GoogleStyleResult
};