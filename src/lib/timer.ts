// Module-level variable to store total elapsed time across all countdown calls
let totalElapsedTime: number = 0;

function measureTimeUntilCondition(
  stopCondition: () => boolean
): Promise<number> {
  // Each function call will have its own elapsedTime to avoid concurrency issues
  let elapsedTime: number = 0;

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      elapsedTime++;

      // Check if the stop condition is met
      if (stopCondition()) {
        clearInterval(interval);
        totalElapsedTime += elapsedTime; // Update total elapsed time only after the interval ends

        console.log(`Condition met after ${elapsedTime} seconds.`);
        resolve(elapsedTime); // Resolve with the time it took for the condition to be met
      }
    }, 1000); // 1-second intervals
  });
}

// Export the measureTimeUntilCondition function and totalElapsedTime for external use
export default measureTimeUntilCondition;
export { totalElapsedTime };
