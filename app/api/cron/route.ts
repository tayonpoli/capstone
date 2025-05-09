import { runScheduledTasks } from '@/lib/cron';

export async function GET() {
    await runScheduledTasks();
    return new Response('Cron jobs executed', { status: 200 });
}