
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simple math challenge
  const num1 = 5;
  const num2 = 3;
  const correctAnswer = num1 + num2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }
    
    // Verify math challenge
    if (parseInt(mathAnswer) !== correctAnswer) {
      setError("Incorrect math answer. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const success = await login(email, password);

      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back to ISHOWCRYPTO!",
        });
        navigate("/dashboard");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md border-border/40 bg-crypto-darker">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mathChallenge">Math Challenge: What is {num1} + {num2}?</Label>
              <Input
                id="mathChallenge"
                type="number"
                placeholder="Enter your answer"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-crypto-green hover:bg-crypto-green/90 text-black font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-crypto-green hover:text-crypto-green/90 font-medium"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
