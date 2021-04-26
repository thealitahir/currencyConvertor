//As we were getting only the information of records passed or failed in the post api to process transactions,
//we cannot find the exact transaction to be failing, so I have asssumed that time is more important here so to
//save time I have created bathces of 25 and for each batch I'm checking the success rate, If the success rate 
//is above 50% then we will no re-process that batch but if it's less than 50% we'll process that batch again 2 more
//times. I've alse added a function to process each entry in case we assume to go with retrying each transaction 3 times.

/**
 * Get no Params and process transactions in batches of 25 with 3 retries if the success rate of each batch is less than
 * 50% assuming that trasactions are not critical but the efficiency is critical
 */
const processBatchTransaction = async () => {
    let transactions = {transactions:[]};
    let transactionObj = {};
    const rates = await getExchangeRates();
    for(let j = 0; j < 4; j++){
        for(let i = 0; i < 25; i++){
            const response = await fetch('https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/get-transaction');
            const transaction = await response.json();
            transactionObj = {...transaction};
            delete transactionObj.getAccessKeyUrl;
            delete transactionObj.exchangeUrl;
            transactionObj.convertedAmount = parseFloat((transaction.amount/rates[`${transaction.currency}`]).toFixed(4));
            transactions.transactions.push(transactionObj);
            transactionObj = {};
        }
        postTransaction(JSON.parse(JSON.stringify(transactions)),3);
        transactions.transactions = [];
    }
    
}

/**
 * Get no Params and process transactions as a single entry assuming that each transaction is more critical
 * and time is less critical, we cannot skip any record
 */
const processSingleTransaction = async () => {
    let transactions = {transactions:[]};
    let transactionObj = {};
    const rates = await getExchangeRates();
    
    for(let i = 0; i < 100; i++){
        const response = await fetch('https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/get-transaction');
        const transaction = await response.json();
        transactionObj = {...transaction};
        delete transactionObj.getAccessKeyUrl;
        delete transactionObj.exchangeUrl;
        transactionObj.convertedAmount = parseFloat((transaction.amount/rates[`${transaction.currency}`]).toFixed(4));
        transactions.transactions.push(transactionObj);
        transactionObj = {};
        postTransaction(JSON.parse(JSON.stringify(transactions)),3);
        transactions.transactions = [];
    }
    
    
}
/**
 * Get no params and returns latest exchange rates
 * @returns {Array} rates
 */
const getExchangeRates = async () => {
    const response = await fetch('http://api.exchangeratesapi.io/v1/latest?access_key=a5505d34d6bcdc507e77f5413dc37aa8');
    const rates = await response.json();
    return rates.rates;
}

/**
 * Get two Params and post the transaction batch to given api and checks the reponse success rate for retrying
 * @param {Object} transactions
 * @param {Number} retryCount
 */
const postTransaction = async (transactions, retryCount) => {
    const response = await fetch('https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/process-transactions', {
        method: 'POST',
        body: JSON.stringify(transactions), // string or object
        headers: {
        'Content-Type': 'application/json'
        }
    });
    const myJson = await response.json();
    --retryCount;
    if(myJson.passed < 13 && retryCount !== 0){
        postTransaction(transactions,retryCount);
    }
    
}

processBatchTransaction();

module.exports = {
    processBatchTransaction,
    processSingleTransaction,
    getExchangeRates,
    postTransaction
}