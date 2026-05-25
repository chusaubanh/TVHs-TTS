"use client";

import { SaasShell } from "../components/saas-shell";
import { GuideContent } from "../components/guide-content";

export default function GuidePage() {
  return (
    <SaasShell activeId="guide">
      <div className="h-full overflow-y-auto p-6">
        <GuideContent />
      </div>
    </SaasShell>
  );
}
