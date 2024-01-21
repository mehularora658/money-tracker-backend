const express = require('express')
const app = express()
const cors = require('cors')
const Transaction = require('./Models/Transactions.js')
const User = require('./Models/Users.js')
const mongoose = require('mongoose')
const Jwt = require('jsonwebtoken')
const PORT = process.env.PORT || 4040

require('dotenv').config()
const ConnectDb = require('./db.js')
ConnectDb()
app.get('/api/test', (req, resp) => {
    
    resp.json({
        body: "test ok2"
        
    })
})

app.use(cors())
app.use(express.json())
function VerifyToken(req, resp, next) {
    let token = req.headers.authorization;
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, process.env.JWT_SECRET_KEY, (err, valid) => {
            if (err) {
                resp.status(401).send("please give valid token with header")
            } else {
                next()
            }
        })
    } else {
        resp.status(403).send("please add token with header")
    }
}

app.post('/api/transaction', VerifyToken, async (req, resp) => {
    const { price, name, description, datetime, label, userId, transactionType } = req.body
    try {
        const result = new Transaction({ price: price, name: name, description: description, datetime: datetime, label: label, userId: userId, transactionType: transactionType });
        await result.save()
        resp.json(result)


    } catch (err) {
        console.log('error', err);
        resp.json({ result: 'Something Gone wrong', error: err })
    }
})

app.get('/api/transactions/:userId', VerifyToken, async (req, resp) => {
    const userId = req.params.userId
    const transactions = await Transaction.find({ userId: userId });
    console.log(transactions);
    resp.json(transactions);
})

app.delete('/api/delete/:userId', VerifyToken, async (req, resp) => {
    const userId = req.params.userId
    const result = await Transaction.deleteMany({ userId: userId })
    console.log(result);
    resp.json(result);
})

app.post('/api/createAccount', async (req, resp) => {
    const { username, password } = req.body;
    const result = await new User({ username, password })
    await result.save()
    resp.json(result)
})
app.post('/api/login', async (req, resp) => {
    const { username, password } = req.body;
    const usernameResult = await User.find({ username })
    if (usernameResult[0]) {
        if (password === usernameResult[0].password) {
            Jwt.sign({ usernameResult }, process.env.JWT_SECRET_KEY, { expiresIn: '30d' }, (err, token) => {
                if (err) {
                    resp.json({ result: 'something went wrong' })
                }
                resp.json({ result: usernameResult, token: token })
            })
        } else {
            resp.json({ result: 'incorrect password' })
        }
    } else {
        resp.json({ result: 'user not exists' })
    }

})

app.get('/api/LabelMoneyStructure/:userId', VerifyToken, async (req, resp) => {
    const userId = req.params.userId
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    let colors = ["RGB(255, 0, 0)", "RGB(0, 255, 0)", "RGB(0, 0, 255)", "RGB(255, 255, 0)", "RGB(255, 165, 0)", "RGB(128, 0, 128)", "RGB(0, 128, 128)", "RGB(255, 192, 203)", "RGB(0, 255, 255)", "RGB(128, 128, 0)", "RGB(255, 99, 71)"];
    const trans = await Transaction.find({
        userId: userId,
        transactionType: 'Expense',
        datetime: {
            $gte: startOfMonth,
            $lt: endOfMonth
        }
    })

    resp.json({
        userId: userId,
        result: trans.reduce((result, transaction, index) => {
            const existingTransaction = result.find((item) => item.label === transaction.label);

            if (existingTransaction) {
                existingTransaction.data += transaction.price * -1;
            } else {
                result.push({
                    label: transaction.label,
                    data: transaction.price * -1,
                    color: colors[index % colors.length]
                });
            }

            return result;
        }, [])
    })
})

app.get('/api/cashFlowData/:userId', async (req, resp) => {
    const userId = req.params.userId
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const Incometrans = await Transaction.find({
        userId: userId,
        transactionType: 'Income',
        datetime: {
            $gte: startOfMonth,
            $lt: endOfMonth
        }
    })
    const Expensetrans = await Transaction.find({
        userId: userId,
        transactionType: 'Expense',
        datetime: {
            $gte: startOfMonth,
            $lt: endOfMonth
        }
    })

    resp.json({
        userId: userId,
        IncomeData: Incometrans.reduce((total, transaction) => total + transaction.price, 0),
        ExpenseData: Expensetrans.reduce((total, transaction) => total + ((transaction.price) * -1), 0)

    })
})


app.listen(PORT);