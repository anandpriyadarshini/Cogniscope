from typing import Dict, List, Any
from models.quiz import StudentSubmission
from models.result import LearningGapResult, ConceptGap
from logic.features import FeatureExtractor
from logic.rules import LearningGapRules  
from logic.authenticity import AuthenticityDetector
from datetime import datetime


class LearningGapScorer:
    """Main scoring engine that combines all analysis components."""
    
    def __init__(self):
        self.feature_extractor = FeatureExtractor()
        self.rules_engine = LearningGapRules()
        self.authenticity_detector = AuthenticityDetector()
    
    def score_submission(self, submission: StudentSubmission) -> LearningGapResult:
        """Generate complete learning gap analysis for a submission."""
        
        # Extract features
        features = self.feature_extractor.extract_features(submission)
        
        # Apply rule-based analysis
        gap_analysis = self.rules_engine.analyze_learning_gaps(features)
        
        # Detect AI usage patterns
        authenticity_analysis = self.authenticity_detector.detect_ai_usage_probability(features)
        
        # Generate concept-level gaps
        concept_gaps = self._generate_concept_gaps(features, gap_analysis, submission)
        
        # Calculate overall scores
        overall_score = self._calculate_overall_score(gap_analysis, authenticity_analysis)
        overall_risk = self._determine_overall_risk(overall_score, authenticity_analysis)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            gap_analysis, authenticity_analysis, concept_gaps
        )
        
        return LearningGapResult(
            student_id=submission.student_id,
            quiz_id=submission.quiz_id,
            overall_score=overall_score,
            overall_risk=overall_risk,
            concept_gaps=concept_gaps,
            timestamp=datetime.now(),
            recommendations=recommendations
        )
    
    def _generate_concept_gaps(self, features: Dict[str, Any], 
                              gap_analysis: Dict[str, Any], 
                              submission: StudentSubmission) -> List[ConceptGap]:
        """Generate concept-level gap analysis."""
        
        # Group attempts by concept (simplified mapping)
        concept_attempts = {}
        for attempt in submission.attempts:
            concept = f"concept_{attempt.question_id % 3}"  # Simple concept mapping
            if concept not in concept_attempts:
                concept_attempts[concept] = []
            concept_attempts[concept].append(attempt)
        
        concept_gaps = []
        
        for concept, attempts in concept_attempts.items():
            # Calculate concept-specific metrics
            accuracy = sum(1 for a in attempts if a.is_correct) / len(attempts)
            avg_time = sum(a.time_taken for a in attempts) / len(attempts)
            avg_confidence = sum(a.confidence for a in attempts) / len(attempts)
            
            # Determine gap score for this concept
            gap_score = self._calculate_concept_gap_score(
                accuracy, avg_time, avg_confidence, attempts
            )
            
            # Determine risk level
            if gap_score < 0.3:
                risk_level = "safe"
            elif gap_score < 0.6:
                risk_level = "watch" 
            else:
                risk_level = "at_risk"
            
            # Generate indicators
            indicators = self._generate_concept_indicators(
                accuracy, avg_time, avg_confidence, attempts
            )
            
            concept_gaps.append(ConceptGap(
                concept=concept.replace('_', ' ').title(),
                gap_score=gap_score,
                risk_level=risk_level,
                indicators=indicators
            ))
        
        return concept_gaps
    
    def _calculate_concept_gap_score(self, accuracy: float, avg_time: float, 
                                   avg_confidence: float, attempts: List) -> float:
        """Calculate gap score for a specific concept."""
        gap_score = 0.0
        
        # Low accuracy indicates gaps
        if accuracy < 0.6:
            gap_score += (0.6 - accuracy) * 1.5
        
        # Overconfidence on incorrect answers
        incorrect_attempts = [a for a in attempts if not a.is_correct]
        if incorrect_attempts:
            incorrect_confidence = sum(a.confidence for a in incorrect_attempts) / len(incorrect_attempts)
            if incorrect_confidence > 3.5:
                gap_score += 0.3
        
        # Suspiciously fast responses with high confidence
        if avg_time < 8 and avg_confidence > 4:
            gap_score += 0.2
        
        # Very slow responses might indicate confusion
        if avg_time > 45:
            gap_score += 0.1
        
        return min(gap_score, 1.0)
    
    def _generate_concept_indicators(self, accuracy: float, avg_time: float,
                                   avg_confidence: float, attempts: List) -> List[str]:
        """Generate specific indicators for concept gaps."""
        indicators = []
        
        if accuracy < 0.5:
            indicators.append(f"Low accuracy ({accuracy:.1%})")
        
        if avg_time < 10 and accuracy > 0.8:
            indicators.append("Fast responses with high accuracy (potential AI)")
        
        if avg_confidence > 4 and accuracy < 0.7:
            indicators.append("Overconfident despite poor performance")
        
        # Check for consistency within concept
        correct_times = [a.time_taken for a in attempts if a.is_correct]
        incorrect_times = [a.time_taken for a in attempts if not a.is_correct]
        
        if correct_times and incorrect_times:
            if abs(sum(correct_times)/len(correct_times) - sum(incorrect_times)/len(incorrect_times)) < 2:
                indicators.append("Similar response times for correct/incorrect answers")
        
        if not indicators:
            indicators.append("Performance within expected range")
        
        return indicators
    
    def _calculate_overall_score(self, gap_analysis: Dict[str, Any], 
                               authenticity_analysis: Dict[str, Any]) -> float:
        """Calculate overall learning gap score."""
        
        gap_severity = gap_analysis.get('gap_severity', 0)
        authenticity_score = authenticity_analysis.get('ai_probability', 0)
        
        # Combine gap severity with AI usage probability
        overall_score = (gap_severity * 0.7) + (authenticity_score * 0.3)
        
        return min(overall_score, 1.0)
    
    def _determine_overall_risk(self, overall_score: float, 
                              authenticity_analysis: Dict[str, Any]) -> str:
        """Determine overall risk level."""
        
        ai_probability = authenticity_analysis.get('ai_probability', 0)
        
        # High AI probability automatically elevates risk
        if ai_probability > 0.7:
            return "at_risk"
        
        if overall_score < 0.3:
            return "safe"
        elif overall_score < 0.6:
            return "watch"
        else:
            return "at_risk"
    
    def _generate_recommendations(self, gap_analysis: Dict[str, Any],
                                authenticity_analysis: Dict[str, Any],
                                concept_gaps: List[ConceptGap]) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        # AI usage recommendations
        ai_probability = authenticity_analysis.get('ai_probability', 0)
        if ai_probability > 0.6:
            recommendations.append("Consider follow-up assessment without digital tools")
            recommendations.append("Implement concept understanding checks through discussion")
        
        # Learning gap recommendations
        at_risk_concepts = [cg for cg in concept_gaps if cg.risk_level == "at_risk"]
        if at_risk_concepts:
            recommendations.append(f"Focus remediation on: {', '.join([c.concept for c in at_risk_concepts])}")
        
        # Confidence calibration recommendations
        overconfidence_indicators = [
            ind for ind in gap_analysis.get('gap_indicators', [])
            if ind.get('type') == 'overconfidence'
        ]
        if overconfidence_indicators:
            recommendations.append("Work on confidence calibration and self-assessment skills")
        
        # Speed recommendations
        speed_indicators = [
            ind for ind in gap_analysis.get('gap_indicators', [])
            if 'speed' in ind.get('type', '')
        ]
        if speed_indicators:
            recommendations.append("Encourage more thoughtful problem-solving approach")
        
        if not recommendations:
            recommendations.append("Continue current learning approach - performance looks good")
        
        return recommendations
    
    def batch_score_submissions(self, submissions: List[StudentSubmission]) -> List[LearningGapResult]:
        """Score multiple submissions efficiently."""
        return [self.score_submission(submission) for submission in submissions]
