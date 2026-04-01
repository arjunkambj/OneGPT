import { Icon } from "@iconify/react";

export default function Loading() {
  return (
    <div className="flex h-dvh w-screen items-center justify-center">
      <Icon icon="svg-spinners:bars-scale" className="h-8 w-8" />
    </div>
  );
}
