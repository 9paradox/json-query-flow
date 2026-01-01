import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles } from "lucide-react";

export function ConnectWithAIPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium"
        >
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <span>Connect with AI</span>
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
              <span className="ml-1 italic">(Coming soon)</span>
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
                disabled
                className="col-span-2 h-8"
                placeholder="••••••••••••"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
