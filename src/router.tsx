import { AppShell } from "./components/aurfy/app-shell";
import Showcase from "./pages/Showcase";
import SignalFeed from "./pages/SignalFeed";
import Studio from "./pages/Studio";
import Intake from "./pages/Intake";
import Signals from "./pages/Signals";
import Brief from "./pages/Brief";
import Positioning from "./pages/Positioning";
import Concept from "./pages/Concept";
import Outreach from "./pages/Outreach";
import Pipeline from "./pages/Pipeline";
import Prospects from "./pages/Prospects";
import Social from "./pages/Social";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    name: "signal-feed",
    element: <SignalFeed />,
  },
  {
    path: "/deck",
    name: "showcase",
    element: <Showcase />,
  },
  {
    element: <AppShell />,
    children: [
      { path: "more", name: "more", element: <Studio /> },
      { path: "intake", name: "intake", element: <Intake /> },
      { path: "signals", name: "signals", element: <Signals /> },
      { path: "brief", name: "brief", element: <Brief /> },
      { path: "positioning", name: "positioning", element: <Positioning /> },
      { path: "concept", name: "concept", element: <Concept /> },
      { path: "outreach", name: "outreach", element: <Outreach /> },
      { path: "pipeline", name: "pipeline", element: <Pipeline /> },
      { path: "prospects", name: "prospects", element: <Prospects /> },
      { path: "social", name: "social", element: <Social /> },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
