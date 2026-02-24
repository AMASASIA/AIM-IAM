const express = require('express');
const router = express.Router();
const { executeAtomicMint } = require('../services/atomic');
const { generateOpalMasterpiece } = require('../services/opalImageService');

/**
 * OKE Protocol: Triple Minting Logic
 * Records Thinking (Context), Seeing (Visual), and Proving (Agent) on-chain.
 */
router.post('/mint-fact', async (req, res) => {
    try {
        const { targetWallet, contextFact, visualFact, physics, useOpal } = req.body;
        console.log(`[OKE Protocol] Starting REAL Triple Mint for ${targetWallet || 'System Agent'}`);

        let finalVisual = visualFact;

        // OPAL ENHANCEMENT: If useOpal is true, generate a high-quality AI masterpiece
        if (useOpal) {
            const hdImage = await generateOpalMasterpiece(visualFact, physics || {}, contextFact?.name || 'Atomic Fact');
            if (hdImage) {
                console.log("[OKE] OPAL Masterpiece Generated:", hdImage);
                finalVisual = hdImage;
            }
        }

        // Call the real Web3 service
        const metadataString = JSON.stringify({
            contextFact,
            visualFact: finalVisual,
            physics,
            timestamp: new Date()
        });

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
            imageUrl: finalVisual,
            message: useOpal ? "OKE & OPAL Joint Mint Completed." : "OKE Atomic Mint Completed."
        });
    } catch (error) {
        console.error("Triple Mint Error:", error);
        res.status(500).json({ error: "Atomic Mint Execution Failed (Web3 Error)" });
    }
});

module.exports = router;
