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


function createNewProtocol() {

    window.location.href = 'createprotocol.html';

}

function initializeViewProtocolPage() {
    fetchProtocolData().then(() => {
        toggleAssociatedFilesSection();
    }).catch((error) => {
        console.error('Error initializing page:', error);
    });
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

    if (document.getElementById('login-form')) {
        handleLoginForm()
    }

    // Check if we are on the signup page
    if (document.getElementById('signup-form')) {
        handleSignupForm();
    }

    if (window.location.pathname.endsWith('dashboard.html')) {
        initDashboardPage();
        sendReminderEmails();
        const accountType = sessionStorage.getItem('accountType');
        if (accountType == 'student'){
            fetchProtocols();
        }
        if (accountType == 'erc-secretary') {


        }

        if (accountType == 'ethics-reviewer') {
            fetchReviewerProtocols();
            sendReminderEmails();
        }
        if (accountType == 'erc-chair') {


        }
    }
    if (window.location.pathname.endsWith('createprotocol.html')) {
        fetchAcadYear();
    }
    

    if (window.location.pathname.includes('accountsettings.html')) {
        initAccountSettingsPage();
    }
    const accountType = sessionStorage.getItem('accountType');

    }


    if (window.location.pathname.endsWith('viewprotocol.html')) {
        const accountType = sessionStorage.getItem('accountType');

            fetchProtocolData();
            populateReviewers();
            handleReviewerCountChange();
            fetchReviewerStatus();


            // Set the current date and time for start date (readonly)
            const currentDate = new Date();
            const startDateInput = document.getElementById('start-date');
            startDateInput.value = currentDate.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:mm'
        
            // Set the end date input to be 24 hours after the start date
            const endDateInput = document.getElementById('end-date');
            const endDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
            endDateInput.value = endDate.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:mm'




            if (accountType == 'erc-secretary') {
                generateMoreDownloadIcafPafFilesTable()
                            // Add event listeners to buttons
                document.getElementById('not-eligible-button').addEventListener('click', () => {
                    updateEthicsStatus('Not Eligible');
                });

                document.getElementById('exempted-button').addEventListener('click', () => {
                    updateEthicsStatus('Exempted');
                });

                document.getElementById('eligible-button').addEventListener('click', () => {
                    updateEthicsStatus('Eligible');
                });
            }

            if (accountType == 'ethics-reviewer') {
                generateDownloadIcafFilesTable();

            }
            if (accountType == 'erc-chair') {

                

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
        sessionStorage.setItem('email', email);
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
async function forgotsendCode() {
    const email = document.getElementById('email').value;
    sessionStorage.setItem('forgotemail', email);  // Store email in sessionStorage
    if (!email) {
        alert("Input Email First");
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
            
            // Show the code section
            document.getElementById('code-section').style.display = 'block';
        } else {
            alert('Failed to send code. Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error sending code. Please try again later.');
    }
}

async function ForgotverifyCode() {
    const confirmationCode = document.getElementById('confirmation-code').value; // Get user input
    const expectedCode = sessionStorage.getItem('expectedConfirmationCode'); // Get expected code from sessionStorage

    if (confirmationCode !== expectedCode) {
        alert("Invalid confirmation code.");
        return;
    } else {
        // Hide the code-section and show the forgot-password-section
        document.getElementById('code-section').style.display = 'none';
        document.getElementById('forgot-password-section').style.display = 'block';
    }
}

async function ChangePass() {
    const email = sessionStorage.getItem('forgotemail');
    const newPassword = document.getElementById('password').value; // Get new password
    const confirmpassword = document.getElementById('c-password').value; // Get confirm password

    if (newPassword !== confirmpassword) {
        alert('New password and confirm password do not match.');
        return;
    }

    try {
        const response = await fetch('https://dlsudercproject.pythonanywhere.com/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                newPassword: newPassword,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            // If password update is successful
            alert('Password updated successfully!');
            window.location.href = 'index.html'; // Redirect to login page after success
        } else {
            // If there's an error
            alert(result.error || 'Password change failed. Please try again.');
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
        console.error('Error:', error);
    }
}

//==================================================================================================================================
// Function to show the section based on the user account type
function showSectionBasedOnAccountType(accountType) {
    const studentSection = document.getElementById('student-section');
    const ethicsReviewerSection = document.getElementById('ethics-reviewer-section');
    const ercChairSection = document.getElementById('erc-chair-section');
    const ercSecretarySection = document.getElementById('erc-secretary-section');
    const laymanSection = document.getElementById('layman-section');

    // Hide all sections initially
    studentSection.classList.add('hidden');
    ethicsReviewerSection.classList.add('hidden');
    ercChairSection.classList.add('hidden');
    ercSecretarySection.classList.add('hidden');
    laymanSection.classList.add('hidden');

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
        case 'layman':
            laymanSection.classList.remove('hidden');
            break;
        default:
            alert('Account type not recognized.');
            break;
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



// Ensure the form fields for protocol and files are handled correctly in this JavaScript

function adjustForm() {
    const reviewType = document.getElementById('review-type').value;
    const experimentTypeSection = document.getElementById('experiment-type-section');
    experimentTypeSection.style.display = 'none';

if (reviewType === 'expedited' || reviewType === 'fullboard') {
    experimentTypeSection.style.display = 'block';
    const experimentType = document.getElementById('experiment-type').value;
}
}

if (window.location.pathname.includes('signup.html')){
document.getElementById('review-type').addEventListener('change', adjustForm);
}

// ==========================================================================================================================


async function handleProtocolForm() {
    document.getElementById('protocol-form').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get the submit button and disable it
        const submitButton = document.querySelector('#protocol-form button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...'; // Update button text

        // Get form input values
        const researchTitle = document.querySelector('[name="research-title"]').value.trim();
        const proponent1 = document.querySelector('[name="proponent1"]').value.trim();
        const proponent2 = document.querySelector('[name="proponent2"]').value.trim();
        const proponent3 = document.querySelector('[name="proponent3"]').value.trim();
        const college = document.querySelector('[name="college"]').value.trim();
        const acadYear = document.querySelector('[name="acad-year"]').value; // Disabled input, will be set from the backend
        const category = document.querySelector('[name="category"]').value;

        // Get the email from sessionStorage
        const userEmail = sessionStorage.getItem('userEmail');

        // Validate input fields
        if (!researchTitle || !proponent1 || !college || !acadYear || !userEmail) {
            alert('Please fill in all required fields.');
            submitButton.disabled = false; // Re-enable the button
            submitButton.textContent = 'Submit'; // Reset button text
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('research-title', researchTitle);
        formData.append('proponent1', proponent1);
        formData.append('proponent2', proponent2);
        formData.append('proponent3', proponent3);
        formData.append('college', college);
        formData.append('acad-year', acadYear);
        formData.append('category', category);
        formData.append('user-email', userEmail);

        try {
            // Send POST request to protocol submission API
            const response = await fetch('https://dlsudercproject.pythonanywhere.com/submit-protocol-fields', {
                method: 'POST',
                body: formData
            });

            const result = await response.json(); // Parse the response

            if (response.ok) {
                // If submission is successful, store the protocol ID and move to file upload
                sessionStorage.setItem('protocol_id', result.protocol_id);
                alert('Protocol fields submitted successfully!');
            } else {
                // If there's an error (like validation issues)
                alert(result.error || 'Submission failed. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting protocol:', error);
            alert('An unexpected error occurred. Please try again later.');
        } finally {
            // Re-enable the button and reset text regardless of success or failure
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    });
}
// Fetch the Academic Year from the backend
async function fetchAcadYear() {
    try {
        const response = await fetch('https://dlsudercproject.pythonanywhere.com/get-acad-year');
        const result = await response.json();
        if (response.ok) {
            // Set the acad-year input field with the fetched academic year
            document.getElementById('acad-year').value = result.acad_year;
        } else {
            console.error('Failed to fetch academic year:', result.error);
        }
    } catch (error) {
        console.error('Error fetching academic year:', error);
    }
}



// ==========================================================================================================================================
async function fetchProtocols() {
    // Retrieve the email from sessionStorage
    const userEmail = sessionStorage.getItem('userEmail');

    if (!userEmail) {
        console.error('User email is not available in sessionStorage.');
        alert('User email is not available. Please log in again.');
        return;
    }

    const apiUrl = `https://dlsudercproject.pythonanywhere.com/get-protocols?email=${encodeURIComponent(userEmail)}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                displayProtocols(data.protocols);

            } else {
                console.error(data.message);
                alert(data.message || 'Failed to fetch protocols.');
            }
        } else {
            console.error('Failed to fetch protocols');
        }
    } catch (error) {
        console.error('Error fetching protocols:', error);
    }
}

function displayProtocols(protocols) {
    const tableBody = document.querySelector('#protocols-table tbody');
    tableBody.innerHTML = ''; // Clear any existing rows

    protocols.forEach(protocol => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${protocol.ResearchTitle}</td>
            <td>${protocol.College || 'N/A'}</td>
            <td>${protocol.ReviewType || 'N/A'}</td>
            <td>${protocol.Category || 'N/A'}</td>
            <td>${protocol.EthicsStatus || 'No Ethics Status Yet'}</td>
            <td><button class="view-btn" data-protoid="${protocol.Protoid}">View</button></td>
        `;

        // Add event listener to the "View" button
        const viewButton = row.querySelector('.view-btn');
        viewButton.addEventListener('click', function () {
            // Store the Protoid in sessionStorage
            sessionStorage.setItem('protoid', protocol.Protoid);
            console.log(`Redirecting to protocol: ${protocol.Protoid}`); // Debug log
            // Redirect to viewprotocol.html
            window.location.href = 'viewprotocol.html';
        });

        tableBody.appendChild(row);
    });
}

// =====================================================================================================================



async function fetchProtocolData() {
    const protoid = sessionStorage.getItem('protoid');
    if (!protoid) {
        console.error('Protoid is not available in sessionStorage.');
        alert('Protoid not found. Please go back to the dashboard and try again.');
        return;
    }

    try {
        const apiUrl = `https://dlsudercproject.pythonanywhere.com/get-protocol-details?protoid=${protoid}`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                displayProtocolData(data.protocol);
                generateFileTable();
                generateDownloadFilesTable()
                generateUpdateFilesTable()
                

            } else {
                console.error(data.message);
            }
        } else {
            console.error('Failed to fetch protocol details');
        }
    } catch (error) {
        console.error('Error fetching protocol data:', error);
    }
}

function displayProtocolData(protocol) {
    document.getElementById('researchTitle').textContent = protocol.ResearchTitle;
    document.getElementById('email').textContent = protocol.Email;
    document.getElementById('college').textContent = protocol.College;
    document.getElementById('category').textContent = protocol.Category;
    document.getElementById('reviewType').textContent = protocol.ReviewType || 'Not Decided';
    document.getElementById('proponent1').textContent = protocol.Proponent1;
    document.getElementById('proponent2').textContent = protocol.Proponent2 || 'N/A';
    document.getElementById('proponent3').textContent = protocol.Proponent3 || 'N/A';
    document.getElementById('acadYear').textContent = protocol.AcadYear || 'N/A';
    document.getElementById('ethicsStatus').textContent = protocol.EthicsStatus || 'Pending';
    sessionStorage.setItem('ethicsStatus', protocol.EthicsStatus);
    sessionStorage.setItem('reviewType', protocol.ReviewType);
    sessionStorage.setItem('category', protocol.Category);
}
//=========================================================================================================

// Function to generate file table based on EthicsStatus and radio button selection
function generateFileTable() {
    const ethicsStatus = sessionStorage.getItem('ethicsStatus'); // Get EthicsStatus
    const addLinkSite = document.querySelector('input[name="add-link-site"]:checked').value === 'yes'; // Check if 'yes' is selected

    const filesList = document.getElementById('files-list');
    filesList.innerHTML = ''; // Clear previous rows

    // Define file categories based on EthicsStatus
    const fileCategories = {
        Pending: [
            'Accomplished checklist form',
            'Informed Consent Assessment Form (ICAF)',
            'Protocol Assessment Form',
            'Informed Consent (English Version)',
            'Informed Consent (Filipino Version)',
            'Revised Research Proposal',
            'Validated Questionnaire',
            'Advertisement of Recruitment process',
        ],
        Checking: ['Official Receipt']
    };

    let selectedCategories = fileCategories[ethicsStatus] || [];

    // Add "Link/Site of Data Sources (if data mining)" if radio button is 'yes' and EthicsStatus is 'Pending'
    if (ethicsStatus === 'Pending' && addLinkSite) {
        selectedCategories.push('Link/Site of Data Sources (if data mining)');
    }

    // Generate rows in the file table for each category
    selectedCategories.forEach((category, index) => {
        const row = document.createElement('tr');
        
        // File Type column
        const fileTypeCell = document.createElement('td');
        fileTypeCell.textContent = category;
        row.appendChild(fileTypeCell);

        // Upload File column
        const fileUploadCell = document.createElement('td');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = `files[${index}]`;
        fileInput.dataset.category = category; // Save category in a data attribute
        fileUploadCell.appendChild(fileInput);
        row.appendChild(fileUploadCell);

        filesList.appendChild(row);
    });
}

// Listen for changes to the radio buttons and regenerate the file table
document.querySelectorAll('input[name="add-link-site"]').forEach(radio => {
    radio.addEventListener('change', generateFileTable);
});


async function submitFiles() {
    const uploadButton = document.getElementById('uploadButton');
    if (uploadButton.disabled) return; // Prevent multiple clicks
    uploadButton.disabled = true;

    const formData = new FormData();
    const protoid = sessionStorage.getItem('protoid');
    if (!protoid) {
        alert("Protoid is missing.");
        uploadButton.disabled = false;
        return;
    }
    formData.append('protoid', protoid);

    // Get the selected value for the data mining radio buttons
    const addLinkSite = document.querySelector('input[name="add-link-site"]:checked')?.value;
    formData.append('add-link-site', addLinkSite);

    const files = document.querySelectorAll('input[type="file"]');
    files.forEach(fileInput => {
        if (fileInput.files.length > 0) {
            const category = fileInput.dataset.category;
            formData.append('files[]', fileInput.files[0]);
            formData.append('file_types[]', category); // Append file category
        }
    });

    try {
        const response = await fetch('https://dlsudercproject.pythonanywhere.com/upload-files', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert('Files uploaded successfully!');
            window.location.href = 'dashboard.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        alert('An error occurred while uploading files.');
    } finally {
        uploadButton.disabled = false;
    }
}

//=================================================================================================================================

// Function to fetch and populate the download files table
async function generateDownloadFilesTable() {
    const protoid = sessionStorage.getItem('protoid'); // Get Protoid from sessionStorage
    const downloadFilesList = document.getElementById('download-files-list');
    downloadFilesList.innerHTML = ''; // Clear existing rows

    if (!protoid) {
        alert('Protoid is missing.');
        return;
    }

    try {
        // Fetch data from the backend
        const response = await fetch(`https://dlsudercproject.pythonanywhere.com/get-files/${protoid}`);
        const result = await response.json();

        if (result.status !== 'success') {
            alert(result.message || 'Error fetching files.');
            return;
        }

        const files = result.data; // Assuming result.data contains the array of files

        // Check if files are returned
        if (files.length === 0) {
            const noFilesRow = document.createElement('tr');
            const noFilesCell = document.createElement('td');
            noFilesCell.colSpan = 2;
            noFilesCell.textContent = 'No files available for download.';
            noFilesRow.appendChild(noFilesCell);
            downloadFilesList.appendChild(noFilesRow);
            return;
        }

        // Populate the table with the file data
        files.forEach(file => {
            const row = document.createElement('tr');

            // File Type column
            const fileTypeCell = document.createElement('td');
            fileTypeCell.textContent = file.FileCategory; // Use FileCategory
            row.appendChild(fileTypeCell);

            // Download button column
            const downloadCell = document.createElement('td');
            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Download';
            downloadButton.onclick = () => {
                window.location.href = `https://dlsudercproject.pythonanywhere.com/download-file/${file.FileID}`;
            };
            downloadCell.appendChild(downloadButton);
            row.appendChild(downloadCell);

            downloadFilesList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching download files:', error);
        alert('An error occurred while fetching download files.');
    }
}


//====================================================================================================================
//Update
async function generateUpdateFilesTable() {
    const protoid = sessionStorage.getItem('protoid'); // Get Protoid from sessionStorage
    const updateFilesList = document.getElementById('update-files-list');
    updateFilesList.innerHTML = ''; // Clear existing rows

    if (!protoid) {
        alert('Protoid is missing.');
        return;
    }

    try {
        // Fetch data from the backend
        const response = await fetch(`https://dlsudercproject.pythonanywhere.com/get-files/${protoid}`);
        const result = await response.json();

        if (result.status !== 'success') {
            alert(result.message || 'Error fetching files.');
            return;
        }

        const files = result.data; // Assuming result.data contains the array of files

        files.forEach(file => {
            const row = document.createElement('tr');

            // File Type column
            const fileTypeCell = document.createElement('td');
            fileTypeCell.textContent = file.FileCategory; // Use FileCategory
            row.appendChild(fileTypeCell);

            // Upload column
            const uploadCell = document.createElement('td');
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = `file-upload-${file.FileID}`;
            uploadCell.appendChild(fileInput);
            row.appendChild(uploadCell);

            // Update button column
            const updateCell = document.createElement('td');
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update File';
            updateButton.onclick = async () => {
                const fileElement = document.getElementById(`file-upload-${file.FileID}`);
                const selectedFile = fileElement.files[0];
                if (!selectedFile) {
                    alert('Please select a file to update.');
                    return;
                }

                const formData = new FormData();
                formData.append('file', selectedFile);

                try {
                    const updateResponse = await fetch(`https://dlsudercproject.pythonanywhere.com/update-file/${file.FileID}`, {
                        method: 'POST',
                        body: formData
                    });

                    const updateResult = await updateResponse.json();

                    if (updateResponse.ok) {
                        alert(updateResult.message || 'File updated successfully.');
                        generateUpdateFilesTable(); // Refresh the table to reflect changes
                    } else {
                        alert(updateResult.message || 'Error updating the file.');
                    }
                } catch (error) {
                    console.error('Error updating file:', error);
                    alert('An error occurred while updating the file.');
                }
            };
            updateCell.appendChild(updateButton);
            row.appendChild(updateCell);

            updateFilesList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching update files:', error);
        alert('An error occurred while fetching files.');
    }
}



//===================================================================================================================
// Call the function to populate the table when the page loads

// Global variable to store the selected reviewers
let selectedReviewers = {
    primary: '',
    reviewer2: '',
    reviewer3: ''
};

// Populate reviewers dynamically
function populateReviewers() {
    const reviewerSelects = document.querySelectorAll('#primary-reviewer, #reviewer-2, #reviewer-3, #fprimary-reviewer, #freviewer-2, #freviewer-3'); // Get all reviewer select elements

    // Fetch reviewer data from backend
    fetch('https://dlsudercproject.pythonanywhere.com/get-reviewers')
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                alert('Error fetching reviewers');
                return;
            }

            const reviewers = data.reviewers; // Assuming data.reviewers is an array of reviewer objects with 'name' and 'email'

            reviewerSelects.forEach(select => {
                // Clear the select options before adding new ones
                select.innerHTML = '';

                // Add a placeholder option
                const placeholderOption = document.createElement('option');
                placeholderOption.value = '';
                placeholderOption.textContent = 'Select Reviewer';
                select.appendChild(placeholderOption);

                reviewers.forEach(reviewer => {
                    const option = document.createElement('option');
                    option.value = reviewer.email; // Use email as the value for easier identification
                    option.textContent = reviewer.name; // Display name of the reviewer
                    select.appendChild(option);
                });

                // Get the corresponding email <p> element for this select dropdown
                const emailDisplay = document.getElementById(select.id + '-email');

                // Add change event listener to update email and hide selected reviewer options
                select.addEventListener('change', function () {
                    const selectedEmail = select.value;
                    emailDisplay.textContent = ''; // Reset email display

                    // Update all select options to hide selected reviewers
                    updateReviewerOptions(reviewerSelects);
                    
                    // Show the email of the selected reviewer in the corresponding <p> tag
                    const selectedReviewer = reviewers.find(r => r.email === selectedEmail);
                    if (selectedReviewer) {
                        emailDisplay.textContent = `Email: ${selectedReviewer.email}`;
                    }
                });
            });

            // Initial check to hide already selected reviewers when the page loads
            updateReviewerOptions(reviewerSelects);
        })
        .catch(error => {
            console.error('Error fetching reviewers:', error);
            alert('An error occurred while fetching reviewers.');
        });
}
// Update reviewer options to hide already selected reviewers
function updateReviewerOptions(selects) {
    selects.forEach(select => {
        // Only apply the update to reviewer selects (skip 'review-selection')
        if (
            select.id.startsWith("reviewer") || 
            select.id.startsWith("freviewer") || 
            select.id === "primary-reviewer" || 
            select.id === "fprimary-reviewer"
        ) {
            Array.from(select.options).forEach(option => {
                // Reset options visibility for all selects
                option.disabled = false; // Enable all options
                option.style.display = ''; // Make all options visible again
            });

            // Hide options that are already selected in other selects
            selects.forEach(otherSelect => {
                if (otherSelect !== select && otherSelect.value) {
                    const selectedValue = otherSelect.value;
                    const option = select.querySelector(`option[value="${selectedValue}"]`);
                    if (option) {
                        option.disabled = true;
                        option.style.display = 'none';
                    }
                }
            });
        }
    });
}


// Handle the number of reviewers input field
function handleReviewerCountChange() {
    const reviewerCountInput = document.getElementById('reviewer-count');
    const reviewer2Select = document.getElementById('reviewer-2');
    const reviewer3Select = document.getElementById('reviewer-3');

    reviewerCountInput.addEventListener('input', function () {
        const count = parseInt(reviewerCountInput.value);

        // Enable or disable reviewer select boxes based on the count value
        reviewer2Select.disabled = count < 2;
        reviewer3Select.disabled = count < 3;
    });

    // Initial state
    const initialCount = parseInt(reviewerCountInput.value);
    reviewer2Select.disabled = initialCount < 2;
    reviewer3Select.disabled = initialCount < 3;
}

function assignProtocol() {
    const protoid = sessionStorage.getItem('protoid'); // Retrieve Protoid from sessionStorage
    if (!protoid) {
        alert('Protoid is missing. Please reload the page.');
        return;
    }

    // Get protocol details
    const reviewType = sessionStorage.getItem('reviewType'); // Expedited or other
    const category = sessionStorage.getItem('category'); // Undergraduate or Graduate
    const reviewerCount = parseInt(document.getElementById('reviewer-count').value); // Number of reviewers
    const startDate = document.getElementById('start-date').value; // Start date
    const endDate = document.getElementById('end-date').value; // End date

    if (!endDate) {
        alert('Please provide an end date.');
        return;
    }

    // Get selected reviewer emails
    const primaryReviewerEmail = document.getElementById('primary-reviewer').value;
    const reviewer2Email = document.getElementById('reviewer-2').value;
    const reviewer3Email = document.getElementById('reviewer-3').value;

    // Validation: Ensure all required reviewers are selected
    if (!primaryReviewerEmail) {
        alert('Please select a primary reviewer.');
        return;
    }
    if (reviewerCount >= 2 && !reviewer2Email) {
        alert('Please select Reviewer 2.');
        return;
    }
    if (reviewerCount === 3 && !reviewer3Email) {
        alert('Please select Reviewer 3.');
        return;
    }

    // Payment calculation
    let paymentDistribution = [];
    if (reviewType === 'Expedited') {
        if (category === 'undergraduate') {
            paymentDistribution = [300, 100, 100];
        } else if (category === 'graduate') {
            if (reviewerCount === 1) paymentDistribution = [750];
            else if (reviewerCount === 2) paymentDistribution = [750, 500];
            else paymentDistribution = [750, 500, 500];
        }
    } else {
        alert('Currently, only Expedited review types are supported.');
        return;
    }

    // Prepare payload
    const payload = {
        protoid: protoid,
        startDate: startDate,
        endDate: endDate,
        reviewers: [
            { email: primaryReviewerEmail, isPrimary: true, paidAmount: paymentDistribution[0], startDate: startDate, endDate: endDate },
            ...(reviewerCount >= 2 ? [{ email: reviewer2Email, isPrimary: false, paidAmount: paymentDistribution[1], startDate: startDate, endDate: endDate }] : []),
            ...(reviewerCount === 3 ? [{ email: reviewer3Email, isPrimary: false, paidAmount: paymentDistribution[2], startDate: startDate, endDate: endDate }] : []),
        ],
    };

    // Send to backend
    fetch('https://dlsudercproject.pythonanywhere.com/assign-protocol-reviewers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Reviewers assigned successfully!');
                reviewEthicsStatus();
            } else {
                alert('Error assigning reviewers: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while assigning reviewers.');
        });
}


// Set current date and time as the default start date
document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('start-date');
    const now = new Date().toISOString().slice(0, -1); // Format as yyyy-MM-ddTHH:mm
    startDateInput.value = now;

    handleReviewerCountChange(); // Initialize reviewer count handling
    populateReviewers(); // Populate reviewer dropdowns
});


