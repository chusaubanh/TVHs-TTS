"use client";

import { SaasShell } from "../components/saas-shell";
import { FeaturesContent } from "../components/features-content";

export default function FeaturesPage() {
  return (
    <SaasShell activeId="features">
      <div className="h-full overflow-y-auto p-6">
        <FeaturesContent />
      </div>
    </SaasShell>
  );
}
