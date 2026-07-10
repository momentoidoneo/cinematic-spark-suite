import { lazy, Suspense, useEffect, useState } from "react";

const SmartQuoter = lazy(() => import("@/components/SmartQuoter"));

const SmartQuoterLoader = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const load = () => setShouldLoad(true);
    window.addEventListener("open-smart-quoter", load, { once: true });
    return () => window.removeEventListener("open-smart-quoter", load);
  }, []);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <SmartQuoter initialOpen />
    </Suspense>
  );
};

export default SmartQuoterLoader;
