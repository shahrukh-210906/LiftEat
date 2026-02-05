import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="glass-card p-8 text-center max-w-md w-full animate-fade-in">
        <h1 className="mb-2 text-6xl font-bold text-gradient">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button className="btn-primary-gradient w-full">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
