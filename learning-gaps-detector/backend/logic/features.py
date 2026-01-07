from typing import List, Dict, Any
import statistics
from models.quiz import StudentSubmission, QuizAttempt
from utils.time_utils import calculate_time_stats


class FeatureExtractor:
    """Extract behavioral features from student quiz attempts."""
    
    def extract_features(self, submission: StudentSubmission) -> Dict[str, Any]:
        """Extract all behavioral features from a submission."""
        attempts = submission.attempts
        
        features = {
            'student_id': submission.student_id,
            'quiz_id': submission.quiz_id,
            'timestamp': submission.timestamp,
        }
        
        # Time-based features
        features.update(self._extract_time_features(attempts))
        
        # Confidence features  
        features.update(self._extract_confidence_features(attempts))
        
        # Accuracy features
        features.update(self._extract_accuracy_features(attempts))
        
        # Consistency features
        features.update(self._extract_consistency_features(attempts))
        
        return features
    
    def _extract_time_features(self, attempts: List[QuizAttempt]) -> Dict[str, float]:
        """Extract timing-related features."""
        times = [attempt.time_taken for attempt in attempts]
        correct_times = [attempt.time_taken for attempt in attempts if attempt.is_correct]
        incorrect_times = [attempt.time_taken for attempt in attempts if not attempt.is_correct]
        
        features = {}
        
        # Basic time stats
        time_stats = calculate_time_stats(times)
        features['avg_time'] = time_stats['avg']
        features['median_time'] = time_stats['median']
        features['time_std'] = time_stats['std']
        
        # Speed patterns
        features['very_fast_responses'] = sum(1 for t in times if t < 5) / len(times)
        features['very_slow_responses'] = sum(1 for t in times if t > 60) / len(times)
        
        # Correct vs incorrect timing
        if correct_times:
            features['avg_correct_time'] = statistics.mean(correct_times)
        else:
            features['avg_correct_time'] = 0
            
        if incorrect_times:
            features['avg_incorrect_time'] = statistics.mean(incorrect_times)
        else:
            features['avg_incorrect_time'] = 0
        
        # Time consistency
        features['time_variance'] = statistics.variance(times) if len(times) > 1 else 0
        
        return features
    
    def _extract_confidence_features(self, attempts: List[QuizAttempt]) -> Dict[str, float]:
        """Extract confidence-related features."""
        confidences = [attempt.confidence for attempt in attempts]
        correct_confidences = [attempt.confidence for attempt in attempts if attempt.is_correct]
        incorrect_confidences = [attempt.confidence for attempt in attempts if not attempt.is_correct]
        
        features = {}
        
        # Basic confidence stats
        features['avg_confidence'] = statistics.mean(confidences)
        features['confidence_std'] = statistics.stdev(confidences) if len(confidences) > 1 else 0
        
        # High confidence patterns
        features['high_confidence_rate'] = sum(1 for c in confidences if c >= 4) / len(confidences)
        features['low_confidence_rate'] = sum(1 for c in confidences if c <= 2) / len(confidences)
        
        # Confidence accuracy alignment
        if correct_confidences:
            features['avg_confidence_when_correct'] = statistics.mean(correct_confidences)
        else:
            features['avg_confidence_when_correct'] = 0
            
        if incorrect_confidences:
            features['avg_confidence_when_incorrect'] = statistics.mean(incorrect_confidences)
        else:
            features['avg_confidence_when_incorrect'] = 0
            
        # Overconfidence indicator
        features['overconfidence_score'] = features['avg_confidence_when_incorrect'] - 2.5
        
        return features
    
    def _extract_accuracy_features(self, attempts: List[QuizAttempt]) -> Dict[str, float]:
        """Extract accuracy-related features."""
        features = {}
        
        total_attempts = len(attempts)
        correct_attempts = sum(1 for attempt in attempts if attempt.is_correct)
        
        features['accuracy'] = correct_attempts / total_attempts if total_attempts > 0 else 0
        features['total_questions'] = total_attempts
        features['correct_answers'] = correct_attempts
        features['incorrect_answers'] = total_attempts - correct_attempts
        
        return features
    
    def _extract_consistency_features(self, attempts: List[QuizAttempt]) -> Dict[str, float]:
        """Extract consistency-related features."""
        features = {}
        
        # Group by concept for consistency analysis
        concept_attempts = {}
        for attempt in attempts:
            # We'll need to map questions to concepts - for now use question_id
            concept = f"concept_{attempt.question_id % 3}"  # Simple grouping
            if concept not in concept_attempts:
                concept_attempts[concept] = []
            concept_attempts[concept].append(attempt)
        
        # Calculate concept-level consistency
        concept_accuracies = []
        for concept, concept_attempts_list in concept_attempts.items():
            if len(concept_attempts_list) > 0:
                accuracy = sum(1 for a in concept_attempts_list if a.is_correct) / len(concept_attempts_list)
                concept_accuracies.append(accuracy)
        
        if concept_accuracies:
            features['concept_consistency'] = 1 - statistics.stdev(concept_accuracies) if len(concept_accuracies) > 1 else 1
            features['weakest_concept_score'] = min(concept_accuracies)
            features['strongest_concept_score'] = max(concept_accuracies)
            features['concept_gap'] = max(concept_accuracies) - min(concept_accuracies)
        else:
            features['concept_consistency'] = 0
            features['weakest_concept_score'] = 0
            features['strongest_concept_score'] = 0
            features['concept_gap'] = 0
        
        return features
