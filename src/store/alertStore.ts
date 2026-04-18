import { create } from "zustand";

export type AlertIntent = "info" | "success" | "warning" | "danger";
export type AlertType = "alert" | "confirm" | "prompt";

export interface AlertConfig {
  title?: string;
  message: string;
  intent?: AlertIntent;
  
  // Prompt specifics
  defaultValue?: string;
  inputType?: string; // "text" | "password" | "email"
  placeholder?: string;
}

interface AlertStoreState {
  isOpen: boolean;
  type: AlertType;
  config: AlertConfig;
  resolver: ((value: any) => void) | null;
  
  // Actions to trigger modals
  showAlert: (config: AlertConfig | string) => Promise<void>;
  showConfirm: (config: AlertConfig | string) => Promise<boolean>;
  showPrompt: (config: AlertConfig | string) => Promise<string | null>;
  
  // Actions utilized by AlertModal component internally
  resolveAndClose: (value: any) => void;
}

const defaultConfig: AlertConfig = {
  message: "",
  intent: "info"
};

export const useAlertStore = create<AlertStoreState>((set, get) => ({
  isOpen: false,
  type: "alert",
  config: defaultConfig,
  resolver: null,

  showAlert: (config) => {
    return new Promise<void>((resolve) => {
      const formattedConfig = typeof config === "string" ? { message: config, intent: "info" as AlertIntent } : { ...defaultConfig, ...config };
      set({ isOpen: true, type: "alert", config: formattedConfig, resolver: () => resolve() });
    });
  },

  showConfirm: (config) => {
    return new Promise<boolean>((resolve) => {
      const formattedConfig = typeof config === "string" ? { message: config, intent: "warning" as AlertIntent } : { ...defaultConfig, ...config };
      set({ isOpen: true, type: "confirm", config: formattedConfig, resolver: resolve });
    });
  },

  showPrompt: (config) => {
    return new Promise<string | null>((resolve) => {
      const formattedConfig = typeof config === "string" ? { message: config, intent: "info" as AlertIntent } : { ...defaultConfig, ...config };
      set({ isOpen: true, type: "prompt", config: formattedConfig, resolver: resolve });
    });
  },

  resolveAndClose: (value) => {
    const { resolver } = get();
    if (resolver) {
      resolver(value);
    }
    set({ isOpen: false, resolver: null });
  }
}));
