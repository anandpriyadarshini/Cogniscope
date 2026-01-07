from typing import Dict, List, Any, Tuple


class LearningGapRules:
    """Rule-based system for detecting learning gaps."""
    
    def __init__(self):
        # Thresholds for different indicators
        self.thresholds = {
            'very_fast_threshold': 5.0,  # seconds
            'high_confidence_threshold': 4,
            'low_confidence_threshold': 2,
            'overconfidence_threshold': 1.0,
            'time_inconsistency_threshold': 0.7,
            'concept_gap_threshold': 0.3,
            'accuracy_threshold_high': 0.8,
            'accuracy_threshold_low': 0.6
        }
    
    def analyze_learning_gaps(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Apply rule-based analysis to detect learning gaps."""
        
        analysis = {
            'gap_indicators': [],
            'strengths': [],
            'risk_factors': [],
            'authenticity_score': 0.0,
            'gap_severity': 0.0
        }
        
        # Analyze different aspects
        analysis.update(self._analyze_speed_patterns(features))
        analysis.update(self._analyze_confidence_patterns(features))
        analysis.update(self._analyze_consistency_patterns(features))
        analysis.update(self._analyze_ai_usage_indicators(features))
        
        # Calculate final scores
        analysis['gap_severity'] = self._calculate_gap_severity(analysis['gap_indicators'])
        analysis['authenticity_score'] = self._calculate_authenticity_score(features, analysis)
        analysis['risk_level'] = self._determine_risk_level(analysis['gap_severity'])
        
        return analysis
    
    def _analyze_speed_patterns(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze timing patterns for learning gaps."""
        patterns = {'speed_analysis': {}}
        
        avg_time = features.get('avg_time', 0)
        very_fast_rate = features.get('very_fast_responses', 0)
        time_variance = features.get('time_variance', 0)
        
        # Suspiciously fast responses
        if very_fast_rate > 0.3:  # More than 30% very fast
            patterns['gap_indicators'] = patterns.get('gap_indicators', [])
            patterns['gap_indicators'].append({
                'type': 'speed_anomaly',
                'description': f'High rate of very fast responses ({very_fast_rate:.1%})',
                'severity': 'medium' if very_fast_rate < 0.5 else 'high'
            })
        
        # Extremely consistent timing (might indicate copy-paste)
        if time_variance < 2.0 and avg_time < 10:
            patterns['gap_indicators'] = patterns.get('gap_indicators', [])
            patterns['gap_indicators'].append({
                'type': 'timing_consistency',
                'description': 'Unusually consistent response times',
                'severity': 'medium'
            })
        
        # Good pacing
        if 10 <= avg_time <= 30 and very_fast_rate < 0.1:
            patterns['strengths'] = patterns.get('strengths', [])
            patterns['strengths'].append('Thoughtful pacing on questions')
        
        return patterns
    
    def _analyze_confidence_patterns(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze confidence patterns for learning gaps."""
        patterns = {'confidence_analysis': {}}
        
        avg_confidence = features.get('avg_confidence', 0)
        overconfidence_score = features.get('overconfidence_score', 0)
        confidence_when_correct = features.get('avg_confidence_when_correct', 0)
        confidence_when_incorrect = features.get('avg_confidence_when_incorrect', 0)
        accuracy = features.get('accuracy', 0)
        
        # Overconfidence on wrong answers
        if overconfidence_score > self.thresholds['overconfidence_threshold']:
            patterns['gap_indicators'] = patterns.get('gap_indicators', [])
            patterns['gap_indicators'].append({
                'type': 'overconfidence',
                'description': f'High confidence on incorrect answers (score: {overconfidence_score:.1f})',
                'severity': 'high'
            })
        
        # High confidence with low accuracy
        if avg_confidence > 4.0 and accuracy < 0.6:
            patterns['gap_indicators'] = patterns.get('gap_indicators', [])
            patterns['gap_indicators'].append({
                'type': 'confidence_accuracy_mismatch',
                'description': f'High confidence ({avg_confidence:.1f}) but low accuracy ({accuracy:.1%})',
                'severity': 'high'
            })
        
        # Appropriate confidence calibration
        confidence_gap = abs(confidence_when_correct - confidence_when_incorrect)
        if confidence_gap > 1.0 and confidence_when_correct > confidence_when_incorrect:
            patterns['strengths'] = patterns.get('strengths', [])
            patterns['strengths'].append('Well-calibrated confidence levels')
        
        return patterns
    
    def _analyze_consistency_patterns(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze consistency across concepts."""
        patterns = {'consistency_analysis': {}}
        
        concept_gap = features.get('concept_gap', 0)
        concept_consistency = features.get('concept_consistency', 0)
        weakest_score = features.get('weakest_concept_score', 0)
        
        # Large gaps between concepts
        if concept_gap > self.thresholds['concept_gap_threshold']:
            patterns['gap_indicators'] = patterns.get('gap_indicators', [])
            patterns['gap_indicators'].append({
                'type': 'concept_inconsistency',
                'description': f'Large performance gap across concepts ({concept_gap:.1%})',
                'severity': 'medium'
            })
        
        # Very weak performance on some concepts
        if weakest_score < 0.3:
            patterns['gap_indicators'] = patterns.get('gap_indicators', [])
            patterns['gap_indicators'].append({
                'type': 'concept_weakness',
                'description': f'Very poor performance on some concepts ({weakest_score:.1%})',
                'severity': 'high'
            })
        
        # Good consistency
        if concept_consistency > 0.8 and weakest_score > 0.6:
            patterns['strengths'] = patterns.get('strengths', [])
            patterns['strengths'].append('Consistent understanding across concepts')
        
        return patterns
    
    def _analyze_ai_usage_indicators(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze patterns that might indicate AI assistance."""
        patterns = {'ai_analysis': {}}
        
        very_fast_rate = features.get('very_fast_responses', 0)
        accuracy = features.get('accuracy', 0)
        avg_confidence = features.get('avg_confidence', 0)
        time_variance = features.get('time_variance', 0)
        
        # High accuracy with fast responses and high confidence (classic AI pattern)
        if accuracy > 0.85 and very_fast_rate > 0.4 and avg_confidence > 4.0:
            patterns['risk_factors'] = patterns.get('risk_factors', [])
            patterns['risk_factors'].append({
                'type': 'potential_ai_assistance',
                'description': 'Pattern suggests possible AI assistance (high accuracy + speed + confidence)',
                'severity': 'high',
                'confidence': 0.8
            })
        
        # Unnatural timing consistency
        if time_variance < 1.0 and len(features.get('attempts', [])) > 5:
            patterns['risk_factors'] = patterns.get('risk_factors', [])
            patterns['risk_factors'].append({
                'type': 'unnatural_timing',
                'description': 'Unusually consistent response times across questions',
                'severity': 'medium',
                'confidence': 0.6
            })
        
        return patterns
    
    def _calculate_gap_severity(self, gap_indicators: List[Dict]) -> float:
        """Calculate overall gap severity score."""
        if not gap_indicators:
            return 0.0
        
        severity_weights = {'low': 0.2, 'medium': 0.5, 'high': 1.0}
        total_score = sum(severity_weights.get(indicator.get('severity', 'low'), 0.2) 
                         for indicator in gap_indicators)
        
        # Normalize to 0-1 scale
        max_possible = len(gap_indicators) * 1.0
        return min(total_score / max_possible, 1.0) if max_possible > 0 else 0.0
    
    def _calculate_authenticity_score(self, features: Dict[str, Any], analysis: Dict[str, Any]) -> float:
        """Calculate how authentic the learning appears to be."""
        risk_factors = analysis.get('risk_factors', [])
        
        if not risk_factors:
            return 1.0  # Highly authentic if no risk factors
        
        # Reduce authenticity based on risk factors
        authenticity = 1.0
        for factor in risk_factors:
            severity = factor.get('severity', 'low')
            confidence = factor.get('confidence', 0.5)
            
            if severity == 'high':
                authenticity -= 0.3 * confidence
            elif severity == 'medium':
                authenticity -= 0.2 * confidence
            else:
                authenticity -= 0.1 * confidence
        
        return max(authenticity, 0.0)
    
    def _determine_risk_level(self, gap_severity: float) -> str:
        """Determine risk level based on gap severity."""
        if gap_severity < 0.3:
            return 'safe'
        elif gap_severity < 0.6:
            return 'watch'
        else:
            return 'at_risk'
