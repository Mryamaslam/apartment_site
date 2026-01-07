# Hostinger Setup Guide

## Quick Setup Checklist

Since your site is hosted on Hostinger, follow these steps to ensure form submissions work correctly:

### 1. File Permissions (via File Manager or FTP)

Set the following permissions using Hostinger's File Manager or FTP client:

- **`data/` folder**: `755` or `777` (must be writable)
- **`data/submissions.json`**: `644` or `666` (must be writable)
- **`api/` folder**: `755` (standard)

**How to set permissions in Hostinger File Manager:**
1. Log into Hostinger hPanel
2. Go to **File Manager**
3. Navigate to your site's root directory
4. Right-click on `data` folder → **Change Permissions**
5. Set to `755` or `777`
6. Do the same for `data/submissions.json` (set to `644` or `666`)

### 2. Verify PHP is Working

1. Open your browser and go to: `https://yourdomain.com/api/test.php`
2. You should see a JSON response with server information
3. Check that `data_dir_writable` and `data_file_writable` are both `true`

### 3. Test Form Submission

1. Go to your contact page: `https://yourdomain.com/contact.html`
2. Fill out and submit the form
3. Check browser console (F12) for any errors
4. Verify submission was saved by checking admin panel

### 4. Test Admin Panel

1. Go to: `https://yourdomain.com/admin/login.html`
2. Login with credentials
3. Check that submissions appear in the dashboard
4. Test the "Sync Pending" button if needed

## Troubleshooting

### Form shows error when submitting:

1. **Check file permissions:**
   - Go to `https://yourdomain.com/api/test.php`
   - Verify `data_dir_writable` is `true`
   - If false, set `data/` folder permissions to `755` or `777`

2. **Check browser console (F12):**
   - Look for any JavaScript errors
   - Check Network tab for failed API requests
   - Look for CORS errors

3. **Check PHP error logs:**
   - In Hostinger hPanel, go to **Advanced** → **Error Log**
   - Look for any PHP errors related to `save-submission.php`

### Admin panel shows no submissions:

1. **Verify API endpoint works:**
   - Go to: `https://yourdomain.com/api/get-submissions.php`
   - Should return JSON array (may be empty `[]`)

2. **Check file exists:**
   - Verify `data/submissions.json` exists
   - Check it's readable (permissions `644` or `666`)

3. **Try manual sync:**
   - Click "Sync Pending" button in admin panel
   - Check browser console for errors

### Permission denied errors:

If you see "Permission denied" or "Failed to save" errors:

1. **Set folder permissions:**
   ```
   data/ → 755 or 777
   data/submissions.json → 644 or 666
   ```

2. **Create data folder if missing:**
   - The PHP script will try to create it, but if it fails:
   - Manually create `data/` folder via File Manager
   - Set permissions to `755` or `777`

3. **Check ownership:**
   - Files should be owned by your hosting account
   - Contact Hostinger support if ownership issues persist

## File Structure on Hostinger

Your files should be organized like this:

```
public_html/ (or your domain folder)
├── index.html
├── contact.html
├── admin/
│   ├── login.html
│   └── dashboard.html
├── api/
│   ├── save-submission.php
│   ├── get-submissions.php
│   ├── delete-submission.php
│   ├── test.php
│   └── .htaccess
├── data/
│   ├── submissions.json
│   └── .htaccess
├── js/
│   └── form-handler.js
└── css/
    └── style.css
```

## Security Notes

1. **Admin Login:** Change default credentials in `admin/login.html` before going live
2. **Data Protection:** The `.htaccess` file in `data/` prevents direct access to `submissions.json`
3. **API Protection:** Consider adding authentication to API endpoints for production

## Support

If issues persist:
1. Check `https://yourdomain.com/api/test.php` for detailed diagnostics
2. Review Hostinger error logs in hPanel
3. Contact Hostinger support for file permission issues
4. Check browser console (F12) for client-side errors

## Testing Checklist

- [ ] `api/test.php` shows all checks as `true`
- [ ] Form submission works without errors
- [ ] Admin panel shows submissions
- [ ] File permissions are set correctly
- [ ] No errors in browser console
- [ ] No errors in PHP error logs

