const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const path = require('path');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const nodemailer = require("nodemailer");



const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { google } = require('googleapis');
const creds = require('./data/sincere-surfer-416614-376c1d829133.json'); 

const createGoogleSheet = async (m_ordes, aov) => {
    const auth = new google.auth.GoogleAuth ({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    });
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: client});
    const googleSheetsID = "1hpTYTUC0wm8f8kRmpG5TVY2mQFyyV8HQgmaougLPjRs";
    const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId: googleSheetsID 
    });
    
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: googleSheetsID,
        range: "Data!C2:D2"
    });

    const values = [
        [m_ordes, aov, email],
    ];
    const resource = {
        values,
    };
    const response = await googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId: googleSheetsID,
        range: "Data!C2:D2",
        valueInputOption: 'RAW',
        resource
    });

};

async function  createSheetCopy(m_ordes, aov, email, shopifyplan) {
    const auth = new google.auth.GoogleAuth ({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    });
    const client = await auth.getClient();
    const googleSheets = google.sheets({version: "v4", auth: client});
    const googleSheetsID = "1hpTYTUC0wm8f8kRmpG5TVY2mQFyyV8HQgmaougLPjRs";
    const sourceSheetId = 0; 
    const currentEpochTime = Math.floor(Date.now() / 1000);
    const newSheetName = `${email}_${currentEpochTime}_sheet`;

    // Dup sheet
    const response = await googleSheets.spreadsheets.batchUpdate({
        auth,
        spreadsheetId: googleSheetsID,
        resource: {
            requests: [
                {
                    duplicateSheet: {
                        sourceSheetId,
                        insertSheetIndex: 1, // Vị trí để chèn bản sao
                        newSheetName,
                    },
                },
            ],
        },
    });
// Update value
    const values = [
        [m_ordes, aov],
    ];
    const resource = {
        values,
    };
    const newSheetID = `${email}_${currentEpochTime}_sheet!C2:D2`;
    const response_update = await googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId: googleSheetsID,
        range: newSheetID,
        valueInputOption: 'RAW',
        resource
    });


    //Send email notification
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'canhminh199x@gmail.com',
            pass: 'rjiwwfxlgeywcqdp',
        },
    });

    
//feePercent
    const shopifyplanPrice = function getTransactionFeePercent(shopifyplan) {
        switch (shopifyplan) {
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
    const feePercent = shopifyplanPrice(parseInt(shopifyplan));

    const shopifyplanText = function getshopifyplanText(shopifyplan) {
        switch (shopifyplan) {
            case 29:
                return 'Basic';
            case 79:
                return "Shopify";
            case 399:
                return 'Advanced';
            case 2500:
                return "Plus";
            default:
                return 0;
        }
    }
    const _shopifyplanText = shopifyplanText(parseInt(shopifyplan));



//GmvValue
    const GmvValue = function calculateGmvValue(m_ordes, aov) {
        const monthlyOrdersValue = parseFloat(m_ordes);
        const aovValue = parseFloat(aov);
        gmvValue = monthlyOrdersValue * aovValue;
        return gmvValue;
    }

    const result = GmvValue(m_ordes, aov);
    console.log("GmvValue: " + result);

    //Payment Getway Fee
    const PaymentFee = function calculatePaymentGatewayFee(result) {
        const gmvPrice = result;
        paymentGatewayFee = gmvPrice * 30 / 100 * 2.4 / 100;
        return paymentGatewayFee;
    }
    const PaymentGatewayFee = PaymentFee(result);
    console.log("PaymentGatewayFee: " + PaymentGatewayFee);

 //Transaction Fee
    const TransactionFee = function calculateTransactionFees(result, feePercent) {
        const gmvPrice = result;
        const transactionFeePercent = parseFloat(feePercent);
        paymentGatewayFee = (gmvPrice * transactionFeePercent) / 100;
        return paymentGatewayFee;
    }

    const _TransactionFee = TransactionFee(result, feePercent);
    console.log("TransactionFee: " + _TransactionFee);

 //Total Fee
    const _calculateTotalFees = function calculateTotalFees(shopifyplan, PaymentGatewayFee,  _TransactionFee) {
        const calculatePaymentGatewayFeePrice = PaymentGatewayFee;
        const shopifyPlanPrice = parseFloat(shopifyplan);
        const calculateTransactionFeesPrice = _TransactionFee;
        const totalFees = calculatePaymentGatewayFeePrice + shopifyPlanPrice + calculateTransactionFeesPrice;
        return totalFees;
    }
    const TotalFees = _calculateTotalFees(shopifyplan, PaymentGatewayFee, _TransactionFee);
    console.log("Total Fees: " + TotalFees);

    //calculateGmvPercentage
    const _calculateGmvPercentage = function calculateGmvPercentage(_gmvPrice, _totalFees) {
        const gmvPrice =  parseFloat(_gmvPrice);
        const totalFees =  parseFloat(_totalFees);
        const gmvPercentage = totalFees / gmvPrice * 100;
        return gmvPercentage;
    }
    const GmvPercentage = _calculateGmvPercentage(result, TotalFees);
    console.log("Gmv Percentage: " + GmvPercentage);


    const mailOptions = {
        from: 'canhminh199x@gmail.com',
        to: email,
        subject: 'Shopify Costs',
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Shopify Plus Costs Caculator</title>
            <link rel="stylesheet" href="/index.css">
        </head>
        <body>
            <div class="caculatorContainer">
                <div class="caculatorHeader">
                    <h2 style="color: #000"> Shopify Costs Caculator Resulst</h2>
                </div>
                <div class="caculatorContent">
                    <div class="caculator_header">
                        <h3>Shopify package: ${_shopifyplanText}</h3>
                    </div>
                    <div  style="margin-bottom: 10px">
                        <label style="font-weight: 600">GMV Price:</label>
                        <p style="margin:2px 0;">$${result.toLocaleString()}</p>
                    </div>
                    <div  style="margin-bottom: 10px">
                        <label style="font-weight: 600">Payment Gateway Fee:</label>
                        <p style="margin:2px 0;">$${PaymentGatewayFee.toLocaleString()}</p>
                    </div>
                    <div  style="margin-bottom: 10px">
                        <label style="font-weight: 600">Transaction Fee:</label>
                        <p style="margin:2px 0;">$${_TransactionFee.toLocaleString()}</p>
                    </div>
                    <div  style="margin-bottom: 10px">
                        <label style="font-weight: 600">Total Fee:</label>
                        <p style="margin:2px 0;">$${TotalFees.toLocaleString()}</p>
                    </div>
                    <div  style="margin-bottom: 10px">
                        <label style="font-weight: 600">GMV Percentage:</label>
                        <p style="margin:2px 0;">${GmvPercentage}%</p>
                    </div>
                </div>    
            </div>
           
        </body>
        </html>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });

}



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'))
});

app.post('/caculator', (req, res) => {
    const { monthlyorders, aov, email, shopifyplan } = req.body;
    createSheetCopy(monthlyorders, aov, email, shopifyplan);
    res.send('Successfully created')
    
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


