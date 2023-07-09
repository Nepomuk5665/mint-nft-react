import React, { useEffect, useState, useRef } from 'react';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Confetti from 'react-confetti';
import nftImage from './nft1.jpg';

const NFTPORT_API_KEY = '553c202a-e63c-465e-adef-f0497a01abdc';

function App() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [hasSignedToS, setHasSignedToS] = useState(false);
  const [showToSModal, setShowToSModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const tosContent = "If you accept this Terms of Service, you will be able to mint an NFT.";

  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  const checkMetaMaskConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
      await connectWallet();
    }
  };

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const signToS = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const from = accounts[0];

      const message = `I agree to the Terms of Service: ${tosContent}`;
      const signature = await web3.eth.personal.sign(web3.utils.utf8ToHex(message), from, '');

      console.log('Signature:', signature);
      setHasSignedToS(true);
    } catch (error) {
      console.error("Error signing Terms of Service:", error);
    }
  };

  const mintNFT = async () => {
    if (!hasSignedToS) {
      alert('You must sign the Terms of Service before minting the NFT');
      return;
    }

    const imageBlob = await fetch(nftImage).then((response) => response.blob());
    const form = new FormData();
    form.append("file", imageBlob, "nft1.jpg");

    const options = {
      method: "POST",
      body: form,
      headers: {
        Authorization: NFTPORT_API_KEY,
      },
    };

    const title = "Cool NFT!";
    const description = "This is a cool NFT!";
    const address = account;

    await fetch(
      "https://api.nftport.xyz/v0/mints/easy/files?" +
        new URLSearchParams({
          chain: "goerli",
          name: title,
          description: description,
          mint_to_address: address,
        }),
      options
    )
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        toast.success("NFT Minted Successfully", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
          theme: "dark",
        });
        setShowConfetti(true);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>MetaMask Game</h1>
      {isConnected ? (
        <>
          <p>Account: {account}</p>
          {hasSignedToS ? (
            <>
              <button onClick={mintNFT}>Mint NFT</button>
              {showConfetti && <Confetti />}
            </>
          ) : (
            <button onClick={signToS}>Sign Terms of Service</button>
          )}
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      {showToSModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
          }}
        >
          <h2>Terms of Service</h2>
          <p>{tosContent}</p>
          <button onClick={signToS}>I Agree</button>
        </div>
      )}
    </div>
  );
}

export default App;