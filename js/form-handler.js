// Form Handler for Contact Form Submissions
// Saves form data to server via PHP API

// Get base path for API calls
function getApiPath(endpoint) {
    const isAdmin = window.location.pathname.includes('/admin/');
    return isAdmin ? `../api/${endpoint}` : `api/${endpoint}`;
}

// Function to save form submission to server
async function saveFormSubmission(formData) {
    try {
        const response = await fetch(getApiPath('save-submission.php'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result;
        } else {
            throw new Error(result.message || 'Failed to save submission');
        }
    } catch (error) {
        console.error('Error saving submission:', error);
        throw error;
    }
}

// Function to get all form submissions from server (for admin)
async function getFormSubmissions() {
    try {
        const response = await fetch(getApiPath('get-submissions.php'));
        
        if (!response.ok) {
            throw new Error('Failed to fetch submissions');
        }
        
        const submissions = await response.json();
        return submissions || [];
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
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
        contactForm.addEventListener('submit', function(e) {
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
            
            // Save submission to server
            try {
                await saveFormSubmission(formData);
                
                // Show success message
                showFormMessage('Thank you! Your inquiry has been submitted successfully. We will contact you soon.', 'success');
                
                // Reset form
                contactForm.reset();
                
                // Hide price alert if visible
                const priceAlert = document.getElementById('priceAlert');
                if (priceAlert) {
                    priceAlert.classList.add('d-none');
                }
            } catch (error) {
                showFormMessage('Sorry, there was an error submitting your inquiry. Please try again or contact us directly.', 'danger');
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

