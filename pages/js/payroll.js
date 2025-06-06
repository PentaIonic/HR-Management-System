// --- Payroll System with LocalStorage ---

// DOM Elements
const employeeNameEl = document.getElementById('employeeName');
const employeeIdEl = document.getElementById('employeeId');
const basicSalaryEl = document.getElementById('basicSalary');
const workingDaysEl = document.getElementById('workingDays');
const daysWorkedEl = document.getElementById('daysWorked');
const overtimeHoursEl = document.getElementById('overtimeHours');
const allowancesEl = document.getElementById('allowances');
const otherDeductionsInputEl = document.getElementById('otherDeductions');

const summaryBasicPayEl = document.getElementById('summaryBasicPay');
const summaryTotalAllowancesEl = document.getElementById('summaryTotalAllowances');
const summaryOvertimePayEl = document.getElementById('summaryOvertimePay');
const summaryGrossPayEl = document.getElementById('summaryGrossPay');
const summaryWithholdingTaxEl = document.getElementById('summaryWithholdingTax');
const summarySSSEl = document.getElementById('summarySSS');
const summaryPhilHealthEl = document.getElementById('summaryPhilHealth');
const summaryPagibigEl = document.getElementById('summaryPagibig');
const summaryOtherDeductionsEl = document.getElementById('summaryOtherDeductions');
const summaryTotalDeductionsEl = document.getElementById('summaryTotalDeductions');
const summaryNetPayEl = document.getElementById('summaryNetPay');

const resetButton = document.getElementById('resetButton');
const savePayrollButton = document.getElementById('savePayrollButton');
const generatePayslipButton = document.getElementById('generatePayslipButton');
const payrollForm = document.getElementById('payrollForm');
const messageArea = document.getElementById('messageArea');

