import {
  studentTRightTailedPValue,
  studentTCriticalValue,
  runWelchTTest,
} from './statsEngine';

console.log('=== VERIFYING MATHEMATICAL FORMULAS FOR PITCHEDGE ===\n');

// Reference case 1: df = 28, t = 2.05
const p1 = studentTRightTailedPValue(2.05, 28);
console.log(`Reference Case 1 (df = 28, t = 2.05):`);
console.log(`Expected: p ≈ 0.02495 (≈ 0.025)`);
console.log(`Calculated: p = ${p1.toFixed(6)}`);
const pass1 = Math.abs(p1 - 0.02495) < 0.001;
console.log(`Result: ${pass1 ? '✅ PASS' : '❌ FAIL'}\n`);

// Reference case 2: df = 10, t = 1.81246
const p2 = studentTRightTailedPValue(1.81246, 10);
console.log(`Reference Case 2 (df = 10, t = 1.81246):`);
console.log(`Expected: p ≈ 0.0500`);
console.log(`Calculated: p = ${p2.toFixed(6)}`);
const pass2 = Math.abs(p2 - 0.05) < 0.0005;
console.log(`Result: ${pass2 ? '✅ PASS' : '❌ FAIL'}\n`);

// Critical value test: alpha = 0.05 for df = 10 should be ~1.81246
const tCrit10 = studentTCriticalValue(0.05, 10);
console.log(`Critical Value Test (df = 10, alpha = 0.05):`);
console.log(`Expected: t_crit ≈ 1.8125`);
console.log(`Calculated: t_crit = ${tCrit10.toFixed(4)}`);
const passCrit = Math.abs(tCrit10 - 1.8125) < 0.001;
console.log(`Result: ${passCrit ? '✅ PASS' : '❌ FAIL'}\n`);

// Reference case 3: t = 0 => p = 0.50
const p3 = studentTRightTailedPValue(0, 30);
console.log(`Reference Case 3 (df = 30, t = 0.00):`);
console.log(`Expected: p = 0.5000`);
console.log(`Calculated: p = ${p3.toFixed(4)}`);
const pass3 = Math.abs(p3 - 0.5) < 0.0001;
console.log(`Result: ${pass3 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Welch's t-test with unequal variances
// Home: [175, 185, 195, 170, 180, 190, 165, 185, 195, 200, 170, 175, 180, 185, 190]
// Away: [160, 165, 155, 170, 160, 165, 150, 175, 160, 165, 155, 160, 165, 170, 160]
const homeMock = [175, 185, 195, 170, 180, 190, 165, 185, 195, 200, 170, 175, 180, 185, 190];
const awayMock = [160, 165, 155, 170, 160, 165, 150, 175, 160, 165, 155, 160, 165, 170, 160];
const welch = runWelchTTest(homeMock, awayMock);
console.log('Welch t-test on mock IPL samples:');
console.log(`  Mean Home: ${welch.meanHome.toFixed(2)}, SD Home: ${welch.sdHome.toFixed(2)}`);
console.log(`  Mean Away: ${welch.meanAway.toFixed(2)}, SD Away: ${welch.sdAway.toFixed(2)}`);
console.log(`  Mean Diff: ${welch.meanDiff.toFixed(2)} runs`);
console.log(`  Welch t: ${welch.tStat.toFixed(4)}`);
console.log(`  Welch df: ${welch.df.toFixed(2)}`);
console.log(`  p-value: ${welch.pValue.toExponential(4)}`);
console.log(`  t_crit (0.05): ${welch.tCrit.toFixed(4)}`);
console.log(`  Significant: ${welch.isSignificant ? 'YES (Reject H0)' : 'NO (Fail to reject H0)'}`);

if (pass1 && pass2 && passCrit && pass3 && welch.tStat > 0 && welch.isSignificant) {
  console.log('\n🎉 ALL MATHEMATICAL ACCURACY TESTS PASSED!');
} else {
  console.error('\n❌ SOME MATHEMATICAL TESTS FAILED!');
  process.exit(1);
}
