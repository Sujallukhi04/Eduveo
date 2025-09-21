import { Button } from "@/components/ui/button";
import Logo from "@/lib/logo";
import { ArrowRight, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./providers/auth";

const Navbar = () => {
  const { isAuthenticated, login, logout, user } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="dark:bg-dark-background/70 dark:border-dark-border fixed start-0 top-0 z-20 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
        <div className="flex items-center gap-2">
          {/* <MobileNav /> */}
          <Link to="/" className="flex items-center ">
            <Logo className="h-11 w-11 pt-2" />
            <span className="self-center whitespace-nowrap text-3xl font-semibold dark:text-white">
              study<span className="text-primary">wise</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {/* <div className="hidden justify-center gap-11 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              className="hover:border-b-2 hover:border-green-600 hover:text-primary"
              href={href}
            >
              {label}
            </Link>
          ))}
        </div> */}

        {/* Action Buttons */}
        <div className="flex space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
          <div className="flex gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span>{user?.name}</span>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                className="flex items-center gap-2"
                onClick={() => navigate("/login")}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
