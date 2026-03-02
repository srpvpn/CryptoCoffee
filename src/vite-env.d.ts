/// <reference types="vite/client" />

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isRabby?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    solana?: {
      isPhantom?: boolean;
      isSolflare?: boolean;
      publicKey: unknown;
      connect: () => Promise<unknown>;
      signAndSendTransaction: (transaction: unknown) => Promise<{ signature?: string }>;
    };
    solflare?: {
      isPhantom?: boolean;
      isSolflare?: boolean;
      publicKey: unknown;
      connect: () => Promise<unknown>;
      signAndSendTransaction: (transaction: unknown) => Promise<{ signature?: string }>;
    };
  }
}

export {};
