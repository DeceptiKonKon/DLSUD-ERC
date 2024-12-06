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

/// Function to view a protocol's details
function viewProtocol(protocolId) {
    // Example: Redirect to a detailed protocol page
    window.location.href = `viewprotocol.html?id=${protocolId}`;
}

// Function to navigate to the Create Protocol page
function createNewProtocol() {
    // Example: Redirect to the "Create Protocol" page
    window.location.href = 'createprotocol.html';
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
    const accountType = sessionStorage.getItem('accountType');
    
        if (window.location.pathname.endsWith('dashboard.html')) {
            if (accountType === 'student') {
            initDashboardPage();
            fetchProtocols()
            }
            if (accountType == 'erc-secretary') {
                initDashboardPage();
                fetchsecretaryProtocols()

            }
            if (accountType == 'erc-chair') {
                initDashboardPage();
                fetchchairProtocols()
                document.getElementById('postMessageBtn').addEventListener('click', function() {
                    const message = document.getElementById('message').value;
                    if (message) {
                        postMessage(protoid, message);
                    }
                });
                
            }
            if (accountType == 'ethics-reviewer') {
                initDashboardPage();
                fetchReviewerProtocols()

            }
    }
    }
    if (window.location.pathname.endsWith('viewprotocol.html')) {

            initializeViewProtocolPage()
            populateReviewers()
            handleReviewerCountChange()


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
async function handleProtocolForm() {
    document.getElementById('protocol-form').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get form input values
        const researchTitle = document.querySelector('[name="research-title"]').value.trim();
        const proponent1 = document.querySelector('[name="proponent1"]').value.trim();
        const proponent2 = document.querySelector('[name="proponent2"]').value.trim();
        const proponent3 = document.querySelector('[name="proponent3"]').value.trim();
        const college = document.querySelector('[name="college"]').value.trim();
        const acadYear = document.querySelector('[name="acad-year"]').value;
        const reviewType = document.getElementById('review-type').value;
        const category = document.getElementById('category').value;
        const experimentType = document.getElementById('experiment-type')?.value || null;


        // Get the email from sessionStorage
        const userEmail = sessionStorage.getItem('userEmail');

        // Validate input fields
        if (!researchTitle || !proponent1 || !college || !acadYear || reviewType === 'none' || !userEmail) {
            alert('Please fill in all required fields.');
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
        formData.append('review-type', reviewType);
        formData.append('category', category);
        formData.append('user-email', userEmail); // Add email to form data
        if (experimentType) formData.append('experiment-type', experimentType);

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

                // Now call the file upload function (or redirect to another page if preferred)
                handleFileUpload(result.protocol_id);
            } else {
                // If there's an error (like validation issues)
                alert(result.error || 'Submission failed. Please try again.');
            }
        } catch (error) {
            // Handle network or unexpected errors
            window.location.href = 'dashboard.html';
        }
    });
}


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

                generateFileTable(data.protocol.ExperimentType, data.protocol.ReviewType);
                generateDownloadFilesTable();
                generateUpdateFilesTable();

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
    document.getElementById('reviewType').textContent = protocol.ReviewType;
    document.getElementById('proponent1').textContent = protocol.Proponent1;
    document.getElementById('proponent2').textContent = protocol.Proponent2 || 'N/A';
    document.getElementById('proponent3').textContent = protocol.Proponent3 || 'N/A';
    document.getElementById('acadYear').textContent = protocol.AcadYear;
    document.getElementById('experimentType').textContent = protocol.ExperimentType || 'Not specified';
    document.getElementById('ethicsStatus').textContent = protocol.EthicsStatus;
    sessionStorage.setItem('reviewType', protocol.ReviewType);
    sessionStorage.setItem('category', protocol.Category);


}



// Function to generate file table based on Experiment Type and Review Type
function generateFileTable(experimentType, reviewType) {
    const fileTypes = getFileTypes(experimentType, reviewType); // Get file types for the selected experiment type and review type
    const filesList = document.getElementById('files-list');
    filesList.innerHTML = '';  // Clear previous rows

    // Generate the file inputs based on file types
    fileTypes.forEach((fileType, index) => {
        const row = document.createElement('tr');
        
        // File Type column
        const fileTypeCell = document.createElement('td');
        fileTypeCell.textContent = fileType;
        row.appendChild(fileTypeCell);

        // Upload File column
        const fileUploadCell = document.createElement('td');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = `files[${index}]`; 
        fileUploadCell.appendChild(fileInput);
        row.appendChild(fileUploadCell);



        filesList.appendChild(row);
    });
}