//==================================================================================================================

// Function to fetch reminder status and trigger email sending
function sendReminderEmails() {
    // Prepare the data to send, if any is required (empty here for simplicity)
    const data = {};

    // Fetch request to the backend API to check and send reminders
    fetch('https://dlsudercproject.pythonanywhere.com/check-reminders', {  // Updated URL
        method: 'POST', // Using POST method
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Convert data object to JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);  // Notify the admin if reminders are sent or no action needed
        } else if (data.error) {
            alert("Error: " + data.error);  // Handle any errors
        }
    })
    .catch(error => {
        console.error("There was an error:", error);
        alert("Failed to send reminders. Please try again.");
    });
}


//==================================================================================================================


    // Function to send update request
    function updateEthicsStatus(newStatus) {
        const protoid = sessionStorage.getItem('protoid');
        fetch('https://dlsudercproject.pythonanywhere.com/update_ethics_status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Protoid: protoid,
                EthicsStatus: newStatus,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    alert(data.message);
                } else {
                    alert('Error updating EthicsStatus: ' + data.error);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Failed to update EthicsStatus.');
            });
    }

//===============================================================================================================

document.getElementById("Review-button").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent form submission or button default behavior

    // Get the selected review type from the dropdown
    const reviewType = document.getElementById("review-selection").value;

    // Check if the review type is selected
    if (!reviewType) {
        alert("Please select a review type.");
        return;
    }

    // Fetch the Protoid (Assuming you have the Protoid in session or somewhere in the form)
    const protoid = sessionStorage.getItem('protoid'); // Replace with your method to get Protoid

    // Send the update request to the backend
    fetch('https://dlsudercproject.pythonanywhere.com/update-review-type', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            protoid: protoid,        // Protoid of the protocol to update
            reviewType: reviewType   // Selected review type
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("Review type updated successfully!");
        } else {
            alert("Error updating review type.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while updating the review type.");
    });
});


