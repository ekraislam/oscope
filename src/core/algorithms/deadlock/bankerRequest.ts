/**
 * OScope — Banker's Resource-Request Algorithm
 * Pure evaluation of dynamic resource requests against remaining need, current availability, and provisional safety.
 */

import type {
  ResourceAllocationState,
  ResourceRequest,
  ResourceRequestResult,
} from '../../models/deadlock';
import { isVectorLessOrEqual, subtractVectors, addVectors, cloneMatrix, createResourceAllocationState } from './matrix';
import { runBankerSafetyCheck } from './bankerSafety';

/**
 * Evaluates whether a process's resource request can be granted safely without risk of deadlock.
 * Does NOT mutate the input state.
 */
export function runBankerResourceRequest(
  state: ResourceAllocationState,
  request: ResourceRequest
): ResourceRequestResult {
  const pIdx = state.processes.indexOf(request.processId);
  if (pIdx === -1) {
    throw new Error(`ResourceRequestError: Process "${request.processId}" not found in current state.`);
  }

  if (request.requestVector.length !== state.resourceCount) {
    throw new Error(
      `ResourceRequestError: Request vector length (${request.requestVector.length}) must equal resource count (${state.resourceCount}).`
    );
  }

  // Validate non-negative integers
  for (let j = 0; j < request.requestVector.length; j++) {
    const val = request.requestVector[j];
    if (typeof val !== 'number' || isNaN(val) || val < 0 || !Number.isInteger(val)) {
      throw new Error(`ResourceRequestError: Request value for resource ${state.resources[j]} must be a non-negative integer.`);
    }
  }

  const needRow = state.need[pIdx];
  const allocRow = state.allocation[pIdx];
  const available = state.available;

  // 1. Need Check: Request_i <= Need_i
  const needCheckPassed = isVectorLessOrEqual(request.requestVector, needRow);
  const needCheckReason = needCheckPassed
    ? `Request [${request.requestVector.join(', ')}] does not exceed remaining Need [${needRow.join(', ')}].`
    : `Request [${request.requestVector.join(', ')}] exceeds declared maximum remaining Need [${needRow.join(', ')}]. (Process has exceeded its maximum claim).`;

  if (!needCheckPassed) {
    const emptySafety = runBankerSafetyCheck(state);
    return Object.freeze({
      granted: false,
      reason: `DENIED: ${needCheckReason}`,
      safetyResult: emptySafety,
      checkDetails: Object.freeze({
        needCheckPassed: false,
        availableCheckPassed: false,
        safetyCheckPassed: false,
        needCheckReason,
        availableCheckReason: 'Not evaluated because request exceeded remaining need.',
        safetyCheckReason: 'Not evaluated because request exceeded remaining need.',
      }),
    });
  }

  // 2. Available Check: Request_i <= Available
  const availableCheckPassed = isVectorLessOrEqual(request.requestVector, available);
  const availableCheckReason = availableCheckPassed
    ? `Requested quantities [${request.requestVector.join(', ')}] are currently Available [${available.join(', ')}].`
    : `Requested quantities [${request.requestVector.join(', ')}] exceed currently Available resources [${available.join(', ')}]. (Process must wait for resources to be released).`;

  if (!availableCheckPassed) {
    const emptySafety = runBankerSafetyCheck(state);
    return Object.freeze({
      granted: false,
      reason: `DENIED: ${availableCheckReason}`,
      safetyResult: emptySafety,
      checkDetails: Object.freeze({
        needCheckPassed: true,
        availableCheckPassed: false,
        safetyCheckPassed: false,
        needCheckReason,
        availableCheckReason,
        safetyCheckReason: 'Not evaluated because requested resources are not currently available.',
      }),
    });
  }

  // 3. Provisional State Allocation
  // Available' = Available - Request
  const provAvailable = subtractVectors(available, request.requestVector);

  // Allocation' = Allocation + Request
  const provAlloc = cloneMatrix(state.allocation);
  provAlloc[pIdx] = addVectors(allocRow, request.requestVector);

  // Max remains unchanged
  const provMax = cloneMatrix(state.max);

  const provisionalState = createResourceAllocationState({
    processes: state.processes,
    resources: state.resources,
    available: provAvailable,
    max: provMax,
    allocation: provAlloc,
  });

  // 4. Safety Check on Provisional State
  const safetyResult = runBankerSafetyCheck(provisionalState);
  const safetyCheckPassed = safetyResult.isSafe;
  const safetyCheckReason = safetyCheckPassed
    ? `Provisional allocation leads to a SAFE STATE with safe sequence <${safetyResult.safeSequence.join(', ')}>.`
    : `Provisional allocation would leave the system in an UNSAFE STATE. Granting this request could potentially lead to a deadlock.`;

  if (!safetyCheckPassed) {
    return Object.freeze({
      granted: false,
      reason: `DENIED: ${safetyCheckReason}`,
      safetyResult,
      checkDetails: Object.freeze({
        needCheckPassed: true,
        availableCheckPassed: true,
        safetyCheckPassed: false,
        needCheckReason,
        availableCheckReason,
        safetyCheckReason,
      }),
    });
  }

  // 5. Safe: GRANT Request
  return Object.freeze({
    granted: true,
    requestedState: provisionalState,
    safetyResult,
    reason: `GRANTED: Request satisfies Need, Availability, and preserves system safety with sequence <${safetyResult.safeSequence.join(', ')}>.`,
    checkDetails: Object.freeze({
      needCheckPassed: true,
      availableCheckPassed: true,
      safetyCheckPassed: true,
      needCheckReason,
      availableCheckReason,
      safetyCheckReason,
    }),
  });
}
