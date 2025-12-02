# Daily Encouragement Web App

A personalized web app to provide daily inspiration, Bible verses, motivational quotes, and a photo gallery. Perfect for encouraging someone special through law school or any challenging journey!

## Features

- **Daily Bible Verse**: A different encouraging scripture every day from bible-api.com
- **Photo Gallery**: Automatically loads all photos from a folder - no code editing needed!
- **Daily Motivation**: Inspirational quotes and law school encouragement from Quotable API
- **Mobile Optimized**: Fully responsive design with mobile-friendly navigation
- **Beautiful UI**:
  - Professional navigation with Headless UI components
  - Smooth animations and transitions
  - Gradient designs throughout
  - Icons from Heroicons
  - Sticky navigation bar
  - Elegant footer

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
cd encouragement-app
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Adding Your Photos

**Super Simple - Just Drop and Go!**

1. Add your photos to the `public/images/` folder
2. That's it! The gallery automatically detects and displays all images

**Supported formats:** JPG, JPEG, PNG, GIF, WebP

**Pro Tips:**
- The filename (without extension) becomes the caption
- For better captions, name your files descriptively: `beach-day.jpg` → "beach day"
- Photos are displayed in alphabetical order
- No code changes needed!

## Customization

### Change Bible Verses
Edit the `verses` array in `app/page.tsx` to add or modify scripture references.

### Modify Motivational Messages
Edit the encouraging message cards in `app/motivation/page.tsx` to personalize them.

### Update Colors
The app uses a purple-to-pink gradient theme. To change colors, search for color classes like `purple-600`, `pink-500` in the component files and replace with your preferred Tailwind color classes.

## Deploy to Vercel (Free)

### Step 1: Push to GitHub

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on [GitHub](https://github.com/new)

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login (can use your GitHub account)

2. Click "Add New Project" or "New Project"

3. Import your GitHub repository

4. Vercel will auto-detect Next.js settings. Just click "Deploy"

5. Wait 1-2 minutes for deployment to complete

6. You'll get a URL like `your-app-name.vercel.app`

7. Share this URL with your special person!

### Optional: Custom Domain

If you want a custom domain like `encouragement.com`:
1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain and follow the instructions

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Bible API** - Daily verses
- **ZenQuotes API** - Motivational quotes

## APIs Used

- [bible-api.com](https://bible-api.com/) - Free Bible verse API
- [Quotable](https://quotable.io/) - Free inspirational quotes API

## Support

If you need help:
- Next.js Documentation: https://nextjs.org/docs
- Vercel Deployment Guide: https://vercel.com/docs
- Tailwind CSS Docs: https://tailwindcss.com/docs

## License

This is a personal project. Feel free to use and modify as you wish!
