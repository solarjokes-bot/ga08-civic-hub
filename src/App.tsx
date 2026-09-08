import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "@/routes/Home";
import About from "@/routes/About";
import Accessibility from "@/routes/Accessibility";
import ComingSoon from "@/routes/ComingSoon";

// Route-level code splitting keeps the initial bundle small for
// low-bandwidth rural users (perf requirement). Home/About/Accessibility
// are static and small enough to ship eagerly with the app shell.
const Resources = lazy(() => import("@/routes/Resources"));
const ResourceDetail = lazy(() => import("@/routes/ResourceDetail"));
const Guide = lazy(() => import("@/routes/Guide"));
const Help = lazy(() => import("@/routes/Help"));
const NotFound = lazy(() => import("@/routes/NotFound"));

function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] items-center justify-center text-ink-500"
    >
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="resources" element={<Resources />} />
          <Route path="resources/:slug" element={<ResourceDetail />} />
          <Route path="guide" element={<Guide />} />
          <Route path="help" element={<Help />} />
          <Route
            path="representative"
            element={
              <ComingSoon
                title="Rep. Austin Scott — GA-08"
                phase="Phase 5 — planned"
                description="Committee work, priorities, sponsored legislation, and district initiatives — presented factually and non-partisan — are coming in the next phase."
              />
            }
          />
          <Route
            path="representative/legislation"
            element={
              <ComingSoon
                title="Sponsored & Cosponsored Legislation"
                phase="Phase 5 — planned"
                description="A live, filterable table of bills sponsored and cosponsored by Rep. Scott, synced from Congress.gov."
              />
            }
          />
          <Route
            path="representative/initiatives"
            element={
              <ComingSoon
                title="Initiatives & Insights"
                phase="Phase 5 — planned"
                description="District-focused initiatives and plain-language summaries are coming in the next phase."
              />
            }
          />

          <Route path="about" element={<About />} />
          <Route path="accessibility" element={<Accessibility />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
