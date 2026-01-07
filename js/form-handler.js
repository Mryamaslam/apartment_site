// Form Handler for Contact Form Submissions
// Saves form data to server via PHP API

// Get base path for API calls
function getApiPath(endpoint) {
    const isAdmin = window.location.pathname.includes('/admin/');
    return isAdmin ? `../api/${endpoint}` : `api/${endpoint}`;
}

// Function to save form submission to localStorage (fallback)
function saveFormSubmissionToLocalStorage(formData) {
    try {
        const submission = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            }),
            fullName: formData.fullName || '',
            phoneNumber: formData.phoneNumber || '',
            email: formData.email || '',
            apartmentType: formData.apartmentType || '',
            userType: formData.userType || '',
            message: formData.message || '',
            synced: false // Mark as not synced to server yet
        };
        
        // Get existing submissions from localStorage
        const existing = localStorage.getItem('formSubmissions');
        const submissions = existing ? JSON.parse(existing) : [];
        
        // Add new submission
        submissions.push(submission);
        
        // Save back to localStorage (keep last 100 submissions)
        const toSave = submissions.slice(-100);
        localStorage.setItem('formSubmissions', JSON.stringify(toSave));
        
        console.log('Saved to localStorage:', submission);
        
        // Try to sync to server in background (don't wait for it)
        syncLocalStorageSubmissions().catch(err => {
            console.log('Background sync failed, will retry later:', err);
        });
        
        return { success: true, message: 'Submission saved locally', id: submission.id };
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        throw new Error('Failed to save submission locally');
    }
}

// Function to sync localStorage submissions to server
async function syncLocalStorageSubmissions() {
    try {
        const stored = localStorage.getItem('formSubmissions');
        if (!stored) {
            return { synced: 0, failed: 0 };
        }
        
        const submissions = JSON.parse(stored);
        const unsynced = submissions.filter(sub => !sub.synced);
        
        if (unsynced.length === 0) {
            return { synced: 0, failed: 0 };
        }
        
        console.log(`Syncing ${unsynced.length} unsynced submissions to server...`);
        
        const apiPath = getApiPath('save-submission.php');
        let syncedCount = 0;
        let failedCount = 0;
        
        // Sync each unsynced submission
        for (const submission of unsynced) {
            try {
                const formData = {
                    fullName: submission.fullName,
                    phoneNumber: submission.phoneNumber,
                    email: submission.email,
                    apartmentType: submission.apartmentType,
                    userType: submission.userType,
                    message: submission.message
                };
                
                const response = await fetch(apiPath, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        // Mark as synced
                        submission.synced = true;
                        syncedCount++;
                        console.log(`Synced submission: ${submission.id}`);
                    } else {
                        failedCount++;
                    }
                } else {
                    failedCount++;
                }
            } catch (error) {
                console.error(`Error syncing submission ${submission.id}:`, error);
                failedCount++;
            }
        }
        
        // Update localStorage with synced status
        if (syncedCount > 0) {
            localStorage.setItem('formSubmissions', JSON.stringify(submissions));
        }
        
        console.log(`Sync complete: ${syncedCount} synced, ${failedCount} failed`);
        return { synced: syncedCount, failed: failedCount };
    } catch (error) {
        console.error('Error syncing localStorage submissions:', error);
        return { synced: 0, failed: 0 };
    }
}

