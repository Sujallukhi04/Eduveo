import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/lib/logo";
import {
  getCurrentPushSubscription,
  registerPushNotifications,
  unregisterPushNotification,
} from "@/lib/notification/push-service";
import { Bell, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "./providers/auth";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { UserAvatar } from "./UserAvatar";
import { toast } from "sonner";

const Navbar = () => {
  const { user, logout } = useAuth(); // Get logout from useAuth
  const [isLoading, setIsLoading] = useState(false);
  const [hasActivePushSubscription, setHasActivePushSubscription] =
    useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from the context
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    async function getActivePushSubscription() {
      try {
        const subscription = await getCurrentPushSubscription();
        setHasActivePushSubscription(!!subscription);
      } catch (error) {
        console.error("Error fetching push subscription:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getActivePushSubscription();
  }, []);

  async function setPushNotificationEnabled(enabled: boolean) {
    setIsToggling(true);
    try {
      if (enabled) {
        await registerPushNotifications();
        toast.success("Push notifications enabled", {
          closeButton: true,
        });
      } else {
        await unregisterPushNotification();
        toast.success("Push notifications disabled", {
          closeButton: true,
        });
      }
      setHasActivePushSubscription(enabled);
    } catch (error) {
      console.error("Error toggling push notification:", error);
      if (enabled && Notification.permission === "denied") {
        toast.warning(
          "Please enable push notifications in your browser settings"
        );
      } else {
        toast.error("Something went wrong, please try again later", {
          closeButton: true,
        });
      }
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <nav className="dark:bg-dark-background/70 dark:border-dark-border fixed start-0 top-0 z-[50] w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <Logo className="h-11 w-11 pt-2" />
            <span className="self-center whitespace-nowrap text-3xl font-semibold dark:text-white">
              study<span className="text-primary">wise</span>
            </span>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 md:order-2 md:space-x-4 rtl:space-x-reverse mr-2">
          <div className="hidden md:block lg:block">
            <ModeToggle />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              {user ? (
                <UserAvatar
                  user={{
                    name: user.name || "User",
                    avatar: user.picture || undefined,
                    userId: user.email || "default",
                  }}
                  size={36}
                />
              ) : (
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="flex items-center justify-between"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </div>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Switch
                    checked={hasActivePushSubscription}
                    onCheckedChange={setPushNotificationEnabled}
                    disabled={isToggling}
                  />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
