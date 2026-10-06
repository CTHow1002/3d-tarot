const noop = () => {};
let sink = noop;

const schema = Object.freeze({
  tarot_start: Object.freeze({}),
  tarot_draw: Object.freeze({ position: (value) => Number.isInteger(value) && value >= 1 && value <= 8 }),
  tarot_complete: Object.freeze({}),
  tarot_reading_open: Object.freeze({ position: (value) => Number.isInteger(value) && value >= 1 && value <= 8 }),
  tarot_reading_close: Object.freeze({}),
  tarot_restart: Object.freeze({ stage: (value) => value === 'draw' || value === 'results' })
});

export function setAnalyticsSink(nextSink) {
  sink = typeof nextSink === 'function' ? nextSink : noop;
}

export function track(eventName, properties = {}) {
  try {
    if (!Object.hasOwn(schema, eventName)) return;
    const safeProperties = {};
    const allowed = schema[eventName];
    for (const [key, validate] of Object.entries(allowed)) {
      if (!properties || typeof properties !== 'object' || !validate(properties[key])) return;
      safeProperties[key] = properties[key];
    }

    void Promise.resolve(sink(eventName, safeProperties)).catch(noop);
  } catch {
    // Analytics must never interrupt the reading flow.
  }
}
