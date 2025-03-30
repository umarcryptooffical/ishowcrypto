import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type AirdropCategory = string;
export type TestnetCategory = string;
export type ToolCategory = string;
export type VideoCategory = string;

export type AirdropLink = {
  id: string;
  name: string;
  url: string;
};

export type Airdrop = {
  id: string;
  userId: string;
  title: string;
  category: AirdropCategory;
  description: string;
  links: AirdropLink[];
  fundingAmount: string;
  rewards: string;
  timeCommitment: string;
  workRequired: string;
  isCompleted: boolean;
  isPinned: boolean;
  createdAt: number;
};

export type AirdropRanking = {
  id: string;
  rank: number;
  title: string;
  description: string;
  fundingAmount: string;
  rewards: string;
  rating: number; // 1-5 stars
  detailsLink?: string;
  isPinned: boolean;
  createdAt: number;
};

export type TestnetTask = {
  id: string;
  name: string;
  url: string;
  isCompleted: boolean;
};

export type Testnet = {
  id: string;
  userId: string;
  title: string;
  category: TestnetCategory;
  description: string;
  progress: number;
  rewards: string;
  tasks: TestnetTask[];
  isCompleted: boolean;
  isPinned: boolean;
  createdAt: number;
};

export type Tool = {
  id: string;
  userId: string;
  title: string;
  category: ToolCategory;
  description: string;
  url: string;
  createdAt: number;
};

export type Video = {
  id: string;
  userId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: VideoCategory;
  isPinned: boolean;
  createdAt: number;
};

