declare namespace Express {
  interface Request {
    userId?: number;
    userRole?: string;
    // multer file attached by upload middleware
    file?: Express.Multer.File;
  }
}
