import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Rocket, FlaskConical, CheckSquare, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { airdrops, testnets } = useData();

  const userAirdrops = airdrops.filter(airdrop => airdrop.userId === user?.id || airdrop.userId === 'demo');
  const userTestnets = testnets.filter(testnet => testnet.userId === user?.id || testnet.userId === 'demo');
  
  const completedAirdrops = userAirdrops.filter(airdrop => airdrop.isCompleted).length;
  const activeTestnets = userTestnets.filter(testnet => !testnet.isCompleted).length;
  
  // Calculate overall progress
  const totalItems = userAirdrops.length + userTestnets.length;
  const completedItems = completedAirdrops + userTestnets.filter(testnet => testnet.isCompleted).length;
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // For daily tasks, we'll assume each testnet with < 100% progress has daily tasks
  const dailyTasks = userTestnets.filter(testnet => testnet.progress < 100).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{user?.username}</span>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6 border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>
            Track your overall completion and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card className="bg-secondary/30 border-border/40">
                <CardContent className="p-4 flex flex-col items-center">
                  <Rocket className="h-8 w-8 text-crypto-blue mb-2" />
                  <h3 className="text-xl font-bold">{userAirdrops.length}</h3>
                  <p className="text-sm text-muted-foreground">Total Airdrops</p>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary/30 border-border/40">
                <CardContent className="p-4 flex flex-col items-center">
                  <CheckSquare className="h-8 w-8 text-crypto-green mb-2" />
                  <h3 className="text-xl font-bold">{completedAirdrops}</h3>
                  <p className="text-sm text-muted-foreground">Completed Airdrops</p>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary/30 border-border/40">
                <CardContent className="p-4 flex flex-col items-center">
                  <FlaskConical className="h-8 w-8 text-crypto-purple mb-2" />
                  <h3 className="text-xl font-bold">{activeTestnets}</h3>
                  <p className="text-sm text-muted-foreground">Active Testnets</p>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary/30 border-border/40">
                <CardContent className="p-4 flex flex-col items-center">
                  <Clock className="h-8 w-8 text-crypto-yellow mb-2" />
                  <h3 className="text-xl font-bold">{dailyTasks}</h3>
                  <p className="text-sm text-muted-foreground">Daily Tasks</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Airdrops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Airdrops</CardTitle>
              <CardDescription>Your latest airdrop opportunities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/airdrops">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userAirdrops.slice(0, 3).map(airdrop => (
                <div key={airdrop.id} className="flex items-center p-3 rounded-md bg-secondary/30">
                  <div className={`w-2 h-2 rounded-full mr-3 ${airdrop.isCompleted ? 'bg-crypto-green' : 'bg-crypto-yellow'}`}></div>
                  <div className="flex-1">
                    <h4 className="font-medium truncate">{airdrop.title}</h4>
                    <p className="text-xs text-muted-foreground">{airdrop.category}</p>
                  </div>
                  <div className="text-xs bg-primary/20 px-2 py-1 rounded">
                    {airdrop.isCompleted ? 'Completed' : 'Active'}
                  </div>
                </div>
              ))}
              
              {userAirdrops.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No airdrops yet. Add your first one!</p>
                  <Button variant="outline" className="mt-2" asChild>
                    <Link to="/airdrops">Add Airdrop</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Testnets */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Testnet Progress</CardTitle>
              <CardDescription>Your active testnet participation</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/testnets">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTestnets.slice(0, 3).map(testnet => (
                <div key={testnet.id} className="p-3 rounded-md bg-secondary/30">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium flex-1 truncate">{testnet.title}</h4>
                    <span className="text-xs">{testnet.progress}%</span>
                  </div>
                  <Progress value={testnet.progress} className="h-1.5" />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{testnet.category}</p>
                    <p className="text-xs text-primary">{testnet.tasks.filter(t => t.isCompleted).length}/{testnet.tasks.length} tasks</p>
                  </div>
                </div>
              ))}
              
              {userTestnets.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No testnets yet. Add your first one!</p>
                  <Button variant="outline" className="mt-2" asChild>
                    <Link to="/testnets">Add Testnet</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
