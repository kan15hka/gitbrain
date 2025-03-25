import { Button } from "@/components/ui/button";
import React from "react";

export default async function Home() {
  if (typeof document === "undefined") {
    React.useLayoutEffect = React.useEffect;
  }
  return <Button>Quit</Button>;
}
