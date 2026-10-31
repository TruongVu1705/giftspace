document.addEventListener('DOMContentLoaded', () => {
    // Ensure cursor glitter effect is active across all pages
    if (!window.__giftspace_glitter_initialized__ && !document.getElementById('giftspace-glitter-script')) {
        const script = document.createElement('script');
        script.id = 'giftspace-glitter-script';
        script.src = 'js/cursor-glitter.js';
        script.async = true;
        document.body.appendChild(script);
    }

    // 1. Dark Mode Persistence & Toggle
    const htmlEl = document.documentElement;
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        htmlEl.classList.add('dark');
    } else {
        htmlEl.classList.remove('dark');
    }

    const themeToggles = document.querySelectorAll('[aria-label="Toggle light/dark theme"], [aria-label="Toggle dark mode"], [aria-label="Chuyển chế độ sáng / tối"]');
    themeToggles.forEach(toggle => {
        // Update initial icon
        const icon = toggle.querySelector('.theme-toggle-icon');
        if (icon) {
            icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        }

        toggle.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            htmlEl.classList.toggle('dark');
            const currentlyDark = htmlEl.classList.contains('dark');
            localStorage.setItem('darkMode', currentlyDark);

            themeToggles.forEach(t => {
                const i = t.querySelector('.theme-toggle-icon');
                if (i) i.textContent = currentlyDark ? 'light_mode' : 'dark_mode';
            });
        };
    });

    // 2. User Icon Menu
    function setupUserMenu() {
        const personIcons = document.querySelectorAll('header .material-symbols-outlined');
        let userBtn = null;
        let iconSpan = null;
        personIcons.forEach(i => {
            if (i.textContent.trim() === 'person') {
                userBtn = i.parentElement;
                iconSpan = i;
            }
        });

        if (!userBtn) {
            userBtn = document.getElementById('userHeaderAvatar');
        }

        if (userBtn) {
            // Remove any existing dropdown if re-initializing
            const existingDropdown = userBtn.querySelector('.user-dropdown-menu');
            if (existingDropdown) existingDropdown.remove();

            const pathname = window.location.pathname.toLowerCase();
            const isDashboardPage = pathname.includes('dashboard');
            const isProfilePage = pathname.includes('userprofile');

            let user = null;
            try {
                user = JSON.parse(localStorage.getItem('user'));
            } catch (e) {}

            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || (isProfilePage && !!user);

            if ((isLoggedIn || isProfilePage) && user) {
                userBtn.innerHTML = '';
                const initial = user.full_name ? user.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
                
                if (user.avatar_url) {
                    const img = document.createElement('img');
                    img.src = user.avatar_url;
                    img.className = 'w-full h-full object-cover rounded-full pointer-events-none';
                    userBtn.appendChild(img);
                } else {
                    userBtn.textContent = initial;
                    userBtn.className = 'w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 font-bold text-[14px] cursor-pointer shadow-xs border border-outline-variant hover:scale-105 transition-transform';
                }
            } else {
                userBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">person</span>';
            }

            userBtn.style.cursor = 'pointer';
            userBtn.style.position = 'relative';

            const dropdown = document.createElement('div');
            dropdown.className = 'user-dropdown-menu absolute top-full right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-2 hidden z-50 flex-col gap-1 backdrop-blur-md';
            dropdown.style.backgroundColor = 'var(--color-surface-container-lowest)';
            
            const currentLang = localStorage.getItem('app_lang') || 'vi';
            const isVi = currentLang === 'vi';
            const profileText = isVi ? 'Hồ sơ cá nhân' : 'Profile';
            const logoutText = isVi ? 'Đăng xuất' : 'Logout';
            const dashboardText = isVi ? 'Trang Quản trị' : 'Dashboard';

            const showDashboard = user && user.is_admin === 1 && !isDashboardPage;
            const showProfile = !isProfilePage;

            let dropdownHtml = '';

            if (showDashboard) {
                dropdownHtml += `
                    <button id="dashboardBtn" data-i18n="Dashboard" class="w-full text-left px-3.5 py-2 text-body-md text-error hover:bg-error-container/50 rounded-lg transition-colors font-bold flex items-center gap-2 cursor-pointer">
                        <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                        <span>${dashboardText}</span>
                    </button>
                    <div class="h-[1px] w-full bg-outline-variant my-1"></div>
                `;
            }

            if (showProfile) {
                dropdownHtml += `
                    <button id="profileBtn" data-i18n="Profile" class="w-full text-left px-3.5 py-2 text-body-md text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px] text-secondary">account_circle</span>
                        <span>${profileText}</span>
                    </button>
                `;
            }

            dropdownHtml += `
                <button id="logoutBtn" data-i18n="Logout" class="w-full text-left px-3.5 py-2 text-body-md text-error hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">logout</span>
                    <span>${logoutText}</span>
                </button>
            `;
            
            dropdown.innerHTML = dropdownHtml;
            userBtn.appendChild(dropdown);
            
            userBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const loggedIn = localStorage.getItem('isLoggedIn') === 'true' || (isProfilePage && user);
                if (!loggedIn) {
                    if (typeof openModal === 'function' && document.getElementById('login-modal')) {
                        openModal('login-modal');
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    if (dropdown.style.display === 'flex') {
                        dropdown.style.display = 'none';
                    } else {
                        dropdown.style.display = 'flex';
                    }
                }
            };
            
            const profileBtn = dropdown.querySelector('#profileBtn');
            if (profileBtn) {
                profileBtn.onclick = (e) => {
                    e.stopPropagation();
                    window.location.href = 'userprofile.html'; 
                };
            }
            
            const dashboardBtn = dropdown.querySelector('#dashboardBtn');
            if (dashboardBtn) {
                dashboardBtn.onclick = (e) => {
                    e.stopPropagation();
                    window.location.href = 'dashboard.html';
                };
            }
            
            const logoutBtn = dropdown.querySelector('#logoutBtn');
            if (logoutBtn) {
                logoutBtn.onclick = (e) => {
                    e.stopPropagation();
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                };
            }
            
            document.addEventListener('click', () => {
                dropdown.style.display = 'none';
            });
        }
    }
    window.setupUserMenu = setupUserMenu;
    setupUserMenu();

    // 3. Demo Tracking & Interaction
    function trackDemoView(assetInfo, demoType) {
        try {
            let list = JSON.parse(localStorage.getItem('viewed_demos') || '[]');
            const id = assetInfo.id || assetInfo.title;
            const existingIndex = list.findIndex(item => item.id === id || item.title === assetInfo.title);
            const now = new Date().toISOString();
            
            if (existingIndex > -1) {
                const item = list[existingIndex];
                if (!item.demo_types) item.demo_types = [item.demo_type || 'web'];
                if (!item.demo_types.includes(demoType)) {
                    item.demo_types.push(demoType);
                }
                item.viewed_at = now;
                if (assetInfo.thumbnail_url && !item.thumbnail_url) item.thumbnail_url = assetInfo.thumbnail_url;
                list.splice(existingIndex, 1);
                list.unshift(item);
            } else {
                list.unshift({
                    id: assetInfo.id || ('d_' + Date.now()),
                    title: assetInfo.title || 'Mẫu thiết kế cao cấp',
                    category: assetInfo.category || 'WEB TEMPLATE',
                    thumbnail_url: assetInfo.thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
                    base_price: assetInfo.base_price || 49.0,
                    demo_url: assetInfo.demo_url || '#',
                    demo_types: [demoType],
                    viewed_at: now
                });
            }
            localStorage.setItem('viewed_demos', JSON.stringify(list));
        } catch (e) {
            console.error('Error tracking demo view:', e);
        }
    }
    window.trackDemoView = trackDemoView;

    function extractCardAsset(btn) {
        const card = btn.closest('article, .asset-card');
        if (!card) return null;
        const id = card.dataset.id || '';
        const titleEl = card.querySelector('h2, h3, h4, h5');
        const title = titleEl ? titleEl.textContent.trim() : 'Mẫu giao diện';
        const imgEl = card.querySelector('img');
        const thumbnail_url = imgEl ? imgEl.src : '';
        const catEl = card.querySelector('.uppercase, [data-category]');
        const category = catEl ? catEl.textContent.trim() : (card.dataset.category || 'TEMPLATE');
        return { id, title, thumbnail_url, category, base_price: 49.0 };
    }

    // Purchase & Demo buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, a');
        if (!btn) return;

        // Only ignore submit buttons inside forms (never intercept login/register forms, but always allow purchase and demo buttons)
        if (btn.closest('form') && !btn.classList.contains('purchase-btn') && !btn.classList.contains('mobile-demo-btn')) {
            return;
        }

        // Mobile Demo
        const isMobileDemo = btn.classList.contains('mobile-demo-btn') || 
            btn.textContent.includes('Mobile Demo') || 
            btn.textContent.includes('Mobile') ||
            (btn.querySelector('.material-symbols-outlined')?.textContent === 'smartphone');

        if (isMobileDemo) {
            e.preventDefault();
            let demoUrl = btn.getAttribute('data-demo-url') || btn.getAttribute('href') || '';
            if (!demoUrl || demoUrl === '#' || demoUrl.includes('example.com')) {
                demoUrl = 'demo-lumina.html';
            }
            const iframe = document.getElementById('mobile-demo-iframe');
            if (iframe) {
                iframe.src = demoUrl;
            }
            const assetInfo = extractCardAsset(btn) || { title: 'Lumina Agency & Portfolio Template', demo_url: demoUrl, base_price: 49 };
            trackDemoView(assetInfo, 'mobile');
            
            // Dynamically update modal headers and product text if elements exist
            const modalTitle = document.getElementById('mobile-modal-title');
            if (modalTitle) modalTitle.textContent = `${assetInfo.title} — Mobile Demo`;
            const prodTitle = document.getElementById('mobile-prod-title') || document.getElementById('mobile-modal-prod-title');
            if (prodTitle) prodTitle.textContent = assetInfo.title;
            const buyBtn = document.getElementById('mobile-modal-buy-btn');
            if (buyBtn) {
                buyBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">shopping_bag</span><span>Sở hữu ${assetInfo.title.slice(0, 15)}... — $${(assetInfo.base_price || 49).toFixed(0)}</span>`;
            }
            
            // Update clock
            const clock = document.getElementById('mobileClockTime');
            if (clock) {
                const now = new Date();
                clock.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            }

            openModal('mobile-modal');
            return;
        }

        // Web Demo
        if (btn.textContent.includes('Web Demo') || btn.textContent.includes('Live Demo') || (btn.querySelector('.material-symbols-outlined')?.textContent === 'laptop_mac')) {
            const demoUrl = btn.getAttribute('data-demo-url') || btn.getAttribute('href') || '';
            const assetInfo = extractCardAsset(btn) || { title: 'Lumina Agency & Portfolio Template', demo_url: demoUrl };
            trackDemoView(assetInfo, 'web');
            if (demoUrl && demoUrl !== '#') {
                // allow normal navigation
            } else {
                e.preventDefault();
                openModal('mobile-modal');
            }
            return;
        }
        
        // Purchase
        if (btn.classList.contains('purchase-btn') || btn.textContent.includes('Purchase') || btn.textContent.includes('Get Template') || btn.textContent.includes('Mua ngay')) {
            e.preventDefault();
            const asset = extractCardAsset(btn) || {
                id: 'a1',
                title: 'Lumina — Minimalist Portfolio & Agency Suite',
                category: 'WEB TEMPLATE',
                base_price: 49.0,
                thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgf-lKA_EJfDrlTOl-7jnOx2TU53x8UHUJKR0OJj-CjlswaLYIqeqUFibvZi-mYiVBvciXhmXL5gHnojYtDDXIIih4daYr2pijZpU-JHGO0KUyNgVUM1TfTgK4RE-MG2jkgegTnvsvDHA4VnTjV8ppovoIuJjYsL0_CBJ1nQFjywrexvK4EyHj3-lG6MSWsFvdBZnua48P71i6vS6Hv6ua2jU2FVv2Z9WISe3_xdVnzAFxAnEpshV8'
            };
            try {
                localStorage.setItem('checkout_item', JSON.stringify(asset));
            } catch (e) {}
            window.location.href = `payment.html?id=${encodeURIComponent(asset.id || 'a1')}&title=${encodeURIComponent(asset.title)}&price=${asset.base_price || 49.0}`;
            return;
        }

        // Handle Modal Close buttons
        if (btn.hasAttribute('onclick') && btn.getAttribute('onclick').includes('remove')) {
            e.preventDefault();
            const modal = btn.closest('.fixed.inset-0');
            if (modal) modal.style.setProperty('display', 'none', 'important');
        }
    });

    // Global Toast Notification Helper
    function showToast(message, type = 'success', duration = 3500) {
        let container = document.getElementById('global-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'global-toast-container';
            container.className = 'fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-[calc(100%-40px)] sm:w-96 select-none';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        let iconName = 'check_circle';
        let iconColor = 'text-emerald-500';
        let titleText = 'Thành công';
        let borderClass = 'border-emerald-500/30';
        let shadowClass = 'shadow-emerald-500/10';

        if (type === 'error') {
            iconName = 'error';
            iconColor = 'text-rose-500';
            titleText = 'Lỗi xác thực';
            borderClass = 'border-rose-500/30';
            shadowClass = 'shadow-rose-500/10';
        } else if (type === 'warning') {
            iconName = 'warning';
            iconColor = 'text-amber-500';
            titleText = 'Cảnh báo';
            borderClass = 'border-amber-500/30';
            shadowClass = 'shadow-amber-500/10';
        } else if (type === 'info') {
            iconName = 'info';
            iconColor = 'text-blue-500';
            titleText = 'Thông báo';
            borderClass = 'border-blue-500/30';
            shadowClass = 'shadow-blue-500/10';
        }

        toast.className = `pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform -translate-y-2 opacity-0 bg-surface-container-lowest/95 ${borderClass} text-on-surface ${shadowClass}`;

        toast.innerHTML = `
            <span class="material-symbols-outlined text-[22px] ${iconColor} shrink-0 mt-0.5">${iconName}</span>
            <div class="flex-1 min-w-0 pr-1">
                <span class="block text-[11px] font-bold uppercase tracking-wider ${iconColor} leading-none mb-1">${titleText}</span>
                <p class="text-body-sm text-[13px] text-on-surface leading-snug font-medium break-words">${message}</p>
            </div>
            <button type="button" class="text-on-surface-variant hover:text-on-surface p-0.5 rounded-lg transition-colors cursor-pointer shrink-0" title="Đóng">
                <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
        `;

        const closeBtn = toast.querySelector('button');
        const dismiss = () => {
            toast.classList.add('opacity-0', '-translate-y-2');
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 300);
        };

        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                dismiss();
            };
        }

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('-translate-y-2', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        });

        setTimeout(dismiss, duration);
    }
    window.showToast = showToast;

    // Inline Modal Alert Banner Helper
    function showModalAlert(modal, message, type = 'error') {
        if (!modal) return;
        let alertBox = modal.querySelector('.modal-dynamic-alert');
        if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.className = 'modal-dynamic-alert mb-3 p-3.5 rounded-2xl border text-left text-[12px] leading-relaxed transition-all flex items-start gap-2.5';
            const form = modal.querySelector('form');
            if (form) {
                form.parentElement.insertBefore(alertBox, form);
            } else {
                modal.querySelector('.relative')?.prepend(alertBox);
            }
        }

        let isErr = type === 'error';
        let isWarn = type === 'warning';
        let iconName = isErr ? 'error' : (isWarn ? 'warning' : 'check_circle');
        let iconColor = isErr ? 'text-rose-500' : (isWarn ? 'text-amber-500' : 'text-emerald-500');
        let bgClasses = isErr 
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400' 
            : (isWarn ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400');

        alertBox.className = `modal-dynamic-alert mb-3 p-3.5 rounded-2xl border text-left text-[12px] leading-relaxed transition-all flex items-start gap-2.5 ${bgClasses}`;

        let quickAction = '';
        if (message.includes('đã tồn tại') || message.includes('Email already exists')) {
            quickAction = ` <button type="button" class="underline font-bold hover:opacity-80 cursor-pointer ml-1" onclick="openModal('login-modal')">Đăng nhập ngay</button>`;
        } else if (message.includes('chưa được đăng ký') || message.includes('chưa có tài khoản') || message.includes('chưa đăng ký')) {
            quickAction = ` <button type="button" class="underline font-bold hover:opacity-80 cursor-pointer ml-1" onclick="openModal('register-modal')">Đăng ký mới</button>`;
        } else if (message.includes('Mật khẩu không chính xác') || message.includes('sai mật khẩu')) {
            quickAction = ` <button type="button" class="underline font-bold hover:opacity-80 cursor-pointer ml-1" onclick="openModal('forgot-modal')">Quên mật khẩu?</button>`;
        }

        alertBox.innerHTML = `
            <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${iconColor}">${iconName}</span>
            <div class="flex-1 min-w-0">
                <span class="font-semibold block mb-0.5">${isErr ? 'Lỗi xác thực:' : (isWarn ? 'Lưu ý:' : 'Thành công:')}</span>
                <span>${message}${quickAction}</span>
            </div>
            <button type="button" class="text-current opacity-70 hover:opacity-100 p-0.5 cursor-pointer shrink-0" onclick="this.parentElement.remove()" title="Đóng">
                <span class="material-symbols-outlined text-[15px]">close</span>
            </button>
        `;
        alertBox.classList.remove('hidden');
    }

    function clearModalAlert(modal) {
        if (!modal) return;
        const alertBox = modal.querySelector('.modal-dynamic-alert');
        if (alertBox) alertBox.remove();

        const inputs = modal.querySelectorAll('input');
        inputs.forEach(inp => inp.classList.remove('ring-2', 'ring-rose-500', 'border-rose-500'));
    }

    // 4. Modal Logic
    function hideAllModals() {
        document.querySelectorAll('#modals-container > div').forEach(m => {
            m.style.setProperty('display', 'none', 'important');
            clearModalAlert(m);
        });
    }
    window.hideAllModals = hideAllModals;

    function openModal(modalId) {
        hideAllModals();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.setProperty('display', 'flex', 'important');
            clearModalAlert(modal);
            setupModalInteractions(modal);
        }
    }
    window.openModal = openModal;

    function updatePasswordStrength(password, rootModal) {
        const labelEl = rootModal.querySelector('#password-strength-label');
        const barsContainer = rootModal.querySelector('#password-strength-bars');
        const hintEl = rootModal.querySelector('#password-strength-hint');
        if (!labelEl || !barsContainer) return;

        const bars = barsContainer.querySelectorAll('div');
        if (bars.length < 3) return;

        if (!password || password.length === 0) {
            labelEl.textContent = 'Chưa nhập';
            labelEl.className = 'font-semibold text-on-surface-variant';
            bars[0].className = 'rounded-full bg-outline-variant/40 h-full transition-all duration-300';
            bars[1].className = 'rounded-full bg-outline-variant/40 h-full transition-all duration-300';
            bars[2].className = 'rounded-full bg-outline-variant/40 h-full transition-all duration-300';
            if (hintEl) hintEl.textContent = 'Yêu cầu: Yếu (chữ & số ≤ 8 ký tự), Trung bình (> 8 ký tự), Mạnh (kí tự đặc biệt)';
            return;
        }

        const hasLetters = /[a-zA-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        const len = password.length;

        // Đánh giá 3 cấp độ theo yêu cầu:
        // 1. Mạnh: có các kí tự đặc biệt
        // 2. Trung bình: có chữ và số trên 8 kí tự
        // 3. Yếu: chỉ có chữ và số (<= 8 ký tự hoặc đơn giản)
        if (hasSpecial) {
            labelEl.textContent = 'Mạnh';
            labelEl.className = 'font-semibold text-emerald-500';
            bars[0].className = 'rounded-full bg-emerald-500 h-full transition-all duration-300';
            bars[1].className = 'rounded-full bg-emerald-500 h-full transition-all duration-300';
            bars[2].className = 'rounded-full bg-emerald-500 h-full transition-all duration-300';
            if (hintEl) hintEl.textContent = 'Mật khẩu mạnh: đã có ký tự đặc biệt bảo vệ tối ưu.';
        } else if (hasLetters && hasNumbers && len > 8) {
            labelEl.textContent = 'Trung bình';
            labelEl.className = 'font-semibold text-amber-500';
            bars[0].className = 'rounded-full bg-amber-500 h-full transition-all duration-300';
            bars[1].className = 'rounded-full bg-amber-500 h-full transition-all duration-300';
            bars[2].className = 'rounded-full bg-outline-variant/40 h-full transition-all duration-300';
            if (hintEl) hintEl.textContent = 'Mật khẩu trung bình: có cả chữ và số trên 8 ký tự. Thêm ký tự đặc biệt (!@#$...) để đạt mức Mạnh.';
        } else {
            labelEl.textContent = 'Yếu';
            labelEl.className = 'font-semibold text-rose-500';
            bars[0].className = 'rounded-full bg-rose-500 h-full transition-all duration-300';
            bars[1].className = 'rounded-full bg-outline-variant/40 h-full transition-all duration-300';
            bars[2].className = 'rounded-full bg-outline-variant/40 h-full transition-all duration-300';
            if (hintEl) hintEl.textContent = 'Mật khẩu yếu: chỉ có chữ và số (dưới hoặc bằng 8 ký tự). Hãy nhập trên 8 ký tự hoặc thêm ký tự đặc biệt.';
        }
    }

    function setupModalInteractions(modal) {
        // Clear alerts on input typing
        modal.querySelectorAll('input').forEach(inp => {
            if (!inp.dataset.clearAlertBound) {
                inp.dataset.clearAlertBound = 'true';
                inp.addEventListener('input', () => {
                    inp.classList.remove('ring-2', 'ring-rose-500', 'border-rose-500');
                    const alertBox = modal.querySelector('.modal-dynamic-alert');
                    if (alertBox) alertBox.remove();
                });
            }
        });

        // 1. Setup Password Visibility Toggles for all password inputs in modal
        modal.querySelectorAll('input[type="password"], input[data-is-pwd="true"]').forEach(pwdInput => {
            pwdInput.setAttribute('data-is-pwd', 'true');
            const parent = pwdInput.parentElement;
            if (!parent) return;
            const eyeBtn = parent.querySelector('.toggle-password-btn') || parent.querySelector('button');
            if (eyeBtn && !eyeBtn.dataset.toggleBound) {
                eyeBtn.dataset.toggleBound = 'true';
                eyeBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const icon = eyeBtn.querySelector('.material-symbols-outlined');
                    if (pwdInput.type === 'password') {
                        pwdInput.type = 'text';
                        if (icon) icon.textContent = 'visibility_off';
                        eyeBtn.setAttribute('title', 'Ẩn mật khẩu');
                    } else {
                        pwdInput.type = 'password';
                        if (icon) icon.textContent = 'visibility';
                        eyeBtn.setAttribute('title', 'Xem mật khẩu');
                    }
                };
            }
        });

        // 2. Setup Login Quick Fill Hint (if present)
        const quickFillBtn = modal.querySelector('#login-quick-fill');
        if (quickFillBtn && !quickFillBtn.dataset.bound) {
            quickFillBtn.dataset.bound = 'true';
            quickFillBtn.onclick = (e) => {
                e.preventDefault();
                const emailInp = modal.querySelector('#login-email') || modal.querySelector('input[type="email"]');
                const passInp = modal.querySelector('#login-password') || modal.querySelector('input[data-is-pwd="true"]');
                if (emailInp) emailInp.value = 'vu.nguyen@example.com';
                if (passInp) passInp.value = '123456';
                clearModalAlert(modal);
            };
        }

        // 3. Setup Register Password Strength Evaluator Realtime Listener
        if (modal.id === 'register-modal') {
            const regPwdInput = modal.querySelector('#register-password') || modal.querySelectorAll('input[data-is-pwd="true"]')[0];
            if (regPwdInput && !regPwdInput.dataset.strengthBound) {
                regPwdInput.dataset.strengthBound = 'true';
                const handler = () => updatePasswordStrength(regPwdInput.value, modal);
                regPwdInput.addEventListener('input', handler);
                regPwdInput.addEventListener('keyup', handler);
                handler(); // Initial state
            }
        }

        // 4. Handle Forms Submission
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => {
            form.onsubmit = async (e) => {
                e.preventDefault();
                
                const isLogin = modal.id === 'login-modal';
                const isRegister = modal.id === 'register-modal';
                const isForgot = modal.id === 'forgot-modal';
                
                try {
                    if (isLogin) {
                        const emailInput = form.querySelector('#login-email') || form.querySelector('input[type="email"]');
                        const passwordInput = form.querySelector('#login-password') || form.querySelector('input[data-is-pwd="true"]');
                        if (!emailInput || !passwordInput) return;
                        
                        const email = emailInput.value.trim();
                        const password = passwordInput.value;
                        if (!email || !password) {
                            showModalAlert(modal, 'Vui lòng nhập đầy đủ Email và Mật khẩu!', 'warning');
                            showToast('Vui lòng nhập đầy đủ email và mật khẩu!', 'warning');
                            if (!email) emailInput.focus();
                            else passwordInput.focus();
                            return;
                        }

                        const submitBtn = form.querySelector('button[type="submit"]');
                        const oldBtnHtml = submitBtn ? submitBtn.innerHTML : '';
                        if (submitBtn) {
                            submitBtn.disabled = true;
                            submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span><span>Đang xác thực...</span>';
                        }
                        
                        try {
                            const res = await fetch('/api/users/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password })
                            });
                            const data = await res.json();
                            
                            if (data.success) {
                                clearModalAlert(modal);
                                localStorage.setItem('isLoggedIn', 'true');
                                localStorage.setItem('user', JSON.stringify(data.user));
                                localStorage.setItem('token', data.token);
                                
                                showToast(`Đăng nhập thành công! Chào mừng ${data.user.full_name || data.user.email}!`, 'success');
                                modal.style.setProperty('display', 'none', 'important');
                                
                                if (typeof setupUserMenu === 'function') setupUserMenu();
                                if (typeof renderUserHeader === 'function') renderUserHeader();
                                
                                setTimeout(() => {
                                    window.location.reload();
                                }, 700);
                            } else {
                                const errorMsg = data.message || 'Mật khẩu không chính xác hoặc email chưa được đăng ký!';
                                showModalAlert(modal, errorMsg, 'error');
                                showToast(errorMsg, 'error');
                                
                                if (errorMsg.includes('Mật khẩu')) {
                                    passwordInput.classList.add('ring-2', 'ring-rose-500', 'border-rose-500');
                                    passwordInput.focus();
                                    passwordInput.select();
                                } else {
                                    emailInput.classList.add('ring-2', 'ring-rose-500', 'border-rose-500');
                                    emailInput.focus();
                                }
                            }
                        } catch (err) {
                            showModalAlert(modal, 'Lỗi kết nối máy chủ: ' + err.message, 'error');
                            showToast('Lỗi kết nối máy chủ. Vui lòng thử lại!', 'error');
                        } finally {
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = oldBtnHtml;
                            }
                        }
                    } else if (isRegister) {
                        const emailInput = form.querySelector('#register-email') || form.querySelector('input[type="email"]');
                        const passwordInput = form.querySelector('#register-password') || form.querySelectorAll('input[data-is-pwd="true"]')[0];
                        const confirmInput = form.querySelector('#register-confirm-password') || form.querySelectorAll('input[data-is-pwd="true"]')[1];
                        const nameInput = form.querySelector('#register-name') || form.querySelector('input[type="text"]');
                        if (!emailInput || !passwordInput) return;

                        const email = emailInput.value.trim();
                        const password = passwordInput.value;
                        const confirmPass = confirmInput ? confirmInput.value : '';
                        
                        if (!email || !password) {
                            showModalAlert(modal, 'Vui lòng điền đầy đủ họ tên, email và mật khẩu!', 'warning');
                            showToast('Vui lòng điền đầy đủ thông tin đăng ký!', 'warning');
                            if (!email) emailInput.focus();
                            else passwordInput.focus();
                            return;
                        }

                        if (password.length < 6) {
                            showModalAlert(modal, 'Mật khẩu phải có độ dài tối thiểu 6 ký tự!', 'warning');
                            showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'warning');
                            passwordInput.focus();
                            return;
                        }

                        if (confirmInput && confirmPass !== password) {
                            showModalAlert(modal, 'Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.', 'error');
                            showToast('Mật khẩu xác nhận không khớp!', 'error');
                            confirmInput.classList.add('ring-2', 'ring-rose-500', 'border-rose-500');
                            confirmInput.focus();
                            return;
                        }
                        
                        const full_name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : email.split('@')[0];
                        
                        const submitBtn = form.querySelector('button[type="submit"]');
                        const oldBtnHtml = submitBtn ? submitBtn.innerHTML : '';
                        if (submitBtn) {
                            submitBtn.disabled = true;
                            submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span><span>Đang tạo tài khoản...</span>';
                        }

                        try {
                            const res = await fetch('/api/users/register', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password, full_name })
                            });
                            const data = await res.json();
                            
                            if (data.success) {
                                clearModalAlert(modal);
                                localStorage.setItem('isLoggedIn', 'true');
                                localStorage.setItem('user', JSON.stringify(data.user));
                                localStorage.setItem('token', data.token);
                                
                                showToast(`Đăng ký tài khoản thành công! Chào mừng ${data.user.full_name || data.user.email}!`, 'success');
                                modal.style.setProperty('display', 'none', 'important');
                                
                                if (typeof setupUserMenu === 'function') setupUserMenu();
                                if (typeof renderUserHeader === 'function') renderUserHeader();
                                
                                setTimeout(() => {
                                    window.location.reload();
                                }, 700);
                            } else {
                                const errorMsg = data.message || 'Đăng ký thất bại. Email có thể đã tồn tại.';
                                showModalAlert(modal, errorMsg, 'error');
                                showToast(errorMsg, 'error');
                                
                                if (errorMsg.includes('đã tồn tại') || errorMsg.includes('exists')) {
                                    emailInput.classList.add('ring-2', 'ring-rose-500', 'border-rose-500');
                                    emailInput.focus();
                                }
                            }
                        } catch (err) {
                            showModalAlert(modal, 'Lỗi kết nối máy chủ: ' + err.message, 'error');
                            showToast('Lỗi kết nối máy chủ. Vui lòng thử lại!', 'error');
                        } finally {
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = oldBtnHtml;
                            }
                        }
                    } else if (isForgot) {
                        const emailInput = form.querySelector('#forgot-email') || form.querySelector('input[type="email"]');
                        const resultBox = modal.querySelector('#forgot-result-box');
                        const submitBtn = modal.querySelector('#forgot-submit-btn') || form.querySelector('button[type="submit"]');
                        const btnText = modal.querySelector('#forgot-btn-text');

                        if (!emailInput || !emailInput.value.trim()) {
                            showToast('Vui lòng nhập địa chỉ email đã đăng ký của bạn!', 'warning');
                            if (emailInput) {
                                emailInput.classList.add('ring-2', 'ring-rose-500', 'border-rose-500');
                                emailInput.focus();
                            }
                            return;
                        }

                        const email = emailInput.value.trim();

                        if (submitBtn) submitBtn.disabled = true;
                        if (btnText) btnText.textContent = 'Đang gửi mật khẩu reset...';

                        try {
                            const res = await fetch('/api/users/forgot-password', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email })
                            });
                            const data = await res.json();

                            if (data.success) {
                                showToast(`Đã cấp lại mật khẩu mới cho ${data.email}!`, 'success');
                                if (resultBox) {
                                    resultBox.className = 'p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-left space-y-3 transition-all';
                                    resultBox.innerHTML = `
                                        <div class="flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400">
                                            <span class="material-symbols-outlined text-[22px] shrink-0 mt-0.5">check_circle</span>
                                            <div>
                                                <p class="font-semibold text-sm leading-tight">Đã cấp lại mật khẩu thành công!</p>
                                                <p class="text-[12px] opacity-90 mt-0.5 leading-relaxed">Mật khẩu mới đã được gửi về hòm thư <strong class="underline">${data.email}</strong> và đã kích hoạt trực tiếp trên hệ thống:</p>
                                            </div>
                                        </div>
                                        <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-outline-variant">
                                            <div>
                                                <span class="block text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Mật khẩu tạm thời</span>
                                                <span class="font-mono text-base font-bold text-primary-container tracking-wider select-all" id="temp-new-pass">${data.new_password}</span>
                                            </div>
                                            <button type="button" id="copy-temp-pass-btn" class="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-[12px] font-medium text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer">
                                                <span class="material-symbols-outlined text-[15px]">content_copy</span>
                                                <span id="copy-btn-label">Sao chép</span>
                                            </button>
                                        </div>
                                        <button type="button" id="forgot-login-now-btn" class="w-full py-2.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-sm font-semibold tracking-wide transition-all shadow flex items-center justify-center gap-2 cursor-pointer">
                                            <span class="material-symbols-outlined text-[18px]">login</span>
                                            <span>Đăng nhập ngay với mật khẩu mới</span>
                                        </button>
                                    `;
                                    resultBox.classList.remove('hidden');

                                    // Bind copy button
                                    const copyBtn = resultBox.querySelector('#copy-temp-pass-btn');
                                    if (copyBtn) {
                                        copyBtn.onclick = () => {
                                            navigator.clipboard.writeText(data.new_password);
                                            const label = resultBox.querySelector('#copy-btn-label');
                                            if (label) {
                                                label.textContent = 'Đã chép!';
                                                setTimeout(() => { label.textContent = 'Sao chép'; }, 2000);
                                            }
                                            showToast('Đã sao chép mật khẩu mới!', 'info');
                                        };
                                    }

                                    // Bind login now button
                                    const loginNowBtn = resultBox.querySelector('#forgot-login-now-btn');
                                    if (loginNowBtn) {
                                        loginNowBtn.onclick = () => {
                                            openModal('login-modal');
                                            const loginEmail = document.getElementById('login-email') || document.querySelector('#login-modal input[type="email"]');
                                            const loginPass = document.getElementById('login-password') || document.querySelector('#login-modal input[data-is-pwd="true"]');
                                            if (loginEmail) loginEmail.value = data.email;
                                            if (loginPass) loginPass.value = data.new_password;
                                        };
                                    }
                                }
                            } else {
                                const errorMsg = data.message || 'Không tìm thấy tài khoản với email này trong hệ thống!';
                                showToast(errorMsg, 'error');
                                if (resultBox) {
                                    resultBox.className = 'p-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-left space-y-1.5 transition-all';
                                    resultBox.innerHTML = `
                                        <div class="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                                            <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                                            <div class="text-[12px] leading-relaxed">
                                                <strong class="font-semibold block">Không tìm thấy tài khoản</strong>
                                                <span>${errorMsg}</span>
                                            </div>
                                        </div>
                                    `;
                                    resultBox.classList.remove('hidden');
                                }
                            }
                        } catch (apiErr) {
                            showToast('Lỗi kết nối đến máy chủ. Vui lòng thử lại!', 'error');
                        } finally {
                            if (submitBtn) submitBtn.disabled = false;
                            if (btnText) btnText.textContent = 'Gửi mật khẩu reset về Email';
                        }
                    } else {
                        // Other forms
                        modal.style.setProperty('display', 'none', 'important');
                    }
                } catch (err) {
                    showToast('Lỗi: ' + err.message, 'error');
                }
            };
        });

        // 5. Handle links inside modal (Register, Forgot, Login)
        // ONLY target explicit <a> links that are NOT buttons and NOT inside submit/action buttons!
        const modalLinks = modal.querySelectorAll('a');
        modalLinks.forEach(link => {
            // NEVER touch buttons or elements inside buttons!
            if (link.closest('button') || link.type === 'submit') return;

            // Skip external links or real navigations
            const href = link.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('javascript:')) return;

            const text = link.textContent.trim();
            if (text.includes('Tạo tài khoản') || text.includes('Đăng ký') || text.includes('Đăng Ký') || text.includes('Sign Up')) {
                link.style.cursor = 'pointer';
                link.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal('register-modal');
                };
            }
            else if (text.includes('Quên mật khẩu') || text.includes('Quên Mật Khẩu') || text.includes('Forgot Password')) {
                link.style.cursor = 'pointer';
                link.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal('forgot-modal');
                };
            }
            else if (text.includes('Đăng nhập') || text.includes('Đăng Nhập') || text.includes('Log In') || text.includes('Quay lại')) {
                link.style.cursor = 'pointer';
                link.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal('login-modal');
                };
            }
        });

        // 6. Ensure close buttons inside this modal work (exclude submit buttons)
        const closeBtns = Array.from(modal.querySelectorAll('button:not([type="submit"])')).filter(btn => {
            const icon = btn.querySelector('.material-symbols-outlined');
            return (icon && icon.textContent.trim() === 'close') || btn.getAttribute('title')?.toLowerCase().includes('close') || btn.getAttribute('title')?.toLowerCase().includes('đóng');
        });
        closeBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                modal.style.setProperty('display', 'none', 'important');
                const iframe = modal.querySelector('#mobile-demo-iframe');
                if (iframe) iframe.src = 'about:blank';
            };
        });
        
        // Ensure standard string close buttons also work (strictly exclude submit buttons)
        const textCloseBtns = Array.from(modal.querySelectorAll('button:not([type="submit"])')).filter(b => {
            const t = b.textContent.trim().toLowerCase();
            return t === 'close' || t === 'đóng' || t === 'cancel' || t === 'back to hub';
        });
        textCloseBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                modal.style.setProperty('display', 'none', 'important');
                const iframe = modal.querySelector('#mobile-demo-iframe');
                if (iframe) iframe.src = 'about:blank';
            };
        });
    }

    function closeMobileDemoModal() {
        const modal = document.getElementById('mobile-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.setProperty('display', 'none', 'important');
            const iframe = document.getElementById('mobile-demo-iframe');
            if (iframe) iframe.src = 'about:blank';
        }
    }
    window.closeMobileDemoModal = closeMobileDemoModal;

    function reloadMobileDemo() {
        const iframe = document.getElementById('mobile-demo-iframe');
        if (iframe && iframe.src && iframe.src !== 'about:blank') {
            iframe.src = iframe.src;
        }
    }
    window.reloadMobileDemo = reloadMobileDemo;

    function openMobileDemoFullscreen() {
        const iframe = document.getElementById('mobile-demo-iframe');
        if (iframe && iframe.src && iframe.src !== 'about:blank') {
            window.open(iframe.src, '_blank');
        }
    }
    window.openMobileDemoFullscreen = openMobileDemoFullscreen;

    function setDeviceViewport(device) {
        const frame = document.getElementById('phoneDeviceFrame');
        const island = document.getElementById('mobileDynamicIsland');
        const screen = document.getElementById('mobile-screen-container');
        const iframe = document.getElementById('mobile-demo-iframe');
        const btnIPhone = document.getElementById('btnDeviceIPhone');
        const btnPixel = document.getElementById('btnDevicePixel');
        const btnIPad = document.getElementById('btnDeviceIPad');
        const deviceDesc = document.getElementById('mobile-modal-device-desc');
        
        const allBtns = [btnIPhone, btnPixel, btnIPad];
        allBtns.forEach(b => {
            if (b) {
                b.className = 'py-2 px-2 rounded-xl text-center font-label-sm text-[11px] font-medium bg-surface-container-low border border-outline-variant text-on-surface hover:bg-surface-container transition-all cursor-pointer';
            }
        });

        if (device === 'pixel') {
            if (btnPixel) btnPixel.className = 'py-2 px-2 rounded-xl text-center font-label-sm text-[11px] font-bold bg-primary text-white shadow-xs cursor-pointer';
            if (frame) {
                frame.style.width = '340px';
                frame.style.height = '670px';
                frame.style.borderRadius = '42px';
                frame.style.padding = '3.5px';
                frame.style.overflow = 'hidden';
            }
            if (screen) {
                screen.style.borderRadius = '38px';
                screen.style.overflow = 'hidden';
            }
            if (iframe) {
                iframe.style.borderRadius = 'inherit';
                iframe.style.overflow = 'hidden';
            }
            if (island) {
                island.style.display = 'flex';
                island.style.width = '14px';
                island.style.height = '14px';
                island.style.top = '10px';
                island.innerHTML = '<div class="w-2 h-2 rounded-full bg-[#1e293b]/90 border border-slate-700/60 m-auto"></div>';
            }
            if (deviceDesc) deviceDesc.textContent = 'Pixel 8 Pro (412 × 915 px) • AMOLED 120Hz';
        } else if (device === 'ipad') {
            if (btnIPad) btnIPad.className = 'py-2 px-2 rounded-xl text-center font-label-sm text-[11px] font-bold bg-primary text-white shadow-xs cursor-pointer';
            if (frame) {
                frame.style.width = '460px';
                frame.style.height = '640px';
                frame.style.borderRadius = '32px';
                frame.style.padding = '6px';
                frame.style.overflow = 'hidden';
            }
            if (screen) {
                screen.style.borderRadius = '26px';
                screen.style.overflow = 'hidden';
            }
            if (iframe) {
                iframe.style.borderRadius = 'inherit';
                iframe.style.overflow = 'hidden';
            }
            if (island) island.style.display = 'none';
            if (deviceDesc) deviceDesc.textContent = 'iPad Mini (744 × 1133 px) • Liquid Retina';
        } else {
            // iPhone default
            if (btnIPhone) btnIPhone.className = 'py-2 px-2 rounded-xl text-center font-label-sm text-[11px] font-bold bg-primary text-white shadow-xs cursor-pointer';
            if (frame) {
                frame.style.width = '335px';
                frame.style.height = '670px';
                frame.style.borderRadius = '50px';
                frame.style.padding = '3.5px';
                frame.style.overflow = 'hidden';
            }
            if (screen) {
                screen.style.borderRadius = '46px';
                screen.style.overflow = 'hidden';
            }
            if (iframe) {
                iframe.style.borderRadius = 'inherit';
                iframe.style.overflow = 'hidden';
            }
            if (island) {
                island.style.display = 'flex';
                island.style.width = '112px';
                island.style.height = '24px';
                island.style.top = '10px';
                island.innerHTML = '<div class="w-2.5 h-2.5 rounded-full bg-[#1e293b]/90 border border-slate-700/60"></div><div class="w-2 h-2 rounded-full bg-[#0a1120] border border-blue-900/40"></div>';
            }
            if (deviceDesc) deviceDesc.textContent = 'iPhone 15 Pro (393 × 852 px) • Super Retina XDR';
        }
    }
    window.setDeviceViewport = setDeviceViewport;

    // Initialize initial state if any
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('modal')) {
        openModal(urlParams.get('modal'));
    }
    
    // 5. Load Assets Dynamically
    async function loadAssets() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        try {
            const res = await fetch('/api/assets');
            const { data } = await res.json();
            window.allAssets = data;
            const assetCountEl = document.getElementById('assetCount');
            if (assetCountEl) {
                assetCountEl.textContent = data.length;
            }
            window.currentPage = 1;
            window.ITEMS_PER_PAGE = 6;
            renderPaginatedAssets();
        } catch (err) {
            console.error('Error fetching assets:', err);
        }
    }

    window.renderPaginatedAssets = function() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const startIndex = (window.currentPage - 1) * window.ITEMS_PER_PAGE;
        const endIndex = startIndex + window.ITEMS_PER_PAGE;
        const paginatedData = window.allAssets.slice(startIndex, endIndex);
        
        paginatedData.forEach(asset => {
            const article = document.createElement('article');
            article.className = "asset-card group bg-surface-container-lowest border border-outline-variant rounded-2xl p-space-md flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-secondary-container";
            article.dataset.id = asset.id;
            
            article.innerHTML = `
                <div>
                  <div class="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/60 mb-space-md">
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      alt="${asset.title}" src="${asset.thumbnail_url}">
                  </div>
                  <h2 class="font-title-lg text-title-lg text-on-surface font-semibold group-hover:text-primary-container transition-colors line-clamp-1 mb-1">
                    ${asset.title}
                  </h2>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    by <span class="font-medium text-on-surface">GiftSpace Creator</span> • Updated recently
                  </p>
                  <p class="font-body-sm text-body-sm text-on-surface mb-2 font-semibold">
                     Giá: ${asset.base_price.toFixed(2)}
                  </p>
                </div>
                <div class="flex items-center gap-space-sm pt-space-xs">
                  <div class="w-full flex flex-col gap-2">
                    <div class="grid grid-cols-2 gap-2">
                      <a href="${asset.demo_url || '#'}" target="_blank" class="web-demo-btn py-2 px-2 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors text-center font-medium flex items-center justify-center gap-1 cursor-pointer">
                        <span class="material-symbols-outlined text-[16px] text-outline">laptop_mac</span><span>Web Demo</span>
                      </a>
                      <button type="button" data-demo-url="${asset.demo_url || 'demo-lumina.html'}" class="mobile-demo-btn py-2 px-2 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors text-center font-medium flex items-center justify-center gap-1 cursor-pointer">
                        <span class="material-symbols-outlined text-[16px] text-outline">smartphone</span><span>Mobile Demo</span>
                      </button>
                    </div>
                    <button class="purchase-btn w-full py-2 px-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-label-md transition-colors text-center font-medium flex items-center justify-center gap-1.5 shadow-xs" type="button">
                      <span class="material-symbols-outlined text-[16px]">shopping_bag</span><span>Purchase</span>
                    </button>
                  </div>
                </div>
            `;
            grid.appendChild(article);
        });
        
        renderPaginationControls();
    }

    window.renderPaginationControls = function() {
        const container = document.getElementById('pagination-container');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        
        if (!container) return;
        
        container.innerHTML = '';
        const totalPages = Math.ceil(window.allAssets.length / window.ITEMS_PER_PAGE);
        
        if (totalPages <= 1) return;
        
        // Prev button
        const prevBtn = document.createElement('button');
        prevBtn.setAttribute('aria-label', 'Previous Page');
        prevBtn.className = "w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors";
        prevBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">chevron_left</span>';
        prevBtn.onclick = () => {
            if (window.currentPage > 1) {
                window.currentPage--;
                window.renderPaginatedAssets();
                document.getElementById('productGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        if (window.currentPage === 1) prevBtn.style.opacity = '0.3';
        container.appendChild(prevBtn);
        
        // Pages
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            if (i === window.currentPage) {
                pageBtn.className = "w-8 h-8 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold flex items-center justify-center shadow-xs";
            } else {
                pageBtn.className = "w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md font-medium hover:bg-surface-container-low transition-colors flex items-center justify-center";
                pageBtn.onclick = () => {
                    window.currentPage = i;
                    window.renderPaginatedAssets();
                    document.getElementById('productGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
            }
            container.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.setAttribute('aria-label', 'Next Page');
        nextBtn.className = "w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors";
        nextBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">chevron_right</span>';
        nextBtn.onclick = () => {
            if (window.currentPage < totalPages) {
                window.currentPage++;
                window.renderPaginatedAssets();
                document.getElementById('productGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        if (window.currentPage === totalPages) nextBtn.style.opacity = '0.3';
        container.appendChild(nextBtn);
    }
    
    loadAssets();
});