type DataContextType = {
  airdrops: Airdrop[];
  testnets: Testnet[];
  tools: Tool[];
  videos: Video[];
  rankings: AirdropRanking[];
  addAirdrop: (airdrop: Omit<Airdrop, 'id' | 'userId' | 'createdAt'>) => void;
  updateAirdrop: (id: string, airdrop: Partial<Airdrop>) => void;
  deleteAirdrop: (id: string) => void;
  addTestnet: (testnet: Omit<Testnet, 'id' | 'userId' | 'createdAt'>) => void;
  updateTestnet: (id: string, testnet: Partial<Testnet>) => void;
  deleteTestnet: (id: string) => void;
  updateTestnetTask: (testnetId: string, taskId: string, isCompleted: boolean) => void;
  addTool: (tool: Omit<Tool, 'id' | 'userId' | 'createdAt'>) => void;
  updateTool: (id: string, tool: Partial<Tool>) => void;
  deleteTool: (id: string) => void;
  addVideo: (video: Omit<Video, 'id' | 'userId' | 'createdAt'>) => void;
  updateVideo: (id: string, video: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  addRanking: (ranking: Omit<AirdropRanking, 'id' | 'createdAt'>) => void;
  updateRanking: (id: string, ranking: Partial<AirdropRanking>) => void;
  deleteRanking: (id: string) => void;
  refreshData: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const AIRDROPS_KEY = 'crypto_tracker_airdrops';
const TESTNETS_KEY = 'crypto_tracker_testnets';
const TOOLS_KEY = 'crypto_tracker_tools';
const VIDEOS_KEY = 'crypto_tracker_videos';
const RANKINGS_KEY = 'crypto_tracker_rankings';
const LAST_REFRESH_KEY = 'crypto_tracker_last_refresh';

const demoAirdrops: Airdrop[] = [
  {
    id: '1',
    userId: 'demo',
    title: 'Arbitrum Airdrop',
    category: 'Layer 1 & Testnet Mainnet',
    description: 'Complete tasks on Arbitrum network to qualify for ARB token airdrop.',
    links: [
      { id: '1', name: 'Official Website', url: 'https://arbitrum.io/' },
      { id: '2', name: 'Bridge ETH to Arbitrum', url: 'https://bridge.arbitrum.io/' },
    ],
    fundingAmount: '$675M',
    rewards: 'Up to 10,000 ARB tokens',
    timeCommitment: '2 weeks',
    workRequired: 'Bridge assets, swap tokens, provide liquidity',
    isCompleted: false,
    isPinned: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: '2',
    userId: 'demo',
    title: 'LayerZero Quest',
    category: 'Social Airdrops',
    description: 'Complete social media tasks and on-chain activities for potential LayerZero airdrop.',
    links: [
      { id: '1', name: 'Galxe Campaign', url: 'https://galxe.com' },
      { id: '2', name: 'LayerZero Docs', url: 'https://docs.layerzero.network/' },
    ],
    fundingAmount: 'Unknown',
    rewards: 'Estimated 500-2000 ZRO tokens',
    timeCommitment: '1-2 hours',
    workRequired: 'Follow Twitter, join Discord, complete bridge transactions',
    isCompleted: false,
    isPinned: false,
    createdAt: Date.now() - 86400000,
  },
];

const demoTestnets: Testnet[] = [
  {
    id: '1',
    userId: 'demo',
    title: 'Taiko Testnet',
    category: 'Galxe Testnet',
    description: 'Participate in Taiko L2 rollup testnet activities.',
    progress: 60,
    rewards: 'Potential TAIKO token airdrop',
    tasks: [
      { id: '1', name: 'Bridge ETH to Taiko', url: 'https://bridge.test.taiko.xyz', isCompleted: true },
      { id: '2', name: 'Swap tokens on TaikoSwap', url: 'https://swap.test.taiko.xyz', isCompleted: true },
      { id: '3', name: 'Deploy a smart contract', url: 'https://docs.taiko.xyz', isCompleted: false },
    ],
    isCompleted: false,
    isPinned: true,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: '2',
    userId: 'demo',
    title: 'Linea Voyage',
    category: 'Mining Sessions',
    description: 'Complete tasks on Linea network to earn points and qualify for potential airdrop.',
    progress: 25,
    rewards: 'Estimated 300-1000 LINEA tokens',
    tasks: [
      { id: '1', name: 'Bridge to Linea', url: 'https://bridge.linea.build/', isCompleted: true },
      { id: '2', name: 'Mint Linea Voyage NFT', url: 'https://voyage.linea.build/', isCompleted: false },
      { id: '3', name: 'Complete week 1 tasks', url: 'https://galxe.com/linea', isCompleted: false },
      { id: '4', name: 'Complete week 2 tasks', url: 'https://galxe.com/linea', isCompleted: false },
    ],
    isCompleted: false,
    isPinned: false,
    createdAt: Date.now() - 86400000 * 2,
  },
];

const demoTools: Tool[] = [
  {
    id: '1',
    userId: 'demo',
    title: 'DeBank',
    category: 'Wallet Connect',
    description: 'Track your DeFi portfolio across multiple chains.',
    url: 'https://debank.com/',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: '2',
    userId: 'demo',
    title: 'Etherscan',
    category: 'Gas Fee Calculator',
    description: 'Explore and analyze Ethereum blockchain.',
    url: 'https://etherscan.io/',
    createdAt: Date.now() - 86400000 * 3,
  },
];

const demoVideos: Video[] = [
  {
    id: '1',
    userId: 'demo',
    title: 'How to Qualify for Arbitrum Airdrop',
    description: 'A step-by-step guide to maximize your chances for the Arbitrum airdrop.',
    thumbnailUrl: 'https://i.ytimg.com/vi/gxP33axk8yY/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=gxP33axk8yY',
    category: 'Crypto Series',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: '2',
    userId: 'demo',
    title: 'ZKSync Era Testnet Tutorial',
    description: 'Complete guide to participate in ZKSync Era testnet and earn potential rewards.',
    thumbnailUrl: 'https://i.ytimg.com/vi/Z3-XgvG_z9U/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=Z3-XgvG_z9U',
    category: 'Top Testnets',
    isPinned: false,
    createdAt: Date.now() - 86400000 * 2,
  },
];

const demoRankings: AirdropRanking[] = [
  {
    id: '1',
    rank: 1,
    title: 'Arbitrum',
    description: 'Ethereum Layer 2 scaling solution with strong ecosystem.',
    fundingAmount: '$120M',
    rewards: 'Up to 12,500 ARB tokens',
    rating: 5,
    detailsLink: 'https://arbitrum.io/',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: '2',
    rank: 2,
    title: 'LayerZero',
    description: 'Cross-chain interoperability protocol.',
    fundingAmount: '$85M',
    rewards: 'Estimated 2000-5000 ZRO tokens',
    rating: 4.5,
    detailsLink: 'https://layerzero.network/',
    isPinned: false,
    createdAt: Date.now() - 86400000,
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, awardAchievement } = useAuth();
  const { toast } = useToast();
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [testnets, setTestnets] = useState<Testnet[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [rankings, setRankings] = useState<AirdropRanking[]>([]);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedAirdrops = localStorage.getItem(AIRDROPS_KEY);
        const storedTestnets = localStorage.getItem(TESTNETS_KEY);
        const storedTools = localStorage.getItem(TOOLS_KEY);
        const storedVideos = localStorage.getItem(VIDEOS_KEY);
        const storedRankings = localStorage.getItem(RANKINGS_KEY);
        const storedLastRefresh = localStorage.getItem(LAST_REFRESH_KEY);

        if (!storedAirdrops) {
          localStorage.setItem(AIRDROPS_KEY, JSON.stringify(demoAirdrops));
          setAirdrops(demoAirdrops);
        } else {
          setAirdrops(JSON.parse(storedAirdrops));
        }

        if (!storedTestnets) {
          localStorage.setItem(TESTNETS_KEY, JSON.stringify(demoTestnets));
          setTestnets(demoTestnets);
        } else {
          setTestnets(JSON.parse(storedTestnets));
        }

        if (!storedTools) {
          localStorage.setItem(TOOLS_KEY, JSON.stringify(demoTools));
          setTools(demoTools);
        } else {
          setTools(JSON.parse(storedTools));
        }

        if (!storedVideos) {
          localStorage.setItem(VIDEOS_KEY, JSON.stringify(demoVideos));
          setVideos(demoVideos);
        } else {
          setVideos(JSON.parse(storedVideos));
        }

        if (!storedRankings) {
          localStorage.setItem(RANKINGS_KEY, JSON.stringify(demoRankings));
          setRankings(demoRankings);
        } else {
          setRankings(JSON.parse(storedRankings));
        }

        if (storedLastRefresh) {
          setLastRefresh(JSON.parse(storedLastRefresh));
        } else {
          const now = Date.now();
          localStorage.setItem(LAST_REFRESH_KEY, JSON.stringify(now));
          setLastRefresh(now);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading data",
          description: "There was an error loading your data. Using default data instead.",
          variant: "destructive",
        });
        
        setAirdrops(demoAirdrops);
        setTestnets(demoTestnets);
        setTools(demoTools);
        setVideos(demoVideos);
        setRankings(demoRankings);
      }
    };

    loadData();
  }, [toast]);

  useEffect(() => {
    const now = Date.now();
    const oneDayMs = 86400000; // 24 hours in ms
    
    if (now - lastRefresh > oneDayMs) {
      refreshData();
    }
    
    const checkInterval = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - lastRefresh > oneDayMs) {
        refreshData();
      }
    }, 3600000); // Check every hour
    
    return () => clearInterval(checkInterval);
  }, [lastRefresh]);

  useEffect(() => {
    if (airdrops && airdrops.length > 0) {
      localStorage.setItem(AIRDROPS_KEY, JSON.stringify(airdrops));
    }
  }, [airdrops]);

  useEffect(() => {
    if (testnets && testnets.length > 0) {
      localStorage.setItem(TESTNETS_KEY, JSON.stringify(testnets));
    }
  }, [testnets]);

  useEffect(() => {
    if (tools && tools.length > 0) {
      localStorage.setItem(TOOLS_KEY, JSON.stringify(tools));
    }
  }, [tools]);

  useEffect(() => {
    if (videos && videos.length > 0) {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
    }
  }, [videos]);

  useEffect(() => {
    if (rankings && rankings.length > 0) {
      localStorage.setItem(RANKINGS_KEY, JSON.stringify(rankings));
    }
  }, [rankings]);

  const addAirdrop = (newAirdrop: Omit<Airdrop, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const airdrop: Airdrop = {
      ...newAirdrop,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: Date.now(),
    };
    
    setAirdrops(prev => [...prev, airdrop]);
    toast({
      title: "Airdrop added",
      description: `"${airdrop.title}" has been added to your airdrops.",
    });
  };

  const updateAirdrop = (id: string, updatedFields: Partial<Airdrop>) => {
    setAirdrops(prev => 
      prev.map(airdrop => 
        airdrop.id === id 
          ? { ...airdrop, ...updatedFields } 
          : airdrop
      )
    );
    toast({
      title: "Airdrop updated",
      description: "Your changes have been saved.",
    });
  };

  const deleteAirdrop = (id: string) => {
    setAirdrops(prev => prev.filter(airdrop => airdrop.id !== id));
    toast({
      title: "Airdrop deleted",
      description: "The airdrop has been removed from your list.",
    });
  };

  const addTestnet = (newTestnet: Omit<Testnet, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const testnet: Testnet = {
      ...newTestnet,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: Date.now(),
    };
    
    setTestnets(prev => [...prev, testnet]);
    toast({
      title: "Testnet added",
      description: `"${testnet.title}" has been added to your testnets.",
    });
  };

  const updateTestnet = (id: string, updatedFields: Partial<Testnet>) => {
    setTestnets(prev => 
      prev.map(testnet => 
        testnet.id === id 
          ? { ...testnet, ...updatedFields } 
          : testnet
      )
    );
    toast({
      title: "Testnet updated",
      description: "Your changes have been saved.",
    });
  };

  const deleteTestnet = (id: string) => {
    setTestnets(prev => prev.filter(testnet => testnet.id !== id));
    toast({
      title: "Testnet deleted",
      description: "The testnet has been removed from your list.",
    });
  };

  const updateTestnetTask = (testnetId: string, taskId: string, isCompleted: boolean) => {
    setTestnets(prev => 
      prev.map(testnet => {
        if (testnet.id === testnetId) {
          const updatedTasks = testnet.tasks.map(task => 
            task.id === taskId ? { ...task, isCompleted } : task
          );
          
          const completedTasks = updatedTasks.filter(task => task.isCompleted).length;
          const progress = Math.round((completedTasks / updatedTasks.length) * 100);
          
          return {
            ...testnet,
            tasks: updatedTasks,
            progress,
            isCompleted: progress === 100,
          };
        }
        return testnet;
      })
    );
  };

  const addTool = (newTool: Omit<Tool, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const tool: Tool = {
      ...newTool,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: Date.now(),
    };
    
    setTools(prev => [...prev, tool]);
    toast({
      title: "Tool added",
      description: `"${tool.title}" has been added to your tools.",
    });
  };

  const updateTool = (id: string, updatedFields: Partial<Tool>) => {
    setTools(prev => 
      prev.map(tool => 
        tool.id === id 
          ? { ...tool, ...updatedFields } 
          : tool
      )
    );
    toast({
      title: "Tool updated",
      description: "Your changes have been saved.",
    });
  };

  const deleteTool = (id: string) => {
    setTools(prev => prev.filter(tool => tool.id !== id));
    toast({
      title: "Tool deleted",
      description: "The tool has been removed from your list.",
    });
  };

  const addVideo = (newVideo: Omit<Video, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const video: Video = {
      ...newVideo,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: Date.now(),
    };
    
    setVideos(prev => [...prev, video]);
    toast({
      title: "Video added",
      description: `"${video.title}" has been added to your videos.",
    });
  };

  const updateVideo = (id: string, updatedFields: Partial<Video>) => {
    setVideos(prev => 
      prev.map(video => 
        video.id === id 
          ? { ...video, ...updatedFields } 
          : video
      )
    );
    toast({
      title: "Video updated",
      description: "Your changes have been saved.",
    });
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
    toast({
      title: "Video deleted",
      description: "The video has been removed from your list.",
    });
  };

  const addRanking = (newRanking: Omit<AirdropRanking, 'id' | 'createdAt'>) => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can add rankings.",
        variant: "destructive",
      });
      return;
    }
    
    const ranking: AirdropRanking = {
      ...newRanking,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    
    setRankings(prev => {
      const updated = [...prev, ranking];
      return updated.sort((a, b) => a.rank - b.rank);
    });
    
    toast({
      title: "Ranking added",
      description: `"${ranking.title}" has been added to rankings.",
    });
  };

  const updateRanking = (id: string, updatedFields: Partial<AirdropRanking>) => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can update rankings.",
        variant: "destructive",
      });
      return;
    }
    
    setRankings(prev => {
      const updated = prev.map(ranking => 
        ranking.id === id 
          ? { ...ranking, ...updatedFields } 
          : ranking
      );
      return updated.sort((a, b) => a.rank - b.rank);
    });
    
    toast({
      title: "Ranking updated",
      description: "Your changes have been saved.",
    });
  };

  const deleteRanking = (id: string) => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can delete rankings.",
        variant: "destructive",
      });
      return;
    }
    
    setRankings(prev => prev.filter(ranking => ranking.id !== id));
    toast({
      title: "Ranking deleted",
      description: "The ranking has been removed.",
    });
  };

  const refreshData = () => {
    const now = Date.now();
    setLastRefresh(now);
    localStorage.setItem(LAST_REFRESH_KEY, JSON.stringify(now));
    
    setAirdrops(prev => prev.map(airdrop => {
      if (!airdrop.isCompleted && (now - airdrop.createdAt > 3 * 86400000) && Math.random() > 0.7) {
        const ranking = rankings.find(r => r.title === airdrop.title);
        if (ranking) {
          if (user && airdrop.userId === user.id) {
            awardAchievement({
              name: "Airdrop Completed",
              description: `You completed the ${airdrop.title} airdrop`,
              icon: "gift",
            });
          }
          return { ...airdrop, isCompleted: true };
        }
      }
      return airdrop;
    }));
    
    setTestnets(prev => prev.map(testnet => {
      if (!testnet.isCompleted) {
        const progressIncrement = Math.floor(Math.random() * 20);
        const newProgress = Math.min(100, testnet.progress + progressIncrement);
        const isNowCompleted = newProgress === 100;
        
        if (isNowCompleted && user && testnet.userId === user.id) {
          awardAchievement({
            name: "Testnet Mastery",
            description: `You completed the ${testnet.title} testnet`,
            icon: "flask",
          });
        }
        
        const updatedTasks = testnet.tasks.map((task, index) => {
          const shouldComplete = (index / testnet.tasks.length) * 100 < newProgress;
          return shouldComplete ? { ...task, isCompleted: true } : task;
        });
        
        return { 
          ...testnet, 
          progress: newProgress,
          tasks: updatedTasks,
          isCompleted: isNowCompleted
        };
      }
      return testnet;
    }));
    
    toast({
      title: "Data refreshed",
      description: "Your crypto data has been updated.",
    });
  };

  return (
    <DataContext.Provider
      value={{
        airdrops,
        testnets,
        tools,
        videos,
        rankings,
        addAirdrop,
        updateAirdrop,
        deleteAirdrop,
        addTestnet,
        updateTestnet,
        deleteTestnet,
        updateTestnetTask,
        addTool,
        updateTool,
        deleteTool,
        addVideo,
        updateVideo,
        deleteVideo,
        addRanking,
        updateRanking,
        deleteRanking,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
