export const updateUserInterestVector = (
  userVector: number[],
  threadVector: number[],
  alpha: number,
): number[] => {
  const length = Math.min(userVector.length, threadVector.length);
  const newVector: number[] = [];

  for (let i = 0; i < length; i++) {
    const updatedValue = userVector[i] + alpha * threadVector[i];
    newVector.push(updatedValue);
  }

  return newVector;
};
