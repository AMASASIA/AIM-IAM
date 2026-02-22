const express = require('express');
const router = express.Router();
const { executeAtomicMint } = require('../services/atomic');

/**
 * OKE Protocol: Triple Minting Logic
 * Records Thinking (Context), Seeing (Visual), and Proving (Agent) on-chain.
 */
router.post('/mint-fact', async (req, res) => {
    try {
        const { targetWallet, contextFact, visualFact, secretKey } = req.body;
        console.log(`[OKE Protocol] Starting REAL Triple Mint for ${targetWallet || 'System Agent'}`);

        // Call the real Web3 service
        // For now, we use a placeholder IPFS URL or combine facts into metadata
        const metadataString = JSON.stringify({ contextFact, visualFact, timestamp: new Date() });
        const result = await executeAtomicMint(targetWallet || process.env.DEFAULT_USER_WALLET, `data:application/json;base64,${Buffer.from(metadataString).toString('base64')}`);

        res.json({
            status: 'success',
            proofs: {
                tx: result.tx,
                sbtId: result.sbtId,
                nftId: result.nftId,
                tba: result.tba,
                explorer: result.explorer
            },
            message: "OKE Atomic Mint (Thinking, Seeing, Proving) Completed on Base Sepolia."
        });
    } catch (error) {
        console.error("Triple Mint Error:", error);
        res.status(500).json({ error: "Atomic Mint Execution Failed (Web3 Error)" });
    }
});

async function mockMint(type, data) {
    // Simulate on-chain entry
    const txHash = "0x" + Buffer.from(Math.random().toString() + Date.now()).toString('hex').slice(0, 40);
    console.log(`[OKE Mint] ${type} recorded: ${txHash}`);
    return { type, tx: txHash };
}

module.exports = router;