// --- Helper Functions ---
function formatCurrency(amount) {
    return `₱${parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function showMessage(message, type = "info") {
    messageArea.textContent = message;
    messageArea.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700', 'bg-yellow-100', 'text-yellow-700', 'bg-blue-100', 'text-blue-700');
    if (type === "success") {
        messageArea.classList.add('bg-green-100', 'text-green-700');
    } else if (type === "error") {
        messageArea.classList.add('bg-red-100', 'text-red-700');
    } else if (type === "warning") {
        messageArea.classList.add('bg-yellow-100', 'text-yellow-700');
    } else {
        messageArea.classList.add('bg-blue-100', 'text-blue-700');
    }
    messageArea.classList.remove('hidden');
    setTimeout(() => {
        if (messageArea.textContent === message) {
            messageArea.classList.add('hidden');
        }
    }, 5000);
}

// --- Calculation Logic ---
const STANDARD_MONTHLY_WORKING_DAYS = 22;

function calculateProratedBasicPay(monthlySalary, daysWorkedInPeriod, standardDaysInMonth) {
    if (!monthlySalary || !daysWorkedInPeriod || !standardDaysInMonth || standardDaysInMonth <= 0) return 0;
    return (monthlySalary / standardDaysInMonth) * daysWorkedInPeriod;
}

function calculateOvertimePay(basicSalary, overtimeHours) {
    if (!basicSalary || !overtimeHours) return 0;
    const dailyRate = basicSalary / STANDARD_MONTHLY_WORKING_DAYS;
    const hourlyRate = dailyRate / 8;
    const otPay = hourlyRate * 1.25 * overtimeHours;
    return otPay;
}

function calculateSSS(grossPay) {
    if (grossPay <= 0) return 0;
    let msc = 0;
    if (grossPay < 3250) msc = 3250;
    else if (grossPay >= 30000) msc = 30000;
    else msc = Math.ceil(grossPay / 500) * 500;
    return msc * 0.045;
}

function calculatePhilHealth(basicSalary) {
    if (basicSalary <= 0) return 0;
    let premiumBase = Math.max(10000, Math.min(basicSalary, 100000));
    return premiumBase * 0.025;
}

function calculatePagibig(basicSalary) {
    if (basicSalary <= 0) return 0;
    let rate = basicSalary < 1500 ? 0.01 : 0.02;
    let contribution = basicSalary * rate;
    return Math.min(contribution, 100);
}

function calculateWithholdingTax(grossPay, sss, philhealth, pagibig) {
    const taxableIncome = grossPay - sss - philhealth - pagibig;
    if (taxableIncome <= 20833) {
        return 0;
    } else if (taxableIncome <= 33333) {
        return (taxableIncome - 20833) * 0.15;
    } else if (taxableIncome <= 66667) {
        return 1875 + (taxableIncome - 33333) * 0.20;
    } else if (taxableIncome <= 166667) {
        return 8541.80 + (taxableIncome - 66667) * 0.25;
    } else if (taxableIncome <= 666667) {
        return 33541.80 + (taxableIncome - 166667) * 0.30;
    } else {
        return 183541.80 + (taxableIncome - 666667) * 0.35;
    }
}

function performCalculations() {
    const basicSalary = parseFloat(basicSalaryEl.value) || 0;
    const actualDaysWorked = parseFloat(daysWorkedEl.value) || STANDARD_MONTHLY_WORKING_DAYS;
    const overtimeHours = parseFloat(overtimeHoursEl.value) || 0;
    const allowances = parseFloat(allowancesEl.value) || 0;
    const otherDeductions = parseFloat(otherDeductionsInputEl.value) || 0;

    const actualBasicPayForPeriod = calculateProratedBasicPay(basicSalary, actualDaysWorked, STANDARD_MONTHLY_WORKING_DAYS);
    const overtimePay = calculateOvertimePay(basicSalary, overtimeHours);
    const grossPay = actualBasicPayForPeriod + allowances + overtimePay;

    const sssContribution = calculateSSS(grossPay);
    const philHealthContribution = calculatePhilHealth(basicSalary);
    const pagibigContribution = calculatePagibig(basicSalary);
    const withholdingTax = calculateWithholdingTax(grossPay, sssContribution, philHealthContribution, pagibigContribution);

    const totalDeductions = sssContribution + philHealthContribution + pagibigContribution + withholdingTax + otherDeductions;
    const netPay = grossPay - totalDeductions;

    summaryBasicPayEl.textContent = formatCurrency(actualBasicPayForPeriod);
    summaryTotalAllowancesEl.textContent = formatCurrency(allowances);
    summaryOvertimePayEl.textContent = formatCurrency(overtimePay);
    summaryGrossPayEl.textContent = formatCurrency(grossPay);

    summaryWithholdingTaxEl.textContent = formatCurrency(withholdingTax);
    summarySSSEl.textContent = formatCurrency(sssContribution);
    summaryPhilHealthEl.textContent = formatCurrency(philHealthContribution);
    summaryPagibigEl.textContent = formatCurrency(pagibigContribution);
    summaryOtherDeductionsEl.textContent = formatCurrency(otherDeductions);
    summaryTotalDeductionsEl.textContent = formatCurrency(totalDeductions);
    summaryNetPayEl.textContent = formatCurrency(netPay);

    return {
        employeeName: employeeNameEl.value,
        employeeId: employeeIdEl.value,
        payrollPeriod: workingDaysEl.value,
        basicSalaryInput: basicSalary,
        daysWorked: actualDaysWorked,
        actualBasicPayForPeriod: actualBasicPayForPeriod,
        overtimeHours: overtimeHours,
        overtimePay: overtimePay,
        allowances: allowances,
        grossPay: grossPay,
        sssContribution: sssContribution,
        philHealthContribution: philHealthContribution,
        pagibigContribution: pagibigContribution,
        withholdingTax: withholdingTax,
        otherDeductions: otherDeductions,
        totalDeductions: totalDeductions,
        netPay: netPay,
        calculatedAt: new Date().toISOString()
    };
}

// --- Event Listeners ---
[employeeNameEl, employeeIdEl, basicSalaryEl, daysWorkedEl, overtimeHoursEl, allowancesEl, otherDeductionsInputEl].forEach(el => {
    el.addEventListener('input', () => {
        performCalculations();
    });
});

resetButton.addEventListener('click', () => {
    payrollForm.reset();
    performCalculations();
    showMessage("Form reset.", "info");
});

savePayrollButton.addEventListener('click', () => {
    const payrollData = performCalculations();
    if (!payrollData.employeeId || !payrollData.employeeName) {
        showMessage("Employee Name and ID are required to save.", "warning");
        alert("⚠ Employee Name and ID are required to save.");
        return;
    }

    const localKey = `payroll_${payrollData.employeeId}_${Date.now()}`;
    try {
        localStorage.setItem(localKey, JSON.stringify(payrollData));
        showMessage(`Payroll for ${payrollData.employeeName} saved locally!`, "success");
        alert(`Payroll for ${payrollData.employeeName} has been saved!`);
    } catch (error) {
        console.error("Error saving payroll data: ", error);
        showMessage("Error saving payroll data. Check console for details.", "error");
        alert("Error saving payroll data. Check the console for details.");
    }
});

generatePayslipButton.addEventListener('click', () => {
    const payrollData = performCalculations();
    console.log("--- GENERATE PAYSLIP (DATA) ---");
    console.log(payrollData);
    showMessage(`Payslip data for ${payrollData.employeeName} generated.`, "info");
    alert(`Mock Payslip for: ${payrollData.employeeName}\nNet Pay: ${formatCurrency(payrollData.netPay)}`);
});

performCalculations();
// 