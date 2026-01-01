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
        <Button variant="outline" size="sm">
          <Sparkles className="mr-2" /> Connect with AI
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Connect with AI</h4>
            <p className="text-muted-foreground text-sm">
              Update you Gemini AI key to use AI features.
              <sub>(Coming soon..)</sub>
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="api-key">Key</Label>
              <Input
                id="api-key"
                disabled
                className="col-span-2 h-8"
                type="password"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
