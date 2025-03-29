
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Rocket, Shield, Coins, Zap } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Crypto Ninja</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your ultimate platform for tracking crypto airdrops, testnets, and maximizing your Web3 opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/register">
                    Register Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/videos">
                    Browse Videos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-card rounded-lg p-6 border border-border/40 hover:border-primary/50 transition-colors glow-effect">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Airdrop Tracking</h3>
              <p className="text-muted-foreground">
                Track and organize all your crypto airdrops in one place.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border border-border/40 hover:border-primary/50 transition-colors glow-effect">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Testnet Progress</h3>
              <p className="text-muted-foreground">
                Monitor your testnet participation and completion status.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border border-border/40 hover:border-primary/50 transition-colors glow-effect">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Crypto Tools</h3>
              <p className="text-muted-foreground">
                Access essential tools for your crypto journey.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border border-border/40 hover:border-primary/50 transition-colors glow-effect">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Video Tutorials</h3>
              <p className="text-muted-foreground">
                Learn strategies and tips through our curated videos.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-crypto-darker">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to supercharge your crypto journey?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our platform to track airdrops, testnets, and stay ahead in the crypto space.
          </p>
          
          {!isAuthenticated && (
            <Button size="lg" asChild>
              <Link to="/register">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
