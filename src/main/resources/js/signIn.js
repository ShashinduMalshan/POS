$(document).ready(function() {
    console.log("✅ jQuery is working!");
});

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    $('html').attr('data-theme', savedTheme);
    $('#theme-toggle-btn i').attr('class', savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon');
}

function toggleTheme() {
    const currentTheme = $('html').attr('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    $('html').attr('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    $('#theme-toggle-btn i').attr('class', newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon');
}

$(document).ready(function() {
    initializeTheme();
    $('#theme-toggle-btn').on('click', toggleTheme);
});

//--> Start to communicate with backend <--//

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('❌ Error parsing JWT:', error);
        return null;
    }
}

// Add loading state management
function showLoginLoading(show = true) {
    const submitBtn = $('input[type="submit"], button[type="submit"]');
    if (show) {
        submitBtn.prop('disabled', true).val('Signing in...');
    } else {
        submitBtn.prop('disabled', false).val('Sign In');
    }
}

// Add success animation
function showLoginSuccess(role) {
    // Create a temporary success message
    const successMsg = $(`
        <div id="login-success" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            font-size: 1.1rem;
            font-weight: 500;
            text-align: center;
            opacity: 0;
            animation: successSlideIn 0.5s ease forwards;
        ">
            <i class="fas fa-check-circle" style="margin-right: 10px; font-size: 1.2rem;"></i>
            Login successful! Welcome ${role === 'ADMIN' ? 'Administrator' : 'User'}
        </div>
        <style>
            @keyframes successSlideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
        </style>
    `);

    $('body').append(successMsg);

    // Remove success message and redirect after 2 seconds
    setTimeout(() => {
        successMsg.fadeOut(300, () => {
            successMsg.remove();
            window.location.href = 'http://localhost:63342/ProPOS/system.html'; // Updated to point to the new dashboard
        });
    }, 2000);
}

$(document).ready(function() {
    $('form').on('submit', function(event) {
        event.preventDefault();

        const email = $('#email').val();
        const password = $('#password').val();

        if (!email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        console.log("📧 Email: ", email);
        console.log("🔐 Password: ", password);

        showLoginLoading(true);

        $.ajax({
            url: 'http://localhost:8080/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: email,
                password: password
            }),
            success: function(response) {
                showLoginLoading(false);

                const token = response.data.accessToken;
                localStorage.setItem("jwtToken", token);

                const payload = parseJwt(token);
                if (!payload) {
                    alert("Invalid token received from server.");
                    return;
                }

                const role = payload?.role;
                console.log("👤 User Role:", role);

                // Instead of alerts, show success animation
                showLoginSuccess(role);
            },
            error: function(xhr) {
                showLoginLoading(false);
                console.log("❌ Login failed: ", xhr.responseText);

                let errorMessage = "Invalid credentials or error logging in.";

                // Try to parse error response for better user feedback
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    if (errorResponse.message) {
                        errorMessage = errorResponse.message;
                    }
                } catch (e) {
                    // Use default error message
                }

                // Show error with better styling
                const errorDiv = $(`
                    <div style="
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        color: white;
                        padding: 15px 20px;
                        border-radius: 10px;
                        box-shadow: 0 5px 20px rgba(239, 68, 68, 0.3);
                        z-index: 1000;
                        font-weight: 500;
                        animation: errorSlideIn 0.3s ease;
                    ">
                        <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                        ${errorMessage}
                    </div>
                    <style>
                        @keyframes errorSlideIn {
                            from {
                                transform: translateX(100%);
                                opacity: 0;
                            }
                            to {
                                transform: translateX(0);
                                opacity: 1;
                            }
                        }
                    </style>
                `);

                $('body').append(errorDiv);

                // Remove error message after 5 seconds
                setTimeout(() => {
                    errorDiv.fadeOut(300, () => errorDiv.remove());
                }, 5000);
            }
        });
    });
});