//==============================================================================================================

function fetchReviewerStatus() {
    const protoid = sessionStorage.getItem('protoid'); // Get Protoid from sessionStorage
    if (!protoid) {
        alert('Protoid is missing. Please reload the page.');
        return;
    }

    // Fetch reviewer status data
    fetch(`https://dlsudercproject.pythonanywhere.com/get-reviewer-status/${protoid}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                populateReviewerStatusTable(data.data);
            } else {
                alert('Error fetching reviewer status: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching reviewer status.');
        });
}

// Function to populate the reviewer status table
function populateReviewerStatusTable(reviewers) {
    const tableBody = document.getElementById('reviewer-status-list');
    tableBody.innerHTML = ''; // Clear existing content

    reviewers.forEach(reviewer => {
        const row = document.createElement('tr');

        // Create table cells
        const nameCell = document.createElement('td');
        nameCell.textContent = reviewer.ReviewerName;

        const emailCell = document.createElement('td');
        emailCell.textContent = reviewer.ReviewerEmail;

        const statusCell = document.createElement('td');
        statusCell.textContent = reviewer.ReviewStatus || 'Pending'; // Default to 'Pending' if status is null

        // Append cells to row
        row.appendChild(nameCell);
        row.appendChild(emailCell);
        row.appendChild(statusCell);

        // Append row to table body
        tableBody.appendChild(row);
    });
}

//================================================================================================================
async function fetchsecretaryProtocols() {

    const apiUrl = `https://dlsudercproject.pythonanywhere.com/fetch-secretary-protocols`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                displaySecProtocols(data.protocols);
            } else {
                console.error(data.message);
            }
        } else {
            console.error('Failed to fetch protocols');
        }
    } catch (error) {
        console.error('Error fetching protocols:', error);
    }
}

