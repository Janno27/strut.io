"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Settings,
  Shield,
  Bell,
  Palette,
} from "lucide-react";
import { AccountTab } from "./account-tab";
import { SettingsTab } from "./settings-tab";
import { SecurityTab } from "./security-tab";
import { NotificationsTab } from "./notifications-tab";
import { PreferencesTab } from "./preferences-tab";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "account" | "settings";
}

type TabType = "account" | "settings" | "security" | "notifications" | "preferences";

export function AccountSettingsModal({ 
  isOpen, 
  onClose, 
  defaultTab = "account" 
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const tabs = [
    {
      id: "account" as TabType,
      label: "Compte",
      icon: User,
    },
    {
      id: "settings" as TabType,
      label: "Paramètres",
      icon: Settings,
    },
    {
      id: "security" as TabType,
      label: "Sécurité",
      icon: Shield,
    },
    {
      id: "notifications" as TabType,
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "preferences" as TabType,
      label: "Préférences",
      icon: Palette,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountTab />;
      case "settings":
        return <SettingsTab />;
      case "security":
        return <SecurityTab />;
      case "notifications":
        return <NotificationsTab />;
      case "preferences":
        return <PreferencesTab />;
      default:
        return <AccountTab />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[75vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-48 bg-muted/30 border-r flex flex-col">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-left text-sm">Paramètres</DialogTitle>
            </DialogHeader>
            
            <nav className="flex-1 p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-2 py-1.5 text-left rounded-md transition-colors text-sm ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 