// Function to get the list of file types based on the experiment type and review type
function getFileTypes(experimentType, reviewType) {
    let fileTypes = [];

    // Exempted experiment (2 files)
    if (reviewType === 'exempted' && (experimentType === 'humans' || experimentType === 'plants')) {
        fileTypes = ['Accomplished checklist form', 'Revised Research Proposal'];
    }

    // Expedited/Fullboard with Humans (10 files)
    else if (experimentType === 'humans' && (reviewType === 'expedited' || reviewType === 'fullboard')) {
        fileTypes = [
            'Accomplished checklist form', 
            'Informed Consent Assessment Form (ICAF)', 
            'Protocol Assessment Form', 
            'Informed Consent (English Version)', 
            'Informed Consent (Filipino Version)', 
            'Revised Research Proposal', 
            'Validated Questionnaire', 
            'Advertisement of Recruitment process', 
            'Link/Site of Data Sources (if data mining)', 
            'Official Receipt'
        ];
    }

    // Expedited/Fullboard with Animals/Plants (2 files)
    else if (experimentType === 'plants') {
        fileTypes = ['Accomplished checklist form', 'Revised Research Proposal', 'BSD Form'];
    }

    return fileTypes;
}

// Function to submit files
async function submitFiles() {

    const formData = new FormData();
    const protoid = sessionStorage.getItem('protoid');
    const files = document.querySelectorAll('input[type="file"]');
    const fileTypes = document.querySelectorAll('input[type="file"]');


    if (!protoid) {
        alert("Protoid is missing.");
        return;
    }

    // Add Protoid to form data
    formData.append('protoid', protoid);

    // Check if file types and files match
    console.log('Number of files:', files.length);
    console.log('Number of file types:', fileTypes.length);
    
    if (files.length !== fileTypes.length) {
        console.error('Mismatch between files and file types.');
        console.log('Files:', files);
        console.log('File Types:', fileTypes);
        alert(`Mismatch between files and file types. Files: ${files.length}, File Types: ${fileTypes.length}`);
        uploadButton.disabled = false; // Re-enable the button
        return;
    }

    // Append files and their corresponding types to FormData
    files.forEach((fileInput, index) => {
        if (fileInput.files.length) {
            formData.append('files[]', fileInput.files[0]);  // Append the selected file
            formData.append(`file_types[${index}]`, fileTypes[index].value);  // Append file type
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
            // Redirect to dashboard.html
            window.location.href = 'dashboard.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        alert('An error occurred while uploading files.');
    }
}


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

// Call the function to populate the table when the page loads

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
    // Get the reviewer email from sessionStorage
    const reviewerEmail = sessionStorage.getItem('userEmail');
    if (!reviewerEmail) {
        console.error('User email is not available in sessionStorage.');
        return;
    }

    // Construct the API URL with the reviewer email as a query parameter
    const apiUrl = `https://dlsudercproject.pythonanywhere.com/fetch-reviewer-protocol?reviewer_email=${reviewerEmail}`;

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
                console.log(data.protocols); // Log the fetched protocols
                displayEthicsProtocols(data.protocols); // Update the UI
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
    tableBody.innerHTML = ''; // Clear any existing rows

    protocols.forEach(protocol => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${protocol.Protoid}</td>
            <td>${protocol.ResearchTitle}</td>
            <td>${protocol.ReviewerStatus}</td>
            <td><button class="view-btn" data-protoid="${protocol.Protoid}">View</button></td>
        `;

        // Add event listener to the "View" button
        const viewButton = row.querySelector('.view-btn');
        viewButton.addEventListener('click', function () {
            // Store the Protoid in sessionStorage
            sessionStorage.setItem('protoid', protocol.Protoid);
            console.log(`Stored Protoid: ${protocol.Protoid}`); // Enhanced log statement
            // Redirect to viewprotocol.html
            window.location.href = 'viewprotocol.html';
        });

        tableBody.appendChild(row);
    });
}

async function getUserRole() {
    const email = sessionStorage.getItem(email);
        
    try {
        // Make GET request to get the user's role
        const response = await fetch(`https://dlsudercproject.pythonanywhere.com/get-user-role?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Parse the JSON response
        const data = await response.json();

        // Handle the response based on the status code
        if (response.ok) {
            // If user is found, display the role
            alert(`User role: ${data.role}`);
        } else {
            // If error occurs, show the error message
            alert(data.error || "An error occurred");
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error occurred while fetching user role. Please try again later.');
    }
}


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






// Function to fetch and populate the update files table
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
                        generateUpdateFilesTable(); // Refresh the table
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

async function assignEthicsStatus() {
    const protoid = sessionStorage.getItem('protoid');  // Get Protoid from sessionStorage

    if (!protoid) {
        alert('Protoid is missing.');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('protoid', protoid);

        const response = await fetch('https://dlsudercproject.pythonanywhere.com/assign', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || 'Ethics status updated successfully.');
        } else {
            alert(result.message || 'Error updating the ethics status.');
        }
    } catch (error) {
        console.error('Error updating ethics status:', error);
        alert('An error occurred while updating the ethics status.');
    }
}


let selectedReviewers = {
    primary: null,
    reviewer2: null,
    reviewer3: null
};


function populateReviewers() {
    const reviewerSelects = document.querySelectorAll('select'); // Get all reviewer select elements

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
                select.addEventListener('change', function() {
                    const selectedEmail = select.value;
                    emailDisplay.textContent = ''; // Reset email display

                    // Update the selected reviewer in the global state
                    const selectId = select.id;

                    // Check which reviewer is being updated and update the global state
                    if (selectId === 'primary-reviewer') {
                        selectedReviewers.primary = selectedEmail;
                    } else if (selectId === 'reviewer-2') {
                        selectedReviewers.reviewer2 = selectedEmail;
                    } else if (selectId === 'reviewer-3') {
                        selectedReviewers.reviewer3 = selectedEmail;
                    } else if (selectId === 'fprimary-reviewer') {
                        selectedReviewers.reviewer2 = selectedEmail;
                    } else if (selectId === 'freviewer-2') {
                        selectedReviewers.reviewer3 = selectedEmail;
                    } else if (selectId === 'freviewer-3') {
                        selectedReviewers.reviewer2 = selectedEmail;
                    }

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

function updateReviewerOptions(selects) {
    selects.forEach(select => {
        Array.from(select.options).forEach(option => {
            // Reset options visibility for all selects
            option.disabled = false; // Enable all options
            option.style.display = ''; // Make all options visible again

            // Hide options that are already selected in other selects
            if (selectedReviewers.primary && selectedReviewers.primary === option.value ||
                selectedReviewers.reviewer2 && selectedReviewers.reviewer2 === option.value ||
                selectedReviewers.reviewer3 && selectedReviewers.reviewer3 === option.value) {
                option.disabled = true; // Disable selected reviewer
                option.style.display = 'none'; // Hide the selected reviewer option
            }
        });
    });
}

// Function to handle the number of reviewers input field
function handleReviewerCountChange() {
    const reviewerCountInput = document.getElementById('reviewer-count');
    const reviewer2Select = document.getElementById('reviewer-2');
    const reviewer3Select = document.getElementById('reviewer-3');

    // Handle change event for reviewer count input
    reviewerCountInput.addEventListener('input', function() {
        const count = parseInt(reviewerCountInput.value);

        // Enable or disable reviewer select boxes based on the count value
        if (count === 1) {
            reviewer2Select.disabled = true;
            reviewer3Select.disabled = true;
        } else if (count === 2) {
            reviewer2Select.disabled = false;
            reviewer3Select.disabled = true;
        } else if (count === 3) {
            reviewer2Select.disabled = false;
            reviewer3Select.disabled = false;
        }
    });

    // Initial call to set the correct state
    const initialCount = parseInt(reviewerCountInput.value);
    if (initialCount === 1) {
        reviewer2Select.disabled = true;
        reviewer3Select.disabled = true;
    } else if (initialCount === 2) {
        reviewer2Select.disabled = false;
        reviewer3Select.disabled = true;
    } else if (initialCount === 3) {
        reviewer2Select.disabled = false;
        reviewer3Select.disabled = false;
    }
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

    // Get selected reviewer emails
    const primaryReviewerEmail = document.getElementById('primary-reviewer').value;
    const reviewer2Email = document.getElementById('reviewer-2').value;
    const reviewer3Email = document.getElementById('reviewer-3').value;

    // Validation: Ensure all required reviewers are selected based on reviewer count
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

    // Payment calculation based on reviewType and category
    let paymentDistribution = [];
    if (reviewType === 'expedited') {
        if (category === 'undergraduate') {
            if (reviewerCount === 1) {
                paymentDistribution = [300];
            } else if (reviewerCount === 2) {
                paymentDistribution = [100, 100];
            } else if (reviewerCount === 3) {
                paymentDistribution = [100, 100, 100];
            }
        } else if (category === 'graduate') {
            if (reviewerCount === 1) {
                paymentDistribution = [750];
            } else if (reviewerCount === 2) {
                paymentDistribution = [750, 500];
            } else if (reviewerCount === 3) {
                paymentDistribution = [750, 500, 500];
            }
        }
    } else {
        alert('Currently, only Expedited review types are supported.');
        return;
    }

    // Prepare the payload
    const payload = {
        protoid: protoid,
        reviewers: []
    };

    // Add primary reviewer
    payload.reviewers.push({
        email: primaryReviewerEmail,
        isPrimary: true,
        paidAmount: paymentDistribution[0] || 0
    });

    // Add secondary reviewers based on the reviewer count
    if (reviewerCount >= 2) {
        payload.reviewers.push({
            email: reviewer2Email,
            isPrimary: false,
            paidAmount: paymentDistribution[1] || 0
        });
    }
    if (reviewerCount === 3) {
        payload.reviewers.push({
            email: reviewer3Email,
            isPrimary: false,
            paidAmount: paymentDistribution[2] || 0
        });
    }

    // Send payload to the backend
    fetch('https://dlsudercproject.pythonanywhere.com/assign-protocol-reviewers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Reviewers assigned successfully!');
            } else {
                alert('Error assigning reviewers: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while assigning reviewers.');
        });
}

function fassignProtocol() {
    const protoid = sessionStorage.getItem('protoid'); // Retrieve Protoid from sessionStorage
    if (!protoid) {
        alert('Protoid is missing. Please reload the page.');
        return;
    }

    // Get protocol details
    const reviewType = sessionStorage.getItem('reviewType'); // Expedited or other
    const category = sessionStorage.getItem('category'); // Undergraduate or Graduate

    // Get selected reviewer emails
    const primaryReviewerEmail = document.getElementById('fprimary-reviewer').value;
    const reviewer2Email = document.getElementById('freviewer-2').value;
    const reviewer3Email = document.getElementById('freviewer-3').value;

    // Get layman details
    const laymanName = document.getElementById('layman-name').value;
    const laymanEmail = document.getElementById('layman-email').value;

    // Get ERC chair details from sessionStorage
    const ercChairName = sessionStorage.getItem('userName');
    const ercChairEmail = sessionStorage.getItem('userEmail');

    // Validate required fields
    if (!primaryReviewerEmail || !reviewer2Email || !reviewer3Email || !laymanName || !laymanEmail) {
        alert('Please fill in all required fields.');
        return ;
    }
    // Fixed payment distribution
    const paymentDistribution = [1000, 625, 625]; // Primary gets 1000, others get 625 each

    // Prepare the payload
    const payload = {
        protoid: protoid,
        reviewers: [
            {
                email: primaryReviewerEmail,
                isPrimary: true,
                paidAmount: paymentDistribution[0]
            },
            {
                email: reviewer2Email,
                isPrimary: false,
                paidAmount: paymentDistribution[1]
            },
            {
                email: reviewer3Email,
                isPrimary: false,
                paidAmount: paymentDistribution[2]
            }
        ],
        fullBoardDetails: {
            ercChairName: ercChairName,
            ercChairEmail: ercChairEmail,
            ercChairPaidAmount: paymentDistribution[1], // Same as other reviewers
            laymanName: laymanName,
            laymanEmail: laymanEmail,
            laymanPaidAmount: paymentDistribution[1] // Same as other reviewers
        }
    };

    // Send payload to the backend
    fetch('https://dlsudercproject.pythonanywhere.com/assign-fullboard-protocol-reviewers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Reviewers and full board assigned successfully!');
            } else {
                alert('Error assigning reviewers: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while assigning reviewers.');
        });
}


