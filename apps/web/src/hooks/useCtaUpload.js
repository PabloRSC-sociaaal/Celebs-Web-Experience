import { useRef, useCallback } from "react";
import { useAppStore } from "../store/appStore";

/**
 * Hook used by any CTA button across the landing page.
 * Returns { triggerUpload, inputProps }.
 *
 * - triggerUpload(): opens the native file picker.
 * - inputProps: spread onto a hidden <input> rendered alongside the CTA.
 *
 * Flow: user picks image → file goes to store.pendingFile →
 *       page scrolls to Hero → HeroUpload picks it up and processes.
 */
export function useCtaUpload() {
  const inputRef       = useRef(null);
  const setPendingFile = useAppStore(s => s.setPendingFile);

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setPendingFile(file);

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Reset so the same file can be re-selected
    e.target.value = "";
  }, [setPendingFile]);

  const triggerUpload = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const inputProps = {
    ref: inputRef,
    type: "file",
    accept: "image/*",
    style: { display: "none" },
    onChange: handleChange,
  };

  return { triggerUpload, inputProps };
}