async function fetchchairProtocols() {
    const apiUrl = `https://dlsudercproject.pythonanywhere.com/fetch-chair-protocols`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                displayChairProtocols(data.protocols);
            } else {
                console.error(data.message);
            }
        } else {
            console.error('Failed to fetch protocols');
        }
    } catch (error) {
        console.error('Error fetching protocols:', error);
    }
}

async function fetchReviewerProtocols() {
    const reviewerEmail = sessionStorage.getItem('userEmail');
    if (!reviewerEmail) {
        console.error('User email is not available in sessionStorage.');
        return;
    }

    const apiUrl = `https://dlsudercproject.pythonanywhere.com/fetch-reviewer-protocol?reviewer_email=${reviewerEmail}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                displayEthicsProtocols(data.protocols);
            } else {
                console.error(data.message);
            }
        } else {
            console.error(`Failed to fetch protocols: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching protocols:', error);
    }
}



function displayChairProtocols(protocols) {
    const tableBody = document.querySelector('#chair-protocols-table tbody');
    tableBody.innerHTML = '';  // Clear any existing rows

    protocols.forEach(protocol => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${protocol.Protoid}</td>
            <td>${protocol.ResearchTitle}</td>
            <td>${protocol.EthicsStatus}</td>
            <td><button class="view-btn" data-protoid="${protocol.Protoid}">View</button></td>
        `;

        // Add event listener to the "View" button
        const viewButton = row.querySelector('.view-btn');
        viewButton.addEventListener('click', function() {
            // Store the Protoid in sessionStorage
            sessionStorage.setItem('protoid', protocol.Protoid);
            console.log(protocol.Protoid); // Corrected log statement
            // Redirect to viewprotocol.html
            window.location.href = 'viewprotocol.html';
        });

        tableBody.appendChild(row);
    });
}

function displaySecProtocols(protocols) {
    const tableBody = document.querySelector('#sec-protocols-table tbody');
    tableBody.innerHTML = '';  // Clear any existing rows

    protocols.forEach(protocol => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${protocol.Protoid}</td>
            <td>${protocol.ResearchTitle}</td>
            <td>${protocol.EthicsStatus}</td>
            <td><button class="view-btn" data-protoid="${protocol.Protoid}">View</button></td>
        `;

        // Add event listener to the "View" button
        const viewButton = row.querySelector('.view-btn');
        viewButton.addEventListener('click', function() {
            // Store the Protoid in sessionStorage
            sessionStorage.setItem('protoid', protocol.Protoid);
            console.log(protocol.Protoid); // Corrected log statement
            // Redirect to viewprotocol.html
            window.location.href = 'viewprotocol.html';
        });

        tableBody.appendChild(row);
    });
}

