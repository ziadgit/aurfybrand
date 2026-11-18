import { AppShell } from "./components/aurfy/app-shell";
import Studio from "./pages/Studio";
import Intake from "./pages/Intake";
import Signals from "./pages/Signals";
import Brief from "./pages/Brief";
import Positioning from "./pages/Positioning";
import Concept from "./pages/Concept";
import Outreach from "./pages/Outreach";
import Pipeline from "./pages/Pipeline";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, name: "studio", element: <Studio /> },
      { path: "intake", name: "intake", element: <Intake /> },
      { path: "signals", name: "signals", element: <Signals /> },
      { path: "brief", name: "brief", element: <Brief /> },
      { path: "positioning", name: "positioning", element: <Positioning /> },
      { path: "concept", name: "concept", element: <Concept /> },
      { path: "outreach", name: "outreach", element: <Outreach /> },
      { path: "pipeline", name: "pipeline", element: <Pipeline /> },
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
