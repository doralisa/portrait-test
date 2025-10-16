import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export interface SuiteSummary {
  name: string;
  tests: TestSummary;
  suites: SuiteSummary[];
}

class CustomReporter implements Reporter {
  private startTime: number = 0;
  private results: TestResult[] = [];
  private suiteResults: Map<string, SuiteSummary> = new Map();

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log(`🚀 Starting test run with ${suite.allTests().length} tests`);
    console.log(`📁 Test files: ${config.projects.length} projects`);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`▶️  Running: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push(result);
    
    const status = result.status === 'passed' ? '✅' : 
                   result.status === 'failed' ? '❌' : 
                   result.status === 'skipped' ? '⏭️' : '❓';
    
    const duration = `${result.duration}ms`;
    console.log(`${status} ${test.title} (${duration})`);
    
    if (result.status === 'failed' && result.error) {
      console.log(`   Error: ${result.error.message}`);
    }
  }

  onEnd(result: FullResult) {
    const totalDuration = Date.now() - this.startTime;
    const summary = this.generateSummary();
    
    console.log('\n📊 Test Summary:');
    console.log(`   Total: ${summary.total}`);
    console.log(`   Passed: ${summary.passed} ✅`);
    console.log(`   Failed: ${summary.failed} ❌`);
    console.log(`   Skipped: ${summary.skipped} ⏭️`);
    console.log(`   Duration: ${totalDuration}ms`);
    
    if (summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach((result, index) => {
          const test = result.test;
          console.log(`   ${index + 1}. ${test.title}`);
          if (result.error) {
            console.log(`      Error: ${result.error.message}`);
          }
        });
    }
    
    // Generate detailed report
    this.generateDetailedReport(summary, totalDuration);
  }

  private generateSummary(): TestSummary {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return { total, passed, failed, skipped, duration };
  }

  private generateDetailedReport(summary: TestSummary, totalDuration: number) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        ...summary,
        totalDuration,
        successRate: summary.total > 0 ? (summary.passed / summary.total * 100).toFixed(2) + '%' : '0%'
      },
      tests: this.results.map(result => ({
        title: result.test?.title || 'Unknown Test',
        status: result.status,
        duration: result.duration,
        error: result.error?.message || null,
        file: result.test?.location?.file || 'Unknown File',
        line: result.test?.location?.line || 0
      }))
    };

    // Write report to file
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(process.cwd(), 'test-results', 'custom-report.json');
    
    try {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️  Could not save detailed report: ${error}`);
    }
  }
}

export default CustomReporter;
