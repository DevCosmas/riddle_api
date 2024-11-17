"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalElapsedTime = void 0;
// Module-level variable to store total elapsed time across all countdown calls
let totalElapsedTime = 0;
exports.totalElapsedTime = totalElapsedTime;
function measureTimeUntilCondition(stopCondition) {
    // Each function call will have its own elapsedTime to avoid concurrency issues
    let elapsedTime = 0;
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            elapsedTime++;
            // Check if the stop condition is met
            if (stopCondition()) {
                clearInterval(interval);
                exports.totalElapsedTime = totalElapsedTime += elapsedTime; // Update total elapsed time only after the interval ends
                console.log(`Condition met after ${elapsedTime} seconds.`);
                resolve(elapsedTime); // Resolve with the time it took for the condition to be met
            }
        }, 1000); // 1-second intervals
    });
}
// Export the measureTimeUntilCondition function and totalElapsedTime for external use
exports.default = measureTimeUntilCondition;
