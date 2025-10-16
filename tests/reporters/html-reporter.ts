import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class HtmlReporter implements Reporter {
  private results: TestResult[] = [];
  private startTime: number = 0;

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push(result);
  }

  onEnd(result: FullResult) {
    const totalDuration = Date.now() - this.startTime;
    const summary = this.generateSummary();
    const html = this.generateHtmlReport(summary, totalDuration);
    
    const reportPath = path.join(process.cwd(), 'test-results', 'custom-report.html');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, html);
    
    console.log(`📄 HTML report generated: ${reportPath}`);
  }

  private generateSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return { total, passed, failed, skipped, duration };
  }

  private generateHtmlReport(summary: any, totalDuration: number): string {
    const successRate = summary.total > 0 ? (summary.passed / summary.total * 100).toFixed(2) : '0';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .summary-card.passed { border-left-color: #28a745; }
        .summary-card.failed { border-left-color: #dc3545; }
        .summary-card.skipped { border-left-color: #ffc107; }
        .summary-card h3 { margin: 0 0 10px 0; font-size: 2em; }
        .summary-card p { margin: 0; color: #666; }
        .tests { padding: 0 30px 30px 30px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; }
        .test-item.passed { border-left-color: #28a745; }
        .test-item.failed { border-left-color: #dc3545; }
        .test-item.skipped { border-left-color: #ffc107; }
        .test-title { font-weight: bold; margin-bottom: 5px; }
        .test-details { color: #666; font-size: 0.9em; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Playwright Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>${summary.total}</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-card passed">
                <h3>${summary.passed}</h3>
                <p>Passed</p>
            </div>
            <div class="summary-card failed">
                <h3>${summary.failed}</h3>
                <p>Failed</p>
            </div>
            <div class="summary-card skipped">
                <h3>${summary.skipped}</h3>
                <p>Skipped</p>
            </div>
            <div class="summary-card">
                <h3>${successRate}%</h3>
                <p>Success Rate</p>
            </div>
            <div class="summary-card">
                <h3>${totalDuration}ms</h3>
                <p>Total Duration</p>
            </div>
        </div>
        
        <div class="tests">
            <h2>Test Results</h2>
            ${this.results.map(result => `
                <div class="test-item ${result.status}">
                    <div class="test-title">${result.test?.title || 'Unknown Test'}</div>
                    <div class="test-details">
                        Status: ${result.status} | Duration: ${result.duration}ms
                        ${result.error ? `<div class="error">Error: ${result.error.message}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Generated by Custom HTML Reporter</p>
        </div>
    </div>
</body>
</html>`;
  }
}

export default HtmlReporter;
