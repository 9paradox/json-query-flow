import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/store";
import { Sparkles } from "lucide-react";

export function ConnectWithAIPopover() {
  const apiKey = useStore((s) => s.apiKey ?? "");
  const enableWorkersAI = useStore((s) => s.enableWorkersAI ?? false);

  const setApiKey = useStore((s) => s.setApiKey);
  const setEnableWorkersAI = useStore((s) => s.setWorkersAIUsage);

  const isConnected = enableWorkersAI || Boolean(apiKey);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium ${
            isConnected
              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-600"
              : "hover:bg-accent"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>
            {enableWorkersAI
              ? "Using Workers AI"
              : apiKey
              ? "Connected to Gemini"
              : "Connect with AI"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-4">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">AI Provider</h4>
            <p className="text-xs text-muted-foreground">
              Choose how AI queries are generated.
            </p>
          </div>

          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="api-key" className="text-sm">
                Gemini Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                disabled={enableWorkersAI}
                onChange={(e) => setApiKey(e.target.value)}
                className="col-span-2 h-8"
                placeholder="Enter Gemini API key"
              />
            </div>

            <p className="text-[11px] text-muted-foreground leading-snug">
              Your API key is sent securely to the Cloudflare Worker and used
              only to process your requests. The key is not stored or logged.
            </p>

            {!enableWorkersAI && (
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Get a free Gemini API key →
              </a>
            )}
          </div>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-popover px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label className="text-sm">Use Cloudflare Workers AI</Label>
              <p className="text-[11px] text-muted-foreground">
                No API key required. Requests are handled directly by Cloudflare
                Workers AI. May have daily usage limits. For more complex
                queries, using Gemini can produce more reliable results.
              </p>
            </div>
            <Switch
              checked={enableWorkersAI}
              onCheckedChange={(checked) => {
                setEnableWorkersAI(checked);
                if (checked) {
                  setApiKey("");
                }
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
