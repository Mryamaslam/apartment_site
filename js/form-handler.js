// Form Handler for Contact Form Submissions
// Stores form data in localStorage and provides export functionality

// Function to save form submission to localStorage
function saveFormSubmission(formData) {
    // Get existing submissions or create empty array
    let submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    
    // Add new submission with timestamp
    const submission = {
        id: Date.now(), // Unique ID based on timestamp
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        ...formData
    };
    
    submissions.push(submission);
    
    // Save back to localStorage
    localStorage.setItem('formSubmissions', JSON.stringify(submissions));
    
    return submission;
}

// Function to get all form submissions
function getFormSubmissions() {
    return JSON.parse(localStorage.getItem('formSubmissions') || '[]');
}

// Function to clear all submissions (for admin use)
function clearFormSubmissions() {
    localStorage.removeItem('formSubmissions');
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
            
            // Save submission
            const submission = saveFormSubmission(formData);
            
            // Show success message
            showFormMessage('Thank you! Your inquiry has been submitted successfully. We will contact you soon.', 'success');
            
            // Reset form
            contactForm.reset();
            
            // Hide price alert if visible
            const priceAlert = document.getElementById('priceAlert');
            if (priceAlert) {
                priceAlert.classList.add('d-none');
            }
            
            console.log('Form submission saved:', submission);
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

// Export to CSV/Excel function
function exportToExcel() {
    const submissions = getFormSubmissions();
    
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
            `"${sub.date}"`,
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

// Make export function globally available
window.exportToExcel = exportToExcel;
window.getFormSubmissions = getFormSubmissions;
window.clearFormSubmissions = clearFormSubmissions;

