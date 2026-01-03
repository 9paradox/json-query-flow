import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

function GithubButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="GitHub repository"
      asChild
      className="h-8 w-8"
    >
      <a
        href="https://github.com/9paradox/json-query-flow"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center"
      >
        <GitHubLogoIcon className="h-4 w-4" />
      </a>
    </Button>
  );
}
export default GithubButton;
