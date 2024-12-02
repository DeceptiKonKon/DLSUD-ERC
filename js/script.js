// Function to handle dark mode toggle
function toggleDarkMode() {
    const body = document.body;
    const darkModeIcon = document.getElementById('dark-mode-icon');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        darkModeIcon.src = 'img/dark-icon.png'; 
        localStorage.setItem('darkMode', 'enabled');
    } else {
        darkModeIcon.src = 'img/light-icon.png'; 
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Check if dark mode was previously enabled and apply it
window.onload = () => {
    const darkModeStatus = localStorage.getItem('darkMode');
    const darkModeIcon = document.getElementById('dark-mode-icon');

    if (darkModeStatus === 'enabled') {
        document.body.classList.add('dark-mode');
        if (darkModeIcon) darkModeIcon.src = 'img/dark-icon.png';
    } else {
        document.body.classList.remove('dark-mode');
        if (darkModeIcon) darkModeIcon.src = 'img/light-icon.png';
    }

    // Check if we are on the login page
    if (document.getElementById('login-form')) {
        handleLoginForm();
    }

    // Check if we are on the signup page
    if (document.getElementById('signup-form')) {
        handleSignupForm();
    }

    if (window.location.pathname.endsWith('dashboard.html')) {
        initDashboardPage();
    }

    if (window.location.pathname.includes('accountsettings.html')) {
        initAccountSettingsPage();
    }
    const accountType = sessionStorage.getItem('account_type'); // assuming you stored account_type in sessionStorage
    if (accountType === 'student') 
    // Fetch and display the protocols for the logged-in user
    if (document.getElementById('student-section')) {
        fetchStudentProtocols();
    
    }
}

function initDashboardPage() {
    // Get user information from sessionStorage
    const userEmail = sessionStorage.getItem('userEmail');
    const accountType = sessionStorage.getItem('accountType');

    // If userEmail or accountType are not found, redirect to login page
    if (!userEmail || !accountType) {
        alert("Please log in first.");
        window.location.href = "index.html";  // Redirect to login page
        return;
    }

    // Display the user's email in the dashboard
    displayUserEmail(userEmail);

    // Show or hide sections based on the account type
    showSectionBasedOnAccountType(accountType);
}

function displayUserEmail(userEmail) {
    // Ensure that the element exists before trying to modify it
    const emailElement = document.getElementById('user-email');
    if (emailElement) {
        emailElement.textContent = `Logged in as: ${userEmail}`;
    }
}

async function handleLoginForm() {
    document.getElementById('login-form').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const email = document.getElementById('student-email').value;
        const password = document.getElementById('student-password').value;

        // Basic validation
        if (!email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await fetch('https://dlsudercproject.pythonanywhere.com/login', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const result = await response.json();
                if (result.message === "Please confirm your email.") {
                    sessionStorage.setItem('userEmail', email);
                    alert(result.message);  // Show the confirmation message
                    window.location.href = result.redirect;  // Redirect to confirmation page
                    return;
                } else {
                    alert(result.error || 'An error occurred. Please try again.');
                }
                return;
            }

            const result = await response.json();
            if (result.message === "Login successful!") {
                sessionStorage.setItem('userEmail', email); // Store the email
                sessionStorage.setItem('accountType', result.accountType); // Store the account type
                sessionStorage.setItem('userName', result.userName); // Store the user's name
            
                window.location.href = result.redirect;  // Redirect to the dashboard
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);  // Show error message
        }
    });
}


function handleSignupForm() {
    document.getElementById('signup-form').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get form input values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        const accountType = document.getElementById('account-type').value;

        // Validate input fields
        if (!name || !email || !password || !confirmPassword || !accountType) {
            alert('Please fill in all fields.');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('account-type', accountType);

        try {
            // Send POST request to signup API
            const response = await fetch('https://dlsudercproject.pythonanywhere.com/signup', {
                method: 'POST',
                body: formData
            });

            const result = await response.json(); // Parse the response

            if (response.ok) {
                // If signup is successful
                alert('Signup successful!');
                window.location.href = 'index.html'; // Redirect to login page after successful signup
            } else {
                // If there's an error (like existing email or invalid input)
                alert(result.error || 'Signup failed. Please try again.');
            }
        } catch (error) {
            // Handle network or unexpected errors
            alert('An error occurred: ' + error.message);
            console.error('Error:', error);
        }
    });
}



