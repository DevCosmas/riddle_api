import { IRiddle } from '../model/riddle';

export default function isChallengeElapsed(riddle: IRiddle): boolean {
  const { createdAt, duration } = riddle;

  // Calculate the duration in milliseconds based on the unit
  let durationInMs;
  switch (duration.unit) {
    case 'seconds':
      durationInMs = duration.value * 1000;
      break;
    case 'minutes':
      durationInMs = duration.value * 60 * 1000;
      break;
    case 'hours':
      durationInMs = duration.value * 60 * 60 * 1000;
      break;
    case 'days':
      durationInMs = duration.value * 24 * 60 * 60 * 1000;
      break;
    default:
      throw new Error('Invalid duration unit');
  }

  // Calculate the end time by adding duration to createdAt
  const endTime = createdAt.getTime() + durationInMs;

  return Date.now() > endTime;
}
