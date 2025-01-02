import { Request, Response, NextFunction } from "express";
// import log from "@/utils/logging";

const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error("Endpoint Not found");
  log.warn(error);

  return res.status(404).json({
    error: {
      message: error.message,
    },
  });
};

export default routeNotFound;
