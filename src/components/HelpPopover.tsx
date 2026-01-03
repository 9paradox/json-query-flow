import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircleIcon } from "lucide-react";

export function HelpPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <HelpCircleIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4">
        <div className="grid gap-4 text-sm">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">
              What is Json Query Flow?
            </h4>
            <p className="text-xs text-muted-foreground leading-snug">
              Json Query Flow is a visual tool for exploring, querying, and
              transforming JSON data using a node-based workflow. It helps
              developers quickly understand complex JSON, build queries, and
              visualize results without writing glue code.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none">
              Common use cases
            </h4>
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
              <li>Explore and understand large or unknown JSON payloads</li>
              <li>Build and test JSONata queries interactively</li>
              <li>Transform API responses into charts or tables</li>
              <li>
                Prototype data extraction logic before backend integration
              </li>
            </ul>
          </div>

          <h4 className="text-sm font-medium leading-none">Built using</h4>

          <div>
            <a
              href="https://jsonata.org/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              JSONata
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Query and transformation language for working with JSON data.
            </p>
          </div>

          <div>
            <a
              href="https://reactflow.dev/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              React Flow
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Node-based editor library used to build the visual query flow.
            </p>
          </div>

          <div>
            <a
              href="https://github.com/suren-atoyan/monaco-react"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              React Monaco Editor
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Code editor used for writing JSON and JSONata queries.
            </p>
          </div>

          <div>
            <a
              href="https://ui.shadcn.com/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              shadcn/ui
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Accessible UI components built on Radix UI and Tailwind CSS.
            </p>
          </div>

          <div>
            <a
              href="https://developers.cloudflare.com/workers/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              Cloudflare Workers
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Secure edge runtime used to execute AI requests.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