function displayEthicsProtocols(protocols) {
    const tableBody = document.querySelector('#ethics-protocols-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    protocols.forEach(protocol => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${protocol.Protoid}</td>
            <td>${protocol.ResearchTitle}</td>
            <td>${protocol.College || 'N/A'}</td>
            <td>${protocol.ReviewType || 'N/A'}</td>
            <td>${protocol.Category || 'N/A'}</td>
            <td>${protocol.ReviewerStatus}</td>
            <td><button class="view-btn" data-protoid="${protocol.Protoid}">View</button></td>
        `;

        const viewButton = row.querySelector('.view-btn');
        viewButton.addEventListener('click', function () {
            sessionStorage.setItem('protoid', protocol.Protoid);
            console.log(`Stored Protoid: ${protocol.Protoid}`);
            window.location.href = 'viewprotocol.html';
        });

        tableBody.appendChild(row);
    });
}

//============================================================================================================

async function submiticafFiles() {
    // Get the protoid and user email from sessionStorage
    const protoid = sessionStorage.getItem('protoid');
    const userEmail = sessionStorage.getItem('userEmail');

    // Debugging: Log the values
    console.log('Protoid:', protoid);
    console.log('User Email:', userEmail);

    // Check for protoid and userEmail
    if (!protoid || !userEmail) {
        alert("Protoid or user email is missing.");
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('protoid', protoid);
    formData.append('userEmail', userEmail);

    // Get file inputs
    const icafInput = document.getElementById('icaffile');
    const pafInput = document.getElementById('paffile');

    // Debugging: Ensure file input elements are present
    console.log('ICAF Input Element:', icafInput);
    console.log('PAF Input Element:', pafInput);

    if (!icafInput || !pafInput) {
        alert("File input elements are missing.");
        return;
    }

    // Validate file uploads
    if (!icafInput.files.length || !pafInput.files.length) {
        alert("Please upload both ICAF and PAF files.");
        return;
    }

    // Debugging: Log the selected files
    console.log('ICAF File:', icafInput.files[0]);
    console.log('PAF File:', pafInput.files[0]);

    // Append files to FormData
    formData.append('icaf', icafInput.files[0]);
    formData.append('paf', pafInput.files[0]);

    const uploadButton = document.getElementById('uploadButton');
    if (uploadButton) {
        uploadButton.disabled = true;
        uploadButton.textContent = 'Uploading...';
    }

    try {
        // Send files to the backend
        const response = await fetch('https://dlsudercproject.pythonanywhere.com/icaf-upload-files', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert('Files uploaded successfully!');
            // Redirect to the dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        alert('An error occurred while uploading files.');
    } finally {
        if (uploadButton) {
            uploadButton.disabled = false;
            uploadButton.textContent = 'Submit Files';
        }
    }
}

//==============================================================================================================

async function generateDownloadIcafFilesTable() {
    const protoid = sessionStorage.getItem('protoid'); // Get Protoid from sessionStorage
    const userEmail = sessionStorage.getItem('userEmail'); // Get User Email from sessionStorage
    const downloadFilesList = document.getElementById('icaf-paf-download-list');
    downloadFilesList.innerHTML = ''; // Clear existing rows

    if (!protoid || !userEmail) {
        alert('Protoid or User Email is missing.');
        return;
    }

    try {
        // Fetch data from the backend for filenames
        const response = await fetch(`https://dlsudercproject.pythonanywhere.com/get-icaf-paf-files?protoid=${protoid}&userEmail=${userEmail}`);
        const result = await response.json();

        if (result.status !== 'success') {
            alert(result.message || 'Error fetching files.');
            return;
        }

        const files = result.files; // Assuming result.files contains the array of files

        // Loop through the files and display them in separate rows
        files.forEach(file => {
            const icafRow = document.createElement('tr');

            // ICAF File Type column
            const icafFileTypeCell = document.createElement('td');
            icafFileTypeCell.textContent = file.icaf_filename; // Use ICAF file name
            icafRow.appendChild(icafFileTypeCell);

            // ICAF Download button column
            const icafDownloadCell = document.createElement('td');
            const icafDownloadButton = document.createElement('button');
            icafDownloadButton.textContent = 'Download';
            icafDownloadButton.onclick = () => {
                // Trigger download for ICAF file by calling the backend route
                window.location.href = `https://dlsudercproject.pythonanywhere.com/get-icaf-file?protoid=${protoid}&userEmail=${userEmail}`;
            };
            icafDownloadCell.appendChild(icafDownloadButton);
            icafRow.appendChild(icafDownloadCell);

            downloadFilesList.appendChild(icafRow);

            const pafRow = document.createElement('tr');

            // PAF File Type column
            const pafFileTypeCell = document.createElement('td');
            pafFileTypeCell.textContent = file.paf_filename; // Use PAF file name
            pafRow.appendChild(pafFileTypeCell);

            // PAF Download button column
            const pafDownloadCell = document.createElement('td');
            const pafDownloadButton = document.createElement('button');
            pafDownloadButton.textContent = 'Download';
            pafDownloadButton.onclick = () => {
                // Trigger download for PAF file by calling the backend route
                window.location.href = `https://dlsudercproject.pythonanywhere.com/get-paf-file?protoid=${protoid}&userEmail=${userEmail}`;
            };
            pafDownloadCell.appendChild(pafDownloadButton);
            pafRow.appendChild(pafDownloadCell);

            downloadFilesList.appendChild(pafRow);
        });
    } catch (error) {
        console.error('Error fetching download files:', error);
        alert('An error occurred while fetching download files.');
    }
}

//==============================================================================================================


function sendEmail() {
    const recipientEmail = document.getElementById('email').textContent.trim();
    const subject = document.getElementById('email-subject').value;
    const body = document.getElementById('email-body').value;


    if (!recipientEmail || !subject || !body) {
        alert("All fields are required!");
        return;
    }

    fetch('https://dlsudercproject.pythonanywhere.com/to-send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            recipient_email: recipientEmail,
            subject: subject,
            body: body,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("Email sent successfully!");
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to send email. Please try again later.");
        });
}







function deleteProtocol() {
    const protoid = sessionStorage.getItem('protoid'); // Assume Protoid is stored in sessionStorage

    if (!protoid) {
        alert('No protocol ID found.');
        return;
    }

    const confirmDelete = confirm('Are you sure you want to delete this protocol? This action cannot be undone.');
    if (!confirmDelete) return;

    fetch('https://dlsudercproject.pythonanywhere.com/delete_protocol', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ protoid })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                // Redirect to another page or update the UI
                window.location.href = 'dashboard.html';
            } else if (data.error) {
                alert(`Error: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the protocol.');
        });
}



