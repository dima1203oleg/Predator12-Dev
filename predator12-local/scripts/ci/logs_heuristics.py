#!/usr/bin/env python3
"""
Log anomaly detection using simple heuristics.
Can be extended with ML models for production.
"""

import sys
import re
from typing import List, Dict, Set
from pathlib import Path
from collections import Counter
from datetime import datetime

class LogAnalyzer:
    def __init__(self, log_path: str):
        self.log_path = Path(log_path)
        self.anomalies: List[Dict] = []
        
        # Patterns for anomaly detection
        self.error_patterns = [
            r'error|ERROR|Error',
            r'exception|EXCEPTION|Exception',
            r'fatal|FATAL|Fatal',
            r'panic|PANIC',
            r'failed|FAILED|Failed',
        ]
        
        self.warning_patterns = [
            r'warning|WARNING|Warning',
            r'deprecated|DEPRECATED',
            r'timeout|TIMEOUT|Timeout',
            r'retry|RETRY|Retry',
        ]
        
        self.security_patterns = [
            r'unauthorized|UNAUTHORIZED',
            r'forbidden|FORBIDDEN|403',
            r'authentication failed',
            r'invalid token',
            r'sql injection',
            r'xss|XSS',
        ]
    
    def analyze(self) -> bool:
        """Analyze log file."""
        if not self.log_path.exists():
            print(f"⚠️  Log file not found: {self.log_path}")
            return True
        
        with open(self.log_path) as f:
            lines = f.readlines()
        
        self.check_errors(lines)
        self.check_warnings(lines)
        self.check_security(lines)
        self.check_patterns(lines)
        
        return len(self.anomalies) == 0
    
    def check_errors(self, lines: List[str]):
        """Check for error patterns."""
        error_counts = Counter()
        
        for i, line in enumerate(lines, 1):
            for pattern in self.error_patterns:
                if re.search(pattern, line):
                    error_counts[pattern] += 1
                    if error_counts[pattern] <= 3:  # Show first 3
                        self.anomalies.append({
                            'type': 'ERROR',
                            'line': i,
                            'pattern': pattern,
                            'message': line.strip()[:100]
                        })
        
        # Alert on high error rate
        total_errors = sum(error_counts.values())
        if total_errors > 10:
            self.anomalies.append({
                'type': 'HIGH_ERROR_RATE',
                'count': total_errors,
                'message': f"Found {total_errors} errors in logs"
            })
    
    def check_warnings(self, lines: List[str]):
        """Check for warning patterns."""
        warning_counts = Counter()
        
        for i, line in enumerate(lines, 1):
            for pattern in self.warning_patterns:
                if re.search(pattern, line):
                    warning_counts[pattern] += 1
                    if warning_counts[pattern] <= 2:
                        self.anomalies.append({
                            'type': 'WARNING',
                            'line': i,
                            'pattern': pattern,
                            'message': line.strip()[:100]
                        })
    
    def check_security(self, lines: List[str]):
        """Check for security issues."""
        for i, line in enumerate(lines, 1):
            for pattern in self.security_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    self.anomalies.append({
                        'type': 'SECURITY',
                        'line': i,
                        'pattern': pattern,
                        'message': line.strip()[:100]
                    })
    
    def check_patterns(self, lines: List[str]):
        """Check for suspicious patterns."""
        # Check for repeated errors (potential infinite loop)
        line_counts = Counter(lines)
        for line, count in line_counts.most_common(5):
            if count > 10 and any(re.search(p, line) for p in self.error_patterns):
                self.anomalies.append({
                    'type': 'REPEATED_ERROR',
                    'count': count,
                    'message': f"Line repeated {count} times: {line.strip()[:80]}"
                })
    
    def report(self):
        """Print analysis report."""
        print("\n" + "="*70)
        print("Log Anomaly Detection Report")
        print("="*70 + "\n")
        
        if not self.anomalies:
            print("✅ No anomalies detected!")
        else:
            grouped = {}
            for anomaly in self.anomalies:
                atype = anomaly['type']
                if atype not in grouped:
                    grouped[atype] = []
                grouped[atype].append(anomaly)
            
            for atype, items in grouped.items():
                icon = {
                    'ERROR': '❌',
                    'WARNING': '⚠️ ',
                    'SECURITY': '🔒',
                    'HIGH_ERROR_RATE': '🔥',
                    'REPEATED_ERROR': '🔁'
                }.get(atype, '•')
                
                print(f"\n{icon} {atype} ({len(items)} found):")
                for item in items[:5]:  # Show first 5
                    if 'line' in item:
                        print(f"  Line {item['line']}: {item['message']}")
                    else:
                        print(f"  {item['message']}")
                
                if len(items) > 5:
                    print(f"  ... and {len(items) - 5} more")
        
        print("\n" + "="*70 + "\n")

def main():
    if len(sys.argv) < 2:
        print("Usage: python logs_heuristics.py <logfile>")
        sys.exit(1)
    
    analyzer = LogAnalyzer(sys.argv[1])
    success = analyzer.analyze()
    analyzer.report()
    
    # Don't fail CI for warnings, only for critical security issues
    critical = any(a['type'] == 'SECURITY' for a in analyzer.anomalies)
    sys.exit(1 if critical else 0)

if __name__ == "__main__":
    main()
