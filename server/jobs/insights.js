const User = require('../models/User');
const { refresh } = require('../services/insights');
function startInsightJob() {
  let running = false;
  let stopped = false;
  let pending = Promise.resolve();
  const run = async () => {
    if (running || stopped) return;
    running = true;
    try {
      // Streaming cursor keeps memory bounded as account count grows.
      for await (const user of User.find().select('_id').lean().cursor({ batchSize: 50 })) {
        if (stopped) break;
        try { await refresh(user._id); } catch { console.error('Insight refresh failed for an account; will retry next cycle.'); }
      }
    } catch { console.error('Insight job could not read accounts; will retry next cycle.'); }
    finally { running = false; }
  };
  const tick = () => { if (!running) pending = run(); };
  const timer = setInterval(tick, 5 * 60000);
  timer.unref(); tick();
  return async () => { stopped = true; clearInterval(timer); await pending; };
}
module.exports = { startInsightJob };
