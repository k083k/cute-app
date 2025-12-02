import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDirectory = path.join(process.cwd(), 'public', 'images');

    // Check if directory exists
    if (!fs.existsSync(imagesDirectory)) {
      return NextResponse.json([]);
    }

    // Read all files from the images directory
    const files = fs.readdirSync(imagesDirectory);

    // Filter for image files only (jpg, jpeg, png, gif, webp)
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    // Map to full paths
    const images = imageFiles.map((file, index) => ({
      id: index + 1,
      src: `/images/${file}`,
      alt: `Photo ${index + 1}`,
      caption: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') // Use filename as caption
    }));

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error reading images:', error);
    return NextResponse.json([]);
  }
}
