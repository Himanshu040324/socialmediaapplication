import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className=" text-mv-text bg-mv-surface">

      <div>This is HomePage.</div>
      
      <Button variant="destructive">Click me</Button>
    </div>
  );
}
