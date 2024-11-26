//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')
//modulos internos
const fs = require("fs")

operation()

function operation(){
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer ?',
            choices: ['Criar Conta','Consultar Saldo','Depositar','Sacar','Sair'],

        },
        
    ]).then((answer) =>{
        const action = answer['action']

        if(action === 'Criar Conta'){
            createAccount()
        } else if(action ==='Consultar Saldo'){
            getAccountBalance()
        } else if(action === 'Depositar'){
            deposit()
        } else if(action === 'Sacar'){
            withdraw()
        } else if(action === 'Sair'){
            console.log(chalk.bgGray.green.bold('Obigado por usar o Accounts!!!'))
            process.exit()
        }

        
    })
    .catch((err) => console.log(err))
}

//criando a conta

function createAccount(){
    console.clear()
    console.log(chalk.bgGreen.black('Parabéns por escolhe nosso Banco!'))
    console.log(chalk.green("Defina as opções da sua conta a seguir"))

    buildAccount()
}

function buildAccount(){

    inquirer.prompt([
        {
            name:'accountName',
            message:'Digite um nome para a sua conta:'
        }
    ]).then((answer) =>{
        const accountName = answer['accountName']
        console.info(accountName)

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(
                chalk.bgRed.black('Esta conta já exite, escolha outro nome!')
            )
            buildAccount()
            return
        }
        fs.writeFileSync(`accounts/${accountName}.json`,'{"balance": 0}',function(err){
            console.log(err)
        })

        console.log(chalk.green('Parabéns, a sua conta foi criada'))

        operation()

    }).catch(err => console.log(err))
}

//depositando na conta

function deposit() {
    inquirer.prompt([{
        name: 'accountName',
        message:'Qual o nome da conta que deseja depositar ?'
    }]).then((answer) =>{

        const accountName = answer['accountName']

        //verificar se a conta existe
        if(!checkAccount(accountName)){
            return deposit()
        }
        inquirer.prompt([{
            name: 'amount',
            message:'Quanto você deseja depositar'
        }]).then((answer) =>{

            const amount =answer['amount']

            //add an amount
            addAmount(accountName, amount)

            operation()

        }).catch(err => console.log(err))

    })
    .catch(err => console.log(err))
}

//verifica conta
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black.bold('Esta conta não existe, escolha outro nome!'))
        return false
    }

    return true
}
function addAmount(accountName, amount){

    const accountData = getAccount(accountName)

    if(!amount){
        console.log(chalk.bgRed.white.bold('Ocorreu um erro, tente novamente mais tarde!!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(`accounts/${accountName}.json`,JSON.stringify(accountData), function (err){console.log(err)})

    /console.log(chalk.bgBlue.black(`Foi depositado R$${amount} na sua conta`))

}

function getAccount(accountName){

    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
        encoding: 'utf-8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

//consultar saldo
function getAccountBalance(){
    inquirer.prompt([{
        name:'accountName',
        message:'Digite o nome da conta'
    }]).then((answer)=>{
        const accountName = answer['accountName']

        //verifica se conta existe
        if(!checkAccount(accountName)){
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black.bold(`Olá o saldo da conta é de R$${accountData.balance}`))
        operation()

    }).catch(err => console.log(err))
}

//sacar da conta
function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual nome da sua conta ?'
        }]).then((answer) =>{

            const accountName = answer['accountName']

            if(!checkAccount(accountName)){
                return withdraw()
            }

            inquirer.prompt([
                {
                    name : 'amount',
                    message:'Quanto você deseja sacar ?'
                }
            ]).then((answer) =>{

                const amount = answer['amount']
                removeAmount(accountName,amount)
                

            }).catch(err => console.log(err))

        }).catch(err => console.log(err))
}

function removeAmount(accountName,amount){

    const accountData = getAccount(accountName)

    if(!amount){

        console.log(chalk.bgRed.white.bold('Ocorreu um erro, tente novamente mais tarde!!'))
        return withdraw()
    }

    if(accountData.balance < amount){

        console.log(chalk.bgRed.white.bold('Valor indisponivel!!'))
        return withdraw()
    }

    accountData.balance-= parseFloat(amount)

    fs.writeFileSync(`accounts/${accountName}.json`,JSON.stringify(accountData),function (err){
        console.log(err)
    })

    console.log(chalk.green.bold(`Foi realizado um saque de R$${amount} da sua conta!`))
    operation()
}