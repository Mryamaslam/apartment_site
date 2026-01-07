// Form Handler for Contact Form Submissions
// Uses Supabase as the backend (no PHP required)

// Ensure Supabase client is available
function getSupabaseClient() {
    if (!window.supabaseClient) {
        throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in js/supabase-client.js');
    }
    return window.supabaseClient;
}

// Table name in Supabase
const SUPABASE_TABLE = 'form_submissions';

// Function to save form submission to Supabase
async function saveFormSubmission(formData) {
    const supabase = getSupabaseClient();
    console.log('Saving submission to Supabase:', formData);

    const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .insert([
            {
                full_name: formData.fullName,
                phone_number: formData.phoneNumber,
                email: formData.email || null,
                apartment_type: formData.apartmentType || null,
                user_type: formData.userType || null,
                message: formData.message || null,
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Supabase insert error:', error);
        throw new Error('Failed to save submission. Please try again later.');
    }

    console.log('Supabase insert result:', data);
    return { success: true, data };
}

// Function to get all form submissions from Supabase (for admin)
async function getFormSubmissions() {
    const supabase = getSupabaseClient();
    console.log('Fetching submissions from Supabase...');

    const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Supabase select error:', error);
        throw new Error('Failed to fetch submissions.');
    }

    console.log('Received submissions from Supabase:', data);

    // Map Supabase fields to the structure used by the dashboard
    return (data || []).map(row => ({
        id: row.id,
        date: row.created_at ? new Date(row.created_at).toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }) : '',
        fullName: row.full_name || '',
        phoneNumber: row.phone_number || '',
        email: row.email || '',
        apartmentType: row.apartment_type || '',
        userType: row.user_type || '',
        message: row.message || '',
    }));
}

// Function to delete a submission from Supabase (for admin)
async function deleteSubmission(id) {
    const supabase = getSupabaseClient();
    try {
        const { error } = await supabase
            .from(SUPABASE_TABLE)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting submission from Supabase:', error);
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

