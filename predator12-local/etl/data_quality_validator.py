"""
Great Expectations validation suite for Ukrainian customs declaration data
Implements data quality checks specific to customs declarations format
"""

import great_expectations as gx
from great_expectations.core.expectation_configuration import ExpectationConfiguration
from great_expectations.data_context import DataContext
from great_expectations.dataset import PandasDataset
import pandas as pd
from typing import Dict, List, Optional
import logging
from datetime import datetime, timedelta
import re

logger = logging.getLogger(__name__)

class CustomsDataValidator:
    """Data quality validator for customs declarations"""
    
    def __init__(self, data_context: Optional[DataContext] = None):
        self.context = data_context or gx.get_context()
        self.expectations = self._create_expectations_suite()
    
    def _create_expectations_suite(self) -> List[ExpectationConfiguration]:
        """Create comprehensive expectations suite for customs data"""
        
        expectations = []
        
        # 1. UNIQUENESS CONSTRAINTS
        expectations.extend([
            # Composite business key should be unique
            ExpectationConfiguration(
                expectation_type="expect_compound_columns_to_be_unique",
                kwargs={
                    "column_list": ["declaration_number", "line_number"],
                    "meta": {
                        "description": "Each declaration line should be unique",
                        "severity": "critical"
                    }
                }
            )
        ])
        
        # 2. NON-NULL CONSTRAINTS (Critical fields)
        critical_fields = [
            "declaration_number", "declaration_date", "hs_code", 
            "importer_edrpou", "quantity", "net_weight_kg"
        ]
        
        for field in critical_fields:
            expectations.append(
                ExpectationConfiguration(
                    expectation_type="expect_column_values_to_not_be_null",
                    kwargs={
                        "column": field,
                        "meta": {
                            "description": f"{field} is required and cannot be null",
                            "severity": "critical"
                        }
                    }
                )
            )
        
        # 3. DATA TYPE VALIDATIONS
        expectations.extend([
            # Declaration number format
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_match_regex",
                kwargs={
                    "column": "declaration_number",
                    "regex": r"^[A-Z0-9\/]+$",
                    "meta": {
                        "description": "Declaration number should contain only alphanumeric characters and slashes",
                        "severity": "high"
                    }
                }
            ),
            
            # HS Code validation (10 digits)
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_match_regex",
                kwargs={
                    "column": "hs_code",
                    "regex": r"^\d{10}$",
                    "meta": {
                        "description": "HS code should be exactly 10 digits",
                        "severity": "high"
                    }
                }
            ),
            
            # EDRPOU validation (8 digits)
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_match_regex",
                kwargs={
                    "column": "importer_edrpou",
                    "regex": r"^\d{8}$",
                    "meta": {
                        "description": "EDRPOU should be exactly 8 digits",
                        "severity": "high"
                    }
                }
            ),
            
            # Date range validation (reasonable customs data range)
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_be_between",
                kwargs={
                    "column": "declaration_date",
                    "min_value": datetime(2020, 1, 1),
                    "max_value": datetime.now() + timedelta(days=30),
                    "meta": {
                        "description": "Declaration date should be within reasonable range",
                        "severity": "high"
                    }
                }
            )
        ])
        
        # 4. RANGE CHECKS (Business Logic)
        expectations.extend([
            # Quantity should be positive
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_be_between",
                kwargs={
                    "column": "quantity",
                    "min_value": 0,
                    "max_value": 1000000000,  # Reasonable upper bound
                    "meta": {
                        "description": "Quantity should be positive and reasonable",
                        "severity": "medium"
                    }
                }
            ),
            
            # Net weight should be positive
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_be_between",
                kwargs={
                    "column": "net_weight_kg",
                    "min_value": 0,
                    "max_value": 1000000,  # 1000 tons max
                    "meta": {
                        "description": "Net weight should be positive and reasonable",
                        "severity": "medium"
                    }
                }
            ),
            
            # Gross weight >= Net weight
            ExpectationConfiguration(
                expectation_type="expect_column_pair_values_to_be_greater_than",
                kwargs={
                    "column_A": "gross_weight_kg",
                    "column_B": "net_weight_kg",
                    "or_equal": True,
                    "meta": {
                        "description": "Gross weight should be >= net weight",
                        "severity": "high"
                    }
                }
            ),
            
            # Invoice value should be positive
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_be_between",
                kwargs={
                    "column": "invoice_value",
                    "min_value": 0,
                    "max_value": 100000000,  # $100M reasonable upper bound
                    "meta": {
                        "description": "Invoice value should be positive and reasonable",
                        "severity": "medium"
                    }
                }
            ),
            
            # Rates should be between 0 and 100 percent
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_be_between",
                kwargs={
                    "column": "preferential_rate",
                    "min_value": 0,
                    "max_value": 100,
                    "meta": {
                        "description": "Preferential rate should be between 0 and 100 percent",
                        "severity": "medium"
                    }
                }
            ),
            
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_be_between",
                kwargs={
                    "column": "full_rate",
                    "min_value": 0,
                    "max_value": 100,
                    "meta": {
                        "description": "Full rate should be between 0 and 100 percent",
                        "severity": "medium"
                    }
                }
            )
        ])
        
        # 5. CATEGORICAL VALIDATIONS
        expectations.extend([
            # Country codes should be valid
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_be_in_set",
                kwargs={
                    "column": "country_origin",
                    "value_set": self._get_valid_country_codes(),
                    "meta": {
                        "description": "Country origin should be valid country code",
                        "severity": "medium"
                    }
                }
            ),
            
            # Declaration type should be from known set
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_be_in_set",
                kwargs={
                    "column": "declaration_type",
                    "value_set": ["ІМ/40/ДТ", "ІМ/40/АА", "ЕК/40/ДТ", "ЕК/40/АА"],
                    "meta": {
                        "description": "Declaration type should be from known set",
                        "severity": "medium"
                    }
                }
            )
        ])
        
        # 6. CUSTOM BUSINESS RULES
        expectations.extend([
            # If net weight is 0 but invoice value > 0, flag as warning
            ExpectationConfiguration(
                expectation_type="expect_column_values_to_not_be_in_set",
                kwargs={
                    "column": "net_weight_kg",
                    "value_set": [0],
                    "condition_parser": "pandas",
                    "row_condition": "invoice_value > 0",
                    "meta": {
                        "description": "Warning: Net weight is 0 but invoice value is positive",
                        "severity": "low"
                    }
                }
            )
        ])
        
        return expectations
    
    def _get_valid_country_codes(self) -> List[str]:
        """Get list of valid country codes including special cases"""
        # Common country codes + special values
        return [
            "UA", "PL", "DE", "CH", "CN", "TR", "US", "GB", "FR", "IT", 
            "NL", "BE", "AT", "CZ", "SK", "HU", "RO", "BG", "LT", "LV", 
            "EE", "SI", "HR", "MT", "CY", "LU", "DK", "SE", "FI", "IE", 
            "PT", "ES", "GR", "RU", "BY", "MD", "RS", "BA", "MK", "AL",
            "UNKNOWN", "00"  # Special values for unknown/unspecified
        ]
    
    def validate_dataframe(self, df: pd.DataFrame) -> Dict:
        """
        Validate pandas DataFrame against expectations
        
        Args:
            df: DataFrame to validate
            
        Returns:
            Validation results dictionary
        """
        logger.info(f"Validating DataFrame with {len(df)} rows")
        
        # Convert to Great Expectations dataset
        ge_df = PandasDataset(df)
        
        results = {
            "validation_time": datetime.now(),
            "total_rows": len(df),
            "total_expectations": len(self.expectations),
            "passed_expectations": 0,
            "failed_expectations": 0,
            "warnings": [],
            "errors": [],
            "critical_errors": [],
            "data_quality_score": 0.0
        }
        
        # Run each expectation
        for expectation in self.expectations:
            try:
                result = ge_df.validate_expectation(expectation)
                
                severity = expectation.kwargs.get("meta", {}).get("severity", "medium")
                description = expectation.kwargs.get("meta", {}).get("description", "")
                
                if result["success"]:
                    results["passed_expectations"] += 1
                else:
                    results["failed_expectations"] += 1
                    
                    failure_info = {
                        "expectation": expectation.expectation_type,
                        "description": description,
                        "severity": severity,
                        "unexpected_count": result.get("result", {}).get("unexpected_count", 0),
                        "unexpected_percent": result.get("result", {}).get("unexpected_percent", 0)
                    }
                    
                    if severity == "critical":
                        results["critical_errors"].append(failure_info)
                    elif severity == "high":
                        results["errors"].append(failure_info)
                    else:
                        results["warnings"].append(failure_info)
                        
            except Exception as e:
                logger.error(f"Error validating expectation {expectation.expectation_type}: {e}")
                results["errors"].append({
                    "expectation": expectation.expectation_type,
                    "error": str(e),
                    "severity": "high"
                })
        
        # Calculate data quality score
        if results["total_expectations"] > 0:
            base_score = results["passed_expectations"] / results["total_expectations"]
            
            # Penalize based on severity
            critical_penalty = len(results["critical_errors"]) * 0.1
            error_penalty = len(results["errors"]) * 0.05
            warning_penalty = len(results["warnings"]) * 0.01
            
            results["data_quality_score"] = max(0.0, base_score - critical_penalty - error_penalty - warning_penalty)
        
        return results
    
    def generate_report(self, validation_results: Dict) -> str:
        """Generate human-readable validation report"""
        
        report = f"""
# Data Quality Validation Report
**Generated:** {validation_results['validation_time']}
**Total Rows:** {validation_results['total_rows']:,}
**Data Quality Score:** {validation_results['data_quality_score']:.2%}

## Summary
- ✅ Passed: {validation_results['passed_expectations']} expectations
- ❌ Failed: {validation_results['failed_expectations']} expectations

"""
        
        if validation_results['critical_errors']:
            report += "\n## 🚨 Critical Errors\n"
            for error in validation_results['critical_errors']:
                report += f"- **{error['description']}**\n"
                report += f"  - Unexpected: {error.get('unexpected_count', 'N/A')} rows ({error.get('unexpected_percent', 0):.1f}%)\n"
        
        if validation_results['errors']:
            report += "\n## ⚠️ Errors\n"
            for error in validation_results['errors']:
                report += f"- **{error['description']}**\n"
                report += f"  - Unexpected: {error.get('unexpected_count', 'N/A')} rows ({error.get('unexpected_percent', 0):.1f}%)\n"
        
        if validation_results['warnings']:
            report += "\n## ℹ️ Warnings\n"
            for warning in validation_results['warnings']:
                report += f"- {warning['description']}\n"
                report += f"  - Unexpected: {warning.get('unexpected_count', 'N/A')} rows ({warning.get('unexpected_percent', 0):.1f}%)\n"
        
        # Recommendations
        report += "\n## 📋 Recommendations\n"
        
        if validation_results['data_quality_score'] < 0.7:
            report += "- 🔴 Data quality is below acceptable threshold (70%)\n"
            report += "- Consider reviewing data collection and preprocessing steps\n"
        elif validation_results['data_quality_score'] < 0.9:
            report += "- 🟡 Data quality is acceptable but has room for improvement\n"
            report += "- Address errors and warnings to improve data reliability\n"
        else:
            report += "- 🟢 Data quality is excellent!\n"
        
        if validation_results['critical_errors']:
            report += "- ❗ Address critical errors immediately before processing\n"
        
        return report

def main():
    """Test the validator with sample customs data"""
    # This would typically be called from the ETL pipeline
    validator = CustomsDataValidator()
    
    # Sample data for testing
    test_data = {
        'declaration_number': ['209000020/2017/001264', 'UA100060/2024/202959'],
        'line_number': [1, 1],
        'declaration_date': [datetime(2024, 2, 12), datetime(2024, 2, 5)],
        'hs_code': ['8707109010', '3212900090'],
        'importer_edrpou': ['39883419', '45332420'],
        'quantity': [1, 3],
        'net_weight_kg': [1300, 2.25],
        'gross_weight_kg': [1300, 3.39],
        'invoice_value': [7015, 311.04],
        'preferential_rate': [10, 5],
        'full_rate': [10, 5],
        'country_origin': ['DE', 'DE'],
        'declaration_type': ['ІМ/40/ДТ', 'ІМ/40/АА']
    }
    
    df = pd.DataFrame(test_data)
    results = validator.validate_dataframe(df)
    
    print(validator.generate_report(results))

if __name__ == "__main__":
    main()