// Function to save form submission to server
async function saveFormSubmission(formData) {
    try {
        const apiPath = getApiPath('save-submission.php');
        console.log('Saving submission to:', apiPath);
        console.log('Form data:', formData);
        
        const response = await fetch(apiPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Save response:', result);
        
        if (result.success) {
            return result;
        } else {
            throw new Error(result.message || 'Failed to save submission');
        }
    } catch (error) {
        console.error('Error saving submission to server:', error);
        // Fallback to localStorage if server fails
        console.log('Falling back to localStorage...');
        return saveFormSubmissionToLocalStorage(formData);
    }
}

// Function to get submissions from localStorage (fallback)
function getFormSubmissionsFromLocalStorage() {
    try {
        const stored = localStorage.getItem('formSubmissions');
        if (stored) {
            const submissions = JSON.parse(stored);
            return Array.isArray(submissions) ? submissions : [];
        }
        return [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

// Function to get all form submissions from server (for admin)
async function getFormSubmissions() {
    try {
        // First, try to sync any localStorage submissions to server
        await syncLocalStorageSubmissions();
        
        const apiPath = getApiPath('get-submissions.php');
        console.log('Fetching from:', apiPath);
        
        const response = await fetch(apiPath);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`Failed to fetch submissions: ${response.status}`);
        }
        
        const submissions = await response.json();
        console.log('Received submissions:', submissions);
        return Array.isArray(submissions) ? submissions : [];
    } catch (error) {
        console.error('Error fetching submissions from server:', error);
        // Fallback to localStorage
        console.log('Falling back to localStorage...');
        return getFormSubmissionsFromLocalStorage();
    }
}

// Function to delete a submission (for admin)
async function deleteSubmission(id) {
    try {
        const response = await fetch(getApiPath('delete-submission.php'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        return result.success || false;
    } catch (error) {
        console.error('Error deleting submission:', error);
        return false;
    }
}

// Handle contact form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                fullName: document.getElementById('fullName').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim(),
                email: document.getElementById('email').value.trim(),
                apartmentType: document.getElementById('apartmentSelect').value,
                userType: document.getElementById('userType').value,
                message: document.getElementById('message').value.trim()
            };
            
            // Validate required fields
            if (!formData.fullName || !formData.phoneNumber) {
                showFormMessage('Please fill in all required fields.', 'danger');
                return;
            }
            
            // Disable submit button
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            // Save submission to server (with localStorage fallback)
            try {
                const result = await saveFormSubmission(formData);
                
                // Show success message
                let successMsg = 'Thank you! Your inquiry has been submitted successfully. We will contact you soon.';
                if (result.message && result.message.includes('locally')) {
                    successMsg += ' (Saved locally - please contact us directly at +92 300 4485455)';
                }
                showFormMessage(successMsg, 'success');
                
                // Reset form
                contactForm.reset();
                
                // Hide price alert if visible
                const priceAlert = document.getElementById('priceAlert');
                if (priceAlert) {
                    priceAlert.classList.add('d-none');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                const errorMsg = error.message || 'Sorry, there was an error submitting your inquiry. Please try again or contact us directly at +92 300 4485455.';
                showFormMessage(errorMsg, 'danger');
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
    
    function showFormMessage(message, type) {
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = `alert alert-${type} d-block`;
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                formMessage.classList.add('d-none');
            }, 5000);
        }
    }
});

// Export to CSV/Excel function (for admin)
async function exportToExcel() {
    const submissions = await getFormSubmissions();
    
    if (submissions.length === 0) {
        alert('No form submissions to export.');
        return;
    }
    
    // Create CSV content
    const headers = ['ID', 'Date & Time', 'Full Name', 'Phone Number', 'Email', 'Apartment Type', 'User Type', 'Message'];
    const csvRows = [headers.join(',')];
    
    submissions.forEach(sub => {
        const row = [
            sub.id,
            `"${sub.date || ''}"`,
            `"${sub.fullName || ''}"`,
            `"${sub.phoneNumber || ''}"`,
            `"${sub.email || ''}"`,
            `"${sub.apartmentType || ''}"`,
            `"${sub.userType || ''}"`,
            `"${(sub.message || '').replace(/"/g, '""')}"` // Escape quotes in message
        ];
        csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `form_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Make functions globally available
window.exportToExcel = exportToExcel;
window.getFormSubmissions = getFormSubmissions;
window.deleteSubmission = deleteSubmission;
window.syncLocalStorageSubmissions = syncLocalStorageSubmissions;