// Function to submit ICAF and PAF files
async function submiticafFiles() {
    const protoid = sessionStorage.getItem('protoid');
    const icafFileInput = document.getElementById('icaf-file');
    const pafFileInput = document.getElementById('paf-file');

    if (!protoid) {
        alert("Protoid is missing.");
        return;
    }

    if (!icafFileInput.files.length || !pafFileInput.files.length) {
        alert("Please upload both the Informed Consent Assessment Form and Protocol Assessment Form.");
        return;
    }

    const formData = new FormData();
    formData.append('protoid', protoid);
    formData.append('icaf', icafFileInput.files[0]);
    formData.append('paf', pafFileInput.files[0]);

    try {
        const response = await fetch('https://dlsudercproject.pythonanywhere.com/icaf-upload-files', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert('Files uploaded successfully!');
            // Redirect to dashboard.html
            window.location.href = 'dashboard.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        alert('An error occurred while uploading files.');
    }
}

// Function to fetch and populate the download files table
async function generateDownloadicafFilesTable() {
    const protoid = sessionStorage.getItem('protoid'); // Get Protoid from sessionStorage
    const downloadFilesList = document.getElementById('icaf-paf-download-list');
    downloadFilesList.innerHTML = ''; // Clear existing rows

    if (!protoid) {
        alert('Protoid is missing.');
        return;
    }

    try {
        // Fetch file data from the backend
        const response = await fetch(`https://dlsudercproject.pythonanywhere.com/icaf-get-files/${protoid}`);
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
            fileTypeCell.textContent = file.FileCategory; // Use FileCategory (ICAF/PAF)
            row.appendChild(fileTypeCell);

            // Download button column
            const downloadCell = document.createElement('td');
            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Download';
            downloadButton.onclick = () => {
                window.location.href = `https://dlsudercproject.pythonanywhere.com/icaf-download-file/${file.FileID}`;
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

function toggleAssociatedFilesSection() {
    const ethicsStatusElement = document.getElementById("ethicsStatus");
    const accountType = sessionStorage.getItem('accountType');
    const reviewType = sessionStorage.getItem('reviewType'); // Assuming reviewType is stored in sessionStorage
    const ethicsStatus = ethicsStatusElement.innerText.trim();

    // Get all the section elements
    const sections = {
        associatedFilesSection: document.getElementById("associated-files-section"),
        updateFilesSection: document.getElementById("update-files-section"),
        downloadFilesSection: document.getElementById("download-files-section"),
        commentsSection: document.getElementById("comments-section"),
        assignSection: document.getElementById("assign-section"),
        fullAssignSection: document.getElementById("full-assign-section"),
        reviewerStatusSection: document.getElementById("reviewer-status-section"),
        submitIcafPafSection: document.getElementById("submit-icaf-paf-section"),
        icafPafDownloadSection: document.getElementById("icaf-paf-download-section"),
        forumsection: document.getElementById("forum-section"),
    };

    // Hide all sections by default
    for (let section in sections) {
        sections[section].style.display = "none";
    }

    // Hide the Approved button and label by default
    const approvedButton = document.getElementById("Approved");
    const approvedLabel = document.querySelector("label#Approved"); // Select the label with id 'Approved'

    if (approvedButton) approvedButton.style.display = "none";
    if (approvedLabel) approvedLabel.style.display = "none";

    // Logic based on accountType and ethicsStatus
    if (ethicsStatus === "Pending") {
        if (accountType === "student") {
            sections.associatedFilesSection.style.display = "block";
        }
    } else if (ethicsStatus === "Checking") {
        if (accountType === "student") {
            sections.updateFilesSection.style.display = "block";
            sections.downloadFilesSection.style.display = "block";
        } else if (accountType === "erc-secretary") {
            sections.downloadFilesSection.style.display = "block";
            sections.commentsSection.style.display = "block";

            // Show the Approved button and label only for ERC secretary when status is Checking
            if (approvedButton) approvedButton.style.display = "inline-block";
            if (approvedLabel) approvedLabel.style.display = "inline-block";
        }
    } else if (ethicsStatus === "Assigning") {
        if (accountType === "student") {
            sections.updateFilesSection.style.display = "block";
        } else if (accountType === "erc-secretary") {
            sections.downloadFilesSection.style.display = "block";
            sections.commentsSection.style.display = "block";
        } else if (accountType === "erc-chair") {
            sections.downloadFilesSection.style.display = "block";
            if (reviewType === "expedited") {
                sections.assignSection.style.display = "block";
            } else if (reviewType === "fullboard") {
                sections.fullAssignSection.style.display = "block";
            }
        }
    } else if (ethicsStatus === "Reviewing") {
        if (accountType === "student") {
            sections.updateFilesSection.style.display = "block";
        } else if (accountType === "erc-secretary") {
            sections.downloadFilesSection.style.display = "block";
            sections.commentsSection.style.display = "block";
        } else if (accountType === "erc-chair") {
            sections.downloadFilesSection.style.display = "block";
            sections.reviewerStatusSection.style.display = "block";
            if (reviewType === "Full-Board") {
                sections.forumsection.style.display = "block";
            }
        } else if (accountType === "ethics-reviewer") {
            sections.downloadFilesSection.style.display = "block";
            sections.submitIcafPafSection.style.display = "block";
        } 
    } else if (ethicsStatus === "Evaluating") {
        if (accountType === "student") {
            sections.updateFilesSection.style.display = "block";
        } else if (accountType === "erc-secretary") {
            sections.downloadFilesSection.style.display = "block";
            sections.commentsSection.style.display = "block";
            sections.icafPafDownloadSection.style.display = "block";
            
        } else if (accountType === "erc-chair") {
            sections.downloadFilesSection.style.display = "block";
            sections.icafPafDownloadSection.style.display = "block";
            if (reviewType === "Full-Board") {
                sections.forumsection.style.display = "block";
            }
        } else if (accountType === "ethics-reviewer") {
            sections.downloadFilesSection.style.display = "block";
            sections.icafPafDownloadSection.style.display = "block";
            if (reviewType === "Full-Board") {
                sections.forumsection.style.display = "block";
            }
        }
    }
}


function initializeViewProtocolPage() {
    fetchProtocolData().then(() => {
        toggleAssociatedFilesSection();
    }).catch((error) => {
        console.error('Error initializing page:', error);
    });
}

async function generateReviewerFilesTable() {
    const protoid = sessionStorage.getItem('protoid');
    const downloadFilesList = document.getElementById('icaf-paf-download-list');
    downloadFilesList.innerHTML = '';

    if (!protoid) {
        alert('Protoid is missing.');
        return;
    }

    try {
        // Fetch data from the backend
        const response = await fetch(`https://dlsudercproject.pythonanywhere.com/get-reviewer-files/${protoid}`);
        const result = await response.json();

        if (result.status !== 'success') {
            alert(result.message || 'Error fetching reviewer files.');
            return;
        }

        const files = result.data;

        files.forEach(file => {
            const row = document.createElement('tr');

            // Reviewer Name column
            const reviewerNameCell = document.createElement('td');
            reviewerNameCell.textContent = file.ReviewerName;
            row.appendChild(reviewerNameCell);

            // ICAF Download button
            if (file.ICAFFileName) {
                const icafCell = document.createElement('td');
                const icafButton = document.createElement('button');
                icafButton.textContent = `Download ${file.ICAFFileName}`;
                icafButton.onclick = () => {
                    window.location.href = `https://dlsudercproject.pythonanywhere.com/download-reviewer-file/${file.ReviewerFileID}/icaf`;
                };
                icafCell.appendChild(icafButton);
                row.appendChild(icafCell);
            } else {
                const icafCell = document.createElement('td');
                icafCell.textContent = 'No ICAF file';
                row.appendChild(icafCell);
            }

            // Protocol Download button
            if (file.ProtocolFileName) {
                const protocolCell = document.createElement('td');
                const protocolButton = document.createElement('button');
                protocolButton.textContent = `Download ${file.ProtocolFileName}`;
                protocolButton.onclick = () => {
                    window.location.href = `https://dlsudercproject.pythonanywhere.com/download-reviewer-file/${file.ReviewerFileID}/protocol`;
                };
                protocolCell.appendChild(protocolButton);
                row.appendChild(protocolCell);
            } else {
                const protocolCell = document.createElement('td');
                protocolCell.textContent = 'No Protocol file';
                row.appendChild(protocolCell);
            }

            downloadFilesList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching reviewer files:', error);
        alert('An error occurred while fetching reviewer files.');
    }
}

function fetchForumMessages(protoid) {
    fetch('https://dlsudercproject.pythonanywhere.com/get_forum_messages/' + protoid)
    .then(response => response.json())
    .then(data => {
        const forumTable = document.getElementById('forumTable').getElementsByTagName('tbody')[0];
        forumTable.innerHTML = ''; // Clear the table before inserting new rows

        data.forEach(msg => {
            const row = forumTable.insertRow();
            row.insertCell(0).textContent = msg.chat;
            row.insertCell(1).textContent = msg.datetime;
        });
    })
    .catch(error => console.error('Error fetching messages:', error));
}

function postMessage(protoid, message) {
    const userName = sessionStorage.getItem('userName');
    
    fetch('https://dlsudercproject.pythonanywhere.com/post_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            protoid: protoid,
            message: message,
            user_name: userName
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Refresh the forum messages after posting a new one
        fetchForumMessages(protoid);
    })
    .catch(error => console.error('Error posting message:', error));
}
