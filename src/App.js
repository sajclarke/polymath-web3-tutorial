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
    try {

      const web3 = await this.getWeb3()
      await this.getBalance(web3)

    } catch (error) {

      this.setState({ loading: false, errorMsg: "Could not connect to web3. Please ensure that you have Metamask installed and unlocked" })
    }
  }

  getWeb3 = () => new Promise((resolve, reject) => {

    let web3
    // Checking if Web3 has been injected by the browser (Mist/MetaMask).
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(window.web3.currentProvider)
      console.log('Injected web3 detected.');
      resolve(web3)
    } else {
      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      const provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545')
      web3 = new Web3(provider)
      console.log('No web3 instance injected, using Local web3.');
      resolve(web3)
    }

  })

  getBalance = async (web3) => {

    //Get logged in MetaMask ETH address
    const accounts = await web3.eth.getAccounts()
    //Instantiate the polyToken smart contract
    const polyFaucet = new web3.eth.Contract(PolyTokenFaucet.abi, '0xB06d72a24df50D4E2cAC133B320c5E7DE3ef94cB')
    //Get account's POLY balance
    const polyBalance = await polyFaucet.methods.balanceOf(accounts[0]).call({ from: accounts[0] })
    //We use web3.utils.fromWei to display the units of the balance from wei to ether
    this.setState({ loading: false, web3: web3, account: accounts[0], balance: web3.utils.fromWei(polyBalance, "ether"), polyFaucet: polyFaucet })

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
                        <p>
                          Your ETH address is {account}<br />
                          Your POLY balance is {balance} POLY
                    </p>

                      </Col>
                      <Col xs='6'>
                        <Form onSubmit={(e) => this.handleSubmit(e)}>
                          <FormGroup>
                            <Label for="ethAddress">ETH Address</Label>
                            <Input type="text" name="account" id="ethAddress" placeholder="type ETH address here" defaultValue={account} disabled />
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
