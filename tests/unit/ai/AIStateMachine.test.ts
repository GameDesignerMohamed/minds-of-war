import { describe, it, expect } from 'vitest';
import { AIStateMachine } from '@/ai/AIStateMachine';
import type { AIState } from '@/ai/AIStateMachine';

interface TestContext {
  count: number;
}

function makeState(name: string, nextState: string | null = null): AIState<TestContext> {
  return {
    name,
    enter: () => {},
    exit: () => {},
    update: (_ctx: TestContext, _dt: number) => nextState,
  };
}

describe('AIStateMachine', () => {
  it('starts in initial state', () => {
    const fsm = new AIStateMachine<TestContext>();
    fsm.registerState(makeState('A'));
    fsm.registerState(makeState('B'));

    const ctx: TestContext = { count: 0 };
    fsm.start('A', ctx);

    expect(fsm.activeStateName).toBe('A');
  });

  it('transitions when update returns a state name', () => {
    const fsm = new AIStateMachine<TestContext>();
    fsm.registerState(makeState('A', 'B'));
    fsm.registerState(makeState('B'));

    const ctx: TestContext = { count: 0 };
    fsm.start('A', ctx);
    fsm.update(ctx, 0.016);

    expect(fsm.activeStateName).toBe('B');
  });

  it('stays in state when update returns null', () => {
    const fsm = new AIStateMachine<TestContext>();
    fsm.registerState(makeState('A', null));

    const ctx: TestContext = { count: 0 };
    fsm.start('A', ctx);
    fsm.update(ctx, 0.016);

    expect(fsm.activeStateName).toBe('A');
  });

  it('calls enter on transition', () => {
    let entered = false;
    const stateB: AIState<TestContext> = {
      name: 'B',
      enter: () => {
        entered = true;
      },
      exit: () => {},
      update: () => null,
    };

    const fsm = new AIStateMachine<TestContext>();
    fsm.registerState(makeState('A', 'B'));
    fsm.registerState(stateB);

    const ctx: TestContext = { count: 0 };
    fsm.start('A', ctx);
    fsm.update(ctx, 0.016);

    expect(entered).toBe(true);
  });

  it('calls exit on transition', () => {
    let exited = false;
    const stateA: AIState<TestContext> = {
      name: 'A',
      enter: () => {},
      exit: () => {
        exited = true;
      },
      update: () => 'B',
    };

    const fsm = new AIStateMachine<TestContext>();
    fsm.registerState(stateA);
    fsm.registerState(makeState('B'));

    const ctx: TestContext = { count: 0 };
    fsm.start('A', ctx);
    fsm.update(ctx, 0.016);

    expect(exited).toBe(true);
  });

  it('forceTransition changes state immediately', () => {
    const fsm = new AIStateMachine<TestContext>();
    fsm.registerState(makeState('A'));
    fsm.registerState(makeState('B'));

    const ctx: TestContext = { count: 0 };
    fsm.start('A', ctx);
    fsm.forceTransition('B', ctx);

    expect(fsm.activeStateName).toBe('B');
  });
});
