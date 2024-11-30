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
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-icon').src = 'img/dark-icon.png';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('dark-mode-icon').src = 'img/light-icon.png';
    }

    // Check if we are on the login page
    if (document.getElementById('login-form')) {
        handleLoginForm();
    }
    
    // Check if we are on the signup page
    if (document.getElementById('signup-form')) {
        handleSignupForm();
    }
}

// Function to handle login form submission
function handleLoginForm() {
    document.getElementById('login-form').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const email = document.getElementById('student-email').value;
        const password = document.getElementById('student-password').value;

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await fetch('https://dlsudercproject.pythonanywhere.com/login', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert('Login successful!');
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

// Function to handle signup form submission
function handleSignupForm() {
    document.getElementById('signup-form').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const accountType = document.getElementById('account-type').value;

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
            const response = await fetch('https://dlsudercproject.pythonanywhere.com/signup', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert('Signup successful!');
                window.location.href = 'index.html'; // Redirect to login page after successful signup
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}


let sentCode = ''; // Variable to store the code that gets sent

// Function to send a confirmation code to the email
function sendCode() {
    const email = document.getElementById('email').value;

    // Check if the email is valid
    if (!email) {
        alert("Please enter a valid email.");
        return;
    }

    // Send email request to the Flask backend hosted on PythonAnywhere
    fetch('http://dlsudercproject.pythonanywhere.com/send-code', {  // Use your PythonAnywhere app URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Code sent successfully') {
            sentCode = data.confirmationCode;
            document.getElementById('code-section').style.display = 'block';
            document.getElementById('message').innerHTML = `A code has been sent to ${email}. Please check your inbox.`;
        } else {
            document.getElementById('message').innerHTML = 'Failed to send code. Please try again later.';
            document.getElementById('message').style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').innerHTML = 'Error occurred while sending the code.';
        document.getElementById('message').style.color = 'red';
    });

    // Clear the email field
    document.getElementById('email').value = '';
}

// Function to verify the entered confirmation code
function verifyCode() {
    const enteredCode = document.getElementById('code').value;

    // Check if the entered code matches the sent code
    if (enteredCode === sentCode.toString()) {
        document.getElementById('message').innerHTML = "Code verified successfully! You are now confirmed.";
        document.getElementById('message').style.color = 'green';
    } else {
        document.getElementById('message').innerHTML = "Invalid code. Please try again.";
        document.getElementById('message').style.color = 'red';
    }

    // Clear the code field
    document.getElementById('code').value = '';
}
