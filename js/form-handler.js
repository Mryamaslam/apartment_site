// Form Handler for Contact Form Submissions
// Saves form data to server via PHP API

// Get base path for API calls
function getApiPath(endpoint) {
    const isAdmin = window.location.pathname.includes('/admin/');
    return isAdmin ? `../api/${endpoint}` : `api/${endpoint}`;
}

// Function to save form submission to server
async function saveFormSubmission(formData) {
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
}

// Function to get all form submissions from server (for admin)
async function getFormSubmissions() {
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

