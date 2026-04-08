import { useActor as useActorLib } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

export function useActor() {
  return useActorLib(createActor);
}
