# Secret Gallery Section

This directory contains private media files that are only accessible through authenticated sessions.

## How it works

- Files placed in this directory are **NOT** publicly accessible
- They are served through the `/api/secret-images` API route which checks for valid authentication
- Users must enter the correct secret code to access these files
- Authentication is session-based and expires after 7 days

## Adding Media

Simply add your image or video files to this directory:

**Supported formats:**
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Videos: `.mp4`, `.webm`, `.mov`

The files will automatically appear in the secret section after authentication.

## Security

- Files are stored outside the `public/` folder
- Direct URL access is blocked - all requests require a valid session
- The secret code is stored in environment variables (`.env.local`)
- Sessions are encrypted using `iron-session`

## Changing the Secret Code

Edit the `SECRET_CODE` value in `.env.local`:

```
SECRET_CODE=your_new_secret_code
```

Then restart the development server.
