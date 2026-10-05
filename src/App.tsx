import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "@/routes/Home";
import About from "@/routes/About";
import Accessibility from "@/routes/Accessibility";

// Route-level code splitting keeps the initial bundle small for
// low-bandwidth rural users (perf requirement). Home/About/Accessibility
// are static and small enough to ship eagerly with the app shell.
const Resources = lazy(() => import("@/routes/Resources"));
const ResourceDetail = lazy(() => import("@/routes/ResourceDetail"));
const Guide = lazy(() => import("@/routes/Guide"));
const Help = lazy(() => import("@/routes/Help"));
const Apply = lazy(() => import("@/routes/Apply"));
const Account = lazy(() => import("@/routes/Account"));
const Saved = lazy(() => import("@/routes/Saved"));
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
          <Route path="apply" element={<Apply />} />
          <Route path="account" element={<Account />} />
          <Route path="saved" element={<Saved />} />
          <Route path="about" element={<About />} />
          <Route path="accessibility" element={<Accessibility />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
