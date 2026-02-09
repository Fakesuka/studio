import { Request, Response } from 'express';

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Generate public URL
  // The file is stored in public/uploads, so we access it via /uploads/filename
  // Assuming 'public' folder is served statically
  const imageUrl = `/uploads/${req.file.filename}`;

  return res.json({ url: imageUrl });
}
