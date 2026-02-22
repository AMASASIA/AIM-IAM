/**
 * AIM3 OKE Atomic Mint Service (Real Bullet Implementation)
 * [Proof of Creation] を Baseチェーン上に刻印する Web3 ゲートウェイ
 */
const { ethers } = require('ethers');

// Minimal ABI for AtomicMint contract
const AtomicMintABI = [
    "function atomicMint(address user, string memory metadataURI) public returns (uint256 sbtId, uint256 nftId, address tba)",
    "event AtomicMinted(address indexed user, uint256 sbtId, uint256 nftId, address tba)"
];

// Base Sepolia 設定
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://sepolia.base.org');

// lazy initialization
let _wallet = null;
let _contract = null;

function getAtomicContract() {
    if (_contract) return _contract;

    const key = process.env.TIVE_AGENT_KEY;
    const addr = process.env.ATOMIC_MINT_CONTRACT_ADDRESS;

    if (!key || key.includes('your_private_key') || !addr || addr.includes('0x')) {
        // Simple heuristic for "not configured"
        if (!key || key.length < 60) {
            console.warn("[OKE-Web3] WARN: Web3 keys not configured or invalid. Minting will fail.");
            return null;
        }
    }

    try {
        _wallet = new ethers.Wallet(key, provider);
        _contract = new ethers.Contract(addr, AtomicMintABI, _wallet);
        return _contract;
    } catch (e) {
        console.error("[OKE-Web3] ERROR: Failed to initialize ethers objects:", e.message);
        return null;
    }
}

/**
 * OKE Atomic Mint: 思考・視覚・証明をオンチェーンに刻印
 */
async function executeAtomicMint(userAddress, ipfsUrl) {
    try {
        console.log(`[OKE-Web3] Initiating Atomic Mint on Base Sepolia for ${userAddress}...`);

        const atomicMintContract = getAtomicContract();
        if (!atomicMintContract) {
            throw new Error("Web3 Contract not initialized (check .env)");
        }

        // ガス価格の最適化
        const feeData = await provider.getFeeData();

        // スマートコントラクトの atomicMint 呼び出し
        const tx = await atomicMintContract.atomicMint(userAddress, ipfsUrl, {
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            maxTxFeePerGas: feeData.maxFeePerGas
        });

        console.log(`[OKE-Web3] Transaction Sent: ${tx.hash}`);
        const receipt = await tx.wait(); // ブロック承認を待機

        // イベントログから結果を取得
        const log = receipt.logs.find(l => l.address.toLowerCase() === (process.env.ATOMIC_MINT_CONTRACT_ADDRESS || "").toLowerCase());
        const parsedLog = atomicMintContract.interface.parseLog(log);

        const [user, sbtId, nftId, tbaAddress] = parsedLog.args;

        return {
            success: true,
            tx: receipt.hash,
            sbtId: sbtId.toString(),
            nftId: nftId.toString(),
            tba: tbaAddress,
            blockNumber: receipt.blockNumber,
            explorer: `https://sepolia.basescan.org/tx/${receipt.hash}`
        };
    } catch (error) {
        console.error("[OKE-Web3] Atomic Minting Error:", error);
        throw error;
    }
}

module.exports = { executeAtomicMint };
