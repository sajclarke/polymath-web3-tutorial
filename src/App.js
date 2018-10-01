import React, { Component } from 'react';
import Web3 from 'web3'

import logo from './poly_logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      account:null
    }
  }

  componentDidMount = async() => {
    try{

      const web3 = new Web3(Web3.givenProvider)
      const accounts = await web3.eth.getAccounts()

      this.setState({account:accounts[0]})

    }catch(error){
      console.log("Could not connect to web3",error)
    }
  }

  render() {

    const {account} = this.state
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} alt="logo" />
          <h1 className="App-title">Polymath Tutorial</h1>
        </header>
        <p className="App-intro">

        {(!account)?(
          <span>Loading...</span>
        ):(
          <span>Your ETH address is {this.state.account}</span>
        )}
          
        </p>
      </div>
    );
  }
}

export default App;
