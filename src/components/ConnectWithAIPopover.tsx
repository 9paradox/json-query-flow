import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore } from "@/store";
import { Sparkles } from "lucide-react";

export function ConnectWithAIPopover() {
  const apiKey = useStore((s) => s.apiKey ?? "");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
            apiKey
              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Sparkles
            className={`h-4 w-4 ${
              apiKey ? "text-white" : "text-muted-foreground"
            }`}
          />
          <span>{apiKey ? "Connected to AI" : "Connect with AI"}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">
              Connect with AI
            </h4>
            <p className="text-xs text-muted-foreground">
              Update your Gemini AI key to use AI features.
            </p>
          </div>

          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="api-key" className="text-sm">
                Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => useStore.getState().setApiKey(e.target.value)}
                className="col-span-2 h-8"
                placeholder="Enter your Gemini AI key"
              />
            </div>

            <p className="text-[11px] text-muted-foreground leading-snug">
              Your API key is sent securely to the Cloudflare Worker and used
              only to process your own AI requests. The key is not stored or
              logged by this application and is forwarded only to the selected
              AI provider to fulfill your request.
            </p>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Get your free Gemini AI API key →
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
