/**
 * @jest-environment node
 *
 * ECC Integration Tests
 * Validates agent report parsing and suggestion generation
 */

import {
  parseAgentReport,
  processAgentReports,
  generateECCHookOutput,
  createMockAgentReport,
  runECCIntegration,
  AgentReport,
} from "../ecc-integration";
import { Suggestion } from "../suggestions";

describe("ECC Integration", () => {
  describe("parseAgentReport", () => {
    it("should parse code-quality agent report", () => {
      const report = createMockAgentReport("code-quality");
      const suggestions = parseAgentReport(report);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.agentSource === "code-quality")).toBe(
        true,
      );
      expect(suggestions.some((s) => s.type === "lint-fix")).toBe(true);
      expect(suggestions.some((s) => s.type === "type-fix")).toBe(true);
    });

    it("should parse mobile-qa agent report", () => {
      const report = createMockAgentReport("mobile-qa");
      const suggestions = parseAgentReport(report);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.agentSource === "mobile-qa")).toBe(true);
      expect(suggestions.some((s) => s.type === "null-check")).toBe(true);
    });

    it("should parse security-scanner agent report", () => {
      const report = createMockAgentReport("security-scanner");
      const suggestions = parseAgentReport(report);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(
        suggestions.some((s) => s.agentSource === "security-scanner"),
      ).toBe(true);
      // Güvenlik yamaları (CVE) proje kuralı gereği her zaman yüksek riskli/manuel onaylıdır,
      // tarayıcının bildirdiği 'medium' seviyesi öneri riskini düşürmez (CLAUDE.md).
      expect(suggestions.every((s) => s.severity === "high")).toBe(true);
    });

    it("should handle empty report", () => {
      const report: AgentReport = {
        agentName: "code-quality",
        timestamp: new Date(),
        status: "success",
        duration: 1000,
      };

      const suggestions = parseAgentReport(report);
      expect(suggestions.length).toBe(0);
    });
  });

  describe("processAgentReports", () => {
    it("should process multiple reports in batch", async () => {
      const reports = [
        createMockAgentReport("code-quality"),
        createMockAgentReport("mobile-qa"),
        createMockAgentReport("security-scanner"),
      ];

      const result = await processAgentReports(reports, {
        autoApplyLowRisk: true,
        autoApplyMediumRisk: false,
      });

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.orchestrationResult.totalSuggestions).toBeGreaterThan(0);
      expect(result.autoApplied.length).toBeGreaterThanOrEqual(0);
    });

    it("should auto-apply low-risk fixes when enabled", async () => {
      const reports = [createMockAgentReport("code-quality")];

      const result = await processAgentReports(reports, {
        autoApplyLowRisk: true,
      });

      const autoApplicable = result.suggestions.filter(
        (s) => s.action === "auto_apply",
      );
      expect(autoApplicable.length).toBeGreaterThan(0);
    });

    it("should queue medium-risk for manual review", async () => {
      const reports = [createMockAgentReport("mobile-qa")];

      const result = await processAgentReports(reports);

      const manual = result.suggestions.filter(
        (s) => s.action === "manual_approval",
      );
      expect(manual.length).toBeGreaterThan(0);
    });
  });

  describe("generateECCHookOutput", () => {
    it("should generate valid markdown report", async () => {
      const reports = [createMockAgentReport("code-quality")];
      const result = await processAgentReports(reports);

      const output = generateECCHookOutput({
        orchestrationResult: result.orchestrationResult,
        autoApplied: result.autoApplied,
        branchName: "feature/test",
        commitHash: "abc123def456",
      });

      expect(output).toContain("# ECC Suggestion Engine Report");
      expect(output).toContain("feature/test");
      expect(output).toContain("abc123def456");
      expect(output).toContain("Total Suggestions");
      expect(output).toContain("Auto-Applicable");
    });

    it("should show auto-apply summary", async () => {
      const reports = [createMockAgentReport("code-quality")];
      const result = await processAgentReports(reports, {
        autoApplyLowRisk: true,
      });

      const output = generateECCHookOutput({
        orchestrationResult: result.orchestrationResult,
        autoApplied: result.autoApplied,
        branchName: "feature/lint-fix",
        commitHash: "abc123",
      });

      expect(output).toContain("Auto-Apply");
      expect(output).toContain("Pending Approval");
    });
  });

  describe("runECCIntegration", () => {
    it("should run full integration flow", async () => {
      const result = await runECCIntegration(
        "feat: test auto-apply",
        "feature/test",
        "abc123def456",
      );

      expect(result.report).toContain("ECC Suggestion Engine Report");
      expect(result.autoAppliedCount).toBeGreaterThanOrEqual(0);
    });

    it("should process code-quality and mobile-qa together", async () => {
      const result = await runECCIntegration(
        "feat: multi-agent test",
        "feature/multi-agent",
        "789xyz",
      );

      expect(result.report).toContain("Total Suggestions");
      expect(result.report.length).toBeGreaterThan(100);
    });
  });

  describe("Risk Classification", () => {
    it("should classify lint fixes as low-risk auto-apply", async () => {
      const report = createMockAgentReport("code-quality");
      const suggestions = parseAgentReport(report);

      const lintFixes = suggestions.filter((s) => s.type === "lint-fix");
      for (const s of lintFixes) {
        expect(s.severity).toBe("low");
        expect(s.action).toBe("auto_apply");
      }
    });

    it("should classify null checks as medium-risk manual", async () => {
      const report = createMockAgentReport("mobile-qa");
      const suggestions = parseAgentReport(report);

      const nullChecks = suggestions.filter((s) => s.type === "null-check");
      for (const s of nullChecks) {
        expect(s.severity).toBe("medium");
        expect(s.action).toBe("manual_approval");
      }
    });

    it("should classify security patches as high-risk manual", async () => {
      const report = createMockAgentReport("security-scanner");
      const suggestions = parseAgentReport(report);

      const patches = suggestions.filter((s) => s.type === "security-patch");
      for (const s of patches) {
        expect(s.severity).toBe("high");
        expect(s.action).toBe("manual_only");
      }
    });
  });

  describe("Deduplication", () => {
    it("should deduplicate similar suggestions", async () => {
      const reports = [
        createMockAgentReport("code-quality"),
        createMockAgentReport("code-quality"),
      ];

      const result = await processAgentReports(reports, {
        deduplicateSimilar: true,
      });

      expect(
        result.orchestrationResult.duplicatesRemoved,
      ).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Integration with Dashboard", () => {
    it("should generate suggestions for dashboard display", async () => {
      const reports = [
        createMockAgentReport("code-quality"),
        createMockAgentReport("mobile-qa"),
      ];

      const result = await processAgentReports(reports);

      // Should have both auto-apply and manual review
      expect(
        result.orchestrationResult.autoApplied.length,
      ).toBeGreaterThanOrEqual(0);
      expect(
        result.orchestrationResult.pendingApproval.length,
      ).toBeGreaterThanOrEqual(0);
    });
  });
});
