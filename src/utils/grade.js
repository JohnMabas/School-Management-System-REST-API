const GRADE_BANDS = [
  { min: 90, grade: "A" },
  { min: 80, grade: "B" },
  { min: 70, grade: "C" },
  { min: 60, grade: "D" },
  { min: 0, grade: "F" },
];

/** Grades are always derived from the score so they can never drift out of sync. */
function gradeFromScore(score) {
  return GRADE_BANDS.find((band) => score >= band.min).grade;
}

module.exports = { gradeFromScore, GRADE_BANDS };
