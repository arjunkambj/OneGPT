// biome-ignore-all lint/a11y/noSvgWithoutTitle: provider icons in this selector are decorative.
"use client";

import { Icon } from "@iconify/react";
import { Brain, Eye } from "@phosphor-icons/react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getFilteredModels,
  getModelProvider,
  isSupportedModel,
  type ModelProvider,
  type models,
  PROVIDERS,
  requiresMaxSubscription,
  requiresProSubscription,
} from "@/constant/ai-model";
import { useFavoriteModels } from "@/hooks/use-favorite-models";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// ─── Provider Icon Component ──────────────────────────────────────────────────
const ProviderIcon = ({
  provider,
  size = 18,
  className = "",
}: {
  provider: ModelProvider;
  size?: number;
  className?: string;
}) => {
  const iconProps = {
    width: size,
    height: size,
    className: cn("shrink-0", className),
  };

  switch (provider) {
    case "xai":
      return (
        <svg
          {...iconProps}
          className="shrink-0 size-4.5 p-0 m-0"
          fill="currentColor"
          viewBox="0 0 841.89 595.28"
        >
          <path d="m557.09 211.99 8.31 326.37h66.56l8.32-445.18zM640.28 56.91H538.72L379.35 284.53l50.78 72.52zM201.61 538.36h101.56l50.79-72.52-50.79-72.53zM201.61 211.99l228.52 326.37h101.56L303.17 211.99z" />
        </svg>
      );
    case "openai":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.392.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
      );
    case "anthropic":
      return (
        <svg
          {...iconProps}
          viewBox="0 0 24 24"
          fill="currentColor"
          fillRule="evenodd"
        >
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
        </svg>
      );
    case "google":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    case "alibaba":
      return (
        <svg
          {...iconProps}
          fill="currentColor"
          fillRule="evenodd"
          viewBox="0 0 24 24"
        >
          <path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z" />
        </svg>
      );
    case "deepseek":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 0 1 1.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 0 1 .415-.287.302.302 0 0 1 .2.288.306.306 0 0 1-.31.307.303.303 0 0 1-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 0 1-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 0 1 .016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 0 1-.254-.078.253.253 0 0 1-.114-.358c.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"
          />
        </svg>
      );
    case "zhipu":
      return (
        <svg
          {...iconProps}
          fill="currentColor"
          fillRule="evenodd"
          viewBox="0 0 24 24"
        >
          <path d="M12.105 2L9.927 4.953H.653L2.83 2h9.276zM23.254 19.048L21.078 22h-9.242l2.174-2.952h9.244zM24 2L9.264 22H0L14.736 2H24z" />
        </svg>
      );
    case "moonshot":
      return (
        <svg
          {...iconProps}
          fill="currentColor"
          fillRule="evenodd"
          viewBox="0 0 24 24"
        >
          <path d="M1.052 16.916l9.539 2.552a21.007 21.007 0 00.06 2.033l5.956 1.593a11.997 11.997 0 01-5.586.865l-.18-.016-.044-.004-.084-.009-.094-.01a11.605 11.605 0 01-.157-.02l-.107-.014-.11-.016a11.962 11.962 0 01-.32-.051l-.042-.008-.075-.013-.107-.02-.07-.015-.093-.019-.075-.016-.095-.02-.097-.023-.094-.022-.068-.017-.088-.022-.09-.024-.095-.025-.082-.023-.109-.03-.062-.02-.084-.025-.093-.028-.105-.034-.058-.019-.08-.026-.09-.031-.066-.024a6.293 6.293 0 01-.044-.015l-.068-.025-.101-.037-.057-.022-.08-.03-.087-.035-.088-.035-.079-.032-.095-.04-.063-.028-.063-.027a5.655 5.655 0 01-.041-.018l-.066-.03-.103-.047-.052-.024-.096-.046-.062-.03-.084-.04-.086-.044-.093-.047-.052-.027-.103-.055-.057-.03-.058-.032a6.49 6.49 0 01-.046-.026l-.094-.053-.06-.034-.051-.03-.072-.041-.082-.05-.093-.056-.052-.032-.084-.053-.061-.039-.079-.05-.07-.047-.053-.035a7.785 7.785 0 01-.054-.036l-.044-.03-.044-.03a6.066 6.066 0 01-.04-.028l-.057-.04-.076-.054-.069-.05-.074-.054-.056-.042-.076-.057-.076-.059-.086-.067-.045-.035-.064-.052-.074-.06-.089-.073-.046-.039-.046-.039a7.516 7.516 0 01-.043-.037l-.045-.04-.061-.053-.07-.062-.068-.06-.062-.058-.067-.062-.053-.05-.088-.084a13.28 13.28 0 01-.099-.097l-.029-.028-.041-.042-.069-.07-.05-.051-.05-.053a6.457 6.457 0 01-.168-.179l-.08-.088-.062-.07-.071-.08-.042-.049-.053-.062-.058-.068-.046-.056a7.175 7.175 0 01-.027-.033l-.045-.055-.066-.082-.041-.052-.05-.064-.02-.025a11.99 11.99 0 01-1.44-2.402zm-1.02-5.794l11.353 3.037a20.468 20.468 0 00-.469 2.011l10.817 2.894a12.076 12.076 0 01-1.845 2.005L.657 15.923l-.016-.046-.035-.104a11.965 11.965 0 01-.05-.153l-.007-.023a11.896 11.896 0 01-.207-.741l-.03-.126-.018-.08-.021-.097-.018-.081-.018-.09-.017-.084-.018-.094c-.026-.141-.05-.283-.071-.426l-.017-.118-.011-.083-.013-.102a12.01 12.01 0 01-.019-.161l-.005-.047a12.12 12.12 0 01-.034-2.145zm1.593-5.15l11.948 3.196c-.368.605-.705 1.231-1.01 1.875l11.295 3.022c-.142.82-.368 1.612-.668 2.365l-11.55-3.09L.124 10.26l.015-.1.008-.049.01-.067.015-.087.018-.098c.026-.148.056-.295.088-.442l.028-.124.02-.085.024-.097c.022-.09.045-.18.07-.268l.028-.102.023-.083.03-.1.025-.082.03-.096.026-.082.031-.095a11.896 11.896 0 011.01-2.232zm4.442-4.4L17.352 4.59a20.77 20.77 0 00-1.688 1.721l7.823 2.093c.267.852.442 1.744.513 2.665L2.106 5.213l.045-.065.027-.04.04-.055.046-.065.055-.076.054-.072.064-.086.05-.065.057-.073.055-.07.06-.074.055-.069.065-.077.054-.066.066-.077.053-.06.072-.082.053-.06.067-.074.054-.058.073-.078.058-.06.063-.067.168-.17.1-.098.059-.056.076-.071a12.084 12.084 0 012.272-1.677zM12.017 0h.097l.082.001.069.001.054.002.068.002.046.001.076.003.047.002.06.003.054.002.087.005.105.007.144.011.088.007.044.004.077.008.082.008.047.005.102.012.05.006.108.014.081.01.042.006.065.01.207.032.07.012.065.011.14.026.092.018.11.022.046.01.075.016.041.01L14.7.3l.042.01.065.015.049.012.071.017.096.024.112.03.113.03.113.032.05.015.07.02.078.024.073.023.05.016.05.016.076.025.099.033.102.036.048.017.064.023.093.034.11.041.116.045.1.04.047.02.06.024.041.018.063.026.04.018.057.025.11.048.1.046.074.035.075.036.06.028.092.046.091.045.102.052.053.028.049.026.046.024.06.033.041.022.052.029.088.05.106.06.087.051.057.034.053.032.096.059.088.055.098.062.036.024.064.041.084.056.04.027.062.042.062.043.023.017c.054.037.108.075.161.114l.083.06.065.048.056.043.086.065.082.064.04.03.05.041.086.069.079.065.085.071c.712.6 1.353 1.283 1.909 2.031L7.222.994l.062-.027.065-.028.081-.034.086-.035c.113-.045.227-.09.341-.131l.096-.035.093-.033.084-.03.096-.031c.087-.03.176-.058.264-.085l.091-.027.086-.025.102-.03.085-.023.1-.026L9.04.37l.09-.023.091-.022.095-.022.09-.02.098-.021.091-.02.095-.018.092-.018.1-.018.091-.016.098-.017.092-.014.097-.015.092-.013.102-.013.091-.012.105-.012.09-.01.105-.01c.093-.01.186-.018.28-.024l.106-.008.09-.005.11-.006.093-.004.1-.004.097-.002.099-.002.197-.002z" />
        </svg>
      );
    case "minimax":
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.43 3.92a.86.86 0 1 0-1.718 0v14.236a1.999 1.999 0 0 1-3.997 0V9.022a.86.86 0 1 0-1.718 0v3.87a1.999 1.999 0 0 1-3.997 0V11.49a.57.57 0 0 1 1.139 0v1.404a.86.86 0 0 0 1.719 0V9.022a1.999 1.999 0 0 1 3.997 0v9.134a.86.86 0 0 0 1.719 0V3.92a1.998 1.998 0 1 1 3.996 0v11.788a.57.57 0 1 1-1.139 0zm10.572 3.105a2 2 0 0 0-1.999 1.997v7.63a.86.86 0 0 1-1.718 0V3.923a1.999 1.999 0 0 0-3.997 0v16.16a.86.86 0 0 1-1.719 0V18.08a.57.57 0 1 0-1.138 0v2a1.998 1.998 0 0 0 3.996 0V3.92a.86.86 0 0 1 1.719 0v12.73a1.999 1.999 0 0 0 3.996 0V9.023a.86.86 0 1 1 1.72 0v6.686a.57.57 0 0 0 1.138 0V9.022a2 2 0 0 0-1.998-1.997" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

