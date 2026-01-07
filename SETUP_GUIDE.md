# Setup Guide for Form Submissions

## Overview

The form submission system works in two modes:

1. **Server Mode (Recommended)**: When PHP is available, all submissions are saved directly to the server
2. **Local Mode (Fallback)**: When PHP is not available, submissions are saved to browser localStorage and automatically synced to the server when it becomes available

## How It Works

### For Users Submitting Forms:
- Form tries to submit to PHP API first
- If server is unavailable, saves to localStorage
- Automatically syncs to server when available (in background)

### For Admin Panel:
- Shows all submissions from server (accessible from any device/account)
- Automatically syncs localStorage submissions when panel loads
- Has a "Sync Pending" button to manually sync any pending submissions
- Auto-syncs every 5 minutes

## Setting Up PHP Server (For Production)

### Option 1: Using PHP Built-in Server (Development/Testing)

1. Install PHP (if not already installed):
   - Windows: Download from https://windows.php.net/download/
   - Mac: `brew install php` or comes with macOS
   - Linux: `sudo apt-get install php` (Ubuntu/Debian)

2. Navigate to project directory:
   ```bash
   cd apartmentsite
   ```

3. Start PHP server:
   ```bash
   php -S localhost:8000
   ```

4. Access the site at: `http://localhost:8000`

### Option 2: Using XAMPP/WAMP (Windows)

1. Download and install XAMPP from https://www.apachefriends.org/
2. Copy project files to `C:\xampp\htdocs\apartmentsite\`
3. Start Apache from XAMPP Control Panel
4. Access at: `http://localhost/apartmentsite`

### Option 3: Using Live Server (VS Code Extension)

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"
3. Note: This may not support PHP. Use PHP server instead.

### Option 4: Deploy to Web Hosting

1. Upload all files to your web hosting (cPanel, FTP, etc.)
2. Ensure PHP is enabled on your hosting
3. Set proper file permissions:
   - `data/` folder: 755 or 777 (writable)
   - `data/submissions.json`: 644 or 666 (writable)

## File Permissions

Ensure the `data` directory is writable:

```bash
chmod 755 data
chmod 666 data/submissions.json
```

Or on Windows, right-click folder → Properties → Security → Allow write permissions

## Testing

1. **Test Form Submission:**
   - Open `contact.html` or `index.html`
   - Fill out and submit the form
   - Check `data/submissions.json` for the submission

2. **Test Admin Panel:**
   - Go to `admin/login.html`
   - Login with credentials (see login.html for default)
   - View submissions in dashboard
   - Test "Sync Pending" button

3. **Test Sync Mechanism:**
   - Submit form without PHP server (saves to localStorage)
   - Start PHP server
   - Open admin panel (should auto-sync)
   - Or click "Sync Pending" button

## Troubleshooting

### Form shows error even after fix:
- Check browser console (F12) for errors
- Verify PHP server is running
- Check file permissions on `data/` folder

### Admin panel shows no submissions:
- Check if PHP server is running
- Verify `data/submissions.json` exists and is readable
- Check browser console for API errors
- Try clicking "Sync Pending" button

### Submissions not syncing:
- Check browser console for errors
- Verify PHP API endpoint is accessible
- Check network tab in browser DevTools
- Ensure `api/save-submission.php` is accessible

## Security Notes

- The current setup uses basic front-end authentication
- For production, consider:
  - Moving authentication to PHP sessions
  - Adding .htaccess protection to admin folder
  - Using HTTPS
  - Adding rate limiting to form submissions
  - Sanitizing and validating all inputs server-side

## Admin Login Credentials

Default credentials (stored in `admin/login.html`):
- Username: `cityscape_admin`
- Password: `Fallete@2026!`

**Important:** Change these credentials before deploying to production!

