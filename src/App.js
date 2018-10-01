import React, { Component } from 'react';
import Web3 from 'web3'

import logo from './poly_logo.svg';
import './App.css';

const PolyTokenFaucet = require('./contracts/PolyTokenFaucet.json');

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading:true,
      account:null,
      balance:0,
      errorMsg:''
    }
  }

  componentDidMount = async() => {
    try{

        //Connect to web3
        const web3 = new Web3(Web3.givenProvider)
        //Get logged in MetaMask ETH address
        const accounts = await web3.eth.getAccounts()
        //Instantiate the polyToken smart contract
        const polyFaucet = new web3.eth.Contract(PolyTokenFaucet.abi, '0xB06d72a24df50D4E2cAC133B320c5E7DE3ef94cB')
        //Get account's POLY balance
        const polyBalance = await polyFaucet.methods.balanceOf(accounts[0]).call({ from: accounts[0] })
        //We use web3.utils.fromWei to display the units of the balance from wei to ether
        this.setState({loading:false, account:accounts[0], balance: web3.utils.fromWei(polyBalance,"ether")})

    }catch(error){
      console.log("Could not connect to web3",error)
      this.setState({loading:false,errorMsg:"Could not connect to web3. Check console for error logs"})
    }
  }

  render() {

    const {account, loading, balance, errorMsg} = this.state
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} alt="logo" />
          <h1 className="App-title">Polymath Tutorial</h1>
        </header>
        <div className="App-intro">

        {(loading)?(
          <p>Loading...</p>
        ):(
          (errorMsg.length > 0)?(
            <p>An error occurred: {errorMsg}</p>
          ):(
          <p>
            Your ETH address is {account}<br />
            Your POLY balance is {balance} POLY
          </p>
          )
          
        )}
          
        </div>
      </div>
    );
  }
}

export default App;
