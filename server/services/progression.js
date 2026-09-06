// Versioned deterministic policy: the model never invents a load increase.
function recommend(current, history, increment, now = Date.now()) {
  const result = { version: 1, decision: 'insufficient_data', weight_kg: null, reps: current.target_reps || null, increment_kg: increment, reason: 'Finish two sessions of this exercise with consistent working sets to get a suggestion.', evidence: history.map(h => ({ completed_at: h.completed_at, sets: h.sets })) };
  if (!current.target_reps || !current.target_sets || history.length < 2) return result;
  const latest = history[0];
  const load = latest.sets?.[0]?.weight;
  if (!Number.isFinite(load) || load <= 0) return { ...result, reason: 'Bodyweight and assisted exercises need manual progression.' };
  const consistent = history.every(h => h.sets.length === current.target_sets && h.sets.every(s => s.completed && s.weight === load && Number.isInteger(s.reps) && s.reps > 0));
  if (!consistent) return { ...result, reason: 'Working-set weights or set counts differ. Review the logs before increasing.' };
  result.weight_kg = load;
  result.decision = 'hold';
  if (history.some(h => now - new Date(h.completed_at).getTime() > 30 * 86400000)) return { ...result, weight_kg: null, reason: 'Two recent sessions within 30 days are needed. Choose a comfortable load manually.' };
  if (!history.every(h => h.sets.every(s => s.reps >= current.target_reps + 2))) return { ...result, reason: 'Keep this load until every working set exceeds the current rep target by two in two completed sessions.' };
  if (increment / load > 0.05) return { ...result, reason: 'That equipment increment exceeds the 5% increase limit. Choose a smaller increment or keep this load.' };
  return { ...result, decision: 'increase', weight_kg: Math.round((load + increment) * 100) / 100, reason: 'Every working set exceeded the rep target by two in your last two sessions. Try one equipment increment if form and recovery feel good.' };
}
module.exports = { recommend };
