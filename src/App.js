import React, { Component } from 'react';
import Web3 from 'web3'
import { Container, Row, Col, Button, Alert, Form, FormGroup, Label, Input } from 'reactstrap'

import logo from './poly_logo.svg';
import './App.css';

const PolyTokenFaucet = require('./contracts/PolyTokenFaucet.json');

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      loading: true,
      account: null,
      balance: 0,
      errorMsg: '',
      requestAmount: 250,
      polyFaucet: null
    }
  }

  componentDidMount = async () => {
    
    setInterval(async()=>{

      const web3 = await this.getWeb3()

      await this.getAccount(web3)

    },1000)
    
    
  }

  getWeb3 = () => new Promise((resolve, reject) => {

    try{

      if(typeof window.web3 !== undefined){

        resolve(new Web3(Web3.givenProvider))

      }else{
        this.setState({errorMsg:'web3 not found'})
      }
    }catch(error){
      
      this.setState({errorMsg:'An error occurred trying to connect to web3'})
    }

  })

  getAccount = async (web3) => {
    //Get logged in MetaMask ETH address
    const accounts = await web3.eth.getAccounts()
    if(accounts.length < 1){
      
      this.setState({loading: false,errorMsg:'Could not connect to Metamask. Please unlock your metamask'})

    }else{

      this.setState({loading: false, account:accounts[0], errorMsg:''})
      await this.getBalance(web3, accounts)

    }

  }

  getBalance = async (web3, accounts) => {

    //Instantiate the polyToken smart contract
    const polyFaucet = new web3.eth.Contract(PolyTokenFaucet.abi, '0xB06d72a24df50D4E2cAC133B320c5E7DE3ef94cB')
    //Get account's POLY balance
    const polyBalance = await polyFaucet.methods.balanceOf(accounts[0]).call({ from: accounts[0] })
    //We use web3.utils.fromWei to display the units of the balance from wei to ether
    this.setState({ loading: false, errorMsg:'', web3: web3, account: accounts[0], balance: web3.utils.fromWei(polyBalance, "ether"), polyFaucet: polyFaucet })

  }

  handleSubmit = async (event) => {
    event.preventDefault();

    const { web3, account, requestAmount, polyFaucet } = this.state
    //Request tokens
    polyFaucet.methods.getTokens(web3.utils.toWei(requestAmount.toString(), 'ether'), account).send({ from: account, gas: 100000 })
      .then(function (result) {

        console.log(result)

      })
  };

  handleChange(evt) {
    //Update state based on the input field's name attribute
    this.setState({ [evt.target.name]: evt.target.value });
  }

  render() {

    const { account, loading, balance, errorMsg, requestAmount } = this.state

    return (

      <div>
        <header className="App-header">
          <img src={logo} alt="logo" />
        </header>
        <Container>

          <div className="App-intro">

            {(loading) ? (
              <p>Loading...</p>
            ) : (
                // Display error if web3 connection fails
                (errorMsg.length > 0) ? (
                  <Row style={{ padding: '10px' }}>
                    <Col xs='12'>
                      <Alert color="danger">
                        <strong>An error occurred:</strong> {errorMsg}
                      </Alert>
                    </Col>
                  </Row>

                ) : (
                    // Display user information if web3 connection is successful
                    <Row style={{ padding: '10px' }}>
                      <Col xs='6'>
                      <h4>ETH Address</h4>
                        <p>{account}</p>
                        <h4>POLY balance</h4>
                        <p>{parseFloat(balance).toFixed(2)} POLY</p>

                      </Col>
                      <Col xs='6'>
                        <Form onSubmit={(e) => this.handleSubmit(e)}>
                          <FormGroup>
                            <Label for="ethAddress">ETH Address</Label>
                            <Input type="text" name="account" id="ethAddress" placeholder="type ETH address here" value={account} disabled />
                          </FormGroup>
                          <FormGroup>
                            <Label for="polyAmount">Amount</Label>
                            <Input type="text" name="requestAmount" id="requestAmount" placeholder="How much POLY would you like?" defaultValue={requestAmount} onChange={e => this.handleChange(e)} />
                          </FormGroup>
                          <Button color="primary" type="submit">Request POLY</Button>
                        </Form>
                      </Col>
                    </Row>
                  )
              )}

          </div>
        </Container>
      </div>

    );
  }
}

export default App;