// ─── Sort helper (matches onegpt) ──────────────────────────────────────────────
function sortModelsForList(
  modelsToShow: Array<(typeof models)[0]>,
  options: { isProUser: boolean; isMaxUser: boolean },
) {
  if (modelsToShow.length === 0) return modelsToShow;

  const shouldSortFreeFirst = !options.isProUser || !options.isMaxUser;

  const newModels: Array<(typeof models)[0]> = [];
  const freeModels: Array<(typeof models)[0]> = [];
  const lockedModels: Array<(typeof models)[0]> = [];
  const regularModels: Array<(typeof models)[0]> = [];

  for (const model of modelsToShow) {
    if (model.isNew) {
      newModels.push(model);
      continue;
    }

    if (shouldSortFreeFirst) {
      const needsPro =
        requiresProSubscription(model.value) &&
        !options.isProUser &&
        !options.isMaxUser;
      const needsMax =
        requiresMaxSubscription(model.value) && !options.isMaxUser;
      const isLocked = needsPro || needsMax;
      if (isLocked) lockedModels.push(model);
      else freeModels.push(model);
      continue;
    }

    regularModels.push(model);
  }

  if (shouldSortFreeFirst)
    return [...newModels, ...freeModels, ...lockedModels];
  return [...newModels, ...regularModels];
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  isProUser?: boolean;
  isMaxUser?: boolean;
  excludeModels?: string[];
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ModelSelector({
  selectedModel,
  onModelChange,
  isProUser = false,
  isMaxUser = false,
  excludeModels = [],
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onClose,
}: ModelSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const nextValue =
        typeof value === "function"
          ? value(controlledOpen ?? internalOpen)
          : value;
      if (controlledOnOpenChange) {
        controlledOnOpenChange(nextValue);
      } else {
        setInternalOpen(nextValue);
      }
    },
    [controlledOpen, controlledOnOpenChange, internalOpen],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<
    ModelProvider | "favorites"
  >("favorites");
  const { favorites, toggleFavorite, isFavorite } = useFavoriteModels();
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const providerSidebarRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const modelListRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Cmd+M keyboard shortcut to toggle model selector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "m") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);

  // Get filtered models from centralized model config
  const availableModels = useMemo(() => {
    const filtered = getFilteredModels();
    return filtered.filter((model) => {
      if (!isSupportedModel(model.value)) {
        return false;
      }
      if (excludeModels.includes(model.value)) return false;
      return true;
    });
  }, [excludeModels]);

  // Get current model
  const currentModel = useMemo(
    () => availableModels.find((m) => m.value === selectedModel),
    [availableModels, selectedModel],
  );

  // Get active providers from available models
  const activeProviders = useMemo(() => {
    const providerSet = new Set<ModelProvider>();
    for (const model of availableModels) {
      const provider =
        model.provider || getModelProvider(model.value, model.label);
      providerSet.add(provider);
    }

    // Follow the canonical provider order defined in PROVIDERS.
    const providerOrder = Object.keys(PROVIDERS) as ModelProvider[];
    const ordered: ModelProvider[] = [];
    for (const p of providerOrder) {
      if (providerSet.has(p)) {
        ordered.push(p);
        providerSet.delete(p);
      }
    }
    ordered.push(...Array.from(providerSet));
    return ["favorites", ...ordered] as (ModelProvider | "favorites")[];
  }, [availableModels]);

  // Count models per provider
  const providerModelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    let favCount = 0;
    for (const model of availableModels) {
      const provider =
        model.provider || getModelProvider(model.value, model.label);
      counts[provider] = (counts[provider] || 0) + 1;
      if (favorites.includes(model.value)) favCount++;
    }
    counts.favorites = favCount;
    return counts;
  }, [availableModels, favorites]);

  // Providers manually flagged via PROVIDERS[x].hasNew
  const providersWithNewModels = useMemo(() => {
    const set = new Set<string>();
    for (const [key, info] of Object.entries(PROVIDERS)) {
      if (info.hasNew) set.add(key);
    }
    return set;
  }, []);

  // Filter models by provider
  const filteredByProvider = useMemo(() => {
    if (selectedProvider === "favorites") {
      return availableModels.filter((model) => favorites.includes(model.value));
    }
    return availableModels.filter((model) => {
      const provider =
        model.provider || getModelProvider(model.value, model.label);
      return provider === selectedProvider;
    });
  }, [availableModels, selectedProvider, favorites]);

  const sortedModelsForList = useMemo(
    () => sortModelsForList(filteredByProvider, { isProUser, isMaxUser }),
    [filteredByProvider, isProUser, isMaxUser],
  );

  // Search functionality
  const normalizeText = useCallback((input: string): string => {
    return input
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }, []);

  const displayModels = useMemo(() => {
    if (!searchQuery.trim()) return sortedModelsForList;

    const normalized = normalizeText(searchQuery);
    const tokens = normalized.split(/\s+/).filter(Boolean);

    const scored = sortedModelsForList.map((model) => {
      const providerKey =
        model.provider || getModelProvider(model.value, model.label);
      const providerName = PROVIDERS[providerKey]?.name || "";
      const aggregate = normalizeText(
        [
          model.label,
          model.description,
          model.category,
          providerName,
          model.value,
        ].join(" "),
      );
      let score = 0;
      if (aggregate.includes(normalized)) score += 5;
      for (const token of tokens) {
        if (aggregate.includes(token)) score += 1;
      }
      return { model, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aIsNew = a.model.isNew ? 1 : 0;
        const bIsNew = b.model.isNew ? 1 : 0;
        if (bIsNew !== aIsNew) return bIsNew - aIsNew;
        return a.model.label.localeCompare(b.model.label);
      })
      .map((item) => item.model);
  }, [normalizeText, searchQuery, sortedModelsForList]);

  // Reset focused index when search query or provider changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset focus when either filter input changes.
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, selectedProvider]);

  // When popover opens, focus the currently selected model
  useEffect(() => {
    if (open) {
      const idx = displayModels.findIndex((m) => m.value === selectedModel);
      setFocusedIndex(idx >= 0 ? idx : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [displayModels, open, selectedModel]);

  // Scroll focused model into view
  useEffect(() => {
    if (focusedIndex < 0 || !modelListRef.current) return;
    const items =
      modelListRef.current.querySelectorAll<HTMLElement>("[data-model-index]");
    const item = items[focusedIndex];
    if (item) {
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIndex]);

  // Keyboard handler for model list navigation + provider cycling
  const handleModelListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const count = displayModels.length;

      // ArrowLeft / ArrowRight cycle through provider tabs
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const providerCount = activeProviders.length;
        if (providerCount === 0) return;
        const currentIdx = activeProviders.indexOf(selectedProvider);
        let nextIdx: number;
        if (e.key === "ArrowLeft") {
          nextIdx = currentIdx > 0 ? currentIdx - 1 : providerCount - 1;
        } else {
          nextIdx = currentIdx < providerCount - 1 ? currentIdx + 1 : 0;
        }
        setSelectedProvider(activeProviders[nextIdx]);
        // Scroll the provider button into view
        if (providerSidebarRef.current) {
          const buttons =
            providerSidebarRef.current.querySelectorAll<HTMLElement>("button");
          buttons[nextIdx]?.scrollIntoView({
            block: "nearest",
            inline: "nearest",
            behavior: "smooth",
          });
        }
        return;
      }

      if (count === 0) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setFocusedIndex((prev) => (prev < count - 1 ? prev + 1 : 0));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : count - 1));
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < count) {
            const model = displayModels[focusedIndex];
            const needsPro =
              requiresProSubscription(model.value) && !isProUser && !isMaxUser;
            const needsMax = requiresMaxSubscription(model.value) && !isMaxUser;
            if (needsPro || needsMax) return;
            onModelChange(model.value);
            setOpen(false);
          }
          break;
        }
        case "Home": {
          e.preventDefault();
          setFocusedIndex(0);
          break;
        }
        case "End": {
          e.preventDefault();
          setFocusedIndex(count - 1);
          break;
        }
      }
    },
    [
      displayModels,
      focusedIndex,
      isProUser,
      isMaxUser,
      onModelChange,
      activeProviders,
      selectedProvider,
      setOpen,
    ],
  );

  // ─── Model card renderer (matches onegpt) ────────────────────────────────
  const renderModelCard = (model: (typeof models)[0], index: number) => {
    const reqPro =
      requiresProSubscription(model.value) && !isProUser && !isMaxUser;
    const reqMax = requiresMaxSubscription(model.value) && !isMaxUser;
    const isLocked = reqPro || reqMax;
    const modelProvider =
      model.provider || getModelProvider(model.value, model.label);
    const isSelected = selectedModel === model.value;
    const isFocused = focusedIndex === index;

    const handleClick = () => {
      if (isLocked) return;
      onModelChange(model.value);
      setOpen(false);
    };

    return (
      <div
        key={model.value}
        id={`mselector-option-${model.value}`}
        data-model-index={index}
        role="option"
        tabIndex={isFocused ? 0 : -1}
        aria-selected={isSelected}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onMouseEnter={() => setFocusedIndex(index)}
        className={cn(
          "group flex items-start gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer",
          "transition-all duration-150",
          isLocked
            ? "opacity-50 hover:opacity-75"
            : "hover:bg-accent/40 active:scale-[0.99]",
          isSelected && !isLocked && "bg-primary/6 dark:bg-primary/8",
          isFocused && !isLocked && "bg-accent/50 ring-1 ring-primary/20",
        )}
      >
        {/* Provider Icon */}
        <div
          className={cn(
            "shrink-0 mt-0.5 p-1.5 rounded-md transition-colors duration-150",
            isSelected
              ? "bg-primary/12 text-primary"
              : "bg-secondary/60 text-foreground/70 group-hover:bg-secondary/80",
          )}
        >
          <ProviderIcon
            provider={modelProvider}
            size={isMobile ? 16 : 14}
            className="text-inherit!"
          />
        </div>

        {/* Model Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "font-medium truncate transition-colors duration-150",
                isMobile ? "text-sm" : "text-xs",
                isSelected && "text-primary",
              )}
            >
              {model.label}
            </span>

            {reqMax && !isMaxUser && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 leading-none">
                MAX
              </span>
            )}
            {reqPro && !reqMax && !isProUser && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-primary/10 text-primary leading-none">
                PRO
              </span>
            )}
            {model.isNew && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 leading-none">
                NEW
              </span>
            )}
          </div>

          <p
            className={cn(
              "text-muted-foreground/70 truncate mt-0.5 leading-snug",
              isMobile ? "text-xs" : "text-[10px]",
            )}
          >
            {model.description}
          </p>
        </div>

        {/* Right side: capabilities + check */}
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <div className="flex items-center gap-0.5">
            {model.fast && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("p-0.5 rounded", isMobile && "p-1")}>
                    <Icon
                      icon="solar:bolt-linear"
                      className={cn(
                        "text-amber-500/70",
                        isMobile ? "size-3" : "size-2.5",
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Fast
                </TooltipContent>
              </Tooltip>
            )}
            {model.vision && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("p-0.5 rounded", isMobile && "p-1")}>
                    <Eye
                      className={cn(
                        "text-muted-foreground/50",
                        isMobile ? "size-3" : "size-2.5",
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Vision
                </TooltipContent>
              </Tooltip>
            )}
            {model.reasoning && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn("p-0.5 rounded", isMobile && "p-1")}>
                    <Brain
                      className={cn(
                        "text-muted-foreground/50",
                        isMobile ? "size-3" : "size-2.5",
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Reasoning
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Favorite Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(model.value);
                }}
                className={cn(
                  "p-1 rounded-md transition-all duration-150",
                  isFavorite(model.value)
                    ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                    : "text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-500/10",
                )}
              >
                <Icon
                  icon={
                    isFavorite(model.value)
                      ? "solar:star-bold"
                      : "solar:star-linear"
                  }
                  className={cn(isMobile ? "size-3.5" : "size-3")}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isFavorite(model.value)
                ? "Remove from favorites"
                : "Add to favorites"}
            </TooltipContent>
          </Tooltip>

          {/* Selected Check */}
          {isSelected && !isLocked && (
            <div className="size-4 rounded-full bg-primary flex items-center justify-center">
              <Icon
                icon="solar:check-read-linear"
                className="size-2.5 text-primary-foreground"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Content renderer with provider sidebar ────────────────────────────────
  const renderContent = () => (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex flex-1 min-h-0",
          isMobile ? "flex-col" : "flex-row h-full",
        )}
      >
        {/* Provider Sidebar */}
        <div
          className={cn(
            "shrink-0 border-border/50 relative",
            isMobile ? "flex flex-row border-b" : "flex flex-col w-10 border-r",
          )}
        >
          <div
            ref={providerSidebarRef}
            onScroll={(e) => {
              const target = e.currentTarget;
              const isAtBottom =
                target.scrollHeight - target.scrollTop <=
                target.clientHeight + 10;
              setShowScrollIndicator(!isAtBottom);
            }}
            className={cn(
              isMobile
                ? "flex flex-row gap-0.5 px-2 py-1.5 overflow-x-auto no-scrollbar"
                : "flex flex-col gap-0.5 p-1 overflow-y-auto flex-1 no-scrollbar",
            )}
          >
            {activeProviders.map((provider) => {
              const isFav = provider === "favorites";
              const isActive = selectedProvider === provider;
              const count = providerModelCounts[provider] || 0;
              const hasNew = !isFav && providersWithNewModels.has(provider);

              return (
                <Tooltip key={provider}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setSelectedProvider(provider)}
                      tabIndex={-1}
                      className={cn(
                        "relative flex items-center justify-center rounded-md transition-all duration-150",
                        isMobile ? "p-2 shrink-0" : "p-1.5 w-full",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent/60 text-muted-foreground/60 hover:text-foreground",
                      )}
                    >
                      {isFav ? (
                        <Icon
                          icon="solar:star-bold"
                          width={isMobile ? 16 : 14}
                          height={isMobile ? 16 : 14}
                        />
                      ) : (
                        <ProviderIcon
                          provider={provider as ModelProvider}
                          size={isMobile ? 16 : 14}
                        />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side={isMobile ? "bottom" : "left"}
                    className="text-xs"
                  >
                    {isFav
                      ? "Favorites"
                      : PROVIDERS[provider as ModelProvider]?.name}
                    {hasNew ? " (New Model!)" : ""} ({count})
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          {/* Scroll fade indicator - desktop only */}
          {!isMobile && showScrollIndicator && (
            <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none flex items-end justify-center pb-1 transition-opacity duration-300">
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
              <Icon
                icon="solar:alt-arrow-down-linear"
                className="size-3 text-muted-foreground/60 relative z-10 animate-bounce"
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex flex-col min-w-0 min-h-0 flex-1 overflow-hidden">
          {/* Search Bar */}
          <div className="px-2 pt-2 pb-1.5 shrink-0">
            <div className="relative">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50"
              />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleModelListKeyDown}
                role="combobox"
                aria-expanded={true}
                aria-controls="mselector-listbox"
                aria-activedescendant={
                  focusedIndex >= 0
                    ? `mselector-option-${displayModels[focusedIndex]?.value}`
                    : undefined
                }
                className={cn(
                  "w-full pl-8 pr-3 py-1.5 text-xs rounded-lg",
                  "bg-secondary/30 border border-border/40",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
                  "placeholder:text-muted-foreground/50",
                  "transition-[box-shadow,border-color] duration-200",
                )}
              />
            </div>
          </div>

          {/* Provider Header */}
          {selectedProvider === "favorites" ? (
            <div className="mx-2 mb-1 px-2 py-1.5 flex items-center gap-2 rounded-md bg-secondary/30 shrink-0">
              <Icon
                icon="solar:star-bold"
                width={13}
                height={13}
                className="text-amber-500"
              />
              <span className="text-[11px] font-medium text-muted-foreground">
                Favorites
              </span>
              <span className="text-[10px] text-muted-foreground/50 ml-auto">
                {providerModelCounts.favorites || 0} models
              </span>
            </div>
          ) : (
            <div className="mx-2 mb-1 px-2 py-1.5 flex items-center gap-2 rounded-md bg-secondary/30 shrink-0">
              <ProviderIcon
                provider={selectedProvider as ModelProvider}
                size={13}
                className="text-muted-foreground/70"
              />
              <span className="text-[11px] font-medium text-muted-foreground">
                {PROVIDERS[selectedProvider as ModelProvider]?.name}
              </span>
              <span className="text-[10px] text-muted-foreground/50 ml-auto">
                {providerModelCounts[selectedProvider] || 0} models
              </span>
            </div>
          )}

          {/* Model List */}
          <div
            ref={modelListRef}
            role="listbox"
            id="mselector-listbox"
            className="flex-1 overflow-y-auto px-1 py-0.5 min-h-0 no-scrollbar"
          >
            {displayModels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Icon
                  icon="solar:magnifer-linear"
                  className="size-5 text-muted-foreground/30"
                />
                <p className="text-xs text-muted-foreground/60">
                  No models found
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {searchQuery.trim() && (
                  <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                    Results
                  </div>
                )}
                {displayModels.map((model, index) =>
                  renderModelCard(model, index),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );

  // ─── Trigger button ────────────────────────────────────────────────────────
  const currentModelProvider =
    currentModel?.provider ||
    (currentModel
      ? getModelProvider(currentModel.value, currentModel.label)
      : undefined);

  // Stable trigger element — avoids re-creating a forwardRef component each
  // render, which caused React to unmount / remount and hurt open-perf.
  const triggerContent = children ? (
    children
  ) : (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="justify-between h-8 text-xs gap-2"
    >
      <div className="flex items-center gap-1.5 truncate">
        {currentModelProvider && (
          <ProviderIcon
            provider={currentModelProvider}
            size={13}
            className="text-foreground/70 shrink-0"
          />
        )}
        <span className="truncate">
          {currentModel?.label || "Select model"}
        </span>
      </div>
      <Icon
        icon="solar:alt-arrow-down-linear"
        className={cn(
          "h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-200",
          open && "rotate-180",
        )}
      />
    </Button>
  );

  // Fire onClose callback when the selector closes
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen && onClose) {
        requestAnimationFrame(() => {
          onClose();
        });
      }
    },
    [onClose, setOpen],
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {isMobile ? (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild>{triggerContent}</DrawerTrigger>
          <DrawerContent className="min-h-[70vh] max-h-[85vh] flex flex-col">
            <DrawerHeader className="pb-2 shrink-0">
              <DrawerTitle className="text-left flex items-center gap-2.5 font-medium text-base">
                <div className="p-1.5 rounded-lg bg-secondary/50">
                  <Icon icon="solar:cpu-bolt-linear" width={18} height={18} />
                </div>
                Select Model
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {renderContent()}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>{triggerContent}</PopoverTrigger>
          <PopoverContent
            className="w-[26em] max-w-[90vw] h-[340px] p-0 font-sans rounded-xl bg-popover border border-border/60 shadow-lg shadow-black/8 dark:shadow-black/25 overflow-hidden"
            align="start"
            side="bottom"
            sideOffset={6}
            avoidCollisions={true}
            collisionPadding={16}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              onClose?.();
            }}
          >
            {renderContent()}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
