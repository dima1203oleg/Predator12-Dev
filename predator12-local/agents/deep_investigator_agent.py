"""
🕵️ DEEP INVESTIGATOR AGENT
Агент глибокого розслідування для комплексного аналізу підозрілих схем
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import random
import numpy as np
from dataclasses import dataclass

@dataclass
class Investigation:
    """Структура розслідування"""
    case_id: str
    title: str
    description: str
    evidence_count: int
    confidence_score: float
    risk_level: str
    entities_involved: List[str]
    financial_impact: float
    status: str
    created_at: datetime
    updated_at: datetime

@dataclass
class Evidence:
    """Структура доказів"""
    evidence_id: str
    case_id: str
    evidence_type: str
    description: str
    source: str
    reliability: float
    timestamp: datetime

class DeepInvestigatorAgent:
    """Агент глибокого розслідування"""
    
    def __init__(self):
        self.agent_id = "DeepInvestigator"
        self.specialization = "Complex fraud investigation and pattern analysis"
        self.active_investigations: Dict[str, Investigation] = {}
        self.evidence_database: List[Evidence] = []
        self.investigation_counter = 0
        
        # AI-моделі для аналізу
        self.analysis_models = [
            "mistralai/mixtral-8x7b-instruct-v0.1",
            "ai21-labs/ai21-jamba-1.5-large", 
            "meta-llama/meta-llama-3-70b-instruct"
        ]
        
        # Паттерни для детекції
        self.fraud_patterns = {
            'shell_company': {
                'indicators': ['minimal_activity', 'round_sum_transactions', 'short_existence'],
                'weight': 0.8
            },
            'layering_scheme': {
                'indicators': ['multiple_transfers', 'geographic_dispersion', 'timing_patterns'],
                'weight': 0.9
            },
            'corruption_network': {
                'indicators': ['unusual_procurement', 'political_connections', 'inflated_prices'],
                'weight': 0.85
            }
        }
    
    async def start_investigation(self, trigger_event: Dict[str, Any]) -> Investigation:
        """Початок нового розслідування"""
        self.investigation_counter += 1
        case_id = f"INV-{datetime.now().strftime('%Y%m%d')}-{self.investigation_counter:04d}"
        
        investigation = Investigation(
            case_id=case_id,
            title=f"Розслідування {trigger_event.get('type', 'невідомого типу')}",
            description=trigger_event.get('description', 'Автоматично створене розслідування'),
            evidence_count=0,
            confidence_score=0.0,
            risk_level=trigger_event.get('risk_level', 'medium'),
            entities_involved=[],
            financial_impact=trigger_event.get('amount', 0.0),
            status='initiated',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self.active_investigations[case_id] = investigation
        
        print(f"🔍 Розпочато розслідування {case_id}")
        print(f"   📋 Тип: {trigger_event.get('type')}")
        print(f"   💰 Сума: ${trigger_event.get('amount', 0):,.2f}")
        print(f"   ⚠️ Ризик: {investigation.risk_level}")
        
        # Автоматичний збір доказів
        await self.collect_initial_evidence(investigation, trigger_event)
        
        return investigation
    
    async def collect_initial_evidence(self, investigation: Investigation, trigger_event: Dict):
        """Збір початкових доказів"""
        print(f"   🔎 Збір початкових доказів для {investigation.case_id}...")
        
        # Симуляція збору різних типів доказів
        evidence_types = [
            {
                'type': 'financial_records',
                'description': 'Банківські записи та транзакції',
                'source': 'Banking API',
                'reliability': 0.95
            },
            {
                'type': 'digital_footprint',
                'description': 'Цифрові сліди та метадані',
                'source': 'Digital Forensics',
                'reliability': 0.85
            },
            {
                'type': 'network_analysis',
                'description': 'Аналіз мережі зв\'язків',
                'source': 'Graph Analytics',
                'reliability': 0.80
            },
            {
                'type': 'document_analysis',
                'description': 'Аналіз документів та контрактів',
                'source': 'Document Scanner',
                'reliability': 0.90
            }
        ]
        
        for evidence_type in evidence_types:
            if random.random() < 0.7:  # 70% шансу знайти доказ
                evidence_id = f"EV-{len(self.evidence_database) + 1:06d}"
                
                evidence = Evidence(
                    evidence_id=evidence_id,
                    case_id=investigation.case_id,
                    evidence_type=evidence_type['type'],
                    description=evidence_type['description'],
                    source=evidence_type['source'],
                    reliability=evidence_type['reliability'],
                    timestamp=datetime.now()
                )
                
                self.evidence_database.append(evidence)
                investigation.evidence_count += 1
                
                print(f"      📄 Знайдено: {evidence_type['description']} (надійність: {evidence_type['reliability']:.0%})")
        
        # Оновлення рівня впевненості
        await self.update_confidence_score(investigation)
    
    async def analyze_patterns(self, investigation: Investigation) -> Dict[str, Any]:
        """Аналіз паттернів у зібраних доказах"""
        print(f"   🧠 Аналіз паттернів для {investigation.case_id}...")
        
        # Вибір моделі для аналізу
        selected_model = random.choice(self.analysis_models)
        print(f"      🤖 Використовую модель: {selected_model}")
        
        # Симуляція аналізу паттернів
        detected_patterns = []
        
        for pattern_name, pattern_config in self.fraud_patterns.items():
            # Симуляція детекції паттерну
            detection_score = random.uniform(0.3, 1.0) * pattern_config['weight']
            
            if detection_score > 0.6:  # Поріг детекції
                detected_patterns.append({
                    'pattern': pattern_name,
                    'score': detection_score,
                    'indicators': pattern_config['indicators'],
                    'description': self.get_pattern_description(pattern_name)
                })
                
                print(f"      🎯 Детектовано: {pattern_name} (впевненість: {detection_score:.1%})")
        
        # Генерація рекомендацій
        recommendations = await self.generate_recommendations(detected_patterns, investigation)
        
        analysis_result = {
            'patterns_detected': detected_patterns,
            'recommendations': recommendations,
            'analysis_model': selected_model,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        return analysis_result
    
    def get_pattern_description(self, pattern_name: str) -> str:
        """Отримання опису паттерну"""
        descriptions = {
            'shell_company': 'Схема з використанням фіктивних компаній',
            'layering_scheme': 'Багаторівнева схема відмивання коштів',
            'corruption_network': 'Корупційна мережа в державному секторі'
        }
        return descriptions.get(pattern_name, 'Невідомий паттерн')
    
    async def generate_recommendations(self, patterns: List[Dict], investigation: Investigation) -> List[str]:
        """Генерація рекомендацій на основі аналізу"""
        recommendations = []
        
        if any(p['pattern'] == 'shell_company' for p in patterns):
            recommendations.extend([
                "Перевірити реєстраційні дані всіх пов'язаних компаній",
                "Проаналізувати фактичну діяльність підозрілих організацій",
                "Встановити реальних бенефіціарів"
            ])
        
        if any(p['pattern'] == 'layering_scheme' for p in patterns):
            recommendations.extend([
                "Побудувати повну карту фінансових потоків",
                "Ідентифікувати всі проміжні рахунки",
                "Проаналізувати часові паттерни переказів"
            ])
        
        if any(p['pattern'] == 'corruption_network' for p in patterns):
            recommendations.extend([
                "Перевірити зв'язки з державними службовцями", 
                "Проаналізувати процедури тендерних закупівель",
                "Встановити факти конфлікту інтересів"
            ])
        
        # Загальні рекомендації
        recommendations.extend([
            "Повідомити правоохоронні органи при високому рівні ризику",
            "Заморозити підозрілі активи для запобігання втратам",
            "Підготувати детальний звіт для регуляторів"
        ])
        
        return recommendations[:5]  # Обмежуємо до 5 найважливіших
    
    async def update_confidence_score(self, investigation: Investigation):
        """Оновлення рівня впевненості в розслідуванні"""
        # Фактори впливу на впевненість
        evidence_factor = min(investigation.evidence_count / 10, 1.0)  # Максимум за 10 доказів
        
        case_evidence = [e for e in self.evidence_database if e.case_id == investigation.case_id]
        reliability_factor = np.mean([e.reliability for e in case_evidence]) if case_evidence else 0.5
        
        financial_factor = min(investigation.financial_impact / 1000000, 1.0)  # Нормалізація по $1M
        
        # Загальний розрахунок впевненості
        confidence = (evidence_factor * 0.4 + reliability_factor * 0.4 + financial_factor * 0.2)
        investigation.confidence_score = confidence
        investigation.updated_at = datetime.now()
        
        # Оновлення статусу на основі впевненості
        if confidence > 0.8:
            investigation.status = 'high_confidence'
        elif confidence > 0.6:
            investigation.status = 'medium_confidence'
        else:
            investigation.status = 'low_confidence'
    
    async def conduct_investigation(self, case_id: str) -> Dict[str, Any]:
        """Проведення повного розслідування"""
        if case_id not in self.active_investigations:
            raise ValueError(f"Розслідування {case_id} не знайдено")
        
        investigation = self.active_investigations[case_id]
        
        print(f"\n🕵️ Проведення глибокого розслідування {case_id}")
        print("=" * 50)
        
        # Етап 1: Аналіз паттернів
        analysis_result = await self.analyze_patterns(investigation)
        
        # Етап 2: Розширений пошук доказів
        await self.extended_evidence_search(investigation)
        
        # Етап 3: Побудова карти зв'язків
        network_map = await self.build_network_map(investigation)
        
        # Етап 4: Підготовка звіту
        final_report = await self.prepare_final_report(investigation, analysis_result, network_map)
        
        print(f"✅ Розслідування {case_id} завершено")
        print(f"   📊 Впевненість: {investigation.confidence_score:.1%}")
        print(f"   📄 Доказів зібрано: {investigation.evidence_count}")
        print(f"   ⚠️ Фінальний статус: {investigation.status}")
        
        return final_report
    
    async def extended_evidence_search(self, investigation: Investigation):
        """Розширений пошук доказів"""
        print(f"   🔍 Розширений пошук доказів...")
        
        # Симуляція пошуку додаткових доказів
        additional_evidence = random.randint(2, 8)
        
        for i in range(additional_evidence):
            evidence_id = f"EV-{len(self.evidence_database) + 1:06d}"
            
            evidence_types = [
                'communication_records', 'travel_records', 'property_records',
                'corporate_filings', 'regulatory_reports', 'media_mentions'
            ]
            
            evidence = Evidence(
                evidence_id=evidence_id,
                case_id=investigation.case_id,
                evidence_type=random.choice(evidence_types),
                description=f"Додатковий доказ #{i+1}",
                source="Extended Search",
                reliability=random.uniform(0.7, 0.95),
                timestamp=datetime.now()
            )
            
            self.evidence_database.append(evidence)
            investigation.evidence_count += 1
        
        await self.update_confidence_score(investigation)
        
        print(f"      📄 Знайдено {additional_evidence} додаткових доказів")
    
    async def build_network_map(self, investigation: Investigation) -> Dict[str, Any]:
        """Побудова карти мережі зв'язків"""
        print(f"   🕸️ Побудова карти зв'язків...")
        
        # Симуляція побудови мережі
        entities = []
        connections = []
        
        # Генерація сутностей
        entity_types = ['person', 'company', 'bank_account', 'property', 'government_official']
        
        for i in range(random.randint(5, 15)):
            entity = {
                'id': f"E{i+1:03d}",
                'type': random.choice(entity_types),
                'name': f"Entity_{i+1}",
                'risk_score': random.uniform(0.1, 1.0),
                'suspicious': random.random() < 0.3
            }
            entities.append(entity)
        
        # Генерація зв'язків
        for i in range(len(entities)):
            for j in range(i+1, len(entities)):
                if random.random() < 0.2:  # 20% шансу на зв'язок
                    connection = {
                        'from': entities[i]['id'],
                        'to': entities[j]['id'],
                        'type': random.choice(['financial', 'ownership', 'communication', 'family']),
                        'strength': random.uniform(0.1, 1.0)
                    }
                    connections.append(connection)
        
        network_map = {
            'entities': entities,
            'connections': connections,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        print(f"      🎯 Виявлено {len(entities)} сутностей та {len(connections)} зв'язків")
        
        return network_map
    
    async def prepare_final_report(self, investigation: Investigation, 
                                 analysis_result: Dict, network_map: Dict) -> Dict[str, Any]:
        """Підготовка фінального звіту"""
        print(f"   📊 Підготовка фінального звіту...")
        
        report = {
            'investigation': {
                'case_id': investigation.case_id,
                'title': investigation.title,
                'status': investigation.status,
                'confidence_score': investigation.confidence_score,
                'evidence_count': investigation.evidence_count,
                'financial_impact': investigation.financial_impact,
                'duration_days': (datetime.now() - investigation.created_at).days
            },
            'analysis': analysis_result,
            'network': network_map,
            'summary': {
                'key_findings': [
                    f"Виявлено {len(analysis_result['patterns_detected'])} підозрілих паттернів",
                    f"Зібрано {investigation.evidence_count} доказів",
                    f"Ідентифіковано {len(network_map['entities'])} пов'язаних сутностей",
                    f"Фінансовий вплив: ${investigation.financial_impact:,.2f}"
                ],
                'risk_assessment': investigation.risk_level,
                'recommended_actions': analysis_result['recommendations']
            },
            'generated_at': datetime.now().isoformat(),
            'agent_signature': self.agent_id
        }
        
        return report

    def get_investigation_status(self, case_id: str) -> Dict[str, Any]:
        """Отримання статусу розслідування"""
        if case_id not in self.active_investigations:
            return {'error': f'Розслідування {case_id} не знайдено'}
        
        investigation = self.active_investigations[case_id]
        
        return {
            'case_id': case_id,
            'status': investigation.status,
            'confidence': investigation.confidence_score,
            'evidence_count': investigation.evidence_count,
            'created': investigation.created_at.isoformat(),
            'updated': investigation.updated_at.isoformat()
        }

    async def demo_investigation(self):
        """Демонстрація можливостей агента"""
        print("🕵️ ДЕМОНСТРАЦІЯ DEEP INVESTIGATOR AGENT")
        print("=" * 60)
        
        # Створення тестової події
        trigger_event = {
            'type': 'suspicious_financial_network',
            'description': 'Виявлено підозрілу мережу фінансових переказів',
            'amount': 5200000.0,
            'risk_level': 'high',
            'source': 'Banking Monitoring System'
        }
        
        # Запуск розслідування
        investigation = await self.start_investigation(trigger_event)
        
        # Затримка для реалістичності
        await asyncio.sleep(2)
        
        # Проведення повного розслідування
        final_report = await self.conduct_investigation(investigation.case_id)
        
        print("\n📋 ФІНАЛЬНИЙ ЗВІТ:")
        print("=" * 30)
        print(f"Розслідування: {final_report['investigation']['case_id']}")
        print(f"Статус: {final_report['investigation']['status']}")
        print(f"Впевненість: {final_report['investigation']['confidence_score']:.1%}")
        
        print(f"\n🔍 Ключові висновки:")
        for finding in final_report['summary']['key_findings']:
            print(f"  • {finding}")
        
        print(f"\n📝 Рекомендовані дії:")
        for action in final_report['summary']['recommended_actions'][:3]:
            print(f"  • {action}")
        
        return final_report

# Демонстрація агента
async def main():
    agent = DeepInvestigatorAgent()
    await agent.demo_investigation()

if __name__ == "__main__":
    asyncio.run(main())
