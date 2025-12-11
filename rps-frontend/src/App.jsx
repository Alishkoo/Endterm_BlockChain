import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x1f2C56EA1949658d81DD67BbB64263B5D0144528";

const ABI = [
  {
    inputs: [
      {
        internalType: "enum RockPaperScissors.Move",
        name: "_move",
        type: "uint8",
      },
    ],
    name: "play",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum RockPaperScissors.Move",
        name: "move",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum RockPaperScissors.Result",
        name: "result",
        type: "uint8",
      },
    ],
    name: "Play",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getGame",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "enum RockPaperScissors.Move",
        name: "",
        type: "uint8",
      },
      {
        internalType: "enum RockPaperScissors.Result",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getHistoryLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "history",
    outputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        internalType: "enum RockPaperScissors.Move",
        name: "move",
        type: "uint8",
      },
      {
        internalType: "enum RockPaperScissors.Result",
        name: "result",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const MOVES = ["Rock", "Paper", "Scissors"];

  // ---------------- CONNECT WALLET ----------------
  async function connect() {
    if (!window.ethereum) {
      alert("Install MetaMask!");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    setContract(c);
  }

  // ---------------- PLAY ----------------
  async function play(move) {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.play(move);
      await tx.wait();
      await loadHistory();
    } catch (err) {
      console.error(err);
      alert("Transaction error (see console)");
    }
    setLoading(false);
  }

  // ---------------- LOAD HISTORY ----------------
  async function loadHistory() {
    if (!contract) return;
    try {
      const h = await contract.getHistory();
      setHistory(h);
    } catch (err) {
      console.log("history error", err);
    }
  }

  useEffect(() => {
    if (contract) loadHistory();
  }, [contract]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Rock-Paper-Scissors DApp</h1>

      {!account ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <h2>Choose your move:</h2>

      <div style={{ display: "flex", gap: 10 }}>
        {MOVES.map((m, i) => (
          <button key={i} onClick={() => play(i)} disabled={loading}>
            {m}
          </button>
        ))}
      </div>

      <h2>Game History</h2>

      <div>
        {history.length === 0 && <p>No games yet</p>}

        {history.map((g, i) => (
          <div
            key={i}
            style={{
              marginBottom: 10,
              padding: 10,
              border: "1px solid gray",
              borderRadius: 6,
            }}
          >
            <p>
              <b>Player:</b> {g.player}
            </p>
            <p>
              <b>Your move:</b> {MOVES[g.playerMove]}
            </p>
            <p>
              <b>Contract move:</b> {MOVES[g.contractMove]}
            </p>
            <p>
              <b>Result:</b> {g.win ? " You Win!" : " You Lose"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
