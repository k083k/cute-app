import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the secret images directory
    const secretImagesDir = path.join(process.cwd(), 'private', 'secret');

    // Check if directory exists
    if (!fs.existsSync(secretImagesDir)) {
      return NextResponse.json([]);
    }

    // Read all files from the directory
    const files = fs.readdirSync(secretImagesDir);

    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    // Create image data objects
    const images = imageFiles.map((file, index) => ({
      id: 10000 + index, // Start with high ID to avoid conflicts
      src: `/api/secret-images/file?filename=${encodeURIComponent(file)}`,
      alt: file,
      caption: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    }));

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching secret images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
