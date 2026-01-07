from datetime import datetime
import statistics


def calculate_time_stats(times: list) -> dict:
    """Calculate time-based statistics for response analysis."""
    if not times:
        return {"avg": 0, "median": 0, "std": 0}
    
    return {
        "avg": statistics.mean(times),
        "median": statistics.median(times),
        "std": statistics.stdev(times) if len(times) > 1 else 0
    }


def is_weekend(timestamp: datetime) -> bool:
    """Check if timestamp falls on weekend."""
    return timestamp.weekday() >= 5


def time_of_day_category(timestamp: datetime) -> str:
    """Categorize time of day for pattern analysis."""
    hour = timestamp.hour
    if 6 <= hour < 12:
        return "morning"
    elif 12 <= hour < 18:
        return "afternoon"
    elif 18 <= hour < 22:
        return "evening"
    else:
        return "night"


def format_duration(seconds: float) -> str:
    """Format seconds into human-readable duration."""
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        return f"{seconds/60:.1f}m"
    else:
        return f"{seconds/3600:.1f}h"
