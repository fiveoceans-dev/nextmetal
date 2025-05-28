// scripts/dashboard.js

async function getDashboardData(userId) {
  return {
    balance: await getUserBalance(userId),
    ledger: await getLedger(userId),
    referrals: await getReferrals(userId)
  };
}
