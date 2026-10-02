// Playback of authored examples. This controller does not execute research.
export function createNavigation(data, initialScenario = data.scenarios[0]?.id) {
  const tasks = new Set(data.nodes.map(node => node.id));
  const connections = new Set(data.edges.map(edge => `${edge.from}>${edge.to}`));
  for (const scenario of data.scenarios) {
    if (!scenario.steps.length) throw new Error('A route needs a task');
    scenario.steps.forEach((step, index) => {
      if (!tasks.has(step.node)) throw new Error(`Unknown task: ${step.node}`);
      if (index && !connections.has(`${scenario.steps[index - 1].node}>${step.node}`)) {
        throw new Error(`Missing connection in ${scenario.id}`);
      }
    });
  }
  let scenario, index = 0, playing = false;
  function chooseScenario(id) {
    const candidate = data.scenarios.find(item => item.id === id);
    if (!candidate) throw new Error('Unknown example');
    scenario = candidate; index = 0; playing = false;
  }
  function snapshot() {
    return {
      scenario, index, playing,
      current: scenario.steps[index],
      next: scenario.steps[index + 1] || null,
      visited: scenario.steps.slice(0, index + 1).map(step => step.node),
      complete: index === scenario.steps.length - 1
    };
  }
  function next() {
    if (index < scenario.steps.length - 1) index++;
    if (index === scenario.steps.length - 1) playing = false;
  }
  function seek(stop) {
    if (!Number.isInteger(stop) || stop < 0 || stop >= scenario.steps.length) throw new Error('Invalid route stop');
    index = stop; playing = false;
  }
  chooseScenario(initialScenario);
  return {
    snapshot, chooseScenario, next, seek,
    reset: () => seek(0),
    play: () => { if (index === scenario.steps.length - 1) index = 0; playing = true; },
    pause: () => { playing = false; },
    tick: () => { if (playing) next(); }
  };
}
