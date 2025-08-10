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
            window.location.href = 'http://localhost:63342/ProPOS/system.html';
        });
    }, 2000);
}

let accessToken = null; // Keep in memory only

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing token", e);
        return null;
    }
}

function login(email, password) {
    return $.ajax({
        url: 'http://localhost:8080/auth/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username: email, password: password }),
        xhrFields: { withCredentials: true }, // to receive cookies
    }).then(res => {
        accessToken = res.accessToken;
        console.log("✅ Logged in. Token:", accessToken);
        const payload = parseJwt(accessToken);
        console.log("🔐 Role:", payload?.role);
        return payload?.role;
    }).catch(err => {
        alert("Login failed: " + (err.responseJSON?.message || "Invalid credentials"));
        throw err;
    });
}

function refreshAccessToken() {
    return $.ajax({
        url: 'http://localhost:8080/auth/refresh',
        method: 'POST',
        xhrFields: { withCredentials: true },
    }).then(res => {
        accessToken = res.accessToken;
        console.log("♻️ Token refreshed:", accessToken);
    }).catch(err => {
        console.warn("❌ Refresh failed, please login again.");
        alert("Session expired. Please sign in again.");
        window.location.href = '/login.html';
    });
}

function authFetch(url, method = 'GET', data = null) {
    return $.ajax({
        url,
        method,
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null,
        beforeSend: function (xhr) {
            if (accessToken) xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        },
        xhrFields: { withCredentials: true }
    }).fail(async function (xhr) {
        if (xhr.status === 401) {
            console.warn("⚠️ Token expired, trying refresh...");
            await refreshAccessToken();
            return authFetch(url, method, data); // Retry after refresh
        } else {
            console.error("❌ Auth failed:", xhr);
            throw xhr;
        }
    });
}

// Handle login form
$(document).ready(function () {
    $('#signinForm').on('submit', async function (e) {
        e.preventDefault();

        const email = $('#email').val();
        const password = $('#password').val();

        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const role = await login(email, password);
            showLoginSuccess(role); // your existing animation
        } catch (e) {
            console.error("Login error", e);
        }
    });
});
