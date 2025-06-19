'use client';

import { Bell, BellDot, Check, CheckCircle2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Notification } from '@prisma/client';
import { Button } from './ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';

export function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        const res = await fetch(`/api/notifications?userId=${userId}`);
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    }, [userId]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsReadAndDelete = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE'
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const markAllAsReadAndDelete = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId })
            });
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to delete all notifications:', error);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className='p-1 w-full'>
                    <Button variant="ghost" className="relative w-full justify-start font-normal text-xs">
                        {unreadCount > 0 ? (
                            <BellDot className="h-5 w-5" />
                        ) : (
                            <Bell className="h-5 w-5" />
                        )}
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -left-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                        Notifications
                    </Button>
                </div>
            </SheetTrigger>
            <SheetContent side="right" className="w-[350px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <ScrollArea className="max-h-[80vh] rounded-md border">
                    {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-center">Tidak ada notifikasi</p>
                    ) : (
                        <ul>
                            {notifications.map((notification) => (
                                <li
                                    key={notification.id}
                                    className={`p-3 border-b flex justify-between items-start ${!notification.isRead ? 'bg-card' : ''}`}
                                >
                                    <div className="flex-1">
                                        <h4 className="font-medium">{notification.title}</h4>
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:text-primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsReadAndDelete(notification.id);
                                        }}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </ScrollArea>
                {notifications.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-500 hover:text-blue-700"
                        onClick={markAllAsReadAndDelete}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark all as read & clear
                    </Button>
                )}
            </SheetContent>
        </Sheet>
    );
}