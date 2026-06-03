// SentimentIQ Authentication & Helpers

// Toast Notification System
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto remove after 3.4 seconds (animation duration includes fadeOut)
  setTimeout(() => {
    toast.remove();
  }, 3400);
}

// Check if authenticated
function checkAuth() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    window.location.href = '/login';
    return null;
  }
  return token;
}

// Get user data
function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Logout
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = '/login';
  }, 500);
}

// Init Login Form
function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('btnSpinner');

    if (!username || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    spinner.classList.remove('hidden');
    submitBtn.querySelector('span').textContent = 'Signing in...';

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast(data.message || 'Login successful! 🎉', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } else {
        showToast(data.error || 'Login failed. Please check credentials.', 'error');
        // Reset loading state
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
        submitBtn.querySelector('span').textContent = 'Sign In';
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred. Please try again.', 'error');
      // Reset loading state
      submitBtn.disabled = false;
      spinner.classList.add('hidden');
      submitBtn.querySelector('span').textContent = 'Sign In';
    }
  });
}

// Init Register Form
function initRegister() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('btnSpinner');

    if (!username || !email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    spinner.classList.remove('hidden');
    submitBtn.querySelector('span').textContent = 'Creating account...';

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'Account created successfully! Please login.', 'success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        showToast(data.error || 'Registration failed. Try again.', 'error');
        // Reset loading state
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
        submitBtn.querySelector('span').textContent = 'Create Account';
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred. Please try again.', 'error');
      // Reset loading state
      submitBtn.disabled = false;
      spinner.classList.add('hidden');
      submitBtn.querySelector('span').textContent = 'Create Account';
    }
  });
}
