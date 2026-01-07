from typing import Dict, Any, List
import numpy as np


class AuthenticityDetector:
    """Advanced detection of learning authenticity vs AI assistance."""
    
    def __init__(self):
        self.ai_patterns = {
            # Common AI response patterns
            'response_speed_patterns': {
                'too_consistent': {'min_variance': 0.5, 'weight': 0.3},
                'too_fast': {'max_avg_time': 8.0, 'weight': 0.4},
                'burst_pattern': {'consecutive_fast': 3, 'weight': 0.3}
            },
            'confidence_patterns': {
                'overconfident_incorrect': {'threshold': 3.5, 'weight': 0.5},
                'uniform_high_confidence': {'min_avg': 4.0, 'min_rate': 0.7, 'weight': 0.4}
            },
            'accuracy_patterns': {
                'perfect_with_speed': {'min_accuracy': 0.9, 'max_avg_time': 15, 'weight': 0.6},
                'no_learning_curve': {'consistency_threshold': 0.9, 'weight': 0.3}
            }
        }
    
    def detect_ai_usage_probability(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate probability of AI assistance based on behavioral patterns."""
        
        detection_result = {
            'ai_probability': 0.0,
            'confidence_level': 0.0,
            'detected_patterns': [],
            'authenticity_indicators': [],
            'recommendation': ''
        }
        
        # Analyze different pattern categories
        speed_score = self._analyze_speed_patterns(features)
        confidence_score = self._analyze_confidence_authenticity(features)
        accuracy_score = self._analyze_accuracy_patterns(features)
        behavioral_score = self._analyze_behavioral_consistency(features)
        
        # Combine scores with weights
        ai_probability = (
            speed_score['score'] * 0.3 +
            confidence_score['score'] * 0.25 +
            accuracy_score['score'] * 0.25 +
            behavioral_score['score'] * 0.2
        )
        
        detection_result['ai_probability'] = min(ai_probability, 1.0)
        detection_result['detected_patterns'] = (
            speed_score['patterns'] +
            confidence_score['patterns'] +
            accuracy_score['patterns'] +
            behavioral_score['patterns']
        )
        
        # Calculate confidence in detection
        detection_result['confidence_level'] = self._calculate_detection_confidence(
            detection_result['detected_patterns']
        )
        
        # Generate recommendations
        detection_result['recommendation'] = self._generate_recommendation(
            detection_result['ai_probability'],
            detection_result['confidence_level']
        )
        
        return detection_result
    
    def _analyze_speed_patterns(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze response speed for AI usage indicators."""
        result = {'score': 0.0, 'patterns': []}
        
        avg_time = features.get('avg_time', 30)
        very_fast_rate = features.get('very_fast_responses', 0)
        time_variance = features.get('time_variance', 10)
        accuracy = features.get('accuracy', 0)
        
        # Pattern 1: Too fast with high accuracy
        if avg_time < 10 and accuracy > 0.8:
            result['score'] += 0.4
            result['patterns'].append({
                'pattern': 'fast_accurate_responses',
                'description': f'Very fast responses ({avg_time:.1f}s avg) with high accuracy ({accuracy:.1%})',
                'strength': 'strong'
            })
        
        # Pattern 2: Consistent very fast responses
        if very_fast_rate > 0.5:
            result['score'] += 0.3
            result['patterns'].append({
                'pattern': 'consistent_speed',
                'description': f'{very_fast_rate:.1%} of responses were very fast (<5s)',
                'strength': 'medium'
            })
        
        # Pattern 3: Unnaturally low time variance
        if time_variance < 2 and avg_time < 15:
            result['score'] += 0.3
            result['patterns'].append({
                'pattern': 'robotic_timing',
                'description': f'Very low timing variance ({time_variance:.1f}s)',
                'strength': 'medium'
            })
        
        return result
    
    def _analyze_confidence_authenticity(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze confidence patterns for authenticity."""
        result = {'score': 0.0, 'patterns': []}
        
        avg_confidence = features.get('avg_confidence', 3)
        confidence_when_incorrect = features.get('avg_confidence_when_incorrect', 2)
        high_confidence_rate = features.get('high_confidence_rate', 0)
        accuracy = features.get('accuracy', 0)
        
        # Pattern 1: High confidence on wrong answers
        if confidence_when_incorrect > 3.5:
            result['score'] += 0.5
            result['patterns'].append({
                'pattern': 'overconfident_errors',
                'description': f'High confidence ({confidence_when_incorrect:.1f}) on incorrect answers',
                'strength': 'strong'
            })
        
        # Pattern 2: Uniformly high confidence with mixed accuracy
        if high_confidence_rate > 0.7 and accuracy < 0.9:
            result['score'] += 0.3
            result['patterns'].append({
                'pattern': 'uniform_overconfidence',
                'description': f'{high_confidence_rate:.1%} high confidence responses despite {accuracy:.1%} accuracy',
                'strength': 'medium'
            })
        
        # Pattern 3: Perfect confidence-accuracy mismatch
        confidence_accuracy_gap = avg_confidence / 5.0 - accuracy
        if confidence_accuracy_gap > 0.3:
            result['score'] += 0.2
            result['patterns'].append({
                'pattern': 'confidence_accuracy_mismatch',
                'description': f'Large gap between confidence and actual performance',
                'strength': 'weak'
            })
        
        return result
    
    def _analyze_accuracy_patterns(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze accuracy patterns for AI indicators."""
        result = {'score': 0.0, 'patterns': []}
        
        accuracy = features.get('accuracy', 0)
        avg_time = features.get('avg_time', 30)
        concept_gap = features.get('concept_gap', 0)
        
        # Pattern 1: High accuracy with very fast responses
        if accuracy > 0.85 and avg_time < 12:
            result['score'] += 0.6
            result['patterns'].append({
                'pattern': 'superhuman_performance',
                'description': f'{accuracy:.1%} accuracy with {avg_time:.1f}s average time',
                'strength': 'strong'
            })
        
        # Pattern 2: Suspiciously uniform performance across concepts
        if concept_gap < 0.1 and accuracy > 0.8:
            result['score'] += 0.3
            result['patterns'].append({
                'pattern': 'uniform_concept_mastery',
                'description': f'Extremely consistent performance across all concepts',
                'strength': 'medium'
            })
        
        # Pattern 3: Perfect or near-perfect scores
        if accuracy >= 0.95:
            result['score'] += 0.2
            result['patterns'].append({
                'pattern': 'near_perfect_accuracy',
                'description': f'Near-perfect accuracy ({accuracy:.1%}) is statistically rare',
                'strength': 'weak'
            })
        
        return result
    
    def _analyze_behavioral_consistency(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze behavioral consistency for human-like patterns."""
        result = {'score': 0.0, 'patterns': []}
        
        concept_consistency = features.get('concept_consistency', 0)
        time_variance = features.get('time_variance', 10)
        confidence_std = features.get('confidence_std', 1)
        
        # Pattern 1: Too perfect consistency
        if concept_consistency > 0.95 and time_variance < 3:
            result['score'] += 0.4
            result['patterns'].append({
                'pattern': 'perfect_consistency',
                'description': 'Unnaturally consistent performance patterns',
                'strength': 'medium'
            })
        
        # Pattern 2: No natural learning variations
        if confidence_std < 0.5:
            result['score'] += 0.2
            result['patterns'].append({
                'pattern': 'no_confidence_variation',
                'description': 'Extremely stable confidence levels throughout quiz',
                'strength': 'weak'
            })
        
        return result
    
    def _calculate_detection_confidence(self, patterns: List[Dict]) -> float:
        """Calculate confidence in AI detection based on pattern strength."""
        if not patterns:
            return 0.0
        
        strength_weights = {'strong': 0.8, 'medium': 0.5, 'weak': 0.2}
        total_confidence = sum(strength_weights.get(p.get('strength', 'weak'), 0.2) for p in patterns)
        
        return min(total_confidence / len(patterns), 1.0)
    
    def _generate_recommendation(self, ai_probability: float, confidence: float) -> str:
        """Generate actionable recommendations based on detection results."""
        if ai_probability < 0.3:
            return "Performance appears authentic. Continue monitoring."
        elif ai_probability < 0.6:
            if confidence > 0.6:
                return "Moderate AI usage suspected. Consider follow-up assessment."
            else:
                return "Some unusual patterns detected. Recommend closer observation."
        else:
            if confidence > 0.7:
                return "High probability of AI assistance. Immediate intervention recommended."
            else:
                return "Strong AI usage indicators. Further investigation needed."
