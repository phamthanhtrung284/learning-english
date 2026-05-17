export const calculateNextReview =
  (
    masteryLevel
  ) => {

  const now =
    new Date();

  let days = 1;

  if (masteryLevel >= 1)
    days = 3;

  if (masteryLevel >= 3)
    days = 7;

  if (masteryLevel >= 5)
    days = 14;

  if (masteryLevel >= 7)
    days = 30;

  now.setDate(
    now.getDate() + days
  );

  return now;
};