const covid19ImpactEstimator = (data) => {
  const inputObj = {};
  const dayPeriodFn = (periodType, periodQty) => {
        // Infection doubles every three days
        // I used the modulus to be ensure it is exactly 3 days
        // eslint-disable-next-line no-nested-ternary
        const days = (periodType === 'days') ? periodQty : (periodType === 'weeks') ? periodQty * 7 : periodQty * 30;
        return days;
    };

  const infectionsByRequestedTimeFn = (currentlyInfected, days) => {
        const doubledFactor = (days - (days % 3)) / 3;
        return Math.floor(currentlyInfected * 2 * doubledFactor * doubledFactor);
    };

  const dollarsInFlightFn = (
        infectionsByRequestedTime,
        region,
        avgDailyIncome,
        period
  ) => Math.floor(infectionsByRequestedTime * region * avgDailyIncome * period);

  function impactFn(params) {
        const objImpact = {};
        const impactDays = dayPeriodFn(params.periodType, params.timeToElapse);
        objImpact.currentlyInfected = params.reportedCases * 10;
        objImpact.infectionsByRequestedTime = infectionsByRequestedTimeFn(
        objImpact.currentlyInfected, impactDays
        );
        objImpact.dollarsInFlight = dollarsInFlightFn(
        objImpact.infectionsByRequestedTime,
        params.region.avgDailyIncomePopulation,
        params.region.avgDailyIncomeInUSD,
        impactDays
        );
        return objImpact;
    }

  function severeImpactFn(params) {
        const objSevereImpact = {};
        const severeDays = dayPeriodFn(params.periodType, params.timeToElapse);
        objSevereImpact.currentlyInfected = params.reportedCases * 50;
        objSevereImpact.infectionsByRequestedTime = infectionsByRequestedTimeFn(
        objSevereImpact.currentlyInfected,
        severeDays
        );

        // 15% of infectionsByRequestedTime
        objSevereImpact.severeCasesByRequestedTime = Math.floor(0.15 * objSevereImpact.infectionsByRequestedTime);

        // 35% of total Hosiptal beds are free
        objSevereImpact.hospitalBedsByRequestedTime = Math.floor((0.35 * params.totalHospitalBeds) - objSevereImpact.severeCasesByRequestedTime);

        // 5% of infectionsByRequestedTime
        objSevereImpact.casesForICUByRequestedTime = Math.floor(0.05 * objSevereImpact.infectionsByRequestedTime);

        // 2% of infectionsByRequestedTime
        objSevereImpact.casesForVentilatorsByRequestedTime = Math.floor(0.02 * objSevereImpact.infectionsByRequestedTime);

        objSevereImpact.dollarsInFlight = dollarsInFlightFn(
        objSevereImpact.infectionsByRequestedTime,
        params.region.avgDailyIncomePopulation,
        params.region.avgDailyIncomeInUSD,
        severeDays
        );

        return objSevereImpact;
    }
  inputObj.data = data;

    if (data) {
        inputObj.impact = impactFn(data);
        inputObj.severeImpact = severeImpactFn(data);
    }

    return inputObj;
  };
  
  export default covid19ImpactEstimator;