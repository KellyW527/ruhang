import { useEffect, useMemo, useState } from "react";
import { Phone, PhoneOff, Mic, Volume2 } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "ringing" | "active" | "ended";

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

export function IncomingCallDialog({
  open,
  callerName,
  callerRole,
  onOpenChange,
  onEnded,
}: {
  open: boolean;
  callerName: string;
  callerRole: string;
  onOpenChange: (open: boolean) => void;
  onEnded?: (durationSeconds: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ringing");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!open) {
      setPhase("ringing");
      setSeconds(0);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "active") return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [open, phase]);

  const waveform = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => 6 + ((index * 17) % 32)),
    [],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong h-[100dvh] max-h-none w-full max-w-none border-none bg-background/95 p-0 sm:rounded-none">
        <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-gold text-4xl text-primary-foreground shadow-glow-gold">
              {callerName.slice(0, 1)}
            </div>
            {phase === "ringing" && <span className="absolute inset-0 rounded-full border border-primary/50 animate-ping" />}
          </div>

          <div className="mt-8">
            <div className="font-display text-3xl font-semibold">{callerName}</div>
            <div className="mt-2 text-sm text-muted-foreground">{callerRole}</div>
            <div className="mt-4 text-sm text-primary">
              {phase === "ringing" ? "正在呼叫…" : phase === "active" ? formatDuration(seconds) : "通话结束"}
            </div>
          </div>

          {phase === "active" && (
            <div className="mt-10 flex h-20 items-end gap-1">
              {waveform.map((height, index) => (
                <span
                  key={index}
                  className={cn("w-1.5 rounded-full bg-primary/80", index % 2 === 0 ? "animate-pulse" : "")}
                  style={{ height }}
                />
              ))}
            </div>
          )}

          <div className="mt-12 flex items-center gap-4">
            {phase === "ringing" ? (
              <>
                <Button
                  type="button"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-emerald-500 text-white hover:bg-emerald-400"
                  onClick={() => setPhase("active")}
                >
                  <Phone className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-destructive text-white hover:bg-destructive/90"
                  onClick={() => {
                    setPhase("ended");
                    onOpenChange(false);
                  }}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <>
                <Button type="button" size="icon" variant="secondary" className="h-14 w-14 rounded-full">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button type="button" size="icon" variant="secondary" className="h-14 w-14 rounded-full">
                  <Volume2 className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="h-16 w-16 rounded-full bg-destructive text-white hover:bg-destructive/90"
                  onClick={() => {
                    setPhase("ended");
                    onEnded?.(seconds);
                    onOpenChange(false);
                  }}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
