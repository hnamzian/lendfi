import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  connectSnap,
  getSnap,
  sendHello,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
} from '../components';
import { ethers } from 'ethers';
import NFT from 'snap/src/contracts/NFTWithMarketplace.json';
import Lending from 'snap/src/contracts/Lending.json';


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;


const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const [networkId, setNetworkId] = useState();

  useEffect(() => {
    const run = async () => {
      setNetworkId(await window.ethereum.request({ method: 'net_version' }));
    }
  
    const handleChainChanged = async () => {
      setNetworkId(await window.ethereum.request({ method: 'net_version' }));
    }
  
    window.ethereum.on('chainChanged', handleChainChanged);
    run();
  }, []);

  const NFTContractAddress = networkId ? (NFT.networks[networkId] ? NFT.networks[networkId].address : null) : null;
  const NFTInterface = new ethers.utils.Interface(NFT.abi); 
  const LendingContractAddress = networkId ? (Lending.networks[networkId] ? Lending.networks[networkId].address : null) : null;
  const LendingInterface = LendingContractAddress ? new ethers.utils.Interface(Lending.abi) : null;

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendHelloClick = async () => {
    try {
      await sendHello();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const buyNFTHandler = async (e:Event) => { 
    e.preventDefault();
    const data = new FormData(e.target);  
    const tokenID = ""+data.get("BuyNFTtokenID");
    const functionData = NFTInterface.encodeFunctionData('buyNFT',[tokenID]); 
    
    try { 
      const [from] = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      // Send a transaction to MetaMask.
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: from,
            to: NFTContractAddress,
            value: '0x64',
            data: functionData,
          },
        ],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const approveNFTHandler = async (e:Event) => { 
    e.preventDefault();
    const data = new FormData(e.target);  
    const spender = data.get("ApproveNFTSpender");
    const tokenID = parseInt(data.get("ApproveNFTTokenID"));

    const functionData = NFTInterface.encodeFunctionData('approve',[spender,tokenID]); 
    console.log(functionData)
    
    try { 
      const [from] = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      // Send a transaction to MetaMask.
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: from,
            to: NFTContractAddress,
            value: '0',
            data: functionData,
          },
        ],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const requestLoanHandler = async (e:Event) => { 
    e.preventDefault();
    const data = new FormData(e.target);  
    const tokenID = ""+data.get("RequestLoanTokenID");
    const functionData = LendingInterface.encodeFunctionData('requestLoan',[tokenID]); 
    
    try { 
      const [from] = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      // Send a transaction to MetaMask.
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: from,
            to: LendingContractAddress,
            value: '0',
            data: functionData,
          },
        ],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const proposeLoanHandler = async (e:Event) => { 
    e.preventDefault();
    const data = new FormData(e.target);  
    const proposalID = +data.get("ProposeLoanContractProposalID");
    const amount = ethers.BigNumber.from(data.get("ProposeLoanContractLoanAmount"));
    const interestRate = +data.get("ProposeLoanContractLoanDuration");
    const duration = +data.get("ProposeLoanContractInterestRate");

    const functionData = LendingInterface.encodeFunctionData('proposeLoan',[proposalID, amount, interestRate, duration]); 
    
    try { 
      const [from] = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      // Send a transaction to MetaMask.
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: from,
            to: LendingContractAddress,
            value: '0',
            data: functionData,
          },
        ],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const approveLoanProposalHandler = async (e:Event) => { 
    e.preventDefault();
    const data = new FormData(e.target);  
    const proposalID = data.get("ApproveLoanContractProposalID");
    const functionData = LendingInterface.encodeFunctionData('approveLoan',[proposalID]); 
    
    try { 
      const [from] = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      // Send a transaction to MetaMask.
      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: from,
            to: LendingContractAddress,
            value: '0',
            data: functionData,
          },
        ],
      });
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        {/* Get started by editing <code>src/index.ts</code> */}
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        {NFTContractAddress && ( 
          <Card
            content={ {
              title: 'Buy an NFT',
              description: (
                <form id="buyNFT" onSubmit={buyNFTHandler}>
                  <p><label>TokenID:</label></p>
                  <p><input type="text" placeholder="Token ID" name="BuyNFTtokenID" id="BuyNFTtokenID" /></p>
                  <button type="submit">Buy NFT</button>
                </form>
              ), 
            } }
            disabled={false}
            fullWidth={false}
          />
        )}
        {NFTContractAddress && ( 
          <Card
            content={ {
              title: 'Approve an NFT to Spender',
              description: (
                <form id="approve" onSubmit={approveNFTHandler}>
                  <p><input type="text" placeholder="Spender Address" name="ApproveNFTSpender" id="ApproveNFTSpender" /></p>
                  <p><input type="text" placeholder="Token ID" name="ApproveNFTTokenID" id="ApproveNFTTokenID" /></p>
                  <button type="submit">Approve NFT</button>
                </form>
              ), 
            } }
            disabled={false}
            fullWidth={false}
          />
        )}
        {LendingContractAddress && ( 
          <Card
            content={ {
              title: 'Request Loan By NFT as Collateral',
              description: (
                <form id="requestLoan" onSubmit={requestLoanHandler}>
                  <p><label>TokenID:</label></p>
                  <p><input type="text" placeholder="Token ID" name="RequestLoanTokenID" id="RequestLoanTokenID" /></p>
                  <button type="submit">Request Loan</button>
                </form>
              ), 
            } }
            disabled={false}
            fullWidth={false}
          />
        )}
        {LendingContractAddress && ( 
          <Card
            content={ {
              title: 'Propose Loan Contract',
              description: (
                <form id="proposeLoanContract" onSubmit={proposeLoanHandler}>
                  <p><label>TokenID:</label></p>
                  <p><input type="text" placeholder="Proposal ID" name="ProposeLoanContractProposalID" id="ProposeLoanContractProposalID" /></p>
                  <p><input type="text" placeholder="Loan Amount" name="ProposeLoanContractLoanAmount" id="ProposeLoanContractLoanAmount" /></p>
                  <p><input type="text" placeholder="Interest Rate" name="ProposeLoanContractInterestRate" id="ProposeLoanContractInterestRate" /></p>
                  <p><input type="text" placeholder="Loan Duration" name="ProposeLoanContractLoanDuration" id="ProposeLoanContractLoanDuration" /></p>
                  <button type="submit">Propose Loan Contract</button>
                </form>
              ), 
            } }
            disabled={false}
            fullWidth={false}
          />
        )}
        {LendingContractAddress && ( 
          <Card
            content={ {
              title: 'Approve Loan Contract',
              description: (
                <form id="approveLoanContract" onSubmit={approveLoanProposalHandler}>
                  <p><label>TokenID:</label></p>
                  <p><input type="text" placeholder="Proposal ID" name="ApproveLoanContractProposalID" id="ApproveLoanContractProposalID" /></p>
                  <button type="submit">Approve Loan Contract</button>
                </form>
              ), 
            } }
            disabled={false}
            fullWidth={false}
          />
        )}
        <Card
          content={{
            title: 'Send Hello message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        />
      </CardContainer>
    </Container>
  );
};

export default Index;
