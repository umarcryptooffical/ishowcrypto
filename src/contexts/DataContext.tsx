import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type AirdropCategory = 
  'Layer 1 & Testnet Mainnet' | 
  'Telegram Bot Airdrops' | 
  'Daily Check-in Airdrops' | 
  'Twitter Airdrops' | 
  'Social Airdrops' | 
  'AI Airdrops' | 
  'Wallet Airdrops' | 
  'Exchange Airdrops';

export type TestnetCategory = 
  'Galxe Testnet' | 
  'Bridge Mining' | 
  'Mining Sessions';

export type ToolCategory = 
  'Wallet Connect' | 
  'Airdrop Claim Checker' | 
  'Gas Fee Calculator' | 
  'Testnet Token Faucets' | 
  'Crypto Wallet Extensions' | 
  'Swaps & Bridges';

export type VideoCategory = 
  'Crypto Series' | 
  'Top Testnets' | 
  'Mining Projects';

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
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const AIRDROPS_KEY = 'crypto_tracker_airdrops';
const TESTNETS_KEY = 'crypto_tracker_testnets';
const TOOLS_KEY = 'crypto_tracker_tools';
const VIDEOS_KEY = 'crypto_tracker_videos';

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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [testnets, setTestnets] = useState<Testnet[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedAirdrops = localStorage.getItem(AIRDROPS_KEY);
        const storedTestnets = localStorage.getItem(TESTNETS_KEY);
        const storedTools = localStorage.getItem(TOOLS_KEY);
        const storedVideos = localStorage.getItem(VIDEOS_KEY);

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
      }
    };

    loadData();
  }, [toast]);

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
      description: `"${airdrop.title}" has been added to your airdrops.`,
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
      description: `"${testnet.title}" has been added to your testnets.`,
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
      description: `"${tool.title}" has been added to your tools.`,
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
      description: `"${video.title}" has been added to your videos.`,
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

  return (
    <DataContext.Provider
      value={{
        airdrops,
        testnets,
        tools,
        videos,
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