// Confirmation Page Process (for sending and verifying the confirmation code)
let sentCode = '';
let userEmail = ''; // Store the user's email during the confirmation process

// Send the confirmation code to the email
async function sendCode() {
    const email = sessionStorage.getItem('userEmail');
    if (!email) {
        alert("Please log in first.");
        window.location.href = "index.html"; // Redirect to login page if email is not found
        return;
    }

    userEmail = email; // Store the email for verification
    try {
        const response = await fetch('https://dlsudercproject.pythonanywhere.com/send-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email }),
        });

        const data = await response.json();
        if (data.message === 'Code sent successfully') {
            sentCode = data.confirmationCode;
            document.getElementById('code-section').style.display = 'block';
            document.getElementById('message').innerHTML = `A code has been sent to ${email}. Please check your inbox.`;
        } else {
            document.getElementById('message').innerHTML = 'Failed to send code. Please try again later.';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function verifyCode() {
    const email = sessionStorage.getItem('userEmail');
    const confirmationCode = document.getElementById('confirmation-code').value; // Get user input

    const expectedCode = sessionStorage.getItem('expectedConfirmationCode'); // Get expected code from sessionStorage

    if (confirmationCode !== expectedCode) {
        alert("Invalid confirmation code.");
        return;
    }

    try {
        const response = await fetch('https://dlsudercproject.pythonanywhere.com/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        if (data.message) {
            alert(data.message); // Show success message
            window.location.href = "index.html"; // Redirect to the dashboard
        } else {
            alert(data.error); // Show error message
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to verify code.');
    }
}



// Resend the confirmation code to the email
async function resendCode() {
    const email = sessionStorage.getItem('userEmail');
    if (!email) {
        alert("Please log in first.");
        window.location.href = "index.html"; // Redirect to login if no email found
        return;
    }

    try {
        const response = await fetch('https://dlsudercproject.pythonanywhere.com/send-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        if (data.message === 'Code sent successfully') {
            sessionStorage.setItem('expectedConfirmationCode', data.confirmationCode); // Store the code for comparison
            alert(`A new code has been sent to ${email}. Please check your inbox.`);
        } else {
            alert('Failed to send code. Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error sending code. Please try again later.');
    }
}


// Function to display messages (error or success)
function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = type === 'error' ? 'error-message' : 'success-message';
}


// Function to show the section based on the user account type
function showSectionBasedOnAccountType(accountType) {
    const studentSection = document.getElementById('student-section');
    const ethicsReviewerSection = document.getElementById('ethics-reviewer-section');
    const ercChairSection = document.getElementById('erc-chair-section');
    const ercSecretarySection = document.getElementById('erc-secretary-section');

    // Hide all sections initially
    studentSection.classList.add('hidden');
    ethicsReviewerSection.classList.add('hidden');
    ercChairSection.classList.add('hidden');
    ercSecretarySection.classList.add('hidden');

    // Show the section based on the account type
    switch (accountType) {
        case 'student':
            studentSection.classList.remove('hidden');
            break;
        case 'ethics-reviewer':
            ethicsReviewerSection.classList.remove('hidden');
            break;
        case 'erc-chair':
            ercChairSection.classList.remove('hidden');
            break;
        case 'erc-secretary':
            ercSecretarySection.classList.remove('hidden');
            break;
        default:
            alert('Account type not recognized.');
            break;
    }
}

// Function to handle password change form submission
async function changePassword(email) {
    const passwordChangeForm = document.getElementById('password-change-form');
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate new password
    if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match.');
        return;
    }

    try {
        // Send POST request to change password
        const response = await fetch('https://dlsudercproject.pythonanywhere.com/change_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                currentPassword: currentPassword,
                newPassword: newPassword,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Password updated successfully!');
        } else {
            alert(result.error || 'Error updating password.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the password.');
    }
}

// Initialization function for the Account Settings page
function initAccountSettingsPage() {
    const accountSettingsSection = document.getElementById('account-settings-section');
    const passwordChangeForm = document.getElementById('password-change-form');

    // Fetch user data from sessionStorage
    const userEmail = sessionStorage.getItem('userEmail');
    const userName = sessionStorage.getItem('userName');
    const accountType = sessionStorage.getItem('accountType');

    // Redirect to login page if user is not logged in
    if (!userEmail || !accountType) {
        alert('Please log in first.');
        window.location.href = 'index.html';
        return;
    }

    // Display user information
    document.getElementById('user-email').textContent = `${userEmail}`;
    document.getElementById('user-name').textContent = `${userName || 'N/A'}`;
    document.getElementById('account-type').textContent = `${accountType}`;

    // Handle password change form submission
    passwordChangeForm.addEventListener('submit', function (event) {
        event.preventDefault();
        changePassword(userEmail);
    });
}



function adjustForm() {
    const reviewType = document.getElementById('review-type').value;
    const experimentTypeSection = document.getElementById('experiment-type-section');
    const uploadSection = document.getElementById('upload-section');
    const experimentType = document.getElementById('experiment-type');

    // Reset form sections
    uploadSection.innerHTML = '';
    experimentTypeSection.style.display = 'none';

    // Handle 'exempted' review type
    if (reviewType === 'exempted') {
        uploadSection.innerHTML = `
            <label>Assessment Checklist: <input type="file" name="assessment-checklist"></label>
            <label>Research Proposal: <input type="file" name="research-proposal"></label>
        `;
    } else {
        // Show the experiment type dropdown for 'expedited' or 'fullboard'
        experimentTypeSection.style.display = 'block';

        // Update the upload section based on experiment type
        updateUploadSection();
    }
}

// Update upload requirements based on experiment type
function updateUploadSection() {
    const experimentType = document.getElementById('experiment-type').value;
    const uploadSection = document.getElementById('upload-section');

    // Reset upload section
    uploadSection.innerHTML = '';

    // Add upload fields based on experiment type
    if (experimentType === 'humans') {
        uploadSection.innerHTML = `
            <label>Assessment Checklist: <input type="file" name="assessment-checklist"></label>
            <label>Research Proposal: <input type="file" name="research-proposal"></label>
            <label>ICF English: <input type="file" name="icf-english"></label>
            <label>ICF Tagalog: <input type="file" name="icf-tagalog"></label>
            <label>ICAF: <input type="file" name="icaf"></label>
            <label>Protocol Assessment: <input type="file" name="protocol-assessment"></label>
            <label>Validated Questionnaire: <input type="file" name="validated-questionnaire"></label>
            <label>Image/Advertisement: <input type="file" name="image-advertisement"></label>
        `;
    } else if (experimentType === 'plants') {
        uploadSection.innerHTML = `
            <label>Assessment Checklist: <input type="file" name="assessment-checklist"></label>
            <label>Research Proposal: <input type="file" name="research-proposal"></label>
            <label>BSD Form: <input type="file" name="bsd-form"></label>
        `;
    }
}

// Event listeners to dynamically update the form
document.getElementById('review-type').addEventListener('change', adjustForm);
document.getElementById('experiment-type').addEventListener('change', updateUploadSection);


// Fetch and display protocols for the logged-in student
function fetchStudentProtocols() {
    const userEmail = 'user@example.com'; // Replace with the dynamically fetched user email

    fetch(`/get_student_protocols?email=${userEmail}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('student-protocols');
            tableBody.innerHTML = '';

            data.protocols.forEach(protocol => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${protocol.id}</td>
                    <td>${protocol.ResearchTitle}</td>
                    <td>${protocol.EthicsStatus}</td>
                    <td><button onclick="viewProtocol(${protocol.id})">View</button></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching protocols:', error));
}

/// Function to view a protocol's details
function viewProtocol(protocolId) {
    // Example: Redirect to a detailed protocol page
    window.location.href = `view_protocol.html?id=${protocolId}`;
}

// Function to navigate to the Create Protocol page
function createNewProtocol() {
    // Example: Redirect to the "Create Protocol" page
    window.location.href = 'createprotocol.html';
}
// Initialize the page on load
window.onload = fetchStudentProtocols;

