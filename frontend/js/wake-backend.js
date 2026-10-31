/**
 * GiftSpace - Backend Keep-Alive & Auto Wake-Up Service
 * Tự động đánh thức và duy trì hoạt động cho server Render (tránh rơi vào chế độ ngủ sau 15 phút).
 */
(function () {
    const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 phút (Render Free ngủ sau 15 phút không có request)
    let lastPingTime = 0;
    let isPinging = false;

    async function wakeBackend(triggerReason = 'periodic') {
        if (isPinging) return;
        const now = Date.now();
        // Tránh ping dồn dập (tối thiểu cách nhau 60 giây trừ lần tải đầu)
        if (triggerReason !== 'initial' && (now - lastPingTime) < 60 * 1000) {
            return;
        }

        isPinging = true;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 giây timeout

            const response = await fetch('/api/health', {
                method: 'GET',
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                lastPingTime = Date.now();
                console.log(`[KeepAlive] 🟢 Backend Render đang hoạt động tốt (${triggerReason}).`);
            } else {
                console.warn(`[KeepAlive] 🟡 Backend phản hồi mã: ${response.status}`);
            }
        } catch (err) {
            // Khi Render đang thức dậy từ chế độ ngủ (cold-start), fetch có thể mất vài chục giây
            console.log(`[KeepAlive] ⏳ Đang đánh thức server Render (${triggerReason})...`);
        } finally {
            isPinging = false;
        }
    }

    // 1. Gửi ping đánh thức ngay khi người dùng mở trang web
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => wakeBackend('initial'));
    } else {
        wakeBackend('initial');
    }

    // 2. Định kỳ mỗi 10 phút gửi 1 ping để Render luôn duy trì trạng thái hoạt động
    setInterval(() => {
        wakeBackend('interval_10m');
    }, PING_INTERVAL_MS);

    // 3. Khi người dùng quay lại tab sau một khoảng thời gian
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            const timeSinceLastPing = Date.now() - lastPingTime;
            // Nếu đã quá 8 phút kể từ lần ping trước thì gửi ping ngay
            if (timeSinceLastPing > 8 * 60 * 1000) {
                wakeBackend('tab_focus');
            }
        }
    });

    window.wakeBackend = wakeBackend;
})();

