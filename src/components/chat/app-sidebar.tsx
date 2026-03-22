"use client";

import React, { memo, useMemo, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { chatHomePath, chatPath } from "@/lib/chat-routes";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/use-subscription";
import { useTheme } from "next-themes";
import { useUser } from "@stackframe/stack";
import Link from "next/link";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatItem {
  id: string;
  title: string;
  createdAt: Date;
  isPinned: boolean;
}

interface AppSidebarProps {
  activeChatId?: string | null;
  onNewChat?: () => void;
  onChatSelect?: (chatId: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const groupChatsByDate = (chats: ChatItem[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: { label: string; chats: ChatItem[] }[] = [];
  const todayChats: ChatItem[] = [];
  const yesterdayChats: ChatItem[] = [];
  const thisWeekChats: ChatItem[] = [];
  const olderChats: ChatItem[] = [];

  chats.forEach((chat) => {
    const chatDate = new Date(chat.createdAt);
    const chatDay = new Date(
      chatDate.getFullYear(),
      chatDate.getMonth(),
      chatDate.getDate(),
    );

    if (chatDay.getTime() === today.getTime()) {
      todayChats.push(chat);
    } else if (chatDay.getTime() === yesterday.getTime()) {
      yesterdayChats.push(chat);
    } else if (chatDay > weekAgo) {
      thisWeekChats.push(chat);
    } else {
      olderChats.push(chat);
    }
  });

  if (todayChats.length > 0) groups.push({ label: "Today", chats: todayChats });
  if (yesterdayChats.length > 0)
    groups.push({ label: "Yesterday", chats: yesterdayChats });
  if (thisWeekChats.length > 0)
    groups.push({ label: "Last 7 Days", chats: thisWeekChats });
  if (olderChats.length > 0) groups.push({ label: "Older", chats: olderChats });

  return groups;
};

// ---------------------------------------------------------------------------
// Theme selector (used inside user dropdown)
// ---------------------------------------------------------------------------
const themes = [
  { value: "system", label: "Sys", colors: ["#F9F9F9", "#6B5B4F", "#E8DFD5"] },
  { value: "light", label: "Light", colors: ["#FAFAFA", "#6B5B4F", "#EBE0C8"] },
  { value: "dark", label: "Dark", colors: ["#1A1A1A", "#E8D5A3", "#3A3020"] },
  { value: "colourful", label: "Color", colors: ["#3D3428", "#C4A96A", "#5A4D3A"] },
  { value: "t3chat", label: "T3", colors: ["#2A1F35", "#9B2B5A", "#4A2D5A"] },
  { value: "claudedark", label: "CD", colors: ["#352F28", "#C07A3E", "#2A2520"] },
  { value: "claudelight", label: "CL", colors: ["#F5F0E8", "#B86030", "#E8DDD0"] },
  { value: "neutrallight", label: "NL", colors: ["#FFFFFF", "#BF6E35", "#F1F1F1"] },
  { value: "neutraldark", label: "ND", colors: ["#252525", "#9C5B2C", "#434343"] },
];

// ---------------------------------------------------------------------------
// UserDropdownContent
// ---------------------------------------------------------------------------
function UserDropdownContent() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const user = useUser();
  const router = useRouter();

  const userName = user?.displayName ?? "User";
  const userEmail = user?.primaryEmail ?? "";

  return (
    <>
      <DropdownMenuLabel className="py-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold leading-none">{userName}</p>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        {/* Settings */}
        <DropdownMenuItem
          onSelect={() => {
            router.push("/settings");
          }}
        >
          <Icon icon="solar:settings-linear" width={16} height={16} />
          <span>Settings</span>
        </DropdownMenuItem>

        {/* Theme accordion */}
        <div>
          <button
            onClick={() => setThemeOpen((prev) => !prev)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-default"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 20 20"
              className="shrink-0 rounded-[3px] overflow-hidden"
            >
              <rect
                width="20"
                height="20"
                fill={
                  themes.find((t) => t.value === currentTheme)?.colors[0] ||
                  "#1A1A1A"
                }
              />
              <circle
                cx="7"
                cy="10"
                r="4"
                fill={
                  themes.find((t) => t.value === currentTheme)?.colors[1] ||
                  "#E8D5A3"
                }
              />
              <rect
                x="12"
                y="6"
                width="6"
                height="8"
                rx="1.5"
                fill={
                  themes.find((t) => t.value === currentTheme)?.colors[2] ||
                  "#3A3020"
                }
              />
            </svg>
            <span className="text-sm">Theme</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              width={14}
              height={14}
              className={cn(
                "ml-auto text-muted-foreground transition-transform duration-200",
                themeOpen && "rotate-180",
              )}
            />
          </button>
          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              themeOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <div
                className={cn(
                  "flex flex-col gap-0.5 pt-1 pb-0.5 ml-[17px] pl-3 border-l border-border/60 transition-colors duration-200",
                  themeOpen ? "border-border/60" : "border-transparent",
                )}
              >
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "w-full flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-left transition-colors duration-150",
                      currentTheme === t.value
                        ? "bg-accent/50 text-foreground"
                        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                    )}
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      className="shrink-0 rounded-[4px] border border-border/50 overflow-hidden"
                    >
                      <rect width="20" height="20" fill={t.colors[0]} />
                      <circle cx="7" cy="10" r="4" fill={t.colors[1]} />
                      <rect
                        x="12"
                        y="6"
                        width="6"
                        height="8"
                        rx="1.5"
                        fill={t.colors[2]}
                      />
                    </svg>
                    <span className="text-xs font-medium">{t.label}</span>
                    {currentTheme === t.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Sign Out */}
      <DropdownMenuItem onSelect={() => user?.signOut()}>
        <Icon icon="solar:logout-2-linear" width={16} height={16} />
        <span>Sign Out</span>
      </DropdownMenuItem>
    </>
  );
}

// ---------------------------------------------------------------------------
// ChatItemRow -- a single chat entry with hover actions
// ---------------------------------------------------------------------------
function ChatItemRow({
  chat,
  isActive,
  onSelect,
  onPrefetch,
  onRename,
  onDelete,
  onTogglePin,
}: {
  chat: ChatItem;
  isActive: boolean;
  onSelect: () => void;
  onPrefetch: () => void;
  onRename: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <SidebarMenuItem>
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (!open) triggerRef.current?.blur();
        }}
      >
        <div
          className={cn(
            "group flex items-center w-full rounded-md transition-all duration-200",
            isActive || menuOpen ? "bg-primary/15" : "hover:bg-primary/8",
          )}
        >
          <button
            onClick={onSelect}
            onMouseEnter={onPrefetch}
            onFocus={onPrefetch}
            className={cn(
              "flex items-center gap-2 flex-1 min-w-0 px-2 py-1 text-left",
              isActive && "font-medium",
            )}
          >
            <span className="truncate flex-1 text-sm">
              {chat.title || "Untitled Chat"}
            </span>
          </button>
          <DropdownMenuTrigger asChild>
            <Button
              ref={triggerRef}
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-60 hover:opacity-100 text-muted-foreground hover:text-foreground bg-transparent! shrink-0 mr-1 transition-opacity duration-150 focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon icon="solar:menu-dots-bold" className="h-4 w-4" />
              <span className="sr-only">Open chat actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={20}>
            <DropdownMenuItem onClick={onTogglePin}>
              {chat.isPinned ? (
                <Icon icon="solar:pin-linear" className="h-4 w-4 rotate-45" />
              ) : (
                <Icon icon="solar:pin-linear" className="h-4 w-4" />
              )}
              {chat.isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRename}>
              <Icon icon="solar:pen-linear" className="h-4 w-4" />
              Edit title
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Icon icon="solar:trash-bin-trash-linear" className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------
export const AppSidebar = memo(function AppSidebar({
  activeChatId,
  onNewChat,
  onChatSelect,
}: AppSidebarProps) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();
  const { isProUser, isLoading: isSubscriptionLoading } = useSubscription();

  const userName = user?.displayName ?? "User";
  const userEmail = user?.primaryEmail ?? "";
  const userImage = user?.profileImageUrl || undefined;

  // ---- Real Convex data ----
  const chatsData = useQuery(api.chats.listChats);
  const renameMutation = useMutation(api.chats.updateChatTitle);
  const deleteMutation = useMutation(api.chats.deleteChat);
  const togglePinMutation = useMutation(api.chats.togglePin);

  const chats: ChatItem[] = (chatsData ?? []).map((c) => ({
    id: c._id,
    title: c.title,
    createdAt: new Date(c.createdAt),
    isPinned: c.isPinned,
  }));
  const isLoading = chatsData === undefined;

  // ---- Rename state ----
  const [renameTarget, setRenameTarget] = useState<ChatItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // ---- Delete state ----
  const [deleteTarget, setDeleteTarget] = useState<ChatItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Recent collapsed ----
  const [isRecentCollapsed, setIsRecentCollapsed] = useState(false);
  const prefetchedChatPathsRef = React.useRef(new Set<string>());

  // Close mobile sidebar helper
  const closeMobileSidebar = useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  // ---- Derived data ----
  const pinnedChats = useMemo(() => chats.filter((c) => c.isPinned), [chats]);
  const unpinnedChats = useMemo(
    () => chats.filter((c) => !c.isPinned),
    [chats],
  );
  const groupedChats = useMemo(
    () => groupChatsByDate(unpinnedChats),
    [unpinnedChats],
  );

  // ---- Handlers ----
  const handleChatSelect = useCallback(
    (chatId: string) => {
      closeMobileSidebar();
      router.push(chatPath(chatId));
      onChatSelect?.(chatId);
    },
    [closeMobileSidebar, onChatSelect, router],
  );

  const prefetchChatRoute = useCallback(
    (chatId: string) => {
      const path = chatPath(chatId);
      if (prefetchedChatPathsRef.current.has(path)) return;

      try {
        router.prefetch(path);
        prefetchedChatPathsRef.current.add(path);
      } catch {}
    },
    [router],
  );

  const handleNewChat = useCallback(() => {
    closeMobileSidebar();
    if (!user) {
      router.push("/sign-in");
      return;
    }
    onNewChat?.();
    router.push(chatHomePath);
  }, [closeMobileSidebar, onNewChat, user, router]);

  const handleTogglePin = useCallback(
    (chatId: string) => {
      togglePinMutation({ chatId: chatId as Id<"chats"> });
    },
    [togglePinMutation],
  );

  const openRenameDialog = useCallback((chat: ChatItem) => {
    setRenameTarget(chat);
    setRenameValue(chat.title);
  }, []);

  const closeRenameDialog = useCallback(() => {
    setRenameTarget(null);
    setRenameValue("");
  }, []);

  const handleRenameSubmit = useCallback(async () => {
    if (!renameTarget) return;
    const next = renameValue.trim();
    if (!next) return;

    setIsRenaming(true);
    try {
      await renameMutation({ chatId: renameTarget.id as Id<"chats">, title: next });
    } finally {
      setIsRenaming(false);
      closeRenameDialog();
    }
  }, [renameTarget, renameValue, closeRenameDialog, renameMutation]);

  const openDeleteDialog = useCallback((chat: ChatItem) => {
    setDeleteTarget(chat);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMutation({ chatId: deleteTarget.id as Id<"chats"> });
      if (pathname?.includes(deleteTarget.id)) {
        router.replace(chatHomePath);
      }
    } finally {
      setIsDeleting(false);
      closeDeleteDialog();
    }
  }, [deleteTarget, closeDeleteDialog, deleteMutation, pathname, router]);

  // ---- Render helpers ----
  const renderChatItem = useCallback(
    (chat: ChatItem) => {
      const isActive = activeChatId === chat.id || pathname?.includes(chat.id);
      return (
        <ChatItemRow
          key={chat.id}
          chat={chat}
          isActive={Boolean(isActive)}
          onSelect={() => handleChatSelect(chat.id)}
          onPrefetch={() => prefetchChatRoute(chat.id)}
          onRename={() => openRenameDialog(chat)}
          onDelete={() => openDeleteDialog(chat)}
          onTogglePin={() => handleTogglePin(chat.id)}
        />
      );
    },
    [
      activeChatId,
      pathname,
      handleChatSelect,
      prefetchChatRoute,
      openRenameDialog,
      openDeleteDialog,
      handleTogglePin,
    ],
  );

  return (
    <Sidebar
      collapsible="icon"
      className="shadow-none! border-none! **:data-[slot=sidebar-inner]:light:bg-primary/10 **:data-[slot=sidebar-inner]:dark:bg-primary/4 **:data-[slot=sidebar-inner]:text-sidebar-foreground **:data-[slot=sidebar-gap]:bg-transparent"
    >
      {/* ----------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ----------------------------------------------------------------- */}
      <SidebarHeader className="p-0! pt-1! pb-1!">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="relative flex items-center group-data-[collapsible=icon]:justify-center w-full h-10 px-2 overflow-visible">
              <Button
                variant="ghost"
                className="h-auto w-fit group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center py-1 px-2 justify-start hover:bg-primary/10!"
                onClick={handleNewChat}
              >
                <div className="inline-flex items-center gap-1.5 w-fit group-data-[collapsible=icon]:justify-center">
                  <div className="flex items-center justify-center size-5 group-data-[collapsible=icon]:mx-auto shrink-0 transition-all duration-200">
                    <img
                      src="/Black.svg"
                      alt="OneGPT"
                      className="size-5 logo-dark"
                    />
                    <img
                      src="/white.svg"
                      alt="OneGPT"
                      className="size-5 hidden logo-light"
                    />
                  </div>
                  <div className="flex flex-row items-center gap-2 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold tracking-tight text-lg">
                      OneGPT
                    </span>
                  </div>
                </div>
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ----------------------------------------------------------------- */}
      {/* Static nav (New Chat + Recent label)                              */}
      {/* ----------------------------------------------------------------- */}
      <SidebarGroup className="p-2 pt-0 pb-0 gap-0 shrink-0">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
          {/* New Chat */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New Chat"
              className="bg-primary/10 hover:bg-primary/20 text-sidebar-accent-foreground font-medium transition-all duration-200 active:scale-[0.98] group-data-[collapsible=icon]:justify-center"
              onClick={handleNewChat}
            >
              <span className="text-lg leading-none">+</span>
              <span className="group-data-[collapsible=icon]:hidden">
                New Chat
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Recent section label */}
        <button
          type="button"
          onClick={() => setIsRecentCollapsed((prev) => !prev)}
          className="px-2 pt-4 pb-1 group-data-[collapsible=icon]:hidden flex w-full items-center justify-between text-left text-muted-foreground/80 hover:text-foreground transition-colors"
          aria-expanded={!isRecentCollapsed}
        >
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">
            Recent
          </span>
          <Icon
            icon="solar:alt-arrow-down-linear"
            className={cn(
              "h-3 w-3 transition-transform duration-150",
              isRecentCollapsed ? "-rotate-90" : "rotate-0",
            )}
          />
        </button>
      </SidebarGroup>

      {/* ----------------------------------------------------------------- */}
      {/* Scrollable chat list                                              */}
      {/* ----------------------------------------------------------------- */}
      <SidebarContent className="p-2 pt-0">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
          {!isRecentCollapsed && (
            <div className="group-data-[collapsible=icon]:hidden">
              {isLoading && chats.length === 0 ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <SidebarMenuItem key={`chat-skeleton-${index}`}>
                    <div
                      className="flex items-center w-full gap-2 rounded-md px-2 py-1.5 animate-pulse"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Skeleton className="h-4 flex-1 bg-primary/10 rounded" />
                    </div>
                  </SidebarMenuItem>
                ))
              ) : chats.length > 0 ? (
                <>
                  {/* Pinned chats */}
                  {pinnedChats.length > 0 && (
                    <div className="mb-1">
                      <div className="px-2 py-0.5">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.12em]">
                          Pinned
                        </span>
                      </div>
                      {pinnedChats.map(renderChatItem)}
                    </div>
                  )}

                  {/* Date-grouped chats */}
                  {groupedChats.map((group) => (
                    <div key={group.label} className="mb-1">
                      <div className="px-2 py-0.5">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.12em]">
                          {group.label}
                        </span>
                      </div>
                      {group.chats.map(renderChatItem)}
                    </div>
                  ))}
                </>
              ) : (
                <SidebarMenuItem>
                  <div className="px-2 py-1.5">
                    <span className="text-sm text-sidebar-foreground/50">
                      No chats yet
                    </span>
                  </div>
                </SidebarMenuItem>
              )}
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>

      {/* ----------------------------------------------------------------- */}
      {/* Upgrade to Pro card (free users only)                             */}
      {/* ----------------------------------------------------------------- */}
      {user && !isProUser && !isSubscriptionLoading && (
        <SidebarGroup className="p-0 mt-auto">
          <SidebarGroupContent>
            {/* Expanded state */}
            <div className="group-data-[collapsible=icon]:hidden px-3 pb-2">
              <Link
                prefetch={true}
                href="/pricing"
                onClick={() => isMobile && setOpenMobile(false)}
                className="relative flex flex-col gap-1.5 rounded-xl p-4 pb-3 bg-muted hover:bg-muted/80 transition-colors overflow-hidden group/upgrade"
              >
                <span className="text-base font-medium">Upgrade to Pro</span>
                <span className="text-xs text-muted-foreground pr-12">
                  Unlimited searches, 40+ models & higher rate limits
                </span>
                <div className="absolute -bottom-2 -right-2 flex items-center justify-center size-14 rounded-full bg-background group-hover/upgrade:scale-110 transition-transform duration-300">
                  <Icon
                    icon="solar:crown-bold"
                    className="text-foreground"
                    width={22}
                    height={22}
                  />
                </div>
              </Link>
            </div>

            {/* Collapsed state */}
            <div className="hidden group-data-[collapsible=icon]:block pb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    prefetch={true}
                    href="/pricing"
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="flex items-center justify-center size-8 mx-auto rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Icon
                      icon="solar:crown-bold"
                      className="text-foreground"
                      width={16}
                      height={16}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Upgrade to Pro
                </TooltipContent>
              </Tooltip>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Footer - User account dropdown                                    */}
      {/* ----------------------------------------------------------------- */}
      <SidebarFooter className="group-data-[collapsible=icon]:border-none border-t border-border p-0 gap-0">
        <SidebarMenu className="gap-0">
          <SidebarMenuItem>
            {user ? (
              <>
                {/* Expanded state */}
                <div className="group-data-[collapsible=icon]:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex w-full items-center justify-between gap-2 px-3 py-4 text-left outline-hidden ring-0 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-0 active:bg-primary/20 active:text-sidebar-accent-foreground">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                            {userImage && <AvatarImage src={userImage} />}
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                              {userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-0.5 leading-none flex-1 min-w-0 items-start">
                            <span className="font-semibold text-sm truncate text-sidebar-foreground text-left w-full">
                              {userName}
                            </span>
                            <span className="text-xs text-sidebar-foreground/70 truncate text-left w-full">
                              {userEmail}
                            </span>
                          </div>
                        </div>
                        <Icon
                          icon="solar:sort-vertical-linear"
                          className="h-4 w-4 shrink-0 opacity-50"
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      align="center"
                      className="w-62"
                      sideOffset={4}
                      collisionPadding={{ bottom: 20 }}
                    >
                      <UserDropdownContent />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Collapsed state - avatar only */}
                <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 p-0 overflow-visible"
                      >
                        <Avatar className="h-6 w-6 overflow-hidden rounded-full">
                          {userImage && <AvatarImage src={userImage} />}
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                            {userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="end"
                      className="w-60"
                    >
                      <UserDropdownContent />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                {/* Sign In button - expanded state */}
                <div className="group-data-[collapsible=icon]:hidden px-2 py-3">
                  <button
                    onClick={() => router.push("/sign-in")}
                    className="flex w-full items-center px-5 py-2.5 rounded-xl text-left outline-hidden transition-colors hover:bg-sidebar-accent active:bg-primary/20"
                  >
                    <div className="flex flex-col gap-0.5 leading-none flex-1 min-w-0">
                      <span className="font-semibold text-sm text-sidebar-foreground">
                        Sign In
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        FREE - NO CREDIT CARD
                      </span>
                    </div>
                  </button>
                </div>

                {/* Sign In button - collapsed state */}
                <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center py-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 p-0"
                        onClick={() => router.push("/sign-in")}
                      >
                        <Icon
                          icon="ph:user-plus"
                          width={18}
                          height={18}
                          className="text-primary"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Sign In</TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* ----------------------------------------------------------------- */}
      {/* Rename Dialog                                                     */}
      {/* ----------------------------------------------------------------- */}
      <Dialog
        open={Boolean(renameTarget)}
        onOpenChange={(open) => {
          if (!open) closeRenameDialog();
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Edit title</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRenameSubmit();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  closeRenameDialog();
                }
              }}
              maxLength={100}
              placeholder="Enter title..."
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRenameDialog}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={isRenaming}>
              {isRenaming ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------------------------------------------------- */}
      {/* Delete Confirmation                                               */}
      {/* ----------------------------------------------------------------- */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title || "this chat"}
              </span>{" "}
              and all of its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
});

AppSidebar.displayName = "AppSidebar";
