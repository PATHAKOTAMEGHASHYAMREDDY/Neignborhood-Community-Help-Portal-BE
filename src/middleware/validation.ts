import { Request, Response, NextFunction } from 'express';

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, contact_info, location, password, role } = req.body;

  if (!name || !contact_info || !location || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (role !== 'Resident' && role !== 'Helper') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { contact_info, password, role } = req.body;

  if (!contact_info || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (role !== 'Resident' && role !== 'Helper') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  next();
};

export const validateHelpRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description, and category are required' });
  }

  next();
};
