// Theme switching functionality with jQuery
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

$(document).ready(function () {
    initializeTheme();
    $('#theme-toggle-btn').on('click', toggleTheme);

    //signUp Process

    $('#signupForm').on('submit', function (event){
        const fullname = $('#fullname').val().trim();
        const email = $('#email').val().trim();
        const role = $('#role').val().toUpperCase();
        const password = $('#password').val();

        console.log(fullname, email, role, password);

        $.ajax({
            url: 'http://localhost:8080/auth/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: fullname,
                emailAddress: email,
                role: role,
                password: password
            }),
            success: function (response) {
                console.log("Registration Successful: ", response)
            },
            error: function (xhr) {
                console.log('Registration failed: ', xhr.responseText);
            }
        })

    })

});
