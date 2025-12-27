// Simple password protection for demo
(function () {
    'use strict';

    // Password hash (SHA-256 of "demo2024")
    const VALID_PASSWORD_HASH = 'f27a9e716283166ceac7f7cbcc5d28b8eeb5f8e55bccb8b9770439be2114606b';
    const SESSION_KEY = 'demo_authenticated';
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // Check if already authenticated
    function isAuthenticated() {
        const authData = localStorage.getItem(SESSION_KEY);
        if (!authData) return false;

        try {
            const { timestamp } = JSON.parse(authData);
            const now = Date.now();

            // Check if session is still valid
            if (now - timestamp < SESSION_DURATION) {
                return true;
            } else {
                // Session expired
                localStorage.removeItem(SESSION_KEY);
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    // Hash password using SHA-256
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Show login form
    function showLoginForm() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #101d22 0%, #1a2c32 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
        `;

        // Create login box
        const loginBox = document.createElement('div');
        loginBox.style.cssText = `
            background: #1a2c32;
            border-radius: 1.5rem;
            padding: 3rem 2.5rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            max-width: 400px;
            width: 90%;
            border: 1px solid rgba(19, 182, 236, 0.2);
        `;

        loginBox.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 64px; height: 64px; background: rgba(19, 182, 236, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                    <span style="font-size: 32px; color: #13b6ec;">🔒</span>
                </div>
                <h2 style="color: #fff; font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem;">Demo Access</h2>
                <p style="color: #94a3b8; font-size: 0.875rem; margin: 0;">Enter password to continue</p>
            </div>
            
            <form id="demo-login-form" style="margin-bottom: 1rem;">
                <div style="margin-bottom: 1.5rem;">
                    <input 
                        type="password" 
                        id="demo-password" 
                        placeholder="Password"
                        autocomplete="off"
                        style="
                            width: 100%;
                            padding: 1rem;
                            background: #101d22;
                            border: 2px solid #2a363b;
                            border-radius: 0.75rem;
                            color: #fff;
                            font-size: 1rem;
                            font-family: 'Inter', sans-serif;
                            outline: none;
                            transition: border-color 0.2s;
                            box-sizing: border-box;
                        "
                    />
                </div>
                
                <button 
                    type="submit"
                    style="
                        width: 100%;
                        padding: 1rem;
                        background: #13b6ec;
                        color: #101d22;
                        border: none;
                        border-radius: 0.75rem;
                        font-size: 1rem;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-family: 'Inter', sans-serif;
                    "
                    onmouseover="this.style.background='#0ea5d7'"
                    onmouseout="this.style.background='#13b6ec'"
                >
                    Access Demo
                </button>
                
                <div id="error-message" style="
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 0.5rem;
                    color: #fca5a5;
                    font-size: 0.875rem;
                    text-align: center;
                    display: none;
                "></div>
            </form>
            
            <p style="color: #64748b; font-size: 0.75rem; text-align: center; margin: 0;">
                Contact admin for access credentials
            </p>
        `;

        overlay.appendChild(loginBox);
        document.body.appendChild(overlay);

        // Focus password input
        const passwordInput = document.getElementById('demo-password');
        passwordInput.focus();

        // Add input focus styling
        passwordInput.addEventListener('focus', function () {
            this.style.borderColor = '#13b6ec';
        });
        passwordInput.addEventListener('blur', function () {
            this.style.borderColor = '#2a363b';
        });

        // Handle form submission
        const form = document.getElementById('demo-login-form');
        const errorMessage = document.getElementById('error-message');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const password = passwordInput.value;
            const hash = await hashPassword(password);

            if (hash === VALID_PASSWORD_HASH) {
                // Store authentication
                localStorage.setItem(SESSION_KEY, JSON.stringify({
                    timestamp: Date.now()
                }));

                // Remove overlay
                overlay.remove();
            } else {
                // Show error
                errorMessage.textContent = 'Incorrect password. Please try again.';
                errorMessage.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();

                // Shake animation
                loginBox.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    loginBox.style.animation = '';
                }, 500);
            }
        });
    }

    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);

    // Check authentication on page load
    if (!isAuthenticated()) {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showLoginForm);
        } else {
            showLoginForm();
        }
    }
})();
