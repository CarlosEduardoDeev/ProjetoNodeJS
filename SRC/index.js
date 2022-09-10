const { response } = require('express');
const express = require('express');

const {v4:uuidv4} = require('uuid')

const app = express();

const customers = []

app.use(express.json())


function VerifyAccount(req, res, next) {
  
  const { cpf } = req.headers // por essa ✔️

  const customer = customers.find((customer) => customer.cpf === cpf)

  if (!customer) {
    return res.status(400).json({ error: "Customer not found" });
  }

  req.customer = customer;
  return next();
}

function getBalance(statement){
  const balance = statement.reduce((acc, operation) =>{
    if(operation.type === 'credit'){
          return acc + operation.amount;
    }else{
          return acc - operation.amount;
    }
  },0)
  
  return balance;
}

app.post("/account", (req, res) => {
  
  const {cpf,name} = req.body;

  const customerAlreadyExists = customers.some((customer)  => customer.cpf === cpf)

  if(customerAlreadyExists){
      return res.status(404).json({msg:"CPF ja existe "})
  }

  customers.push({
    id:uuidv4(),
    cpf,
    name,
    statement:[]
   
})
  return res.status(201).json({msg:"dados criados "})   

})

app.post("/deposit", VerifyAccount,(req, res) => {

  const { description, amount } = req.body;

  const { customer } = req;

  
  const balance = getBalance(customer.statement);

  console.log(balance)

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  }

  customer.statement.push(statementOperation);

  return res.status(201).json({msg:"Deposito efetuaddo "});
})

app.get("/statement",VerifyAccount,(req, res) => {

  const { customer } = req;

  return res.json(customer.statement)
})

app.post("/withdraw",VerifyAccount,(req, res) => {

      const {amount}= req.body;

      const { customer } = req;

      const balance = getBalance(customer.statement);

      console.log(balance)

      if(balance < amount) {
        return res.status(400).json({msg:"Não é possivel fazer essa operacação "})
      }

      const statementOperation = {
    
        amount,
        created_at: new Date(),
        type: "debito",
      }

      customer.statement.push(statementOperation);

      
      return res.status(200).json({msg:"Saque efetuado"})
})

app.get("/statement/date",VerifyAccount,(req, res) => {

  const { customer } = req;

  const {date} = req.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) => 
  statement.created_at.toDateString() === 
  new Date(dateFormat).toDateString()
  );

  return res.json(statement);


})

app.put("/account",VerifyAccount,(req, res) =>{ 

  const {name} = req.body

  const {customer} = req;

  customer.name = name

  return res.status(200).json({msg:"Nome Alterado"})


})

app.get("/account",VerifyAccount,(req, res) =>{
    const { customer } = req

    console.log(customer)
    return res.json(customer)
})

app.delete("/account",VerifyAccount,(req, res) =>{
  const { customer } = req

  //splice

  customers.splice(customer,1);

  return res.status(200).json(customers)

})

app.get("/balance",VerifyAccount,(req, res) =>{

  const { customer } = req 

  const balance = getBalance(customer.statement)

  return res.json(balance)
})


app.listen("3000", () => {
  console.log("Connect ")
})