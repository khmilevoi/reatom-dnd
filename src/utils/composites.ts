import { PositionModifier, Sensor } from '../types.ts';

type SensorMethod = keyof Sensor;

const composeSensorMethod = <M extends SensorMethod>(
  sensors: Sensor[],
  method: M,
): Sensor[M] => {
  return ((...args: unknown[]) => {
    const cleanups = sensors.map((sensor) =>
      (sensor[method] as (...args: unknown[]) => () => void)(...args),
    );
    return () => cleanups.forEach((cleanup) => cleanup());
  }) as Sensor[M];
};

export const makeSensors = (sensors: Sensor[]): Sensor => {
  return {
    onDragStart: composeSensorMethod(sensors, 'onDragStart'),
    onDragEnd: composeSensorMethod(sensors, 'onDragEnd'),
    onMovePointer: composeSensorMethod(sensors, 'onMovePointer'),
    onCancel: composeSensorMethod(sensors, 'onCancel'),
    onDrop: composeSensorMethod(sensors, 'onDrop'),
    onDropEnter: composeSensorMethod(sensors, 'onDropEnter'),
    onDropLeave: composeSensorMethod(sensors, 'onDropLeave'),
  };
};

export const makeModifiers = (
  modifiers: PositionModifier[],
): PositionModifier => {
  if (modifiers.length === 0) {
    return ({ position }) => position;
  }

  return (args) => {
    return modifiers.reduce(
      (position, modifier) => modifier({ ...args, position }),
      args.position,
    );
  };
};
