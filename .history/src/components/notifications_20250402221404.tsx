"use client";

import { useEffect } from "react";
import { 
  Bell, 
  Check,
  Bug,
  Trash2,
  X
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTaskNotifications } from "@/features/tasks/hooks/use-task-notifications";
import { ScrollArea, ScrollAreaViewport, Scrollbar } from "@radix-ui/react-scroll-area";

export const Notifications = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    addNotification,
    clearAllNotifications,
    removeNotification
  } = useTaskNotifications();
  
  const unreadCount = getUnreadCount();

  // Listen for storage events to refresh notifications
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'notifications') {
        window.location.reload();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    console.log('Notifications component rendered with:', { 
      notificationsCount: notifications.length, 
      unreadCount 
    });
  }, [notifications, unreadCount]);

  const testNotification = () => {
    addNotification('This is a test notification', 'test-task-id');
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button 
        variant="secondary" 
        size="icon" 
        onClick={testNotification} 
        className="mr-2"
        title="Add test notification"
      >
        <Bug className="h-5 w-5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <ScrollArea className="h-full max-h-[300px] overflow-hidden">
          {/* <ScrollAreaViewport className="w-full"> */}
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllNotifications}
                  className="text-xs text-destructive hover:text-destructive ml-2"
                  title="Clear all notifications"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Clear all
                </Button>
              )}
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs ml-[-9px]"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start py-2 px-4 cursor-pointer",
                      !notification.read && "bg-muted/50"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex w-full justify-between">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <div className="flex items-center ml-2">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 "
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-4 w-4 hover:icon-affirmative" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destruct"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              )}
        </DropdownMenuContent>
            {/* </ScrollAreaViewport> */}
            <Scrollbar orientation="vertical"/>
          </ScrollArea>
      </DropdownMenu>
    </div>
  );
}; 