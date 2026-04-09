/**
 * ECS Component — base interface and component type registry.
 *
 * A Component is a pure-data bag with no methods. Systems read and mutate
 * component data; entities are merely IDs that group components together.
 *
 * Usage pattern:
 *   // Define a component
 *   interface PositionComponent extends Component {
 *     readonly type: 'Position';
 *     x: number;
 *     z: number;
 *   }
 *
 *   // Register its type token
 *   const PositionType: ComponentType<PositionComponent> = 'Position';
 */

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

/**
 * Base interface every concrete component must satisfy.
 *
 * The `type` field is a discriminant string used as the runtime key inside
 * {@link World}'s component maps. It must be unique across all component
 * definitions in the project.
 */
export interface Component {
  /** Discriminant string that identifies this component's kind at runtime. */
  readonly type: string;
}

/**
 * Branded string token used to look up a component type at compile time.
 *
 * Using a phantom-branded type prevents accidentally passing the wrong string
 * literal as a component key. Create tokens with {@link componentType}.
 *
 * @typeParam T - The concrete {@link Component} subtype this token represents.
 */
export type ComponentType<T extends Component> = T['type'] & { __brand: T };

// ---------------------------------------------------------------------------
// Factory Helper
// ---------------------------------------------------------------------------

/**
 * Creates a compile-time-safe {@link ComponentType} token from a plain string.
 *
 * @param key - The discriminant string literal that matches `T['type']`.
 * @returns A branded token safe to pass to World component APIs.
 *
 * @example
 * const PositionType = componentType<PositionComponent>('Position');
 * world.addComponent(entity, PositionType, { type: 'Position', x: 0, z: 0 });
 */
export function componentType<T extends Component>(key: T['type']): ComponentType<T> {
  return key as ComponentType<T>;
}
