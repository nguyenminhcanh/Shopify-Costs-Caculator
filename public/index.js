//Variable
const shopifyPlanElement = document.getElementById('shopifyplan')
const monthlyOrdersElement = document.getElementById('monthlyorders');
const aovElement = document.getElementById('aov');
const calculateButton = document.getElementById('caculatorBtn');
const gmvElement = document.getElementById('gmv');

let gmvValue = 0;
let paymentGatewayFee = 0;
let transactionFees = 0;

function calculateGmvValue() {
    const monthlyOrdersValue = parseInt(monthlyOrdersElement.value);
    const aovValue = parseInt(aovElement.value);
    gmvValue = monthlyOrdersValue * aovValue;
    return gmvValue;
}

function calculatePaymentGatewayFee() {
    const gmvPrice = calculateGmvValue();
    paymentGatewayFee = gmvPrice * 30 / 100 * 2.4 / 100;
    return paymentGatewayFee;
}

function calculateTransactionFees() {
    const gmvPrice = calculateGmvValue();
    const selectedPlan = parseFloat(shopifyPlanElement.value);
    const transactionFeePercent = getTransactionFeePercent(selectedPlan);
    paymentGatewayFee = (gmvPrice * transactionFeePercent) / 100;
    return paymentGatewayFee;
}


function getTransactionFeePercent(planValue) {
    switch (planValue) {
        case 29:
            return 2;
        case 79:
            return 1;
        case 399:
            return 0.5;
        case 2500:
            return 0.25;
        default:
            return 0;
    }
}

function calculateTotalFees() {
    const calculatePaymentGatewayFeePrice = calculatePaymentGatewayFee();
    const shopifyPlanPrice = parseFloat(shopifyPlanElement.value);
    const calculateTransactionFeesPrice = calculateTransactionFees();
    const totalFees = calculatePaymentGatewayFeePrice + shopifyPlanPrice + calculateTransactionFeesPrice;
    return totalFees;
}

function calculateGmvPercentage() {
    const gmvPrice = calculateGmvValue();
    const totalFees = calculateTotalFees();
    const gmvPercentage = totalFees / gmvPrice * 100;
    return gmvPercentage;
}
function viewResult() {
    const gmvPrice = calculateGmvValue();
    const calculatePaymentGatewayFeePrice = calculatePaymentGatewayFee();
    const calculateTransactionFeesPrice = calculateTransactionFees();
    const totalFees = calculateTotalFees();
    const gmvPercentage = calculateGmvPercentage();
    const selectedOption = shopifyPlanElement.options[shopifyPlanElement.selectedIndex];
    const selectedText = selectedOption.text;
    gmvElement.innerHTML = '<h2> Shopify plan: ' + selectedText  + '</h2>' + '<p>GMV Price: $' + gmvPrice.toLocaleString() + '</p><p> Payment Gateway Fee: $' + calculatePaymentGatewayFeePrice.toLocaleString() + "</p><p> Transaction Fees: $" + calculateTransactionFeesPrice.toLocaleString() + '</p><p> Total Fees: $' + totalFees.toLocaleString()  + '</p><p> GMV Percentage: ' + gmvPercentage.toFixed(2) + '%</p>';
}

viewResult();





