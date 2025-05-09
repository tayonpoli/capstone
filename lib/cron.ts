import { checkStockNotifications } from './notification';

export async function runScheduledTasks() {
    // Cek stok setiap hari jam 8 pagi
    if (new Date().getHours() === 8) {
        await checkStockNotifications();
    }
}