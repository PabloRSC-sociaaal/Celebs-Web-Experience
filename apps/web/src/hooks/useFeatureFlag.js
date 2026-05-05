import { getFlag } from "../config";

/**
 * React hook that resolves a feature flag.
 * Usage: const morphEnabled = useFeatureFlag("MORPH_SLIDER");
 *
 * Currently static (resolved at build time via env vars).
 * When remote config is added, this hook will subscribe to real-time updates.
 */
export function useFeatureFlag(flagId) {
  return getFlag(flagId);
}
