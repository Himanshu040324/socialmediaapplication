import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className=" text-mv-text bg-mv-surface">
      This is HomePage.
      <Button variant="destructive">Click me</Button>
    </div>
  );
}
