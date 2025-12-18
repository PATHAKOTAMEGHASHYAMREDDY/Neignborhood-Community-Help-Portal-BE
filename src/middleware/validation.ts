import { Request, Response, NextFunction } from 'express';

/**
 * Validate Register
 * Admin is NOT allowed to self-register
 */
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
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters' });
  }

  // Only Resident & Helper can self-register
  if (role !== 'Resident' && role !== 'Helper') {
    return res.status(400).json({ error: 'Invalid role for registration' });
  }

  next();
};

/**
 * Validate Login
 * Role is NOT validated here
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { contact_info, password } = req.body;

  if (!contact_info || !password) {
    return res.status(400).json({ error: 'Contact info and password are required' });
  }

  // ❌ NO role validation here
  next();
};

/**
 * Validate Help Request
 */
export const validateHelpRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    return res
      .status(400)
      .json({ error: 'Title, description, and category are required' });
  }

  next();
};
